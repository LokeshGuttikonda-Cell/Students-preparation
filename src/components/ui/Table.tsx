import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className="w-full overflow-x-auto border border-border rounded-lg bg-surface">
      <table className={`w-full text-left text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHead: React.FC<
  React.HTMLAttributes<HTMLTableSectionElement>
> = ({ className = '', children, ...props }) => {
  return (
    <thead
      className={`bg-neutral-50 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody: React.FC<
  React.HTMLAttributes<HTMLTableSectionElement>
> = ({ className = '', children, ...props }) => {
  return (
    <tbody className={`divide-y divide-border ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <tr
      className={`transition-colors hover:bg-neutral-50/60 ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHeaderCell: React.FC<
  React.ThHTMLAttributes<HTMLTableCellElement>
> = ({ className = '', children, ...props }) => {
  return (
    <th className={`px-4 py-3.5 font-semibold ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<
  React.TdHTMLAttributes<HTMLTableCellElement>
> = ({ className = '', children, ...props }) => {
  return (
    <td className={`px-4 py-3.5 text-text ${className}`} {...props}>
      {children}
    </td>
  );
};
