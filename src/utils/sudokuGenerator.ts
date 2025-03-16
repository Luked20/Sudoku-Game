
import { CellPosition, DifficultyLevel, SudokuGrid } from "../types/sudoku";

// Function to create an empty 9x9 grid filled with null values
export function createEmptyGrid(): SudokuGrid {
  return Array(9).fill(null).map(() => Array(9).fill(null));
}

// Helper function to check if a value can be placed at a specific position
function isValid(grid: SudokuGrid, row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }

  // Check column
  for (let y = 0; y < 9; y++) {
    if (grid[y][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      if (grid[boxRow + y][boxCol + x] === num) return false;
    }
  }

  return true;
}

// Backtracking algorithm to solve the Sudoku
function solveSudoku(grid: SudokuGrid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        // Try placing numbers 1-9
        const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        for (const num of numbers) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            
            if (solveSudoku(grid)) {
              return true;
            }
            
            grid[row][col] = null; // Backtrack
          }
        }
        
        return false; // No valid number found
      }
    }
  }
  
  return true; // All cells filled
}

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Create a fully solved Sudoku grid
export function generateSolvedGrid(): SudokuGrid {
  const grid = createEmptyGrid();
  solveSudoku(grid);
  return grid;
}

// Remove numbers based on difficulty level
export function createPuzzleFromSolution(solution: SudokuGrid, difficulty: DifficultyLevel): SudokuGrid {
  // Deep copy the solution
  const puzzle: SudokuGrid = JSON.parse(JSON.stringify(solution));
  
  // Determine how many cells to remove based on difficulty
  let cellsToRemove: number;
  switch (difficulty) {
    case 'easy':
      cellsToRemove = 30; // 51 cells filled (easier)
      break;
    case 'medium':
      cellsToRemove = 45; // 36 cells filled
      break;
    case 'hard':
      cellsToRemove = 55; // 26 cells filled (harder)
      break;
    default:
      cellsToRemove = 40;
  }
  
  // Create an array of all positions
  const positions: CellPosition[] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      positions.push({ row, col });
    }
  }
  
  // Shuffle the positions
  const shuffledPositions = shuffleArray(positions);
  
  // Remove cells
  let removed = 0;
  for (const pos of shuffledPositions) {
    if (removed >= cellsToRemove) break;
    
    const { row, col } = pos;
    const temp = puzzle[row][col];
    puzzle[row][col] = null;
    
    // We need to ensure the puzzle still has a unique solution
    // For simplicity in this implementation, we'll skip this check
    // In a production environment, we would verify uniqueness
    
    removed++;
  }
  
  return puzzle;
}

// Generate a new Sudoku puzzle with its solution
export function generateSudokuPuzzle(difficulty: DifficultyLevel): { puzzle: SudokuGrid, solution: SudokuGrid } {
  const solution = generateSolvedGrid();
  const puzzle = createPuzzleFromSolution(solution, difficulty);
  return { puzzle, solution };
}

// Check if a specific value is valid at a position
export function isValidPlacement(grid: SudokuGrid, row: number, col: number, value: number): boolean {
  return isValid(grid, row, col, value);
}

// Check if the Sudoku grid is completely filled and valid
export function isGridComplete(grid: SudokuGrid): boolean {
  // Check if all cells are filled
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) return false;
    }
  }
  
  // Check if all rows are valid
  for (let row = 0; row < 9; row++) {
    const values = new Set<number>();
    for (let col = 0; col < 9; col++) {
      const value = grid[row][col];
      if (value !== null) {
        if (values.has(value)) return false;
        values.add(value);
      }
    }
  }
  
  // Check if all columns are valid
  for (let col = 0; col < 9; col++) {
    const values = new Set<number>();
    for (let row = 0; row < 9; row++) {
      const value = grid[row][col];
      if (value !== null) {
        if (values.has(value)) return false;
        values.add(value);
      }
    }
  }
  
  // Check if all 3x3 boxes are valid
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const values = new Set<number>();
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const value = grid[boxRow * 3 + row][boxCol * 3 + col];
          if (value !== null) {
            if (values.has(value)) return false;
            values.add(value);
          }
        }
      }
    }
  }
  
  return true;
}

// Get a random empty cell position
export function getRandomEmptyCell(grid: SudokuGrid): CellPosition | null {
  const emptyCells: CellPosition[] = [];
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        emptyCells.push({ row, col });
      }
    }
  }
  
  if (emptyCells.length === 0) return null;
  
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}
