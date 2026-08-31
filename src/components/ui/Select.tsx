import React, { forwardRef } from 'react';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ hasError = false, className = '', children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={`w-full px-3.5 py-2 pr-10 text-base bg-surface border rounded-md transition-colors appearance-none focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer ${
            hasError
              ? 'border-error-500 text-error-900 focus:border-error-500 focus:ring-error-500/20'
              : 'border-border text-text focus:border-primary-700 focus:ring-primary-700/20'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted">
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    );
  },
);

Select.displayName = 'Select';
