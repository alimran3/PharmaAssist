export default function Footer() {
  return (
    <footer className="border-t border-surface-200/50 dark:border-surface-700/30 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center">
            <span className="text-white font-display font-extrabold text-[9px]">P</span>
          </div>
          <span className="text-xs font-display font-semibold">
            <span className="gradient-text">pharma</span>
            <span className="text-surface-500">Assist</span>
          </span>
        </div>
        <p className="text-xs text-surface-400">
          © {new Date().getFullYear()} PharmaAssist. Your Neighborhood Pharmacy, Now Digital.
        </p>
      </div>
    </footer>
  );
}