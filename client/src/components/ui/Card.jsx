import { classNames } from '../../utils/helpers';

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'p-5',
  border = true,
  gradient = false,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={classNames(
        'rounded-2xl bg-white dark:bg-surface-900',
        border && 'border border-surface-200/80 dark:border-surface-700/50',
        hover && 'card-hover cursor-pointer',
        gradient && 'bg-gradient-to-br from-white to-surface-50 dark:from-surface-900 dark:to-surface-800',
        padding,
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', actions }) {
  return (
    <div className={classNames(
      'flex items-center justify-between pb-4 mb-4 border-b border-surface-100 dark:border-surface-800',
      className
    )}>
      <div>{children}</div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={classNames(
      'font-display font-bold text-lg text-surface-900 dark:text-white',
      className
    )}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={classNames(
      'text-sm text-surface-500 mt-0.5',
      className
    )}>
      {children}
    </p>
  );
}