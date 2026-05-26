// components/ui/Button.tsx
// Reusable button with 4 variants × 3 sizes.
// Supports rendering as <button> or <a> via the `as` prop.
import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-md',
  md: 'px-5 py-2.5 text-sm font-semibold rounded-lg',
  lg: 'px-7 py-3 text-base font-semibold rounded-lg',
};

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  id?: string;
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  id,
}: ButtonProps) {
  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-ring ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = Omit<ButtonProps, 'type' | 'onClick'> & {
  href: string;
  target?: '_blank' | '_self';
  rel?: string;
};

export function LinkButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  href,
  target,
  rel,
  id,
}: LinkButtonProps) {
  return (
    <a
      id={id}
      href={href}
      target={target}
      rel={rel}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 focus-ring ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </a>
  );
}
