import React from 'react';

export type OptionState =
  | 'default'
  | 'selected'
  | 'correct'
  | 'incorrect';

export interface OptionRowProps {
  label: string; // 'A', 'B', 'C', 'D'
  body: string;
  state?: OptionState;
  disabled?: boolean;
  onClick?: () => void;
}

export const OptionRow: React.FC<OptionRowProps> = ({
  label,
  body,
  state = 'default',
  disabled = false,
  onClick,
}) => {
  let containerStyles =
    'border-border bg-surface hover:bg-neutral-50/80 text-text';
  let badgeStyles = 'bg-neutral-100 text-text-muted border-border';
  let indicator: React.ReactNode = null;

  if (state === 'selected') {
    containerStyles =
      'border-primary-700 bg-primary-50/60 text-primary-950 ring-1 ring-primary-700/20';
    badgeStyles = 'bg-primary-700 text-white border-primary-700';
  } else if (state === 'correct') {
    containerStyles =
      'border-success-500 bg-success-50/70 text-success-950 ring-1 ring-success-500/30';
    badgeStyles = 'bg-success-700 text-white border-success-700';
    indicator = (
      <span className="flex items-center text-success-700 font-semibold text-xs gap-1 ml-auto shrink-0">
        <svg
          className="w-4 h-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
            clipRule="evenodd"
          />
        </svg>
        Correct
      </span>
    );
  } else if (state === 'incorrect') {
    containerStyles =
      'border-error-500 bg-error-50/70 text-error-950 ring-1 ring-error-500/30';
    badgeStyles = 'bg-error-700 text-white border-error-700';
    indicator = (
      <span className="flex items-center text-error-700 font-semibold text-xs gap-1 ml-auto shrink-0">
        <svg
          className="w-4 h-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
        Incorrect
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full p-4 rounded-md border text-left flex items-start gap-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2 disabled:cursor-default ${containerStyles}`}
    >
      <span
        className={`inline-flex items-center justify-center w-7 h-7 rounded-md font-mono font-bold text-xs shrink-0 border ${badgeStyles}`}
      >
        {label}
      </span>
      <span className="text-base leading-relaxed flex-1 pt-0.5">{body}</span>
      {indicator}
    </button>
  );
};
