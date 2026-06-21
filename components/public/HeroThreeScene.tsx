'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { useIsDark } from '@/lib/hooks/use-is-dark';
import { getBackdropPalette } from '@/lib/three/backdrop-palette';
import { getParticleTexture, getRendererPixelRatio } from '@/lib/three/particle-texture';

export function HeroThreeScene() {
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
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(getRendererPixelRatio());
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'hero-three-scene__canvas';
    mount.appendChild(renderer.domElement);

    const coreGeometry = new THREE.IcosahedronGeometry(1.35, 2);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: palette.primary,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.55 : 0.65,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    const outerGeometry = new THREE.TorusKnotGeometry(1.8, 0.08, 160, 24, 2, 3);
    const outerMaterial = new THREE.MeshBasicMaterial({
      color: palette.secondary,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.22 : 0.35,
    });
    const outer = new THREE.Mesh(outerGeometry, outerMaterial);
    scene.add(outer);

    const glowGeometry = new THREE.SphereGeometry(0.65, 48, 48);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: palette.primary,
      transparent: true,
      opacity: isDark ? 0.12 : 0.08,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);

    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(48 * 3);
    for (let i = 0; i < 48; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.2 + Math.random() * 0.8;
      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: palette.particleBright,
      size: isDark ? 0.07 : 0.065,
      map: particleTexture,
      alphaMap: particleTexture,
      transparent: true,
      opacity: isDark ? 0.88 : 0.75,
      blending: palette.blending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const particleField = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleField);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(getRendererPixelRatio());
      renderer.setSize(width, height, false);
    };

    let frameId = 0;
    let t = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.008;

      core.rotation.x = t * 0.4;
      core.rotation.y = t * 0.55;
      outer.rotation.x = -t * 0.25;
      outer.rotation.y = t * 0.35;
      particleField.rotation.y = t * 0.15;
      glow.scale.setScalar(1 + Math.sin(t * 2) * 0.06);

      renderer.render(scene, camera);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      coreGeometry.dispose();
      coreMaterial.dispose();
      outerGeometry.dispose();
      outerMaterial.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      const canvas = renderer.domElement;
      renderer.dispose();
      if (canvas.isConnected) {
        canvas.remove();
      }
    };
  }, [prefersReducedMotion, isDark]);

  if (prefersReducedMotion) {
    return <div className="hero-visual__core hero-visual__core--static mx-auto" />;
  }

  return <div ref={containerRef} className="hero-three-scene" aria-hidden="true" />;
}
