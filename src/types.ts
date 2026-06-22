export type ProgrammeCategory = 'ICT' | 'DMET' | 'Foundation';

export interface QuizQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ProgrammeArea {
  id: string;
  code: string;
  name: string;
  nameZh: string;
  category: ProgrammeCategory;
  icon: string;
  tagline: string;
  careers: string[];
  question: QuizQuestion;
}

export interface Campus {
  id: string;
  name: string;
  short: string;
  shortZh: string;
  district: string;
  address: string;
  tel: string;
  color: number;
  position: { x: number; z: number };
  programmeAreaIds: string[];
  fact: string;
  /** Short description of real campus architecture for labels */
  architectureHint: string;
}

export interface GameState {
  score: number;
  energy: number;
  completedAreas: Set<string>;
  visitedCampuses: Set<string>;
}
