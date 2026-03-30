import { classNames } from '../../utils/helpers';

const variantStyles = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-emerald-500/20',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-amber-500/20',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-red-500/20',
  info: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 ring-brand-500/20',
  neutral: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400 ring-surface-500/20',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 ring-purple-500/20',
};

const sizeStyles = {
  xs: 'text-[9px] px-1.5 py-0.5',
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-0.5',
  lg: 'text-xs px-3 py-1',
};

export default function Badge({
  children,
  variant = 'info',
  size = 'sm',
  dot = false,
  removable = false,
  onRemove,
  icon: Icon,
  className = '',
}) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className={classNames(
          'w-1.5 h-1.5 rounded-full',
          variant === 'success' && 'bg-emerald-500',
          variant === 'warning' && 'bg-amber-500',
          variant === 'danger' && 'bg-red-500',
          variant === 'info' && 'bg-brand-500',
          variant === 'neutral' && 'bg-surface-500',
          variant === 'purple' && 'bg-purple-500',
        )} />
      )}
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-0.5 -mr-0.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}