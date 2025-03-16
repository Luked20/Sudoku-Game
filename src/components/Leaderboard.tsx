
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DifficultyLevel, PlayerScore } from '../types/sudoku';
import { formatTime } from '../utils/scoring';
import { ListOrdered, Award, Timer, HelpCircle } from 'lucide-react';

interface LeaderboardProps {
  scores: PlayerScore[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ scores }) => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  
  // Filter scores by selected difficulty
  const filteredScores = scores.filter(score => score.difficulty === difficulty);
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <ListOrdered className="h-6 w-6" />
          Classificação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="easy" onValueChange={(value) => setDifficulty(value as DifficultyLevel)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="easy">Fácil</TabsTrigger>
            <TabsTrigger value="medium">Médio</TabsTrigger>
            <TabsTrigger value="hard">Difícil</TabsTrigger>
          </TabsList>
          
          <TabsContent value="easy" className="mt-0">
            <LeaderboardTable scores={filteredScores} />
          </TabsContent>
          <TabsContent value="medium" className="mt-0">
            <LeaderboardTable scores={filteredScores} />
          </TabsContent>
          <TabsContent value="hard" className="mt-0">
            <LeaderboardTable scores={filteredScores} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface LeaderboardTableProps {
  scores: PlayerScore[];
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ scores }) => {
  if (scores.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Sem pontuações para mostrar
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left font-medium text-muted-foreground w-10">#</th>
            <th className="py-2 text-left font-medium text-muted-foreground">Jogador</th>
            <th className="py-2 text-right font-medium text-muted-foreground">
              <div className="flex items-center justify-end">
                <Timer className="h-4 w-4 mr-1" />
              </div>
            </th>
            <th className="py-2 text-right font-medium text-muted-foreground">
              <div className="flex items-center justify-end">
                <HelpCircle className="h-4 w-4 mr-1" />
              </div>
            </th>
            <th className="py-2 text-right font-medium text-muted-foreground">
              <div className="flex items-center justify-end">
                <Award className="h-4 w-4 mr-1" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {scores.slice(0, 10).map((score, index) => (
            <tr key={index} className="border-b last:border-0">
              <td className="py-3 font-medium">{index + 1}</td>
              <td className="py-3 font-medium">{score.playerName}</td>
              <td className="py-3 text-right">{formatTime(score.time)}</td>
              <td className="py-3 text-right">{score.hintsUsed}</td>
              <td className="py-3 text-right font-bold text-sudoku-primary">{score.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
