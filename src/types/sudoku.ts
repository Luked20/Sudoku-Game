
export type CellValue = number | null;

export type SudokuGrid = CellValue[][];

export interface CellPosition {
  row: number;
  col: number;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type BoardTheme = 'default' | 'dark' | 'pastel';

export interface GameState {
  grid: SudokuGrid;
  solution: SudokuGrid;
  initialGrid: SudokuGrid;
  selectedCell: CellPosition | null;
  difficulty: DifficultyLevel;
  errors: Map<string, boolean>;
  hintsUsed: number;
  startTime: number;
  endTime: number | null;
  isComplete: boolean;
  isPaused: boolean;
  pauseTime: number;
  notesMode: boolean;
  notes: Map<string, number[]>;
  theme: BoardTheme;
}

export interface PlayerScore {
  playerName: string;
  time: number;
  difficulty: DifficultyLevel;
  errors: number;
  hintsUsed: number;
  date: string;
  score: number;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  bestTime: {
    easy: number | null;
    medium: number | null;
    hard: number | null;
  };
  averageTime: {
    easy: number | null;
    medium: number | null;
    hard: number | null;
  };
  totalHintsUsed: number;
  totalErrors: number;
  longestStreak: number;
  currentStreak: number;
  lastPlayed: string | null;
}
