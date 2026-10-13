import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const BADGE_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-white/5 text-slate-300 border-white/10 font-mono',
  primary: 'bg-lime-400/10 text-lime-400 border-lime-400/30 font-mono',
  accent: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30 font-mono',
  success: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30 font-mono',
  warning: 'bg-amber-400/10 text-amber-400 border-amber-400/30 font-mono',
  error: 'bg-rose-400/10 text-rose-400 border-rose-400/30 font-mono',
  neutral: 'bg-white/5 text-slate-400 border-white/10 font-mono',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${BADGE_STYLES[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'PUBLISHED':
      return <Badge variant="success">Published</Badge>;
    case 'IN_REVIEW':
      return <Badge variant="warning">In Review</Badge>;
    case 'DRAFT':
      return <Badge variant="neutral">Draft</Badge>;
    case 'ARCHIVED':
      return <Badge variant="error">Archived</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const DifficultyBadge: React.FC<{ difficulty: string }> = ({
  difficulty,
}) => {
  switch (difficulty) {
    case 'EASY':
      return <Badge variant="success">Easy</Badge>;
    case 'MEDIUM':
      return <Badge variant="accent">Medium</Badge>;
    case 'HARD':
      return <Badge variant="error">Hard</Badge>;
    default:
      return <Badge>{difficulty}</Badge>;
  }
};
