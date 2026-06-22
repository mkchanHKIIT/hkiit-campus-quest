import * as THREE from 'three';

/** Sky, lighting, and renderer settings for a more realistic look. */
export class RealisticEnvironment {
  private skyMesh!: THREE.Mesh;

  setupScene(scene: THREE.Scene): void {
    scene.background = null;
    scene.fog = new THREE.FogExp2(0xb8c9d9, 0.0045);

    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x4a6741, 0.55);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff4e0, 1.35);
    sun.position.set(60, 90, 45);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096);
    sun.shadow.bias = -0.0002;
    sun.shadow.normalBias = 0.02;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 220;
    const s = 100;
    sun.shadow.camera.left = -s;
    sun.shadow.camera.right = s;
    sun.shadow.camera.top = s;
    sun.shadow.camera.bottom = -s;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xc8daf0, 0.35);
    fill.position.set(-40, 30, -50);
    scene.add(fill);

    this.skyMesh = this.createSkyDome();
    scene.add(this.skyMesh);
  }

  setupRenderer(renderer: THREE.WebGLRenderer): void {
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  private createSkyDome(): THREE.Mesh {
    const geo = new THREE.SphereGeometry(180, 32, 16);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#1e5a8a');
    grad.addColorStop(0.35, '#5ba3d9');
    grad.addColorStop(0.65, '#9fd4f7');
    grad.addColorStop(1, '#e8f4fc');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });
    const sky = new THREE.Mesh(geo, mat);
    sky.position.y = 20;
    return sky;
  }
}
