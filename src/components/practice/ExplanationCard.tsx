import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface ExplanationCardProps {
  isCorrect: boolean;
  explanation: string;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({
  isCorrect,
  explanation,
}) => {
  return (
    <Card
      className={`border transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 bento-tile ${
        isCorrect
          ? 'border-emerald-500/40 bg-emerald-950/20'
          : 'border-rose-500/40 bg-rose-950/20'
      }`}
    >
      <CardHeader className="py-3.5 px-6 border-b border-white/10 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2 font-display">
          <Badge variant={isCorrect ? 'success' : 'error'}>
            {isCorrect ? 'Correct Verdict' : 'Incorrect Selection'}
          </Badge>
          <span className="font-bold text-white">Solution &amp; Socratic Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line max-w-prose font-sans">
          {explanation}
        </div>
      </CardContent>
    </Card>
  );
};
