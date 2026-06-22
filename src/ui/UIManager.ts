import type { Campus, ProgrammeArea } from '../types';
import { TOTAL_PROGRAMME_AREAS } from '../data/programmeAreas';
import { drawMinimap } from '../utils/minimap';

export class UIManager {
  private readonly startScreen = document.getElementById('startScreen')!;
  private readonly winScreen = document.getElementById('winScreen')!;
  private readonly quizOverlay = document.getElementById('quizOverlay')!;
  private readonly hud = document.getElementById('hud')!;
  private readonly interactHint = document.getElementById('interactHint')!;

  private readonly elScore = document.getElementById('score')!;
  private readonly elEnergy = document.getElementById('energy')!;
  private readonly elCampuses = document.getElementById('campuses')!;
  private readonly elAreas = document.getElementById('areas')!;
  private readonly elLog = document.getElementById('log')!;
  private readonly badgeGrid = document.getElementById('badgeGrid')!;

  private readonly modalTitle = document.getElementById('modalTitle')!;
  private readonly modalCampus = document.getElementById('modalCampus')!;
  private readonly modalFact = document.getElementById('modalFact')!;
  private readonly areaTag = document.getElementById('areaTag')!;
  private readonly quizPrompt = document.getElementById('quizPrompt')!;
  private readonly quizOptions = document.getElementById('quizOptions')!;
  private readonly quizExplanation = document.getElementById('quizExplanation')!;
  private readonly navBanner = document.getElementById('navBanner')!;
  private readonly navTitle = document.getElementById('navTitle')!;
  private readonly navMeta = document.getElementById('navMeta')!;
  private readonly navDistrict = document.getElementById('navDistrict')!;
  private readonly minimapCanvas = document.getElementById('minimap') as HTMLCanvasElement | null;

  private onStart?: () => void;
  private onReplay?: () => void;
  private onAnswer?: (index: number) => void;
  private onCloseQuiz?: () => void;

  constructor() {
    document.getElementById('btnStart')?.addEventListener('click', () => {
      this.startScreen.classList.add('hidden');
      this.hud.classList.remove('hidden');
      this.onStart?.();
    });
    document.getElementById('btnReplay')?.addEventListener('click', () => {
      this.winScreen.classList.add('hidden');
      this.startScreen.classList.remove('hidden');
      this.hud.classList.add('hidden');
      this.navBanner.classList.remove('visible');
      this.onReplay?.();
    });
    document.getElementById('btnCloseQuiz')?.addEventListener('click', () => this.onCloseQuiz?.());
  }

  setHandlers(handlers: {
    onStart: () => void;
    onReplay: () => void;
    onAnswer: (index: number) => void;
    onCloseQuiz: () => void;
  }): void {
    this.onStart = handlers.onStart;
    this.onReplay = handlers.onReplay;
    this.onAnswer = handlers.onAnswer;
    this.onCloseQuiz = handlers.onCloseQuiz;
  }

  initBadges(areas: ProgrammeArea[]): void {
    this.badgeGrid.innerHTML = areas
      .map(
        (a) =>
          `<div class="badge" id="badge-${a.id}" title="${a.name} (${a.code})">
            <span class="badge-icon">${a.icon}</span>
          </div>`
      )
      .join('');
  }

  updateHUD(score: number, energy: number, visited: number, completed: number): void {
    this.elScore.textContent = String(score);
    this.elEnergy.textContent = String(Math.floor(energy));
    this.elCampuses.textContent = `${visited} / 6`;
    this.elAreas.textContent = `${completed} / ${TOTAL_PROGRAMME_AREAS}`;
  }

  log(msg: string, highlight = false): void {
    const d = document.createElement('div');
    if (highlight) d.className = 'log-highlight';
    d.textContent = msg;
    this.elLog.prepend(d);
    while (this.elLog.children.length > 14) {
      this.elLog.lastChild?.remove();
    }
  }

  setInteractHint(visible: boolean, text = 'Press E — Campus Challenge'): void {
    this.interactHint.classList.toggle('visible', visible);
    if (visible) this.interactHint.textContent = text;
  }

  setNavBanner(visible: boolean, title: string, meta: string, district: string): void {
    this.navBanner.classList.toggle('visible', visible);
    if (visible) {
      this.navTitle.textContent = title;
      this.navMeta.textContent = meta;
      this.navDistrict.textContent = district;
    }
  }

  updateNavigation(
    _nav: { campus: Campus; distance: number; direction: string } | null
  ): void {
    /* Nav details shown via setNavBanner from Game3D */
  }

  updateMinimap(
    playerPos: { x: number; z: number },
    completedAreas: Set<string>
  ): void {
    if (!this.minimapCanvas) return;
    drawMinimap(this.minimapCanvas, playerPos.x, playerPos.z, completedAreas);
  }

  openQuiz(campus: Campus, area: ProgrammeArea): void {
    this.quizOverlay.classList.add('show');
    this.quizExplanation.classList.remove('show');
    this.quizExplanation.textContent = '';
    this.modalTitle.textContent = area.name;
    this.modalCampus.textContent = `${campus.shortZh} ${campus.short} · ${area.code} · ${area.nameZh}`;
    this.modalFact.textContent = campus.fact;
    this.areaTag.textContent = `${area.category} · ${area.tagline}`;
    this.areaTag.className = `area-tag cat-${area.category.toLowerCase()}`;
    this.quizPrompt.textContent = area.question.prompt;
    this.quizOptions.innerHTML = '';
    area.question.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => this.onAnswer?.(i));
      this.quizOptions.appendChild(btn);
    });
  }

  showExplanation(text: string, correct: boolean): void {
    this.quizExplanation.textContent = (correct ? '✓ ' : '✗ ') + text;
    this.quizExplanation.classList.add('show');
    this.quizOptions.querySelectorAll('button').forEach((b) => {
      (b as HTMLButtonElement).disabled = true;
    });
  }

  closeQuiz(): void {
    this.quizOverlay.classList.remove('show');
  }

  earnBadge(areaId: string): void {
    document.getElementById(`badge-${areaId}`)?.classList.add('earned');
  }

  showWin(score: number, completed: number): void {
    document.getElementById('winSummary')!.textContent =
      `Score: ${score} · Programme areas mastered: ${completed}/${TOTAL_PROGRAMME_AREAS}`;
    this.winScreen.classList.remove('hidden');
    this.hud.classList.add('hidden');
    this.navBanner.classList.remove('visible');
  }
}
