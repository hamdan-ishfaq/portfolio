'use client';

import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useIsDark } from '@/lib/hooks/use-is-dark';
import { getRendererPixelRatio } from '@/lib/three/particle-texture';
import {
  SIM_NODES,
  nodeStatus,
  simCopy,
  type SimLocale,
  type SimNodeId,
  type SimNodeStatus,
  type SimState,
} from '@/lib/content/p2p-simulation';

const ROAD_RADIUS = 12;
const ROAD_HALF_WIDTH = 2.2;
const PAD_RADIUS = 16.5;
const BUILDING_RADIUS = 19;
const DOCK_RANGE = 2.8;
const BUILDING_COLLIDER = 2.8;
const CAR_COLLIDER = 1.1;
const WORLD_LIMIT = 26;

const MAX_SPEED = 21;
const REVERSE_SPEED = 8;
const ACCELERATION = 26;
const BRAKING = 34;
const ROLLING_DRAG = 1.1;
const TURN_RATE = 2.1;

const STATUS_COLOR: Record<SimNodeStatus, number> = {
  posted: 0x4ec2a6,
  blocked: 0xd08a3a,
  available: 0x4a9fd0,
  locked: 0x64748b,
};

/** Ring position on the ground plane. Index order matches the process order. */
function ringPoint(index: number, radius: number): THREE.Vector3 {
  const angle = (index / SIM_NODES.length) * Math.PI * 2 - Math.PI / 2;
  return new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
}

function makeLabelSprite(text: string, color: string): THREE.Sprite {
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2);
  const fontSize = 44;
  const padX = 18;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const font = `600 ${fontSize}px Inter, ui-sans-serif, system-ui, sans-serif`;
  ctx.font = font;
  const width = Math.ceil(ctx.measureText(text).width + padX * 2);
  const height = Math.ceil(fontSize * 1.6);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  const h = 0.85;
  sprite.scale.set(h * (width / height), h, 1);
  sprite.renderOrder = 8;
  return sprite;
}

type HoldButtonProps = {
  label: string;
  icon: string;
  onPress: () => void;
  onRelease: () => void;
};

/** Press-and-hold control; pointer capture keeps it held if the thumb slides. */
function HoldButton({ label, icon, onPress, onRelease }: HoldButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-black/45 text-on-surface backdrop-blur-sm active:bg-primary/40"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onPress();
      }}
      onPointerUp={onRelease}
      onPointerCancel={onRelease}
      onLostPointerCapture={onRelease}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  );
}

type DepotWorldProps = {
  state: SimState;
  locale: SimLocale;
  onDock: (id: SimNodeId) => void;
  className?: string;
};

/**
 * Drivable depot. Each building is a posting station: pull the truck onto its
 * dock pad and the corresponding document is posted through the same engine the
 * step list uses.
 */
export function DepotWorld({
  state,
  locale,
  onDock,
  // Must be a positioned class: the overlays are absolutely placed against it.
  className = 'absolute inset-0',
}: DepotWorldProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLParagraphElement>(null);
  const recentreRef = useRef<(() => void) | null>(null);
  const applyRef = useRef<((state: SimState) => void) | null>(null);
  const dockRef = useRef(onDock);
  const stateRef = useRef(state);
  const isDark = useIsDark();

  // Touch/pointer input shared with the imperative loop.
  const inputRef = useRef({ throttle: 0, steer: 0 });

  useEffect(() => {
    dockRef.current = onDock;
    stateRef.current = state;
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const copy = simCopy(locale);
    const palette = isDark
      ? {
          sky: 0x0b1220,
          ground: 0x111c2e,
          grid: 0x1e3355,
          road: 0x243752,
          building: 0x3a516d,
          label: '#e2e8f0',
          car: 0xd9e2ec,
        }
      : {
          sky: 0xdfe7f0,
          ground: 0xc9d6e4,
          grid: 0x9fb3c8,
          road: 0xaebfd2,
          building: 0x7a93ad,
          label: '#1e293b',
          car: 0x1f4e79,
        };

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(palette.sky, 40, 80);

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 250);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(getRendererPixelRatio());
    renderer.setClearColor(palette.sky, 1);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    mount.appendChild(renderer.domElement);

    const disposables: Array<{ dispose: () => void }> = [];

    scene.add(new THREE.HemisphereLight(0xffffff, palette.ground, isDark ? 1.1 : 1.5));
    const sun = new THREE.DirectionalLight(0xffffff, isDark ? 0.7 : 0.9);
    sun.position.set(18, 30, 12);
    scene.add(sun);

    // --- Ground and road ---
    const groundGeo = new THREE.CircleGeometry(WORLD_LIMIT + 6, 64);
    const groundMat = new THREE.MeshLambertMaterial({ color: palette.ground });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    disposables.push(groundGeo, groundMat);

    const grid = new THREE.GridHelper((WORLD_LIMIT + 6) * 2, 40, palette.grid, palette.grid);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = isDark ? 0.22 : 0.35;
    grid.position.y = 0.01;
    scene.add(grid);
    disposables.push(grid.geometry, grid.material as THREE.Material);

    const roadGeo = new THREE.RingGeometry(
      ROAD_RADIUS - ROAD_HALF_WIDTH,
      ROAD_RADIUS + ROAD_HALF_WIDTH,
      96
    );
    const roadMat = new THREE.MeshLambertMaterial({ color: palette.road });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.02;
    scene.add(road);
    disposables.push(roadGeo, roadMat);

    // Centre plaza — gives the ring a readable interior.
    const plazaGeo = new THREE.CircleGeometry(4.5, 48);
    const plazaMat = new THREE.MeshLambertMaterial({ color: palette.road });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.02;
    scene.add(plaza);
    disposables.push(plazaGeo, plazaMat);

    const hubGeo = new THREE.BoxGeometry(2.2, 0.6, 2.2);
    const hubMat = new THREE.MeshLambertMaterial({ color: isDark ? 0x1f4e79 : 0x4a9fd0 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.position.y = 0.3;
    scene.add(hub);
    disposables.push(hubGeo, hubMat);

    // --- Buildings and dock pads ---
    type Station = {
      id: SimNodeId;
      pad: THREE.Vector3;
      centre: THREE.Vector3;
      roofMat: THREE.MeshLambertMaterial;
      padMat: THREE.MeshBasicMaterial;
      beacon: THREE.Mesh;
      status: SimNodeStatus;
    };

    const buildingMat = new THREE.MeshLambertMaterial({ color: palette.building });
    const spurMat = new THREE.MeshLambertMaterial({ color: palette.road });
    disposables.push(buildingMat, spurMat);

    const stations: Station[] = SIM_NODES.map((node, index) => {
      const centre = ringPoint(index, BUILDING_RADIUS);
      const pad = ringPoint(index, PAD_RADIUS);
      const facing = Math.atan2(centre.x, centre.z);
      const height = 3.2 + (index % 3) * 1.1;

      const bodyGeo = new THREE.BoxGeometry(4.4, height, 3.6);
      const body = new THREE.Mesh(bodyGeo, buildingMat);
      body.position.set(centre.x, height / 2, centre.z);
      body.rotation.y = facing;
      scene.add(body);
      disposables.push(bodyGeo);

      // Wireframe outline so buildings read against the dark ground.
      const outlineGeo = new THREE.EdgesGeometry(bodyGeo);
      const outlineMat = new THREE.LineBasicMaterial({
        color: isDark ? 0x7ea8c9 : 0x1f4e79,
        transparent: true,
        opacity: 0.55,
      });
      const outline = new THREE.LineSegments(outlineGeo, outlineMat);
      outline.position.copy(body.position);
      outline.rotation.copy(body.rotation);
      scene.add(outline);
      disposables.push(outlineGeo, outlineMat);

      // Status band across the roof.
      const roofGeo = new THREE.BoxGeometry(4.6, 0.35, 3.8);
      const roofMat = new THREE.MeshLambertMaterial({ color: STATUS_COLOR.locked });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(centre.x, height + 0.17, centre.z);
      roof.rotation.y = facing;
      scene.add(roof);
      disposables.push(roofGeo, roofMat);

      // Beacon that rises above the active station.
      const beaconGeo = new THREE.ConeGeometry(0.5, 1.2, 4);
      const beacon = new THREE.Mesh(beaconGeo, roofMat);
      beacon.position.set(centre.x, height + 1.4, centre.z);
      scene.add(beacon);
      disposables.push(beaconGeo);

      // Dock pad the driver has to pull onto.
      const padGeo = new THREE.CircleGeometry(DOCK_RANGE, 28);
      const padMat = new THREE.MeshBasicMaterial({
        color: STATUS_COLOR.locked,
        transparent: true,
        opacity: 0.18,
      });
      const padMesh = new THREE.Mesh(padGeo, padMat);
      padMesh.rotation.x = -Math.PI / 2;
      padMesh.position.set(pad.x, 0.04, pad.z);
      scene.add(padMesh);
      disposables.push(padGeo, padMat);

      // Spur road joining the ring to the pad.
      const spurGeo = new THREE.PlaneGeometry(3.2, PAD_RADIUS - ROAD_RADIUS + 2);
      const spur = new THREE.Mesh(spurGeo, spurMat);
      spur.rotation.x = -Math.PI / 2;
      spur.rotation.z = -facing;
      const mid = ringPoint(index, (ROAD_RADIUS + PAD_RADIUS) / 2);
      spur.position.set(mid.x, 0.015, mid.z);
      scene.add(spur);
      disposables.push(spurGeo);

      const label = makeLabelSprite(copy.nodes[node.id].short, palette.label);
      label.position.set(centre.x, height + 2.2, centre.z);
      scene.add(label);
      disposables.push(label.material.map!, label.material);

      return { id: node.id, pad, centre, roofMat, padMat, beacon, status: 'locked' };
    });

    // --- Vehicle ---
    const car = new THREE.Group();
    const chassisGeo = new THREE.BoxGeometry(1.7, 0.55, 3.4);
    const chassisMat = new THREE.MeshLambertMaterial({ color: palette.car });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.62;
    car.add(chassis);
    disposables.push(chassisGeo, chassisMat);

    const cabGeo = new THREE.BoxGeometry(1.5, 0.62, 1.5);
    const cabMat = new THREE.MeshLambertMaterial({ color: 0x2f7d6d });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, 1.18, -0.55);
    car.add(cab);
    disposables.push(cabGeo, cabMat);

    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 14);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    disposables.push(wheelGeo, wheelMat);
    const wheels: THREE.Mesh[] = [];
    for (const [x, z] of [
      [-0.88, 1.05],
      [0.88, 1.05],
      [-0.88, -1.05],
      [0.88, -1.05],
    ]) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.38, z);
      car.add(wheel);
      wheels.push(wheel);
    }
    scene.add(car);

    // --- Vehicle state ---
    const start = ringPoint(0, ROAD_RADIUS);
    const firstPad = ringPoint(0, PAD_RADIUS);
    const position = new THREE.Vector3(start.x, 0, start.z);
    // Face the first station so the opening move is obvious: drive straight to dock.
    let heading = Math.atan2(firstPad.x - start.x, firstPad.z - start.z);
    let speed = 0;
    car.position.copy(position);
    car.rotation.y = heading;

    // Snap the chase camera onto the start pose so the first frame is not empty.
    camera.position
      .set(position.x, 0, position.z)
      .add(new THREE.Vector3(Math.sin(heading) * -11, 8.5, Math.cos(heading) * -11));
    camera.lookAt(position.x + Math.sin(heading) * 4, 1.1, position.z + Math.cos(heading) * 4);

    const recentre = () => {
      position.set(start.x, 0, start.z);
      heading = Math.atan2(firstPad.x - start.x, firstPad.z - start.z);
      speed = 0;
    };
    recentreRef.current = recentre;

    // --- Status ---
    const applyState = (next: SimState) => {
      for (const station of stations) {
        const status = nodeStatus(next, station.id, locale);
        station.status = status;
        station.roofMat.color.setHex(STATUS_COLOR[status]);
        station.padMat.color.setHex(STATUS_COLOR[status]);
        station.padMat.opacity = status === 'available' ? 0.42 : status === 'locked' ? 0.12 : 0.25;
        station.beacon.visible = status === 'available';
      }
    };
    applyState(stateRef.current);
    applyRef.current = applyState;

    // --- Input ---
    const keys = new Set<string>();
    const DRIVE_KEYS = new Set([
      'arrowup',
      'arrowdown',
      'arrowleft',
      'arrowright',
      'w',
      'a',
      's',
      'd',
    ]);

    const isTyping = () => {
      const el = document.activeElement;
      return (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (!DRIVE_KEYS.has(key) || isTyping()) return;
      // Arrows would otherwise scroll the panel behind the canvas.
      if (key.startsWith('arrow')) event.preventDefault();
      keys.add(key);
    };
    const onKeyUp = (event: KeyboardEvent) => keys.delete(event.key.toLowerCase());
    const onBlur = () => keys.clear();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    // --- Sizing ---
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    // --- Loop ---
    const forward = new THREE.Vector3();
    const desiredCam = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();
    let dockedNode: SimNodeId | null = null;
    let promptText = '';
    let last = performance.now();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const touch = inputRef.current;
      const throttle =
        (keys.has('w') || keys.has('arrowup') ? 1 : 0) -
        (keys.has('s') || keys.has('arrowdown') ? 1 : 0) +
        touch.throttle;
      const steer =
        (keys.has('a') || keys.has('arrowleft') ? 1 : 0) -
        (keys.has('d') || keys.has('arrowright') ? 1 : 0) +
        touch.steer;

      const drive = THREE.MathUtils.clamp(throttle, -1, 1);
      const turn = THREE.MathUtils.clamp(steer, -1, 1);

      if (drive > 0) speed += ACCELERATION * drive * dt;
      else if (drive < 0) speed += (speed > 0 ? BRAKING : ACCELERATION) * drive * dt;
      else speed -= Math.sign(speed) * Math.min(Math.abs(speed), ROLLING_DRAG * 8 * dt);

      speed = THREE.MathUtils.clamp(speed, -REVERSE_SPEED, MAX_SPEED);

      // Steering authority scales with speed so a parked truck cannot pirouette.
      const grip = THREE.MathUtils.clamp(Math.abs(speed) / 6, 0, 1);
      heading += turn * TURN_RATE * grip * dt * Math.sign(speed || 1);

      forward.set(Math.sin(heading), 0, Math.cos(heading));
      position.addScaledVector(forward, speed * dt);

      // Buildings are solid.
      for (const station of stations) {
        const dx = position.x - station.centre.x;
        const dz = position.z - station.centre.z;
        const distance = Math.hypot(dx, dz);
        const minimum = BUILDING_COLLIDER + CAR_COLLIDER;
        if (distance < minimum && distance > 0.001) {
          position.x = station.centre.x + (dx / distance) * minimum;
          position.z = station.centre.z + (dz / distance) * minimum;
          speed *= 0.25;
        }
      }

      // Keep the depot bounded.
      const fromCentre = Math.hypot(position.x, position.z);
      if (fromCentre > WORLD_LIMIT) {
        position.x = (position.x / fromCentre) * WORLD_LIMIT;
        position.z = (position.z / fromCentre) * WORLD_LIMIT;
        speed *= 0.4;
      }

      car.position.set(position.x, 0, position.z);
      car.rotation.y = heading;
      const roll = speed * dt * 2.6;
      for (const wheel of wheels) wheel.rotation.x += roll;

      // Docking: fires once per arrival, not once per frame.
      let nearest: Station | null = null;
      let nearestDistance = Infinity;
      for (const station of stations) {
        const distance = Math.hypot(position.x - station.pad.x, position.z - station.pad.z);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = station;
        }
      }

      if (nearest && nearestDistance < DOCK_RANGE) {
        if (dockedNode !== nearest.id) {
          dockedNode = nearest.id;
          dockRef.current(nearest.id);
        }
      } else if (nearestDistance > DOCK_RANGE + 1.5) {
        dockedNode = null;
      }

      const label =
        nearest && nearestDistance < DOCK_RANGE + 8
          ? `${copy.nodes[nearest.id].title} · ${SIM_NODES.find((n) => n.id === nearest!.id)!.transaction}`
          : '';
      if (label !== promptText) {
        promptText = label;
        if (promptRef.current) promptRef.current.textContent = label;
      }

      // Chase camera — high enough to keep neighbouring stations in frame.
      desiredCam
        .set(position.x, 0, position.z)
        .addScaledVector(forward, -11)
        .add(new THREE.Vector3(0, 8.5, 0));
      camera.position.lerp(desiredCam, 1 - Math.pow(0.0015, dt));
      lookTarget.set(position.x, 1.1, position.z).addScaledVector(forward, 4);
      camera.lookAt(lookTarget);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      recentreRef.current = null;
      applyRef.current = null;
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.isConnected) renderer.domElement.remove();
    };
  }, [isDark, locale]);

  useEffect(() => {
    applyRef.current?.(state);
  }, [state]);

  const copy = simCopy(locale);

  const setInput = useCallback((key: 'throttle' | 'steer', value: number) => {
    inputRef.current[key] = value;
  }, []);

  return (
    <div className={className}>
      <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />

      <p
        ref={promptRef}
        className="pointer-events-none absolute inset-x-0 top-3 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-on-surface drop-shadow"
        aria-hidden="true"
      />

      {/* Touch controls. Keyboard users drive with WASD; the step list remains
          the accessible route for anyone who cannot drive at all. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-end justify-between px-4 lg:hidden">
        <div className="pointer-events-auto flex gap-2">
          <HoldButton
            label={copy.ui.steerLeft}
            icon="chevron_left"
            onPress={() => setInput('steer', 1)}
            onRelease={() => setInput('steer', 0)}
          />
          <HoldButton
            label={copy.ui.steerRight}
            icon="chevron_right"
            onPress={() => setInput('steer', -1)}
            onRelease={() => setInput('steer', 0)}
          />
        </div>
        <div className="pointer-events-auto flex gap-2">
          <HoldButton
            label={copy.ui.reverse}
            icon="expand_more"
            onPress={() => setInput('throttle', -1)}
            onRelease={() => setInput('throttle', 0)}
          />
          <HoldButton
            label={copy.ui.accelerate}
            icon="expand_less"
            onPress={() => setInput('throttle', 1)}
            onRelease={() => setInput('throttle', 0)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => recentreRef.current?.()}
        className="absolute right-3 top-3 rounded border border-white/20 bg-black/45 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-on-surface backdrop-blur-sm transition-colors hover:border-primary/60"
      >
        {copy.ui.recentre}
      </button>
    </div>
  );
}
