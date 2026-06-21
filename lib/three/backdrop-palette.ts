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

export const DARK_BACKDROP_PALETTE: BackdropPalette = {
  primary: 0xe8a55a,
  secondary: 0x5eb8b0,
  particleBright: 0xf0c078,
  lineOpacity: 0.14,
  particleOpacity: 0.92,
  particleSize: 0.2,
  blending: THREE.AdditiveBlending,
};

export const LIGHT_BACKDROP_PALETTE: BackdropPalette = {
  primary: 0x4f46e5,
  secondary: 0x0891b2,
  particleBright: 0x6366f1,
  lineOpacity: 0.22,
  particleOpacity: 0.82,
  particleSize: 0.18,
  blending: THREE.NormalBlending,
};

export function getBackdropPalette(isDark: boolean): BackdropPalette {
  return isDark ? DARK_BACKDROP_PALETTE : LIGHT_BACKDROP_PALETTE;
}
