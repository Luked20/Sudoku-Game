
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatTime } from '../utils/scoring';
import { DifficultyLevel, PlayerScore } from '../types/sudoku';
import { Award } from 'lucide-react';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  time: number;
  hintsUsed: number;
  errors: number;
  difficulty: DifficultyLevel;
  score: number;
  onSaveScore: (playerName: string) => void;
}

const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  onClose,
  time,
  hintsUsed,
  errors,
  difficulty,
  score,
  onSaveScore,
}) => {
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onSaveScore(playerName.trim());
    }
  };

  // Map difficulty to a human-readable name
  const difficultyName = {
    'easy': 'Fácil',
    'medium': 'Médio',
    'hard': 'Difícil'
  }[difficulty];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-center gap-2">
            <Award className="h-6 w-6 text-yellow-500" />
            Parabéns!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tempo</p>
              <p className="text-lg font-semibold">{formatTime(time)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Dificuldade</p>
              <p className="text-lg font-semibold">{difficultyName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Dicas Usadas</p>
              <p className="text-lg font-semibold">{hintsUsed}/3</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Erros</p>
              <p className="text-lg font-semibold">{errors}</p>
            </div>
          </div>
          
          <div className="text-center pt-2 pb-4">
            <p className="text-sm text-muted-foreground">Pontuação Final</p>
            <p className="text-3xl font-bold text-sudoku-primary animate-pulse-light">{score}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="playerName">Seu Nome</Label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Digite seu nome"
                maxLength={20}
              />
            </div>
            
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={!playerName.trim()}>
                Salvar Pontuação
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionModal;
