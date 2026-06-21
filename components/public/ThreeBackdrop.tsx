'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { useIsDark } from '@/lib/hooks/use-is-dark';
import { getBackdropPalette } from '@/lib/three/backdrop-palette';
import { getParticleTexture, getRendererPixelRatio } from '@/lib/three/particle-texture';

const PARTICLE_COUNT = 180;
const CONNECT_DISTANCE = 9;

export function ThreeBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isDark = useIsDark();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const mount = containerRef.current;
    if (!mount) return;

    const palette = getBackdropPalette(isDark);
    const particleTexture = getParticleTexture();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120);
    camera.position.z = 28;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(getRendererPixelRatio());
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'site-backdrop__three-canvas';
    mount.appendChild(renderer.domElement);

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 52;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 24;
      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.008
        )
      );
    }

    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pointColors = new Float32Array(PARTICLE_COUNT * 3);
    const primary = new THREE.Color(palette.primary);
    const secondary = new THREE.Color(palette.secondary);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const c = i % 4 === 0 ? secondary : primary;
      pointColors[i * 3] = c.r;
      pointColors[i * 3 + 1] = c.g;
      pointColors[i * 3 + 2] = c.b;
    }
    pointGeometry.setAttribute('color', new THREE.BufferAttribute(pointColors, 3));

    const pointsMaterial = new THREE.PointsMaterial({
      size: palette.particleSize,
      map: particleTexture,
      alphaMap: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: palette.particleOpacity,
      blending: palette.blending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(pointGeometry, pointsMaterial);
    scene.add(points);

    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: palette.primary,
      transparent: true,
      opacity: palette.lineOpacity,
      blending: palette.blending,
      depthWrite: false,
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    const field = new THREE.Group();
    field.add(points);
    field.add(lines);
    scene.add(field);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(getRendererPixelRatio());
      renderer.setSize(width, height, false);
    };

    let frameId = 0;
    let frame = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      frame += 1;
      const tick = frame * 0.003;

      const posAttr = pointGeometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        posArray[i3] += velocities[i].x;
        posArray[i3 + 1] += velocities[i].y;
        posArray[i3 + 2] += velocities[i].z;

        if (Math.abs(posArray[i3]) > 26) velocities[i].x *= -1;
        if (Math.abs(posArray[i3 + 1]) > 18) velocities[i].y *= -1;
        if (Math.abs(posArray[i3 + 2]) > 12) velocities[i].z *= -1;
      }
      posAttr.needsUpdate = true;

      if (frame % 4 === 0) {
        const linePositions: number[] = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const i3 = i * 3;
          for (let j = i + 1; j < PARTICLE_COUNT; j++) {
            const j3 = j * 3;
            const dx = posArray[i3] - posArray[j3];
            const dy = posArray[i3 + 1] - posArray[j3 + 1];
            const dz = posArray[i3 + 2] - posArray[j3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < CONNECT_DISTANCE) {
              linePositions.push(
                posArray[i3],
                posArray[i3 + 1],
                posArray[i3 + 2],
                posArray[j3],
                posArray[j3 + 1],
                posArray[j3 + 2]
              );
            }
          }
        }
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      }

      field.rotation.y = tick * 0.08;
      field.rotation.x = Math.sin(tick * 0.5) * 0.06;
      camera.position.x = Math.sin(tick * 0.3) * 1.5;
      camera.position.y = Math.cos(tick * 0.25) * 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      pointGeometry.dispose();
      pointsMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      const canvas = renderer.domElement;
      renderer.dispose();
      if (canvas.isConnected) {
        canvas.remove();
      }
    };
  }, [prefersReducedMotion, isDark]);

  if (prefersReducedMotion) return null;

  return (
    <div
      ref={containerRef}
      className={`site-backdrop__three ${isDark ? 'site-backdrop__three--dark' : 'site-backdrop__three--light'}`}
      aria-hidden="true"
    />
  );
}
