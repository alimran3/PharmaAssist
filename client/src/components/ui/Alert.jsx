import { HiOutlineExclamation, HiOutlineCheckCircle, HiOutlineInformationCircle, HiOutlineXCircle } from 'react-icons/hi';

const variants = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30',
    icon: HiOutlineCheckCircle,
    iconColor: 'text-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30',
    icon: HiOutlineExclamation,
    iconColor: 'text-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30',
    icon: HiOutlineXCircle,
    iconColor: 'text-red-500',
    text: 'text-red-700 dark:text-red-400',
  },
  info: {
    bg: 'bg-brand-50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800/30',
    icon: HiOutlineInformationCircle,
    iconColor: 'text-brand-500',
    text: 'text-brand-700 dark:text-brand-400',
  },
};

export default function Alert({ variant = 'info', title, children, className = '' }) {
  const config = variants[variant] || variants.info;
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${config.bg} ${className}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div>
        {title && <p className={`font-semibold text-sm ${config.text}`}>{title}</p>}
        <div className={`text-sm ${config.text} ${title ? 'mt-0.5' : ''}`}>{children}</div>
      </div>
    </div>
  );
}