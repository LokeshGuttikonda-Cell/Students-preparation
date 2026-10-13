import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  elevated = false,
  className = '',
  children,
  ...props
}) => {
  const hasBg = /\bbg-/.test(className);
  const hasBorder = /\bborder(\s|$|-)/.test(className);
  const bgClass = hasBg ? '' : 'bg-surface';
  const borderClass = hasBorder ? '' : 'border border-border';

  return (
    <div
      className={`${bgClass} ${borderClass} rounded-2xl backdrop-blur-xl transition-all duration-200 ${
        elevated ? 'shadow-md border-white/15' : 'shadow-xs'
      } ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`p-6 border-b border-border ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <h3
      className={`text-xl font-bold tracking-tight text-white ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`p-6 border-t border-border bg-white/[0.02] rounded-b-2xl flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
