import * as THREE from 'three';

/** Low-poly VTC / HKIIT student avatar with backpack and uniform. */
export function createStudentCharacter(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'student';

  const skin = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.7 });
  const uniform = new THREE.MeshStandardMaterial({
    color: 0x1e3a5f,
    roughness: 0.6,
    metalness: 0.1,
  });
  const accent = new THREE.MeshStandardMaterial({
    color: 0x00d4aa,
    emissive: 0x003328,
    emissiveIntensity: 0.25,
  });
  const pants = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const backpack = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
  const shoes = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), skin);
  head.position.y = 2.05;
  head.castShadow = true;
  g.add(head);

  // Hair cap
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.9 })
  );
  hair.position.y = 2.15;
  hair.castShadow = true;
  g.add(hair);

  // Torso (uniform shirt)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.9, 0.4), uniform);
  torso.position.y = 1.35;
  torso.castShadow = true;
  g.add(torso);

  // Collar stripe (HKIIT accent)
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.12, 0.42), accent);
  collar.position.y = 1.72;
  g.add(collar);

  // ID lanyard
  const lanyard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.02), accent);
  lanyard.position.set(0, 1.5, 0.22);
  g.add(lanyard);

  // Backpack
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.28), backpack);
  pack.position.set(0, 1.35, -0.32);
  pack.castShadow = true;
  g.add(pack);

  // Arms
  const armGeo = new THREE.CapsuleGeometry(0.12, 0.45, 4, 8);
  const leftArm = new THREE.Mesh(armGeo, uniform);
  leftArm.position.set(-0.48, 1.35, 0);
  leftArm.rotation.z = 0.2;
  leftArm.castShadow = true;
  g.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, uniform);
  rightArm.position.set(0.48, 1.35, 0);
  rightArm.rotation.z = -0.2;
  rightArm.castShadow = true;
  g.add(rightArm);

  // Legs
  const legGeo = new THREE.CapsuleGeometry(0.14, 0.55, 4, 8);
  const leftLeg = new THREE.Mesh(legGeo, pants);
  leftLeg.name = 'legL';
  leftLeg.position.set(-0.2, 0.55, 0);
  leftLeg.castShadow = true;
  g.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, pants);
  rightLeg.name = 'legR';
  rightLeg.position.set(0.2, 0.55, 0);
  rightLeg.castShadow = true;
  g.add(rightLeg);

  // Shoes
  const shoeGeo = new THREE.BoxGeometry(0.22, 0.1, 0.32);
  const leftShoe = new THREE.Mesh(shoeGeo, shoes);
  leftShoe.position.set(-0.2, 0.08, 0.04);
  g.add(leftShoe);
  const rightShoe = new THREE.Mesh(shoeGeo, shoes);
  rightShoe.position.set(0.2, 0.08, 0.04);
  g.add(rightShoe);

  // Shadow ring
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.55, 0.7, 32),
    new THREE.MeshBasicMaterial({
      color: 0x00d4aa,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  g.add(ring);

  return g;
}
