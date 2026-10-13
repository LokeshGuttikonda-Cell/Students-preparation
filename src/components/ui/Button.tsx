import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'ghost'
  | 'destructive'
  | 'white'
  | 'outline-white';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-700 bg-lime-400 hover:bg-lime-300 active:bg-lime-500 text-slate-950 font-bold shadow-md shadow-lime-400/25 focus-visible:ring-lime-400 transition-all duration-150 cursor-pointer',
  accent:
    'bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-400/25 focus-visible:ring-cyan-400 transition-all duration-150 cursor-pointer',
  secondary:
    'bg-slate-900/90 hover:bg-slate-800 active:bg-slate-950 text-slate-200 border border-white/10 hover:border-lime-400/40 font-medium shadow-2xs focus-visible:ring-lime-400 transition-all duration-150 cursor-pointer',
  ghost:
    'bg-transparent hover:bg-white/5 active:bg-white/10 text-slate-300 hover:text-white font-medium focus-visible:ring-lime-400 transition-all duration-150 cursor-pointer',
  destructive:
    'bg-rose-950/40 hover:bg-rose-900/60 active:bg-rose-900 text-rose-300 border border-rose-500/40 font-medium focus-visible:ring-rose-500 transition-all duration-150 cursor-pointer',
  white:
    'bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-950 font-bold shadow-xs border border-white/20 focus-visible:ring-white transition-all duration-150 cursor-pointer',
  'outline-white':
    'bg-transparent hover:bg-white/10 active:bg-white/20 text-white border border-white/30 font-medium focus-visible:ring-white transition-all duration-150 cursor-pointer',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-2.5 text-base rounded-2xl gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
