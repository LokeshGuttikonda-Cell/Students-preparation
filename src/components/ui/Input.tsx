import React, { forwardRef } from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError = false, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-3.5 py-2 text-base bg-surface border rounded-md transition-colors placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:bg-neutral-100 disabled:cursor-not-allowed ${
          hasError
            ? 'border-error-500 text-error-900 focus:border-error-500 focus:ring-error-500/20'
            : 'border-border text-text focus:border-primary-700 focus:ring-primary-700/20'
        } ${className}`}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
