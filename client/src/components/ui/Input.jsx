import { forwardRef, useState } from 'react';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { classNames } from '../../utils/helpers';

const Input = forwardRef(({
  label,
  error,
  hint,
  icon: Icon,
  type = 'text',
  required = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none" />
        )}

        {type === 'textarea' ? (
          <textarea
            ref={ref}
            className={classNames(
              'input-field resize-none',
              Icon && 'pl-11',
              error && 'border-red-400 dark:border-red-500 focus:ring-red-500/40 focus:border-red-500',
              className
            )}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            type={inputType}
            className={classNames(
              'input-field',
              Icon && 'pl-11',
              isPassword && 'pr-11',
              error && 'border-red-400 dark:border-red-500 focus:ring-red-500/40 focus:border-red-500',
              className
            )}
            {...props}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <HiOutlineEyeOff className="w-5 h-5" />
            ) : (
              <HiOutlineEye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-surface-400">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;