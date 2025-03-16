
import React from 'react';
import { CellPosition, SudokuGrid } from '../types/sudoku';
import { cn } from '@/lib/utils';

interface SudokuCellProps {
  value: number | null;
  isInitial: boolean;
  isSelected: boolean;
  isRelated: boolean;
  hasError: boolean;
  onCellClick: () => void;
  notes?: number[];
  isSameValue?: boolean;
  theme?: string;
}

const SudokuCell: React.FC<SudokuCellProps> = ({
  value,
  isInitial,
  isSelected,
  isRelated,
  hasError,
  onCellClick,
  notes = [],
  isSameValue = false,
  theme = 'default'
}) => {
  // Determine background color based on theme and state
  const getBgColor = () => {
    if (isSelected) return getBgColorByTheme('selected', theme);
    if (isSameValue) return getBgColorByTheme('sameValue', theme);
    if (isRelated) return getBgColorByTheme('related', theme);
    return getBgColorByTheme('default', theme);
  };

  const getBgColorByTheme = (state: 'default' | 'selected' | 'related' | 'sameValue', theme: string) => {
    if (theme === 'default') {
      switch (state) {
        case 'selected': return 'bg-sudoku-highlight';
        case 'sameValue': return 'bg-blue-100';
        case 'related': return 'bg-sudoku-light';
        default: return 'bg-white';
      }
    } else if (theme === 'dark') {
      switch (state) {
        case 'selected': return 'bg-blue-700';
        case 'sameValue': return 'bg-blue-600';
        case 'related': return 'bg-gray-700';
        default: return 'bg-gray-800';
      }
    } else if (theme === 'pastel') {
      switch (state) {
        case 'selected': return 'bg-pink-200';
        case 'sameValue': return 'bg-pink-100';
        case 'related': return 'bg-yellow-100';
        default: return 'bg-white';
      }
    }
    return 'bg-white';
  };

  // Text color based on state and theme
  const getTextColor = () => {
    if (hasError) return 'text-sudoku-error';
    if (isInitial) return theme === 'dark' ? 'text-white' : 'text-sudoku-dark';
    return theme === 'dark' ? 'text-blue-300' : 'text-sudoku-primary';
  };

  return (
    <div
      onClick={onCellClick}
      className={cn(
        'flex items-center justify-center w-full h-full border cursor-pointer transition-all',
        theme === 'dark' ? 'border-gray-600' : 'border-gray-200',
        getBgColor(),
        getTextColor()
      )}
    >
      {value !== null ? (
        <span className="text-lg font-medium">{value}</span>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <div key={num} className="flex items-center justify-center">
              {notes.includes(num) && (
                <span className="text-[8px] opacity-70">{num}</span>
              )}
            </div>
          ))}
        </div>
      ) : ''}
    </div>
  );
};

export default SudokuCell;
