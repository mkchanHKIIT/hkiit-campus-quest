import * as THREE from 'three';
import type { Campus } from '../../types';
import { BuildingMaterials, addWindowGrid } from '../materials/BuildingMaterials';
import {
  addEntranceCanopy,
  addHKIITLogo,
  addProgrammeIcons,
  finishCampus,
  mesh,
  type CampusBuildResult,
} from './campusShared';

/** VTC Tsing Yi Complex — HKIIT HQ: modern glass wings & central atrium (2024). */
function buildTsingYi(campus: Campus): CampusBuildResult {
  const g = new THREE.Group();
  const concrete = BuildingMaterials.concrete(0xd4d0cb);
  const glass = BuildingMaterials.glass(0x7eb8d8);
  const teal = BuildingMaterials.vtcTeal();

  // Podium plaza
  g.add(mesh(new THREE.BoxGeometry(28, 0.6, 20), concrete, 0, 0.3, 2));

  // Left wing
  g.add(mesh(new THREE.BoxGeometry(10, 5, 14), BuildingMaterials.whiteFacade(), -9, 3.1, 0));
  addWindowGrid(g, 9, 4, 4, 3, 7.05, 3.5, glass);

  // Central atrium tower (glass)
  g.add(mesh(new THREE.BoxGeometry(8, 11, 10), BuildingMaterials.metalPanel(0xb8c5d0), 0, 6.1, -1));
  addWindowGrid(g, 7, 9, 3, 7, 5.05, 6.5, glass);
  g.add(mesh(new THREE.BoxGeometry(8.5, 0.8, 10.5), teal, 0, 11.5, -1));

  // Right wing
  g.add(mesh(new THREE.BoxGeometry(10, 5, 14), BuildingMaterials.whiteFacade(), 9, 3.1, 0));
  addWindowGrid(g, 9, 4, 4, 3, -7.05, 3.5, glass);

  // Curved roof accent (cylinder slice)
  const roof = mesh(
    new THREE.CylinderGeometry(6, 6, 14, 16, 1, false, 0, Math.PI),
    BuildingMaterials.roofDark(),
    0,
    11.8,
    -1
  );
  roof.rotation.x = Math.PI / 2;
  g.add(roof);

  addEntranceCanopy(g, 0x00838f, 9);
  const logo = addHKIITLogo(g, 0, 7.5, 5.2, 7, 2.8);
  const icons = addProgrammeIcons(g, campus, 5.25, 4.5);
  return finishCampus(g, campus, logo, icons, 16, 12.5);
}

/** IVE Chai Wan — terraced blocks on hillside, Shing Tai Road. */
function buildChaiWan(campus: Campus): CampusBuildResult {
  const g = new THREE.Group();
  const white = BuildingMaterials.whiteFacade();
  const glass = BuildingMaterials.glass(0x6a9bc3);
  const hill = BuildingMaterials.grass();

  // Hillside
  const slope = mesh(
    new THREE.BoxGeometry(22, 8, 14),
    hill,
    -4,
    4,
    -10
  );
  slope.rotation.x = -0.35;
  g.add(slope);

  // Lower terrace
  g.add(mesh(new THREE.BoxGeometry(16, 4, 10), white, 0, 2.3, 2));
  addWindowGrid(g, 14, 3, 5, 2, 7.05, 2.5, glass);

  // Mid terrace (set back)
  g.add(mesh(new THREE.BoxGeometry(14, 3.5, 9), white, 0, 5.8, -2));
  addWindowGrid(g, 12, 2.8, 4, 2, -6.05, 6, glass);

  // Upper block
  g.add(mesh(new THREE.BoxGeometry(12, 3, 8), white, 0, 8.5, -5));
  g.add(mesh(new THREE.BoxGeometry(12.5, 0.4, 8.5), BuildingMaterials.vtcOrange(), 0, 10.2, -5));

  g.add(mesh(new THREE.BoxGeometry(18, 0.5, 12), BuildingMaterials.asphalt(), 0, 0.25, 6));
  addEntranceCanopy(g, 0x1565c0, 7);
  const logo = addHKIITLogo(g, 0, 5.5, 7.1, 5.5, 2.2);
  const icons = addProgrammeIcons(g, campus, 7.15, 4);
  return finishCampus(g, campus, logo, icons, 14, 10.5);
}

/** IVE Kwun Tong — compact urban tower, Hiu Ming Street. */
function buildKwunTong(campus: Campus): CampusBuildResult {
  const g = new THREE.Group();
  const concrete = BuildingMaterials.concrete(0x9ca3af);
  const glass = BuildingMaterials.glass(0x5a7a9a);
  const orange = BuildingMaterials.vtcOrange();

  g.add(mesh(new THREE.BoxGeometry(12, 0.4, 10), BuildingMaterials.asphalt(), 0, 0.2, 4));

  // Main tower
  g.add(mesh(new THREE.BoxGeometry(9, 10, 9), concrete, 0, 5.4, 0));
  addWindowGrid(g, 8, 8, 3, 6, 4.55, 5.5, glass);

  // VTC orange band (IVE signature)
  g.add(mesh(new THREE.BoxGeometry(9.2, 0.6, 9.2), orange, 0, 8.5, 0));
  g.add(mesh(new THREE.BoxGeometry(9.2, 0.6, 9.2), orange, 0, 3.5, 0));

  // Annex
  g.add(mesh(new THREE.BoxGeometry(6, 3, 5), BuildingMaterials.whiteFacade(), 8, 1.8, 3));
  addWindowGrid(g, 5, 2.5, 3, 1, 10.55, 2, glass);

  addEntranceCanopy(g, 0xe65100, 5.5);
  const logo = addHKIITLogo(g, 0, 6, 4.65, 5, 2);
  const icons = addProgrammeIcons(g, campus, 4.7, 3.8, 1.2);
  return finishCampus(g, campus, logo, icons, 13, 11);
}

/** IVE Lee Wai Lee — modern Tseung Kwan O campus, King Ling Road. */
function buildLeeWaiLee(campus: Campus): CampusBuildResult {
  const g = new THREE.Group();
  const white = BuildingMaterials.whiteFacade();
  const glass = BuildingMaterials.glass(0x8ecae6);
  const grass = BuildingMaterials.grass();

  // Campus lawn
  g.add(mesh(new THREE.CylinderGeometry(14, 14, 0.3, 32), grass, 0, 0.15, 0));

  // Main long block
  g.add(mesh(new THREE.BoxGeometry(22, 4.5, 8), white, 0, 2.5, 0));
  addWindowGrid(g, 20, 3.5, 8, 2, 4.05, 2.8, glass);

  // Glass entrance facade
  g.add(mesh(new THREE.BoxGeometry(10, 5, 0.4), glass, 0, 3, 4.25));

  // Green roof (sustainable campus)
  g.add(mesh(new THREE.BoxGeometry(22.5, 0.35, 8.5), grass, 0, 4.85, 0));

  // Secondary wing
  g.add(mesh(new THREE.BoxGeometry(8, 3, 12), white, -12, 1.8, -2));
  addWindowGrid(g, 7, 2.5, 2, 2, -8.05, 2, glass);

  // Plaza paving
  g.add(mesh(new THREE.BoxGeometry(16, 0.08, 10), BuildingMaterials.concrete(0xc4c0b8), 0, 0.2, 7));

  addEntranceCanopy(g, 0xad1457, 6);
  const logo = addHKIITLogo(g, 0, 4.2, 4.5, 6.5, 2.5);
  const icons = addProgrammeIcons(g, campus, 4.55, 3.5);
  return finishCampus(g, campus, logo, icons, 12, 9);
}

/** IVE Sha Tin — spread courtyard blocks, Yuen Wo Road. */
function buildShaTin(campus: Campus): CampusBuildResult {
  const g = new THREE.Group();
  const white = BuildingMaterials.whiteFacade();
  const brick = BuildingMaterials.brick();
  const glass = BuildingMaterials.glass(0x7a9ec8);

  g.add(mesh(new THREE.BoxGeometry(26, 0.4, 16), BuildingMaterials.asphalt(), 0, 0.2, 0));

  [-8, 0, 8].forEach((x) => {
    g.add(mesh(new THREE.BoxGeometry(7, 1.2, 12), brick, x, 0.9, 0));
    g.add(mesh(new THREE.BoxGeometry(6.5, 4, 11), white, x, 3.5, 0));
    addWindowGrid(g, 6, 3.5, 2, 3, x > 0 ? 3.05 : -3.05, 3.5, glass);
    g.add(mesh(new THREE.BoxGeometry(7, 0.3, 12), BuildingMaterials.roofDark(), x, 5.6, 0));
  });

  // Courtyard trees (simple cylinders)
  [-4, 4].forEach((x) => {
    g.add(mesh(new THREE.CylinderGeometry(0.3, 0.4, 2, 6), BuildingMaterials.concrete(0x5c4033), x, 1, 0));
    g.add(mesh(new THREE.ConeGeometry(1.2, 2.5, 8), BuildingMaterials.grass(), x, 2.8, 0));
  });

  addEntranceCanopy(g, 0xf9a825, 7);
  const logo = addHKIITLogo(g, 0, 5.5, 6.2, 6, 2.4);
  const icons = addProgrammeIcons(g, campus, 6.25, 4);
  return finishCampus(g, campus, logo, icons, 13, 10);
}

/** IVE Tuen Mun — L-shaped campus, Tsing Wun Road. */
function buildTuenMun(campus: Campus): CampusBuildResult {
  const g = new THREE.Group();
  const white = BuildingMaterials.whiteFacade();
  const glass = BuildingMaterials.glass(0x6b9e7a);
  const grass = BuildingMaterials.grass();

  g.add(mesh(new THREE.BoxGeometry(20, 0.3, 18), grass, 0, 0.15, 0));

  // L-wing horizontal
  g.add(mesh(new THREE.BoxGeometry(16, 4, 7), white, -2, 2.3, 2));
  addWindowGrid(g, 14, 3.5, 5, 2, 5.55, 2.5, glass);

  // L-wing vertical
  g.add(mesh(new THREE.BoxGeometry(7, 4, 12), white, 6, 2.3, -3));
  addWindowGrid(g, 6, 3.5, 2, 3, 9.55, 2.5, glass);

  // Clock tower (IVE Tuen Mun landmark style)
  const tower = mesh(
    new THREE.BoxGeometry(2.5, 8, 2.5),
    BuildingMaterials.concrete(0xd1d5db),
    -8,
    4.5,
    -2
  );
  g.add(tower);
  g.add(mesh(new THREE.CylinderGeometry(1.8, 2, 1.2, 12), BuildingMaterials.roofDark(), -8, 9, -2));
  const clock = mesh(
    new THREE.CylinderGeometry(0.9, 0.9, 0.15, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffcc, emissiveIntensity: 0.3 }),
    -8,
    7.5,
    -0.9
  );
  clock.rotation.x = Math.PI / 2;
  g.add(clock);

  g.add(mesh(new THREE.BoxGeometry(10, 0.08, 8), BuildingMaterials.asphalt(), -2, 0.2, 8));
  addEntranceCanopy(g, 0x2e7d32, 9);
  const logo = addHKIITLogo(g, -2, 5, 5.65, 5.5, 2.2);
  const icons = addProgrammeIcons(g, campus, 5.7, 3.8);
  return finishCampus(g, campus, logo, icons, 12, 9.5);
}

const BUILDERS: Record<string, (c: Campus) => CampusBuildResult> = {
  tsingyi: buildTsingYi,
  chaiwan: buildChaiWan,
  kwuntong: buildKwunTong,
  leewai: buildLeeWaiLee,
  shatin: buildShaTin,
  tuenmun: buildTuenMun,
};

export function createCampusBuilding(campus: Campus): CampusBuildResult {
  const build = BUILDERS[campus.id];
  if (!build) throw new Error(`No campus model for ${campus.id}`);
  return build(campus);
}

export { type CampusBuildResult } from './campusShared';
