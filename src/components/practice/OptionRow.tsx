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
    'border-white/10 bg-[rgba(11,18,33,0.7)] hover:bg-[rgba(132,204,22,0.06)] hover:border-lime-400/40 text-slate-200 bento-option backdrop-blur-md';
  let badgeStyles = 'bg-black/60 text-slate-300 border-white/10';
  let indicator: React.ReactNode = null;

  if (state === 'selected') {
    containerStyles =
      'border-lime-400 bg-lime-400/10 text-white shadow-[0_0_20px_-3px_rgba(163,230,53,0.3)] ring-1 ring-lime-400/30 bento-option';
    badgeStyles = 'bg-lime-400 text-slate-950 font-black border-lime-400';
  } else if (state === 'correct') {
    containerStyles =
      'border-success-500 bg-emerald-950/40 text-white ring-1 ring-emerald-500/40 shadow-[0_0_20px_-3px_rgba(16,185,129,0.3)] bento-option';
    badgeStyles = 'bg-emerald-500 text-slate-950 font-black border-emerald-500';
    indicator = (
      <span className="flex items-center text-emerald-400 font-bold text-xs gap-1 ml-auto shrink-0 font-mono">
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
      'border-error-500 bg-rose-950/40 text-white ring-1 ring-rose-500/40 shadow-[0_0_20px_-3px_rgba(244,63,94,0.3)] bento-option';
    badgeStyles = 'bg-rose-500 text-white font-black border-rose-500';
    indicator = (
      <span className="flex items-center text-rose-400 font-bold text-xs gap-1 ml-auto shrink-0 font-mono">
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
      aria-pressed={state === 'selected'}
      disabled={disabled}
      onClick={onClick}
      className={`w-full min-h-[48px] touch-manipulation p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 disabled:cursor-default ${containerStyles}`}
    >
      <span
        className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-mono font-bold text-xs shrink-0 border ${badgeStyles}`}
      >
        {label}
      </span>
      <span className="text-sm leading-relaxed flex-1 pt-0.5">{body}</span>
      {indicator}
    </button>
  );
};
