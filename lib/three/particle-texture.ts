import * as THREE from 'three';

let cachedTexture: THREE.CanvasTexture | null = null;

/** Soft circular sprite — sharper particles at any DPR than default squares. */
export function getParticleTexture(): THREE.CanvasTexture {
  if (cachedTexture) return cachedTexture;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.25, 'rgba(255,255,255,0.85)');
    gradient.addColorStop(0.55, 'rgba(255,255,255,0.35)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  cachedTexture = new THREE.CanvasTexture(canvas);
  cachedTexture.minFilter = THREE.LinearFilter;
  cachedTexture.magFilter = THREE.LinearFilter;
  cachedTexture.generateMipmaps = false;
  cachedTexture.needsUpdate = true;
  return cachedTexture;
}

export function getRendererPixelRatio(): number {
  return Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2.5);
}
