'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { useIsDark } from '@/lib/hooks/use-is-dark';
import { getParticleTexture, getRendererPixelRatio } from '@/lib/three/particle-texture';
import { fitCameraToNetwork } from '@/lib/three/fit-camera';
import {
  RING_RADIUS,
  SIM_EDGES,
  SIM_NODES,
  nodeStatus,
  ringPositionFor,
  ringYFactor,
  simCopy,
  type SimLocale,
  type SimNodeId,
  type SimNodeStatus,
  type SimState,
} from '@/lib/content/p2p-simulation';

const STATUS_COLOR: Record<SimNodeStatus, number> = {
  posted: 0x4ec2a6,
  blocked: 0xd08a3a,
  available: 0x4a9fd0,
  locked: 0x64748b,
};

const STATUS_OPACITY: Record<SimNodeStatus, number> = {
  posted: 1,
  blocked: 1,
  available: 0.95,
  locked: 0.4,
};

function makeLabelTexture(text: string, color: string): THREE.CanvasTexture {
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2);
  const fontSize = 40;
  const padX = 16;
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
  texture.needsUpdate = true;
  texture.userData.aspect = width / height;
  return texture;
}

type SceneHandle = {
  applyState: (state: SimState) => void;
};

type SimulationSceneProps = {
  state: SimState;
  locale: SimLocale;
  onSelect: (id: SimNodeId) => void;
  className?: string;
};

/**
 * Clickable document network. Node colour is derived from the same
 * `nodeStatus` the step list uses, so the picture can never drift from the
 * ledger.
 */
export function SimulationScene({ state, locale, onSelect, className = '' }: SimulationSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<SceneHandle | null>(null);
  const selectRef = useRef(onSelect);
  const stateRef = useRef(state);
  const isDark = useIsDark();
  const prefersReducedMotion = useReducedMotion();

  // Keep the latest callback/state reachable from the imperative scene without
  // making the scene rebuild on every render.
  useEffect(() => {
    selectRef.current = onSelect;
    stateRef.current = state;
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const copy = simCopy(locale);
    const labelColor = isDark ? '#cbd5e1' : '#334155';
    const edgeColor = isDark ? 0x3b82a8 : 0x1f4e79;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 8.6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(getRendererPixelRatio());
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'manipulation';
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.rotation.x = -0.3;
    scene.add(group);

    const disposables: Array<{ dispose: () => void }> = [];
    const positions = new Map<SimNodeId, THREE.Vector3>();
    for (const node of SIM_NODES) {
      positions.set(node.id, new THREE.Vector3(...node.position));
    }
    const labels: Array<{ id: SimNodeId; sprite: THREE.Sprite }> = [];

    // --- Nodes ---
    const coreGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const frameGeo = new THREE.EdgesGeometry(coreGeo);
    const hitGeo = new THREE.SphereGeometry(0.62, 12, 12);
    disposables.push(coreGeo, frameGeo, hitGeo);

    type NodeVisual = {
      id: SimNodeId;
      frame: THREE.LineSegments;
      core: THREE.Mesh;
      hit: THREE.Mesh;
      frameMat: THREE.LineBasicMaterial;
      coreMat: THREE.MeshBasicMaterial;
      status: SimNodeStatus;
    };

    const visuals: NodeVisual[] = SIM_NODES.map((node) => {
      const position = positions.get(node.id)!;

      const frameMat = new THREE.LineBasicMaterial({ transparent: true });
      const frame = new THREE.LineSegments(frameGeo, frameMat);
      frame.position.copy(position);
      group.add(frame);

      const coreMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.35 });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.scale.setScalar(0.62);
      core.position.copy(position);
      group.add(core);

      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hit = new THREE.Mesh(hitGeo, hitMat);
      hit.position.copy(position);
      hit.userData.nodeId = node.id;
      group.add(hit);

      disposables.push(frameMat, coreMat, hitMat);
      return { id: node.id, frame, core, hit, frameMat, coreMat, status: 'locked' };
    });

    // --- Labels ---
    for (const node of SIM_NODES) {
      const texture = makeLabelTexture(copy.nodes[node.id].short, labelColor);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        depthTest: false,
      });
      const label = new THREE.Sprite(material);
      const aspect = (texture.userData.aspect as number) || 4;
      const h = 0.23;
      label.scale.set(h * aspect, h, 1);
      label.position.copy(positions.get(node.id)!);
      label.position.y += 0.4;
      label.renderOrder = 6;
      group.add(label);
      labels.push({ id: node.id, sprite: label });
      disposables.push(texture, material);
    }

    // --- Edges ---
    type EdgeVisual = {
      from: SimNodeId;
      to: SimNodeId;
      line: THREE.Line;
      material: THREE.LineBasicMaterial;
      reference: boolean;
    };

    const edges: EdgeVisual[] = SIM_EDGES.map((edge) => {
      const a = positions.get(edge.from)!;
      const b = positions.get(edge.to)!;
      const geometry = new THREE.BufferGeometry().setFromPoints([a, b]);
      const material = new THREE.LineBasicMaterial({
        color: edgeColor,
        transparent: true,
        opacity: edge.kind === 'reference' ? 0.16 : 0.3,
      });
      const line = new THREE.Line(geometry, material);
      group.add(line);
      disposables.push(geometry, material);
      return { from: edge.from, to: edge.to, line, material, reference: edge.kind === 'reference' };
    });

    // --- Packets: only travel edges whose documents both exist ---
    const packetMat = new THREE.SpriteMaterial({
      map: getParticleTexture(),
      color: 0x4ec2a6,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    disposables.push(packetMat);

    const packets = edges.map((edge) => {
      const sprite = new THREE.Sprite(packetMat);
      sprite.scale.setScalar(0.28);
      sprite.visible = false;
      group.add(sprite);
      return { edge, sprite, t: Math.random() };
    });

    // --- State application ---
    const applyState = (next: SimState) => {
      for (const visual of visuals) {
        const status = nodeStatus(next, visual.id, locale);
        visual.status = status;
        const color = STATUS_COLOR[status];
        visual.frameMat.color.setHex(color);
        visual.frameMat.opacity = STATUS_OPACITY[status];
        visual.coreMat.color.setHex(color);
        visual.coreMat.opacity = status === 'locked' ? 0.08 : 0.4;
      }

      for (const edge of edges) {
        const live = Boolean(next.posted[edge.from] && next.posted[edge.to]);
        edge.material.color.setHex(live ? 0x4ec2a6 : edgeColor);
        edge.material.opacity = live ? 0.55 : edge.reference ? 0.16 : 0.3;
      }

      for (const packet of packets) {
        packet.sprite.visible = Boolean(
          next.posted[packet.edge.from] && next.posted[packet.edge.to]
        );
      }
    };

    applyState(stateRef.current);
    handleRef.current = { applyState };

    // --- Sizing ---
    const renderFrame = () => renderer.render(scene, camera);

    let yFactor = -1;
    const relayout = (aspect: number) => {
      const next = ringYFactor(aspect);
      if (next === yFactor) return;
      yFactor = next;

      for (const node of SIM_NODES) {
        positions.get(node.id)!.set(...ringPositionFor(node.id, next));
      }
      for (const visual of visuals) {
        const position = positions.get(visual.id)!;
        visual.frame.position.copy(position);
        visual.core.position.copy(position);
        visual.hit.position.copy(position);
      }
      for (const label of labels) {
        label.sprite.position.copy(positions.get(label.id)!);
        label.sprite.position.y += 0.4;
      }
      for (const edge of edges) {
        edge.line.geometry.setFromPoints([positions.get(edge.from)!, positions.get(edge.to)!]);
      }
    };

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      relayout(camera.aspect);
      fitCameraToNetwork(camera, camera.aspect, 3.7, RING_RADIUS * yFactor + 0.6);
      camera.updateProjectionMatrix();
      if (prefersReducedMotion) renderFrame();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    // --- Picking ---
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hitMeshes = visuals.map((v) => v.hit);
    let hovered: SimNodeId | null = null;

    const pick = (clientX: number, clientY: number): SimNodeId | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      return hits.length > 0 ? (hits[0].object.userData.nodeId as SimNodeId) : null;
    };

    const onPointerMove = (event: PointerEvent) => {
      const id = pick(event.clientX, event.clientY);
      hovered = id;
      renderer.domElement.style.cursor = id ? 'pointer' : 'default';
    };

    const onPointerDown = (event: PointerEvent) => {
      const id = pick(event.clientX, event.clientY);
      if (id) selectRef.current(id);
    };

    const onPointerLeave = () => {
      hovered = null;
      renderer.domElement.style.cursor = 'default';
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove, { passive: true });
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave, { passive: true });

    // --- Loop ---
    let frameId = 0;
    let elapsed = 0;

    if (prefersReducedMotion) {
      renderFrame();
    } else {
      const animate = () => {
        frameId = requestAnimationFrame(animate);
        elapsed += 0.016;

        // Deliberately still: nodes are click targets, so the ring must not drift.
        for (const visual of visuals) {
          const isHovered = hovered === visual.id;
          const pulse = visual.status === 'available' ? 1 + Math.sin(elapsed * 2.6) * 0.08 : 1;
          const target = (isHovered ? 1.35 : 1) * pulse;
          visual.frame.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
          visual.core.scale.lerp(
            new THREE.Vector3(target * 0.62, target * 0.62, target * 0.62),
            0.15
          );
          visual.frame.rotation.y += 0.005;
          visual.frame.rotation.x += 0.003;
          visual.core.rotation.copy(visual.frame.rotation);
        }

        for (const packet of packets) {
          if (!packet.sprite.visible) continue;
          packet.t = (packet.t + 0.006) % 1;
          const a = positions.get(packet.edge.from)!;
          const b = positions.get(packet.edge.to)!;
          packet.sprite.position.copy(a).lerp(b, packet.t);
        }

        renderFrame();
      };
      animate();
    }

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      handleRef.current = null;
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.isConnected) renderer.domElement.remove();
    };
  }, [isDark, locale, prefersReducedMotion]);

  useEffect(() => {
    handleRef.current?.applyState(state);
  }, [state]);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
