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
      className={`border transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${
        isCorrect
          ? 'border-success-500/40 bg-success-50/20'
          : 'border-error-500/40 bg-error-50/20'
      }`}
    >
      <CardHeader className="py-3 px-5 border-b border-border/60 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Badge variant={isCorrect ? 'success' : 'error'}>
            {isCorrect ? 'Correct Verdict' : 'Incorrect Selection'}
          </Badge>
          <span className="font-semibold text-text">Solution & Explanation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="text-sm text-text leading-relaxed whitespace-pre-line max-w-prose">
          {explanation}
        </div>
      </CardContent>
    </Card>
  );
};
