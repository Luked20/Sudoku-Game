
import React from 'react';
import SudokuCell from './SudokuCell';
import { CellPosition, SudokuGrid as SudokuGridType } from '../types/sudoku';
import { cn } from '@/lib/utils';

interface SudokuGridProps {
  grid: SudokuGridType;
  initialGrid: SudokuGridType;
  selectedCell: CellPosition | null;
  errors: Map<string, boolean>;
  onCellClick: (row: number, col: number) => void;
  notes?: Map<string, number[]>;
  theme?: string;
}

const SudokuGrid: React.FC<SudokuGridProps> = ({
  grid,
  initialGrid,
  selectedCell,
  errors,
  onCellClick,
  notes = new Map(),
  theme = 'default'
}) => {
  // Check if a cell is related to the selected cell (same row, column, or box)
  const isCellRelated = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    
    const sameRow = row === selectedCell.row;
    const sameCol = col === selectedCell.col;
    const sameBox = 
      Math.floor(row / 3) === Math.floor(selectedCell.row / 3) && 
      Math.floor(col / 3) === Math.floor(selectedCell.col / 3);
    
    return sameRow || sameCol || sameBox;
  };

  // Check if a cell has an error
  const hasCellError = (row: number, col: number): boolean => {
    return errors.has(`${row}-${col}`);
  };

  // Check if a cell has the same value as the selected cell
  const isSameValue = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    const selectedValue = grid[selectedCell.row][selectedCell.col];
    if (selectedValue === null) return false;
    return grid[row][col] === selectedValue;
  };

  // Get cell notes
  const getCellNotes = (row: number, col: number): number[] => {
    return notes.get(`${row}-${col}`) || [];
  };

  // Generate grid background class based on theme
  const getGridBgClass = () => {
    switch (theme) {
      case 'dark': return 'bg-gray-600 border-gray-500';
      case 'pastel': return 'bg-pink-100 border-pink-300';
      default: return 'bg-gray-300 border-gray-800';
    }
  };

  return (
    <div className={cn(
      "grid grid-cols-9 gap-px max-w-md mx-auto rounded-md overflow-hidden shadow-lg border-2",
      getGridBgClass()
    )}>
      {grid.map((row, rowIndex) => (
        <React.Fragment key={`row-${rowIndex}`}>
          {row.map((cellValue, colIndex) => {
            const isInitial = initialGrid[rowIndex][colIndex] !== null;
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isRelated = isCellRelated(rowIndex, colIndex);
            const hasError = hasCellError(rowIndex, colIndex);
            const sameValue = isSameValue(rowIndex, colIndex);
            const cellNotes = getCellNotes(rowIndex, colIndex);
            
            const borderClass = cn(
              'aspect-square',
              // Add bottom border for box separation
              (rowIndex + 1) % 3 === 0 && rowIndex < 8 ? 
                theme === 'dark' ? 'border-b-2 border-gray-500' : 
                theme === 'pastel' ? 'border-b-2 border-pink-300' : 
                'border-b-2 border-gray-800' : '',
              // Add right border for box separation
              (colIndex + 1) % 3 === 0 && colIndex < 8 ? 
                theme === 'dark' ? 'border-r-2 border-gray-500' : 
                theme === 'pastel' ? 'border-r-2 border-pink-300' : 
                'border-r-2 border-gray-800' : ''
            );
            
            return (
              <div 
                key={`cell-${rowIndex}-${colIndex}`}
                className={borderClass}
              >
                <SudokuCell
                  value={cellValue}
                  isInitial={isInitial}
                  isSelected={isSelected}
                  isRelated={isRelated}
                  hasError={hasError}
                  onCellClick={() => onCellClick(rowIndex, colIndex)}
                  notes={cellNotes}
                  isSameValue={sameValue && !isSelected}
                  theme={theme}
                />
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default SudokuGrid;
