import * as THREE from 'three';

export type BackdropPalette = {
  primary: number;
  secondary: number;
  particleBright: number;
  lineOpacity: number;
  particleOpacity: number;
  particleSize: number;
  blending: THREE.Blending;
};

// Warm copper monochrome — one cohesive hue across the whole 3D system.
export const DARK_BACKDROP_PALETTE: BackdropPalette = {
  primary: 0xe8a55a,
  secondary: 0xc4742e,
  particleBright: 0xf3cf9a,
  lineOpacity: 0.13,
  particleOpacity: 0.9,
  particleSize: 0.2,
  blending: THREE.AdditiveBlending,
};

// Light theme: single blue family to match the UI accent.
export const LIGHT_BACKDROP_PALETTE: BackdropPalette = {
  primary: 0x2563eb,
  secondary: 0x4f46e5,
  particleBright: 0x60a5fa,
  lineOpacity: 0.2,
  particleOpacity: 0.8,
  particleSize: 0.18,
  blending: THREE.NormalBlending,
};

export function getBackdropPalette(isDark: boolean): BackdropPalette {
  return isDark ? DARK_BACKDROP_PALETTE : LIGHT_BACKDROP_PALETTE;
}
