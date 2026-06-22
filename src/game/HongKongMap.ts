import * as THREE from 'three';
import { MAP } from '../config/mapConfig';
import { CAMPUSES } from '../data/campuses';
import { createHongKongMapTexture } from '../utils/textures';
import { BuildingMaterials } from './materials/BuildingMaterials';

export class HongKongMap {
  readonly group = new THREE.Group();

  build(scene: THREE.Scene): void {
    const width = MAP.maxX - MAP.minX;
    const depth = MAP.maxZ - MAP.minZ;
    const centerX = (MAP.minX + MAP.maxX) / 2;
    const centerZ = (MAP.minZ + MAP.maxZ) / 2;

    const mapTex = createHongKongMapTexture();
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshStandardMaterial({
        map: mapTex,
        roughness: 0.95,
        metalness: 0,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(centerX, 0, centerZ);
    ground.receiveShadow = true;
    this.group.add(ground);

    // Victoria Harbour water
    const harbour = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 0.94, 24),
      new THREE.MeshStandardMaterial({
        color: 0x1a6b8a,
        roughness: 0.15,
        metalness: 0.65,
        transparent: true,
        opacity: 0.88,
      })
    );
    harbour.rotation.x = -Math.PI / 2;
    harbour.position.set(centerX, 0.06, 2);
    harbour.name = 'harbour';
    this.group.add(harbour);

    this.addGrassPatches();
    // this.addAsphaltRoads(); // Removed black pipes connecting campuses
    this.addDistantSkyline();
    this.addHarbourBridges();

    scene.add(this.group);
  }

  private addGrassPatches(): void {
    const grass = BuildingMaterials.grass();
    const patches: [number, number, number, number][] = [
      [-70, 42, 22, 18],
      [45, 45, 18, 16],
      [-15, 52, 20, 14],
      [55, -32, 16, 12],
    ];
    patches.forEach(([x, z, w, d]) => {
      const p = new THREE.Mesh(
        new THREE.PlaneGeometry(w, d),
        grass.clone()
      );
      p.rotation.x = -Math.PI / 2;
      p.position.set(x, 0.03, z);
      p.receiveShadow = true;
      this.group.add(p);
    });
  }

  private addAsphaltRoads(): void {
    const asphalt = BuildingMaterials.asphalt();
    CAMPUSES.forEach((c) => {
      const points = [
        new THREE.Vector3(8, 0.08, 2),
        new THREE.Vector3(
          8 + (c.position.x - 8) * 0.55,
          0.08,
          2 + (c.position.z - 2) * 0.55
        ),
        new THREE.Vector3(c.position.x, 0.08, c.position.z),
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 40, 1.8, 8, false),
        asphalt
      );
      tube.receiveShadow = true;
      this.group.add(tube);
    });
    // Cross harbour routes (simplified)
    const cross = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 4),
      asphalt
    );
    cross.rotation.x = -Math.PI / 2;
    cross.position.set(-20, 0.07, 2);
    this.group.add(cross);
  }

  private addHarbourBridges(): void {
    const mat = BuildingMaterials.concrete(0x6b7280);
    [-28, 28].forEach((x) => {
      const deck = new THREE.Mesh(new THREE.BoxGeometry(10, 0.35, 22), mat);
      deck.position.set(x, 0.5, 2);
      deck.castShadow = true;
      this.group.add(deck);
      [-4, 4].forEach((z) => {
        const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.2, 8), mat);
        pier.position.set(x, 0.6, z);
        this.group.add(pier);
      });
    });
  }

  private addDistantSkyline(): void {
    const variants = [
      { color: 0x4a5568, h: 14, w: 3 },
      { color: 0x374151, h: 22, w: 4 },
      { color: 0x64748b, h: 10, w: 2.5 },
      { color: 0x1e293b, h: 18, w: 3.5 },
    ];
    const positions: [number, number][] = [
      [-35, -38], [-15, -40], [5, -42], [25, -36], [45, -34],
      [-40, 38], [-15, 42], [20, 40], [45, 38],
      [-60, 5], [65, -5],
    ];
    positions.forEach(([x, z], i) => {
      const v = variants[i % variants.length];
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(v.w, v.h, v.w * 0.7),
        new THREE.MeshStandardMaterial({
          color: v.color,
          roughness: 0.5,
          metalness: 0.35,
        })
      );
      b.position.set(x, v.h / 2, z);
      b.castShadow = true;
      this.group.add(b);
      if (i % 3 === 0) {
        const spire = new THREE.Mesh(
          new THREE.BoxGeometry(v.w * 0.4, v.h * 0.35, v.w * 0.4),
          BuildingMaterials.glass(0x94a3b8)
        );
        spire.position.set(x, v.h + v.h * 0.15, z);
        this.group.add(spire);
      }
    });
  }

  animateHarbour(t: number): void {
    const harbour = this.group.getObjectByName('harbour') as THREE.Mesh | undefined;
    if (harbour?.material instanceof THREE.MeshStandardMaterial) {
      harbour.material.opacity = 0.82 + Math.sin(t * 0.6) * 0.05;
    }
  }
}
