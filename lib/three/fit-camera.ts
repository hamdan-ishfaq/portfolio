import type * as THREE from 'three';

/**
 * Pull the camera back far enough that the node ring *and* its labels stay
 * inside the viewport at any panel shape. Without this, tall narrow panels
 * clip the outermost labels.
 */
export function fitCameraToNetwork(
  camera: THREE.PerspectiveCamera,
  aspect: number,
  halfWidth = 3.7,
  halfHeight = 2.35
): void {
  const tan = Math.tan((camera.fov * Math.PI) / 360);
  const forWidth = halfWidth / (tan * Math.max(aspect, 0.2));
  const forHeight = halfHeight / tan;
  camera.position.z = Math.max(forWidth, forHeight, 7);
}
