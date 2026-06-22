import * as THREE from 'three';

/** Orbit camera around a target (player) — mouse drag + scroll + Q/R keys. */
export class CameraController {
  yaw = Math.PI * 0.15;
  pitch = 0.55;
  distance = 28;
  minDistance = 12;
  maxDistance = 55;
  minPitch = 0.25;
  maxPitch = 1.35;

  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private readonly canvas: HTMLElement;
  private keys = new Set<string>();

  constructor(canvas: HTMLElement) {
    this.canvas = canvas;
    this.bind();
  }

  private bind(): void {
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0 || e.button === 2) {
        this.dragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
      }
    });
    window.addEventListener('mouseup', () => {
      this.dragging = false;
    });
    window.addEventListener('mousemove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.yaw -= dx * 0.005;
      this.pitch = THREE.MathUtils.clamp(this.pitch + dy * 0.004, this.minPitch, this.maxPitch);
    });
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.distance = THREE.MathUtils.clamp(
        this.distance + e.deltaY * 0.03,
        this.minDistance,
        this.maxDistance
      );
    }, { passive: false });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'q') this.keys.add('rotL');
      if (k === 'r') this.keys.add('rotR');
    });
    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'q') this.keys.delete('rotL');
      if (k === 'r') this.keys.delete('rotR');
    });
  }

  update(dt: number): void {
    const rotSpeed = 1.8 * dt;
    if (this.keys.has('rotL')) this.yaw += rotSpeed;
    if (this.keys.has('rotR')) this.yaw -= rotSpeed;
  }

  apply(camera: THREE.PerspectiveCamera, target: THREE.Vector3): void {
    const h = this.distance * Math.sin(this.pitch);
    const flat = this.distance * Math.cos(this.pitch);
    const ox = Math.sin(this.yaw) * flat;
    const oz = Math.cos(this.yaw) * flat;
    const desired = new THREE.Vector3(target.x + ox, target.y + h + 4, target.z + oz);
    camera.position.lerp(desired, 0.12);
    camera.lookAt(target.x, target.y + 2.5, target.z);
  }

  /** Horizontal "into the screen" direction (W / forward). */
  getForwardDirection(): THREE.Vector3 {
    return new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
  }

  /** Horizontal strafe right (D). */
  getRightDirection(): THREE.Vector3 {
    return new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
  }
}
