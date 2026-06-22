export {
  createCampusBuilding,
  type CampusBuildResult,
} from './campuses/CampusModelFactory';
export { INTERACT_RADIUS } from './campuses/campusShared';

import * as THREE from 'three';
import { createProgrammeIconTexture } from '../utils/textures';

export function updateProgrammeIcons(
  programmeIcons: Map<string, THREE.Mesh>,
  completedAreas: Set<string>
): void {
  programmeIcons.forEach((mesh, id) => {
    const icon = (mesh.userData.iconChar as string) ?? '📘';
    const done = completedAreas.has(id);
    const mat = mesh.material as THREE.MeshBasicMaterial;
    if (mat.map) mat.map.dispose();
    mat.map = createProgrammeIconTexture(icon, done);
    mat.needsUpdate = true;
  });
}
