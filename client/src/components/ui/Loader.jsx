export default function Loader({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} rounded-full border-surface-200 dark:border-surface-700 border-t-brand-500 animate-spin`} />
    </div>
  );
}

export function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-brand-100 dark:border-brand-900/30" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-emerald-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <p className="text-sm text-surface-500 font-medium animate-pulse">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl overflow-hidden animate-pulse">
      <div className="h-40 bg-surface-200 dark:bg-surface-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-surface-200 dark:bg-surface-700 rounded" />
        <div className="h-3 w-1/2 bg-surface-100 dark:bg-surface-800 rounded" />
        <div className="h-5 w-1/3 bg-surface-200 dark:bg-surface-700 rounded" />
      </div>
    </div>
  );
}