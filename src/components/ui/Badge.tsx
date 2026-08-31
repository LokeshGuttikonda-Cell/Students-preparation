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
  default: 'bg-neutral-100 text-neutral-800 border-neutral-300',
  primary: 'bg-primary-50 text-primary-800 border-primary-300',
  accent: 'bg-accent-50 text-accent-800 border-accent-300',
  success: 'bg-success-50 text-success-700 border-success-500/30',
  warning: 'bg-accent-50 text-accent-900 border-accent-400',
  error: 'bg-error-50 text-error-700 border-error-500/30',
  neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
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
