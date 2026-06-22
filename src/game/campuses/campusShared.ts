import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { Campus } from '../../types';
import {
  createCampusSignTexture,
  createHkiitLogoTexture,
  createProgrammeIconTexture,
  getProgrammeIconsForCampus,
} from '../../utils/textures';

export const INTERACT_RADIUS = 12;

export interface CampusBuildResult {
  group: THREE.Group;
  light: THREE.PointLight;
  label: CSS2DObject;
  beacon: THREE.Mesh;
  logoMesh: THREE.Mesh;
  programmeIcons: Map<string, THREE.Mesh>;
}

export function mesh(
  geo: THREE.BufferGeometry,
  material: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
  castShadow = true
): THREE.Mesh {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = castShadow;
  m.receiveShadow = true;
  return m;
}

export function addHKIITLogo(
  parent: THREE.Object3D,
  x: number,
  y: number,
  z: number,
  w = 6,
  h = 2.4
): THREE.Mesh {
  const tex = createHkiitLogoTexture();
  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  logo.position.set(x, y, z);
  logo.userData.billboard = true;
  logo.name = 'hkiit-logo';
  parent.add(logo);
  return logo;
}

export function addProgrammeIcons(
  parent: THREE.Object3D,
  campus: Campus,
  facadeZ: number,
  baseY: number,
  spacing = 1.35
): Map<string, THREE.Mesh> {
  const icons = getProgrammeIconsForCampus(campus.id);
  const map = new Map<string, THREE.Mesh>();
  const cols = Math.min(4, icons.length);
  icons.forEach((prog, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const tex = createProgrammeIconTexture(prog.icon, false);
    const iconMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    iconMesh.position.set(
      (col - (cols - 1) / 2) * spacing,
      baseY - row * 1.15,
      facadeZ
    );
    iconMesh.userData.billboard = true;
    iconMesh.userData.programmeId = prog.id;
    iconMesh.userData.iconChar = prog.icon;
    map.set(prog.id, iconMesh);
    parent.add(iconMesh);
  });
  return map;
}

export function addCampusLabel(parent: THREE.Object3D, campus: Campus, height: number): CSS2DObject {
  const colorHex = `#${campus.color.toString(16).padStart(6, '0')}`;
  const icons = getProgrammeIconsForCampus(campus.id).map((p) => p.icon).join(' ');
  const div = document.createElement('div');
  div.className = 'campus-label-3d';
  div.innerHTML = `
    <div class="campus-label-inner campus-label-realistic" style="--campus-color:${colorHex}">
      <span class="campus-logo-text">HKIIT</span>
      <strong>${campus.short}</strong>
      <span class="campus-zh">${campus.shortZh}</span>
      <span class="campus-arch">${campus.architectureHint}</span>
      <span class="campus-prog-icons">${icons}</span>
    </div>
  `;
  const label = new CSS2DObject(div);
  label.position.set(0, height, 0);
  parent.add(label);
  return label;
}

export function addInteractPad(
  parent: THREE.Object3D,
  color: number,
  radius = INTERACT_RADIUS
): void {
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.06, 48),
    new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity: 0.15,
      roughness: 0.8,
    })
  );
  pad.position.y = 0.04;
  pad.receiveShadow = true;
  parent.add(pad);
}

export function addEntranceCanopy(
  parent: THREE.Object3D,
  color: number,
  z: number
): void {
  const canopy = mesh(
    new THREE.BoxGeometry(8, 0.15, 3),
    new THREE.MeshStandardMaterial({ color, metalness: 0.4, roughness: 0.4 }),
    0,
    3.2,
    z
  );
  parent.add(canopy);
  [-3, 3].forEach((x) => {
    parent.add(
      mesh(
        new THREE.CylinderGeometry(0.12, 0.14, 3.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.5, roughness: 0.4 }),
        x,
        1.6,
        z + 1
      )
    );
  });
}

export function addIVELogoBand(
  parent: THREE.Object3D,
  y: number,
  z: number,
  width: number,
  accentMat: THREE.Material
): void {
  parent.add(mesh(new THREE.BoxGeometry(width, 0.5, 0.2), accentMat, 0, y, z));
  const iveSign = mesh(
    new THREE.PlaneGeometry(width * 0.5, 0.8),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    0,
    y + 0.5,
    z + 0.11
  );
  parent.add(iveSign);
}

export function finishCampus(
  g: THREE.Group,
  campus: Campus,
  logoMesh: THREE.Mesh,
  programmeIcons: Map<string, THREE.Mesh>,
  labelHeight: number,
  beaconY: number
): CampusBuildResult {
  const colorHex = `#${campus.color.toString(16).padStart(6, '0')}`;
  const signTex = createCampusSignTexture(
    campus.short,
    campus.shortZh,
    campus.district,
    colorHex
  );
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 2.5),
    new THREE.MeshBasicMaterial({ map: signTex, transparent: true, side: THREE.DoubleSide })
  );
  sign.position.set(10, 4, 2);
  sign.rotation.y = -Math.PI / 2;
  sign.userData.billboard = true;
  g.add(sign);

  const light = new THREE.PointLight(campus.color, 1.2, 40);
  light.position.set(0, 8, 4);
  g.add(light);

  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 8, 8),
    new THREE.MeshStandardMaterial({
      color: 0xfff8e7,
      emissive: campus.color,
      emissiveIntensity: 0.8,
    })
  );
  beacon.position.y = beaconY;
  g.add(beacon);

  addInteractPad(g, campus.color);
  const label = addCampusLabel(g, campus, labelHeight);

  return { group: g, light, label, beacon, logoMesh, programmeIcons };
}
