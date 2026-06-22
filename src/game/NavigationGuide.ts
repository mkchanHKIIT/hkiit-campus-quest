import * as THREE from 'three';
import { CAMPUSES } from '../data/campuses';
import type { Campus } from '../types';

export class NavigationGuide {
  private arrowHelper: THREE.ArrowHelper;
  private groundRing: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    this.arrowHelper = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(),
      12,
      0x00d4aa,
      2.5,
      1.8
    );
    this.arrowHelper.position.y = 0.5;
    scene.add(this.arrowHelper);

    const ringGeo = new THREE.RingGeometry(1.2, 1.5, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00d4aa,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    this.groundRing = new THREE.Mesh(ringGeo, ringMat);
    this.groundRing.rotation.x = -Math.PI / 2;
    this.groundRing.position.y = 0.2;
    scene.add(this.groundRing);
  }

  /** Nearest campus with incomplete programme areas. */
  getTargetCampus(
    playerPos: THREE.Vector3,
    completedAreas: Set<string>
  ): Campus | null {
    let best: Campus | null = null;
    let bestScore = Infinity;

    for (const c of CAMPUSES) {
      const hasWork = c.programmeAreaIds.some((id) => !completedAreas.has(id));
      if (!hasWork) continue;

      const dist = Math.hypot(
        playerPos.x - c.position.x,
        playerPos.z - c.position.z
      );
      if (dist < bestScore) {
        bestScore = dist;
        best = c;
      }
    }
    return best;
  }

  update(
    playerPos: THREE.Vector3,
    completedAreas: Set<string>,
    t: number
  ): { campus: Campus; distance: number; direction: string } | null {
    const target = this.getTargetCampus(playerPos, completedAreas);
    if (!target) {
      this.arrowHelper.visible = false;
      this.groundRing.visible = false;
      return null;
    }

    const dx = target.position.x - playerPos.x;
    const dz = target.position.z - playerPos.z;
    const dist = Math.hypot(dx, dz);
    const dir = new THREE.Vector3(dx, 0, dz).normalize();

    this.arrowHelper.visible = true;
    this.arrowHelper.position.set(playerPos.x, 0.5, playerPos.z);
    this.arrowHelper.setDirection(dir);
    this.arrowHelper.setColor(0x00d4aa);
    this.arrowHelper.setLength(Math.min(14, dist * 0.35 + 4), 2.5, 1.8);

    this.groundRing.visible = true;
    this.groundRing.position.set(playerPos.x, 0.2, playerPos.z);
    this.groundRing.scale.setScalar(1 + Math.sin(t * 4) * 0.08);

    const direction = this.compassDirection(dir);
    return { campus: target, distance: dist, direction };
  }

  private compassDirection(dir: THREE.Vector3): string {
    const angle = Math.atan2(dir.x, -dir.z);
    const deg = ((angle * 180) / Math.PI + 360) % 360;
    if (deg >= 337.5 || deg < 22.5) return 'North ↑';
    if (deg < 67.5) return 'North-East ↗';
    if (deg < 112.5) return 'East →';
    if (deg < 157.5) return 'South-East ↘';
    if (deg < 202.5) return 'South ↓';
    if (deg < 247.5) return 'South-West ↙';
    if (deg < 292.5) return 'West ←';
    return 'North-West ↖';
  }
}
