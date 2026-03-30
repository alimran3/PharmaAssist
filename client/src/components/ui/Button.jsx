import { classNames } from '../../utils/helpers';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  emerald: 'btn-emerald',
  ghost: `inline-flex items-center justify-center gap-2 px-4 py-2.5
          text-surface-600 dark:text-surface-400 font-semibold rounded-xl
          hover:bg-surface-100 dark:hover:bg-surface-800
          active:scale-[0.97] transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-surface-300/50`,
  link: `inline-flex items-center gap-1 text-brand-500 hover:text-brand-600
         font-semibold transition-colors underline-offset-2 hover:underline`,
};

const sizes = {
  xs: 'text-xs px-3 py-1.5',
  sm: 'text-sm px-4 py-2',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-6 py-3',
  xl: 'text-base px-8 py-3.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classNames(
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
          {children}
          {IconRight && <IconRight className="w-4 h-4 flex-shrink-0" />}
        </>
      )}
    </button>
  );
}