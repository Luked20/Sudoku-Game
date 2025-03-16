
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CellPosition, DifficultyLevel, SudokuGrid as SudokuGridType, BoardTheme } from '../types/sudoku';
import { generateSudokuPuzzle, isValidPlacement, isGridComplete, getRandomEmptyCell } from '../utils/sudokuGenerator';
import { calculateScore, saveScore, getScores, saveGameStats, getGameStats } from '../utils/scoring';
import SudokuGrid from '../components/SudokuGrid';
import NumberPad from '../components/NumberPad';
import GameControls from '../components/GameControls';
import CompletionModal from '../components/CompletionModal';
import Leaderboard from '../components/Leaderboard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Helper function to detect conflicting numbers
const detectConflicts = (grid: SudokuGridType, row: number, col: number, value: number) => {
  const conflicts = new Map<string, boolean>();
  
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === value) {
      conflicts.set(`${row}-${c}`, true);
      conflicts.set(`${row}-${col}`, true);
    }
  }
  
  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === value) {
      conflicts.set(`${r}-${col}`, true);
      conflicts.set(`${row}-${col}`, true);
    }
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const currentRow = boxRow + r;
      const currentCol = boxCol + c;
      
      if ((currentRow !== row || currentCol !== col) && grid[currentRow][currentCol] === value) {
        conflicts.set(`${currentRow}-${currentCol}`, true);
        conflicts.set(`${row}-${col}`, true);
      }
    }
  }
  
  return conflicts;
};

const Index = () => {
  const { toast } = useToast();
  
  // Game state
  const [grid, setGrid] = useState<SudokuGridType>([]);
  const [solution, setSolution] = useState<SudokuGridType>([]);
  const [initialGrid, setInitialGrid] = useState<SudokuGridType>([]);
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [errors, setErrors] = useState(new Map<string, boolean>());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [scores, setScores] = useState(getScores());
  
  // New game features
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [totalPauseTime, setTotalPauseTime] = useState(0);
  const [notesMode, setNotesMode] = useState(false);
  const [notes, setNotes] = useState(new Map<string, number[]>());
  const [theme, setTheme] = useState<BoardTheme>('default');
  
  const timerRef = useRef<number | null>(null);
  
  // Initialize a new game
  const initializeGame = useCallback((difficulty: DifficultyLevel) => {
    const { puzzle, solution } = generateSudokuPuzzle(difficulty);
    
    setGrid(JSON.parse(JSON.stringify(puzzle)));
    setSolution(solution);
    setInitialGrid(JSON.parse(JSON.stringify(puzzle)));
    setSelectedCell(null);
    setDifficulty(difficulty);
    setErrors(new Map());
    setHintsUsed(0);
    setErrorCount(0);
    setIsGameComplete(false);
    setIsCompletionModalOpen(false);
    setIsPaused(false);
    setPauseStartTime(null);
    setTotalPauseTime(0);
    setNotes(new Map());
    
    // Reset timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    const now = Date.now();
    setStartTime(now);
    setElapsedTime(0);
    
    // Start timer
    timerRef.current = window.setInterval(() => {
      if (!isPaused) {
        setElapsedTime(Date.now() - now - totalPauseTime);
      }
    }, 1000);
    
    toast({
      title: "Novo jogo iniciado",
      description: `Dificuldade: ${difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil'}`,
    });
  }, [toast, isPaused, totalPauseTime]);
  
  // Initialize game on mount
  useEffect(() => {
    initializeGame('easy');
    
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [initializeGame]);
  
  // Toggle pause state
  const handleTogglePause = () => {
    if (isPaused) {
      // Resume game and calculate additional pause time
      if (pauseStartTime) {
        const additionalPauseTime = Date.now() - pauseStartTime;
        setTotalPauseTime(prev => prev + additionalPauseTime);
      }
      setPauseStartTime(null);
      setIsPaused(false);
      
      toast({
        title: "Jogo retomado",
        description: "O tempo voltou a contar.",
      });
    } else {
      // Pause game
      setPauseStartTime(Date.now());
      setIsPaused(true);
      
      toast({
        title: "Jogo pausado",
        description: "O tempo está pausado.",
      });
    }
  };
  
  // Toggle notes mode
  const handleToggleNotes = () => {
    setNotesMode(prev => !prev);
    
    toast({
      title: notesMode ? "Modo normal ativado" : "Modo de notas ativado",
      description: notesMode ? "Agora você adicionará números diretamente." : "Agora você adicionará anotações.",
    });
  };
  
  // Change board theme
  const handleChangeTheme = () => {
    const themes: BoardTheme[] = ['default', 'dark', 'pastel'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
    
    toast({
      title: "Tema alterado",
      description: `Novo tema: ${themes[nextIndex]}`,
    });
  };
  
  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    // Can't select cells during pause
    if (isPaused) return;
    
    // Can't select initial cells
    if (initialGrid[row][col] !== null) {
      return;
    }
    
    setSelectedCell({ row, col });
  };
  
  // Handle number selection
  const handleNumberSelect = (num: number | null) => {
    if (!selectedCell || initialGrid[selectedCell.row][selectedCell.col] !== null || isPaused) {
      return;
    }
    
    const { row, col } = selectedCell;
    
    // Handle notes mode
    if (notesMode && num !== null) {
      // Toggle note for the selected cell
      const noteKey = `${row}-${col}`;
      const currentNotes = notes.get(noteKey) || [];
      let newNotes: number[];
      
      if (currentNotes.includes(num)) {
        // Remove the note if it already exists
        newNotes = currentNotes.filter(n => n !== num);
      } else {
        // Add the note if it doesn't exist
        newNotes = [...currentNotes, num];
      }
      
      const newNotesMap = new Map(notes);
      if (newNotes.length > 0) {
        newNotesMap.set(noteKey, newNotes);
      } else {
        newNotesMap.delete(noteKey);
      }
      
      setNotes(newNotesMap);
      return;
    }
    
    // Normal mode - set the value directly
    // Create a new grid with the updated value
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = num;
    
    // Clear any existing errors for this cell
    const newErrors = new Map(errors);
    newErrors.delete(`${row}-${col}`);
    
    // Clear notes for this cell
    const newNotes = new Map(notes);
    newNotes.delete(`${row}-${col}`);
    setNotes(newNotes);
    
    // Check for conflicts
    if (num !== null) {
      const conflicts = detectConflicts(newGrid, row, col, num);
      
      // Add new conflicts to the errors map
      conflicts.forEach((_, key) => {
        newErrors.set(key, true);
      });
      
      // If the number doesn't match the solution, increment error count
      if (num !== solution[row][col]) {
        setErrorCount(prev => prev + 1);
      }
    }
    
    setGrid(newGrid);
    setErrors(newErrors);
    
    // Check if the puzzle is complete
    if (isGridComplete(newGrid)) {
      handleGameComplete(newGrid);
    }
  };
  
  // Handle game completion
  const handleGameComplete = (completedGrid: SudokuGridType) => {
    // Stop the timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const finalTime = Date.now() - startTime - totalPauseTime;
    setElapsedTime(finalTime);
    setIsGameComplete(true);
    setIsCompletionModalOpen(true);
    
    // Update game stats
    updateGameStats(finalTime);
    
    toast({
      title: "Parabéns!",
      description: "Você completou o quebra-cabeça!",
    });
  };
  
  // Update game statistics
  const updateGameStats = (finalTime: number) => {
    const stats = getGameStats();
    
    // Update games played and won
    stats.gamesPlayed += 1;
    stats.gamesWon += 1;
    
    // Update best time
    if (stats.bestTime[difficulty] === null || finalTime < stats.bestTime[difficulty]!) {
      stats.bestTime[difficulty] = finalTime;
    }
    
    // Update average time
    if (stats.averageTime[difficulty] === null) {
      stats.averageTime[difficulty] = finalTime;
    } else {
      // Simple moving average
      stats.averageTime[difficulty] = Math.round(
        (stats.averageTime[difficulty]! * (stats.gamesPlayed - 1) + finalTime) / stats.gamesPlayed
      );
    }
    
    // Update hints and errors
    stats.totalHintsUsed += hintsUsed;
    stats.totalErrors += errorCount;
    
    // Update streak
    const lastPlayedDate = stats.lastPlayed ? new Date(stats.lastPlayed) : null;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastPlayedDate) {
      // Check if last played was yesterday
      const isLastPlayedYesterday = 
        lastPlayedDate.getDate() === yesterday.getDate() &&
        lastPlayedDate.getMonth() === yesterday.getMonth() &&
        lastPlayedDate.getFullYear() === yesterday.getFullYear();
      
      if (isLastPlayedYesterday) {
        stats.currentStreak += 1;
      } else if (
        lastPlayedDate.getDate() !== today.getDate() ||
        lastPlayedDate.getMonth() !== today.getMonth() ||
        lastPlayedDate.getFullYear() !== today.getFullYear()
      ) {
        // Reset streak if not played yesterday and not today
        stats.currentStreak = 1;
      }
    } else {
      stats.currentStreak = 1;
    }
    
    // Update longest streak
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
    
    // Update last played
    stats.lastPlayed = today.toISOString();
    
    // Save stats
    saveGameStats(stats);
  };
  
  // Handle saving score
  const handleSaveScore = (playerName: string) => {
    const finalTime = Date.now() - startTime - totalPauseTime;
    const score = calculateScore(finalTime, errorCount, hintsUsed, difficulty);
    
    const playerScore = {
      playerName,
      time: finalTime,
      difficulty,
      errors: errorCount,
      hintsUsed,
      date: new Date().toISOString(),
      score,
    };
    
    saveScore(playerScore);
    setScores(getScores());
    setIsCompletionModalOpen(false);
    
    toast({
      title: "Pontuação salva!",
      description: `${playerName}: ${score} pontos`,
    });
  };
  
  // Check for errors
  const handleCheckErrors = () => {
    if (isPaused) return;
    
    const newErrors = new Map<string, boolean>();
    let foundErrors = false;
    
    // Check each cell
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = grid[row][col];
        
        if (value !== null && value !== solution[row][col]) {
          newErrors.set(`${row}-${col}`, true);
          foundErrors = true;
        }
      }
    }
    
    setErrors(newErrors);
    
    if (foundErrors) {
      toast({
        title: "Encontrados erros",
        description: "Células com erros estão destacadas em vermelho.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sem erros",
        description: "Você está no caminho certo!",
      });
    }
  };
  
  // Provide a hint
  const handleHint = () => {
    if (hintsUsed >= 3 || isGameComplete || isPaused) {
      toast({
        title: "Sem dicas restantes",
        description: "Você já usou todas as suas dicas.",
        variant: "destructive",
      });
      return;
    }
    
    // Find a random empty cell
    const emptyCell = getRandomEmptyCell(grid);
    
    if (!emptyCell) {
      toast({
        title: "Não há células vazias",
        description: "Não há mais células vazias para dar dicas.",
      });
      return;
    }
    
    const { row, col } = emptyCell;
    const correctValue = solution[row][col];
    
    // Update the grid with the correct value
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = correctValue;
    
    // Clear notes for this cell
    const newNotes = new Map(notes);
    newNotes.delete(`${row}-${col}`);
    
    setGrid(newGrid);
    setNotes(newNotes);
    setHintsUsed(prev => prev + 1);
    setSelectedCell(null);
    
    toast({
      title: "Dica usada",
      description: `Dicas restantes: ${2 - hintsUsed}`,
    });
    
    // Check if the puzzle is complete after adding the hint
    if (isGridComplete(newGrid)) {
      handleGameComplete(newGrid);
    }
  };
  
  // Calculate final score for the completion modal
  const calculateFinalScore = () => {
    return calculateScore(elapsedTime, errorCount, hintsUsed, difficulty);
  };
  
  return (
    <div className={`min-h-screen py-8 px-4 ${theme === 'dark' ? 'bg-gray-900 text-white' : theme === 'pastel' ? 'bg-pink-50' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-bold text-center mb-6 ${theme === 'dark' ? 'text-blue-300' : theme === 'pastel' ? 'text-pink-500' : 'text-sudoku-primary'}`}>
          Sudoku Sensation
        </h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            {isPaused ? (
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-8 flex items-center justify-center h-[450px]">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Jogo Pausado</h2>
                  <p className="mb-6">Clique no botão de play para continuar.</p>
                  <Button onClick={handleTogglePause}>Continuar Jogo</Button>
                </div>
              </div>
            ) : (
              <>
                <SudokuGrid
                  grid={grid}
                  initialGrid={initialGrid}
                  selectedCell={selectedCell}
                  errors={errors}
                  onCellClick={handleCellClick}
                  notes={notes}
                  theme={theme}
                />
                
                <NumberPad 
                  onNumberClick={handleNumberSelect} 
                  notesMode={notesMode}
                />
              </>
            )}
            
            <GameControls
              onNewGame={initializeGame}
              onCheckErrors={handleCheckErrors}
              onHint={handleHint}
              hintsRemaining={3 - hintsUsed}
              elapsedTime={elapsedTime}
              isGameComplete={isGameComplete}
              isPaused={isPaused}
              onTogglePause={handleTogglePause}
              onToggleNotes={handleToggleNotes}
              notesMode={notesMode}
              onChangeTheme={handleChangeTheme}
              theme={theme}
            />
          </div>
          
          <div>
            <Leaderboard scores={scores} />
          </div>
        </div>
      </div>
      
      <CompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        time={elapsedTime}
        hintsUsed={hintsUsed}
        errors={errorCount}
        difficulty={difficulty}
        score={calculateFinalScore()}
        onSaveScore={handleSaveScore}
      />
    </div>
  );
};

export default Index;
