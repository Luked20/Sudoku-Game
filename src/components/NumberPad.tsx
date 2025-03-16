
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Pencil } from 'lucide-react';

interface NumberPadProps {
  onNumberClick: (num: number | null) => void;
  disabledNumbers?: Set<number>;
  notesMode?: boolean;
}

const NumberPad: React.FC<NumberPadProps> = ({ 
  onNumberClick, 
  disabledNumbers = new Set(),
  notesMode = false
}) => {
  return (
    <div className="max-w-xs mx-auto mt-4">
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            onClick={() => onNumberClick(num)}
            variant="outline"
            className={`h-12 text-lg font-semibold ${notesMode ? 'bg-blue-50' : ''}`}
            disabled={disabledNumbers.has(num)}
          >
            {notesMode && <Pencil className="h-3 w-3 absolute top-1 right-1 opacity-50" />}
            {num}
          </Button>
        ))}
        <Button
          onClick={() => onNumberClick(null)}
          variant="outline"
          className="h-12"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {notesMode && (
        <div className="mt-2 text-xs text-center text-muted-foreground">
          Modo de notas ativado
        </div>
      )}
    </div>
  );
};

export default NumberPad;
