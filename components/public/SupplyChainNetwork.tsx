'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { useIsDark } from '@/lib/hooks/use-is-dark';
import { useLocale } from '@/components/providers/LocaleProvider';
import { getParticleTexture, getRendererPixelRatio } from '@/lib/three/particle-texture';
import { fitCameraToNetwork } from '@/lib/three/fit-camera';
import {
  SIM_EDGES,
  SIM_NODES,
  simCopy,
  type SimLocale,
  type SimNodeId,
} from '@/lib/content/p2p-simulation';

/** Loaded only after the visitor opts in, so the landing view stays instant. */
const P2PSimulator = dynamic(
  () => import('@/components/public/P2PSimulator').then((m) => m.P2PSimulator),
  { ssr: false }
);

function makeLabelTexture(text: string, hex: string): THREE.CanvasTexture {
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
  ctx.fillStyle = hex;
  ctx.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  texture.userData.aspect = width / height;
  return texture;
}

/**
 * Hero teaser for the document network. Shares node positions and labels with
 * the simulator so the still picture and the interactive one are the same object.
 */
export function SupplyChainNetwork() {
  const mountRef = useRef<HTMLDivElement>(null);
  const isDark = useIsDark();
  const prefersReducedMotion = useReducedMotion();
  const { locale } = useLocale();
  const simLocale: SimLocale = locale === 'de' ? 'de' : 'en';
  const copy = simCopy(simLocale);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const palette = isDark
      ? { node: 0xe2e8f0, edge: 0x3b82a8, packet: 0x4ec2a6, label: '#cbd5e1' }
      : { node: 0x1f4e79, edge: 0x1f4e79, packet: 0x2f7d6d, label: '#334155' };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 8.4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(getRendererPixelRatio());
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.rotation.x = -0.32;
    scene.add(group);

    const disposables: Array<{ dispose: () => void }> = [];
    const positions = new Map<SimNodeId, THREE.Vector3>();
    for (const node of SIM_NODES) {
      positions.set(node.id, new THREE.Vector3(...node.position));
    }

    // Material units.
    const cubeGeo = new THREE.BoxGeometry(0.26, 0.26, 0.26);
    const cubeEdges = new THREE.EdgesGeometry(cubeGeo);
    const cubeMat = new THREE.LineBasicMaterial({
      color: palette.node,
      transparent: true,
      opacity: isDark ? 0.85 : 0.7,
    });
    disposables.push(cubeGeo, cubeEdges, cubeMat);

    const cubes = SIM_NODES.map((node) => {
      const cube = new THREE.LineSegments(cubeEdges, cubeMat);
      cube.position.copy(positions.get(node.id)!);
      group.add(cube);
      return cube;
    });

    // Labels.
    for (const node of SIM_NODES) {
      const texture = makeLabelTexture(copy.nodes[node.id].short, palette.label);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        depthTest: false,
      });
      const label = new THREE.Sprite(material);
      const aspect = (texture.userData.aspect as number) || 4;
      const h = 0.24;
      label.scale.set(h * aspect, h, 1);
      label.position.copy(positions.get(node.id)!);
      label.position.y += 0.36;
      label.renderOrder = 5;
      group.add(label);
      disposables.push(texture, material);
    }

    // Edges.
    const linePoints: number[] = [];
    for (const edge of SIM_EDGES) {
      const a = positions.get(edge.from)!;
      const b = positions.get(edge.to)!;
      linePoints.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePoints, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: palette.edge,
      transparent: true,
      opacity: isDark ? 0.32 : 0.28,
    });
    group.add(new THREE.LineSegments(lineGeo, lineMat));
    disposables.push(lineGeo, lineMat);

    // Postings in transit.
    const packetMat = new THREE.SpriteMaterial({
      map: getParticleTexture(),
      color: palette.packet,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    disposables.push(packetMat);

    const packets = SIM_EDGES.slice(0, 8).map((edge, i) => {
      const mesh = new THREE.Sprite(packetMat);
      mesh.scale.setScalar(0.3);
      group.add(mesh);
      return { edgeIndex: i, t: Math.random(), speed: 0.0024 + Math.random() * 0.0024, mesh };
    });

    const renderFrame = () => {
      for (const packet of packets) {
        const edge = SIM_EDGES[packet.edgeIndex];
        packet.mesh.position
          .copy(positions.get(edge.from)!)
          .lerp(positions.get(edge.to)!, packet.t);
      }
      renderer.render(scene, camera);
    };

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      fitCameraToNetwork(camera, camera.aspect);
      camera.updateProjectionMatrix();
      if (prefersReducedMotion) renderFrame();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      pointer.y = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
    };
    mount.addEventListener('pointermove', onPointerMove, { passive: true });

    let frameId = 0;
    let tiltX = -0.32;

    if (prefersReducedMotion) {
      renderFrame();
    } else {
      const animate = () => {
        frameId = requestAnimationFrame(animate);

        // No auto-rotation: a spinning ring overlaps its own labels. The
        // travelling postings carry the motion instead.
        const targetY = pointer.x * 0.16;
        const targetX = -0.32 - pointer.y * 0.1;
        tiltX += (targetX - tiltX) * 0.05;
        group.rotation.y += (targetY - group.rotation.y) * 0.06;
        group.rotation.x = tiltX;

        for (const cube of cubes) {
          cube.rotation.x += 0.004;
          cube.rotation.y += 0.005;
        }

        for (const packet of packets) {
          packet.t += packet.speed;
          if (packet.t >= 1) {
            packet.t = 0;
            const end = SIM_EDGES[packet.edgeIndex].to;
            const onward = SIM_EDGES.map((e, index) => ({ e, index })).filter(
              ({ e }) => e.from === end
            );
            packet.edgeIndex =
              onward.length > 0
                ? onward[Math.floor(Math.random() * onward.length)].index
                : Math.floor(Math.random() * SIM_EDGES.length);
          }
        }

        renderFrame();
      };
      animate();
    }

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      mount.removeEventListener('pointermove', onPointerMove);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.isConnected) renderer.domElement.remove();
    };
  }, [isDark, prefersReducedMotion, copy]);

  return (
    <>
      <div className="lab-frame rounded-lg overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/10">
          <p className="type-label">Document flow</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
            P2P · O2C
          </p>
        </div>

        <div
          ref={mountRef}
          className="relative w-full aspect-[4/3] min-h-[280px]"
          role="img"
          aria-label="Diagram of a supply chain document flow linking purchase requisition, purchase order, goods receipt, invoice, payment, sales order, delivery, goods issue, and billing."
        />

        <div className="border-t border-white/10 px-5 py-3">
          <button
            type="button"
            onClick={() => setSimulatorOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded border border-white/12 px-4 py-2.5 text-sm font-medium text-on-surface transition-colors hover:border-primary/60 hover:bg-primary/[0.06]"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">open_in_full</span>
            {copy.ui.open}
          </button>
        </div>
      </div>

      {simulatorOpen ? <P2PSimulator isOpen onClose={() => setSimulatorOpen(false)} /> : null}
    </>
  );
}
