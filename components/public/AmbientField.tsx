'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { useIsDark } from '@/lib/hooks/use-is-dark';
import { getRendererPixelRatio } from '@/lib/three/particle-texture';

/**
 * Far-field ambient documents — signature atmosphere without competing with the hero network.
 * Opt-in motion only; static tiles when reduced-motion is set.
 */
export function AmbientField() {
  const mountRef = useRef<HTMLDivElement>(null);
  const isDark = useIsDark();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const color = isDark ? 0x3b82a8 : 0x1f4e79;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
    camera.position.z = 14;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(getRendererPixelRatio(), 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);

    const geo = new THREE.PlaneGeometry(0.9, 1.15);
    const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.9, 1.15, 0.02));
    const fill = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: isDark ? 0.06 : 0.05,
      side: THREE.DoubleSide,
    });
    const stroke = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: isDark ? 0.22 : 0.18,
    });

    const docs: Array<{
      group: THREE.Group;
      base: THREE.Vector3;
      speed: number;
      phase: number;
    }> = [];

    const placements: Array<[number, number, number, number]> = [
      [-6.2, 3.2, -4, 0.35],
      [5.8, 2.4, -5, -0.4],
      [-4.5, -2.8, -3.5, 0.55],
      [6.5, -1.6, -6, -0.25],
      [-7.2, 0.4, -5.5, 0.15],
      [3.2, 3.8, -7, -0.6],
    ];

    for (const [x, y, z, rot] of placements) {
      const group = new THREE.Group();
      group.add(new THREE.Mesh(geo, fill));
      group.add(new THREE.LineSegments(edgeGeo, stroke));
      group.position.set(x, y, z);
      group.rotation.z = rot;
      group.rotation.x = -0.35;
      scene.add(group);
      docs.push({
        group,
        base: new THREE.Vector3(x, y, z),
        speed: 0.15 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    let frame = 0;
    let t = 0;
    if (!prefersReducedMotion) {
      const animate = () => {
        frame = requestAnimationFrame(animate);
        t += 0.008;
        for (const doc of docs) {
          doc.group.position.y = doc.base.y + Math.sin(t * doc.speed + doc.phase) * 0.35;
          doc.group.rotation.z = doc.group.rotation.z + 0.0004;
        }
        renderer.render(scene, camera);
      };
      animate();
    }

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      geo.dispose();
      edgeGeo.dispose();
      fill.dispose();
      stroke.dispose();
      renderer.dispose();
      if (renderer.domElement.isConnected) renderer.domElement.remove();
    };
  }, [isDark, prefersReducedMotion]);

  return <div ref={mountRef} className="site-backdrop__ambient" aria-hidden="true" />;
}
