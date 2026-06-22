import * as THREE from 'three';

const cache = new Map<string, THREE.MeshStandardMaterial>();

function mat(
  key: string,
  opts: THREE.MeshStandardMaterialParameters
): THREE.MeshStandardMaterial {
  if (!cache.has(key)) {
    cache.set(key, new THREE.MeshStandardMaterial(opts));
  }
  return cache.get(key)!;
}

export const BuildingMaterials = {
  concrete: (color = 0xe8e4df) =>
    mat('concrete', { color, roughness: 0.85, metalness: 0.05 }),

  whiteFacade: () =>
    mat('whiteFacade', { color: 0xf5f5f0, roughness: 0.55, metalness: 0.08 }),

  brick: () =>
    mat('brick', { color: 0x9c4a3a, roughness: 0.92, metalness: 0.02 }),

  glass: (tint = 0x88b4d8) =>
    mat(`glass-${tint}`, {
      color: tint,
      roughness: 0.08,
      metalness: 0.6,
      transparent: true,
      opacity: 0.65,
    }),

  metalPanel: (color = 0xc0c8d0) =>
    mat(`metal-${color}`, { color, roughness: 0.35, metalness: 0.75 }),

  vtcTeal: () =>
    mat('vtcTeal', { color: 0x00838f, roughness: 0.5, metalness: 0.2 }),

  vtcOrange: () =>
    mat('vtcOrange', { color: 0xe65100, roughness: 0.5, metalness: 0.15 }),

  roofDark: () =>
    mat('roofDark', { color: 0x374151, roughness: 0.7, metalness: 0.25 }),

  grass: () =>
    mat('grass', { color: 0x3d6b45, roughness: 0.95, metalness: 0 }),

  asphalt: () =>
    mat('asphalt', { color: 0x3a3a3a, roughness: 0.9, metalness: 0.05 }),

  windowFrame: () =>
    mat('windowFrame', { color: 0x4a5568, roughness: 0.4, metalness: 0.3 }),
};

export function addWindowGrid(
  parent: THREE.Object3D,
  width: number,
  height: number,
  cols: number,
  rows: number,
  z: number,
  yCenter: number,
  matGlass = BuildingMaterials.glass()
): void {
  const cellW = width / cols;
  const cellH = height / rows;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(cellW * 0.82, cellH * 0.75),
        matGlass
      );
      win.position.set(
        -width / 2 + cellW * (c + 0.5),
        yCenter - height / 2 + cellH * (r + 0.5),
        z
      );
      parent.add(win);
    }
  }
}
