
import React from 'react';
import { Button } from '@/components/ui/button';
import { DifficultyLevel } from '../types/sudoku';
import { Timer, RefreshCw, CheckCheck, HelpCircle, Pause, Play, Paintbrush } from 'lucide-react';
import { formatTime } from '../utils/scoring';

interface GameControlsProps {
  onNewGame: (difficulty: DifficultyLevel) => void;
  onCheckErrors: () => void;
  onHint: () => void;
  hintsRemaining: number;
  elapsedTime: number;
  isGameComplete: boolean;
  isPaused?: boolean;
  onTogglePause?: () => void;
  onToggleNotes?: () => void;
  notesMode?: boolean;
  onChangeTheme?: () => void;
  theme?: string;
}

const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onCheckErrors,
  onHint,
  hintsRemaining,
  elapsedTime,
  isGameComplete,
  isPaused = false,
  onTogglePause,
  onToggleNotes,
  notesMode = false,
  onChangeTheme,
  theme = 'default'
}) => {
  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center text-lg font-semibold">
          <Timer className="mr-2 h-5 w-5" />
          <span>{formatTime(elapsedTime)}</span>
          
          {onTogglePause && (
            <Button 
              onClick={onTogglePause} 
              variant="ghost" 
              size="sm"
              className="ml-2"
              title={isPaused ? "Continuar jogo" : "Pausar jogo"}
            >
              {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </Button>
          )}
        </div>
        
        <div className="flex items-center text-lg font-semibold">
          <HelpCircle className="mr-2 h-5 w-5" />
          <span>Dicas: {hintsRemaining}/3</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={onCheckErrors} 
          variant="outline"
          className="flex items-center"
          disabled={isGameComplete || isPaused}
        >
          <CheckCheck className="mr-2 h-5 w-5" />
          Verificar Erros
        </Button>
        
        <Button 
          onClick={onHint} 
          variant="outline" 
          className="flex items-center"
          disabled={hintsRemaining <= 0 || isGameComplete || isPaused}
        >
          <HelpCircle className="mr-2 h-5 w-5" />
          Dica
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {onToggleNotes && (
          <Button
            onClick={onToggleNotes}
            variant={notesMode ? "default" : "outline"}
            className="flex items-center"
            disabled={isGameComplete || isPaused}
          >
            <span className="text-xs font-bold mr-2">123</span>
            Modo Notas
          </Button>
        )}
        
        {onChangeTheme && (
          <Button
            onClick={onChangeTheme}
            variant="outline"
            className="flex items-center"
          >
            <Paintbrush className="mr-2 h-5 w-5" />
            Tema: {theme}
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold text-center mb-2">Novo Jogo</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button 
            onClick={() => onNewGame('easy')} 
            variant="default"
            className="bg-green-500 hover:bg-green-600"
          >
            Fácil
          </Button>
          <Button 
            onClick={() => onNewGame('medium')} 
            variant="default"
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            Médio
          </Button>
          <Button 
            onClick={() => onNewGame('hard')} 
            variant="default"
            className="bg-red-500 hover:bg-red-600"
          >
            Difícil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;
