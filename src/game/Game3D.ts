import * as THREE from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { CAMPUSES } from '../data/campuses';
import { PROGRAMME_AREAS, PROGRAMME_AREA_MAP, TOTAL_PROGRAMME_AREAS } from '../data/programmeAreas';
import type { Campus, ProgrammeArea } from '../types';
import { UIManager } from '../ui/UIManager';
import { MAP, PLAYER_START } from '../config/mapConfig';
import { HongKongMap } from './HongKongMap';
import {
  createCampusBuilding,
  INTERACT_RADIUS,
  updateProgrammeIcons,
} from './CampusBuilding';
import { createStudentCharacter } from './StudentCharacter';
import { NavigationGuide } from './NavigationGuide';
import { CameraController } from './CameraController';
import { RealisticEnvironment } from './RealisticEnvironment';

const PLAYER_SPEED = 0.38;

export class Game3D {
  private readonly container: HTMLElement;
  private readonly ui: UIManager;

  private renderer!: THREE.WebGLRenderer;
  private labelRenderer!: CSS2DRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private cameraCtrl!: CameraController;
  private clock = new THREE.Clock();
  private hkMap!: HongKongMap;
  private environment!: RealisticEnvironment;
  private navigation!: NavigationGuide;

  private player!: THREE.Group;
  private keys = new Set<string>();

  private campusMeshes = new Map<string, THREE.Group>();
  private campusLights = new Map<string, THREE.PointLight>();
  private campusBeacons = new Map<string, THREE.Mesh>();
  private campusProgrammeIcons = new Map<string, Map<string, THREE.Mesh>>();

  private score = 0;
  private energy = 100;
  private completedAreas = new Set<string>();
  private visitedCampuses = new Set<string>();
  private activeCampus: Campus | null = null;
  private pendingArea: ProgrammeArea | null = null;
  private quizOpen = false;
  private running = false;
  private animationId = 0;

  constructor(containerId: string, ui: UIManager) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Container #${containerId} not found`);
    this.container = el;
    this.ui = ui;
    this.ui.initBadges(PROGRAMME_AREAS);
    this.ui.setHandlers({
      onStart: () => this.start(),
      onReplay: () => this.reset(),
      onAnswer: (i) => this.handleAnswer(i),
      onCloseQuiz: () => this.closeQuiz(),
    });
    this.initScene();
    this.bindInput();
    this.renderOnce();
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
    this.environment = new RealisticEnvironment();
    this.environment.setupScene(this.scene);

    this.camera = new THREE.PerspectiveCamera(
      50,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      400
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.environment.setupRenderer(this.renderer);
    this.container.appendChild(this.renderer.domElement);

    this.cameraCtrl = new CameraController(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    this.container.appendChild(this.labelRenderer.domElement);

    this.hkMap = new HongKongMap();
    this.hkMap.build(this.scene);

    this.addTrees();
    this.player = createStudentCharacter();
    this.player.position.set(PLAYER_START.x, 0, PLAYER_START.z);
    this.scene.add(this.player);

    CAMPUSES.forEach((c) => {
      const built = createCampusBuilding(c);
      built.group.position.set(c.position.x, 0, c.position.z);
      this.scene.add(built.group);
      this.campusMeshes.set(c.id, built.group);
      this.campusLights.set(c.id, built.light);
      this.campusBeacons.set(c.id, built.beacon);
      this.campusProgrammeIcons.set(c.id, built.programmeIcons);
    });

    this.navigation = new NavigationGuide(this.scene);
    window.addEventListener('resize', () => this.onResize());
  }

  private addTrees(): void {
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x166534 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    for (let i = 0; i < 35; i++) {
      const x = MAP.minX + Math.random() * (MAP.maxX - MAP.minX);
      const z = MAP.minZ + Math.random() * (MAP.maxZ - MAP.minZ);
      if (Math.abs(z) < 14 && Math.abs(x) < 70) continue;
      if (CAMPUSES.some((c) => Math.hypot(x - c.position.x, z - c.position.z) < 12)) continue;

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 1, 6), trunkMat);
      trunk.position.set(x, 0.5, z);
      trunk.castShadow = true;
      this.scene.add(trunk);
      const crown = new THREE.Mesh(new THREE.ConeGeometry(1, 2.2, 6), treeMat);
      crown.position.set(x, 1.8, z);
      crown.castShadow = true;
      this.scene.add(crown);
    }
  }

  private bindInput(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.key.toLowerCase() === 'e' && this.running && !this.quizOpen) {
        this.tryInteract();
      }
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
  }

  private start(): void {
    this.resetState();
    this.running = true;
    this.ui.log('Drag mouse to rotate camera · Scroll to zoom · WASD to walk', true);
    this.animate();
  }

  private reset(): void {
    cancelAnimationFrame(this.animationId);
    this.running = false;
    this.resetState();
    this.player.position.set(PLAYER_START.x, 0, PLAYER_START.z);
    this.renderOnce();
  }

  private resetState(): void {
    this.score = 0;
    this.energy = 100;
    this.completedAreas.clear();
    this.visitedCampuses.clear();
    this.activeCampus = null;
    this.pendingArea = null;
    this.quizOpen = false;
    this.ui.closeQuiz();
    PROGRAMME_AREAS.forEach((a) => {
      document.getElementById(`badge-${a.id}`)?.classList.remove('earned');
    });
    this.campusProgrammeIcons.forEach((icons) =>
      updateProgrammeIcons(icons, this.completedAreas)
    );
    this.ui.updateHUD(0, 100, 0, 0);
    this.ui.updateNavigation(null);
  }

  /** WASD relative to camera yaw (walk toward where you are looking). */
  private getMovement(): THREE.Vector3 {
    let forward = 0;
    let strafe = 0;
    if (this.keys.has('arrowup') || this.keys.has('w')) forward += 1;
    if (this.keys.has('arrowdown') || this.keys.has('s')) forward -= 1;
    if (this.keys.has('arrowleft') || this.keys.has('a')) strafe -= 1;
    if (this.keys.has('arrowright') || this.keys.has('d')) strafe += 1;
    if (forward === 0 && strafe === 0) return new THREE.Vector3();

    const m = new THREE.Vector3()
      .addScaledVector(this.cameraCtrl.getForwardDirection(), forward)
      .addScaledVector(this.cameraCtrl.getRightDirection(), strafe);
    return m.normalize();
  }

  private nearestCampus(): { campus: Campus; dist: number } | null {
    let best: Campus | null = null;
    let bestD = INTERACT_RADIUS;
    for (const c of CAMPUSES) {
      const d = Math.hypot(
        this.player.position.x - c.position.x,
        this.player.position.z - c.position.z
      );
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    return best ? { campus: best, dist: bestD } : null;
  }

  private getNextAreaAtCampus(campus: Campus): ProgrammeArea | null {
    for (const id of campus.programmeAreaIds) {
      if (!this.completedAreas.has(id)) {
        return PROGRAMME_AREA_MAP.get(id) ?? null;
      }
    }
    return null;
  }

  private tryInteract(): void {
    const near = this.nearestCampus();
    if (!near) return;

    const { campus } = near;
    this.visitedCampuses.add(campus.id);
    const area = this.getNextAreaAtCampus(campus);
    if (!area) {
      this.ui.log(`${campus.short} (${campus.shortZh}): all areas done here.`);
      return;
    }

    this.activeCampus = campus;
    this.pendingArea = area;
    this.quizOpen = true;
    this.ui.openQuiz(campus, area);
    const remaining = campus.programmeAreaIds.filter((id) => !this.completedAreas.has(id)).length;
    this.ui.log(`${campus.shortZh} ${campus.short}: ${area.name} (${remaining} left)`);
  }

  private handleAnswer(index: number): void {
    if (!this.pendingArea || !this.activeCampus) return;
    const area = this.pendingArea;
    const correct = index === area.question.correctIndex;

    this.ui.showExplanation(area.question.explanation, correct);

    if (correct) {
      this.score += 200;
      this.energy = Math.min(100, this.energy + 10);
      if (!this.completedAreas.has(area.id)) {
        this.completedAreas.add(area.id);
        this.ui.earnBadge(area.id);
        this.ui.log(`Mastered: ${area.name} (+200)`, true);
      }
    } else {
      this.score += 40;
      this.energy = Math.max(0, this.energy - 5);
      this.ui.log(`Review: ${area.name} (+40)`);
    }

    this.campusProgrammeIcons.forEach((icons) =>
      updateProgrammeIcons(icons, this.completedAreas)
    );

    this.ui.updateHUD(
      this.score,
      this.energy,
      this.visitedCampuses.size,
      this.completedAreas.size
    );

    setTimeout(() => {
      this.closeQuiz();
      if (this.completedAreas.size >= TOTAL_PROGRAMME_AREAS) {
        this.running = false;
        cancelAnimationFrame(this.animationId);
        this.ui.showWin(this.score, this.completedAreas.size);
      }
    }, 1800);
  }

  private closeQuiz(): void {
    this.quizOpen = false;
    this.pendingArea = null;
    this.ui.closeQuiz();
  }

  private updatePlayer(dt: number): void {
    const move = this.getMovement();
    if (move.lengthSq() > 0) {
      const step = move.clone().multiplyScalar(PLAYER_SPEED * 60 * dt);
      this.player.position.add(step);
      this.energy = Math.max(0, this.energy - dt * 2);
      this.player.rotation.y = Math.atan2(move.x, move.z);

      const walk = this.clock.elapsedTime * 12;
      const legL = this.player.getObjectByName('legL');
      const legR = this.player.getObjectByName('legR');
      if (legL) legL.rotation.x = Math.sin(walk) * 0.4;
      if (legR) legR.rotation.x = Math.sin(walk + Math.PI) * 0.4;
    } else {
      const legL = this.player.getObjectByName('legL');
      const legR = this.player.getObjectByName('legR');
      if (legL) legL.rotation.x = 0;
      if (legR) legR.rotation.x = 0;
    }

    this.player.position.x = THREE.MathUtils.clamp(this.player.position.x, MAP.minX + 5, MAP.maxX - 5);
    this.player.position.z = THREE.MathUtils.clamp(this.player.position.z, MAP.minZ + 5, MAP.maxZ - 5);

    if (this.energy <= 0) {
      this.energy = 50;
      this.score = Math.max(0, this.score - 30);
      this.ui.log('Energy low — take a break (-30)');
    }
  }

  private updateCampusEffects(t: number): void {
    const camPos = this.camera.position;
    this.campusMeshes.forEach((g, id) => {
      g.traverse((ch) => {
        if (ch.userData.billboard && ch instanceof THREE.Object3D) {
          const wp = new THREE.Vector3();
          ch.getWorldPosition(wp);
          ch.lookAt(camPos.x, wp.y, camPos.z);
        }
      });
      const beacon = this.campusBeacons.get(id);
      if (beacon) beacon.position.y = 11.8 + Math.sin(t * 2 + id.length) * 0.2;
      const campus = CAMPUSES.find((c) => c.id === id);
      const done = campus?.programmeAreaIds.every((aid) => this.completedAreas.has(aid));
      const light = this.campusLights.get(id);
      if (light) light.intensity = done ? 0.6 : 2.5 + Math.sin(t * 3) * 0.6;
    });
  }

  private animate = (): void => {
    if (!this.running) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;

    this.cameraCtrl.update(dt);
    this.updatePlayer(dt);
    this.cameraCtrl.apply(this.camera, this.player.position);
    this.hkMap.animateHarbour(t);
    this.updateCampusEffects(t);

    const nav = this.navigation.update(this.player.position, this.completedAreas, t);
    this.ui.updateNavigation(nav);
    this.ui.updateMinimap(this.player.position, this.completedAreas);

    const near = this.nearestCampus();
    if (near && !this.quizOpen) {
      const next = this.getNextAreaAtCampus(near.campus);
      if (next) {
        this.ui.setInteractHint(
          true,
          `Press E @ ${near.campus.shortZh} ${near.campus.short} — ${next.icon} ${next.name}`
        );
      } else {
        this.ui.setInteractHint(true, `${near.campus.shortZh} — all done here`);
      }
    } else {
      this.ui.setInteractHint(false);
    }

    if (nav && !this.quizOpen && !near) {
      this.ui.setNavBanner(
        true,
        `→ ${nav.campus.shortZh} ${nav.campus.short}`,
        `${Math.round(nav.distance)} m · ${nav.direction}`,
        nav.campus.district
      );
    } else if (!this.quizOpen) {
      this.ui.setNavBanner(false, '', '', '');
    }

    this.ui.updateHUD(
      this.score,
      this.energy,
      this.visitedCampuses.size,
      this.completedAreas.size
    );

    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.animate);
  };

  private renderOnce(): void {
    this.cameraCtrl.apply(this.camera, this.player.position);
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.labelRenderer.setSize(w, h);
  }
}
