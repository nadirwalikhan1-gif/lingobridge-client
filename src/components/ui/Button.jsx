import React from 'react';

/**
 * Button Component
 * Polish: tighter radius token, spring transition, improved disabled opacity,
 *         subtle glow on primary focus (UI UX Pro Max — Micro SaaS pattern)
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  tooltip,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const baseStyles = [
    'inline-flex items-center justify-center gap-1.5 font-semibold',
    'rounded-[10px] transition-all duration-150',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'select-none',
  ].join(' ');

  const variants = {
    primary:   'bg-lb-primary text-white hover:bg-lb-deep focus:ring-lb-primary/30 shadow-sm hover:shadow-md active:scale-[0.98]',
    secondary: 'bg-white text-slate-700 border border-lb-border hover:bg-lb-surface hover:border-lb-primary/30 focus:ring-lb-primary/20 shadow-sm',
    ghost:     'bg-transparent text-lb-muted hover:bg-lb-surface hover:text-lb-ink focus:ring-lb-primary/20',
    danger:    'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500/30 shadow-sm active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      title={isDisabled && tooltip ? tooltip : undefined}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
