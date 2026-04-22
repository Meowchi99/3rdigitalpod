'use client';

import { cn } from '@/lib/utils';
import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

// ─── ActionButton ───
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'yellow' | 'generate' | 'ghost';

export const ActionButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }
>(({ className, variant = 'primary', children, ...props }, ref) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 font-sans';
  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-brand-red text-white hover:bg-brand-red-2 hover:shadow-[0_8px_30px_rgba(232,0,28,0.4)] hover:-translate-y-0.5',
    secondary:
      'border border-white/[0.07] bg-transparent text-white hover:border-white/20 hover:bg-ink-800',
    danger: 'bg-red-900/30 text-red-300 hover:bg-red-900/50',
    yellow: 'bg-brand-yellow text-black hover:bg-brand-yellow-2',
    generate:
      'bg-gradient-to-r from-brand-red to-brand-pink text-white hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(232,0,28,0.4)]',
    ghost: 'text-muted hover:text-white hover:bg-ink-800',
  };
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
});
ActionButton.displayName = 'ActionButton';

// ─── Field (Input) ───
export const Field = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label?: string }
>(({ className, label, id, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label
        htmlFor={id}
        className="text-[11px] font-semibold uppercase tracking-wider text-muted"
      >
        {label}
      </label>
    )}
    <input
      ref={ref}
      id={id}
      className={cn(
        'rounded-lg border border-white/[0.07] bg-ink-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-brand-blue/50',
        className
      )}
      {...props}
    />
  </div>
));
Field.displayName = 'Field';

// ─── Select ───
export const SelectField = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { label?: string }
>(({ className, label, id, children, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label
        htmlFor={id}
        className="text-[11px] font-semibold uppercase tracking-wider text-muted"
      >
        {label}
      </label>
    )}
    <select
      ref={ref}
      id={id}
      className={cn(
        'cursor-pointer appearance-none rounded-lg border border-white/[0.07] bg-ink-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-brand-blue/50',
        className
      )}
      {...props}
    >
      {children}
    </select>
  </div>
));
SelectField.displayName = 'SelectField';

// ─── Textarea ───
export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }
>(({ className, label, id, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label
        htmlFor={id}
        className="text-[11px] font-semibold uppercase tracking-wider text-muted"
      >
        {label}
      </label>
    )}
    <textarea
      ref={ref}
      id={id}
      className={cn(
        'rounded-lg border border-white/[0.07] bg-ink-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-brand-blue/50 font-mono',
        className
      )}
      {...props}
    />
  </div>
));
TextareaField.displayName = 'TextareaField';

// ─── InfoPanel ───
interface InfoPanelProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
}

export function InfoPanel({
  title,
  subtitle,
  icon,
  children,
  className,
}: InfoPanelProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="border-b border-white/[0.07] px-5 py-4">
          {title && (
            <div className="flex items-center gap-2 text-sm font-bold">
              {icon && <span>{icon}</span>}
              <span>{title}</span>
            </div>
          )}
          {subtitle && <div className="mt-1 text-xs text-muted">{subtitle}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Pill ───
interface PillProps {
  active?: boolean;
  color?: 'red' | 'blue' | 'yellow' | 'pink';
  onClick?: () => void;
  children: React.ReactNode;
}

export function Pill({ active, color = 'blue', onClick, children }: PillProps) {
  const colors = {
    red: active
      ? 'border-brand-red bg-brand-red/20 text-brand-red-3'
      : 'border-white/[0.07] bg-ink-800 text-muted hover:text-white',
    blue: active
      ? 'border-brand-blue bg-brand-blue/20 text-brand-blue-3'
      : 'border-white/[0.07] bg-ink-800 text-muted hover:text-white',
    yellow: active
      ? 'border-brand-yellow bg-brand-yellow/15 text-brand-yellow'
      : 'border-white/[0.07] bg-ink-800 text-muted hover:text-white',
    pink: active
      ? 'border-brand-pink bg-brand-pink/20 text-brand-pink'
      : 'border-white/[0.07] bg-ink-800 text-muted hover:text-white',
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-all',
        colors[color]
      )}
    >
      {children}
    </button>
  );
}

// ─── Section ───
export function Section({
  title,
  subtitle,
  icon,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto max-w-6xl px-6 py-12', className)}>
      {(title || subtitle) && (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            {title && (
              <h2 className="font-display text-4xl tracking-widest">
                {icon && <span className="mr-2">{icon}</span>}
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Toast (simple imperative) ───
let toastTimer: ReturnType<typeof setTimeout> | null = null;
export function showToast(message: string) {
  if (typeof window === 'undefined') return;
  const existing = document.getElementById('__toast');
  if (existing) existing.remove();
  if (toastTimer) clearTimeout(toastTimer);

  const el = document.createElement('div');
  el.id = '__toast';
  el.textContent = message;
  el.className =
    'fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 rounded-lg border border-white/[0.07] bg-ink-900 px-5 py-2.5 text-sm text-white shadow-xl animate-fade-in-up';
  document.body.appendChild(el);
  toastTimer = setTimeout(() => el.remove(), 2500);
}
