
import { DifficultyLevel, PlayerScore, GameStats } from "../types/sudoku";

// Calculate score based on time, errors, and hints
export function calculateScore(time: number, errors: number, hintsUsed: number, difficulty: DifficultyLevel): number {
  // Base score depends on difficulty
  let baseScore: number;
  switch (difficulty) {
    case 'easy':
      baseScore = 1000;
      break;
    case 'medium':
      baseScore = 2000;
      break;
    case 'hard':
      baseScore = 3000;
      break;
    default:
      baseScore = 1000;
  }
  
  // Time penalty (lower time is better)
  // Convert time to minutes for calculation
  const timeInMinutes = time / 60000;
  const timePenalty = Math.floor(timeInMinutes * 10);
  
  // Error penalty
  const errorPenalty = errors * 50;
  
  // Hint penalty
  const hintPenalty = hintsUsed * 100;
  
  // Calculate final score
  const finalScore = Math.max(0, baseScore - timePenalty - errorPenalty - hintPenalty);
  
  return finalScore;
}

// Format time display from milliseconds to MM:SS
export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Save score to local storage
export function saveScore(score: PlayerScore): void {
  const scoresJson = localStorage.getItem('sudokuScores');
  let scores: PlayerScore[] = scoresJson ? JSON.parse(scoresJson) : [];
  
  scores.push(score);
  
  // Sort scores (highest first)
  scores.sort((a, b) => b.score - a.score);
  
  // Limit to top 50 scores
  if (scores.length > 50) {
    scores = scores.slice(0, 50);
  }
  
  localStorage.setItem('sudokuScores', JSON.stringify(scores));
}

// Get scores from local storage
export function getScores(): PlayerScore[] {
  const scoresJson = localStorage.getItem('sudokuScores');
  return scoresJson ? JSON.parse(scoresJson) : [];
}

// Get scores filtered by difficulty
export function getScoresByDifficulty(difficulty: DifficultyLevel): PlayerScore[] {
  const scores = getScores();
  return scores.filter(score => score.difficulty === difficulty);
}

// Initialize default game stats
function initializeGameStats(): GameStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    bestTime: {
      easy: null,
      medium: null,
      hard: null,
    },
    averageTime: {
      easy: null,
      medium: null,
      hard: null,
    },
    totalHintsUsed: 0,
    totalErrors: 0,
    longestStreak: 0,
    currentStreak: 0,
    lastPlayed: null,
  };
}

// Get game stats from local storage
export function getGameStats(): GameStats {
  const statsJson = localStorage.getItem('sudokuStats');
  
  if (!statsJson) {
    // Initialize if none exist
    const initialStats = initializeGameStats();
    localStorage.setItem('sudokuStats', JSON.stringify(initialStats));
    return initialStats;
  }
  
  return JSON.parse(statsJson);
}

// Save game stats to local storage
export function saveGameStats(stats: GameStats): void {
  localStorage.setItem('sudokuStats', JSON.stringify(stats));
}
