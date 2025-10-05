import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const buttonStyles = cva(
  // Estilos base
  'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      intent: {
        primary:
          'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md focus-visible:ring-accent',
        secondary:
          'bg-neutral-200 text-neutral-600 border border-neutral-300 hover:bg-neutral-300 dark:bg-neutral-700-dark dark:text-neutral-300-dark dark:border-neutral-700-dark dark:hover:bg-neutral-800-dark focus-visible:ring-primary',
        tertiary:
          'bg-transparent text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700-dark focus-visible:ring-primary',
        danger:
          'bg-error text-white hover:bg-error-dark shadow-sm hover:shadow-md focus-visible:ring-error',
        success:
          'bg-success text-white hover:bg-success-dark shadow-sm hover:shadow-md focus-visible:ring-success',
      },
      size: {
        lg: 'px-6 py-2.5 text-base',
        md: 'px-4 py-2 text-sm',
        sm: 'p-2 text-sm',
      },
        active: {
          true: 'border-primary/60 bg-primary/10 text-primary shadow-inner',
          false: '',
        },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
      active: false,
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  className,
  intent,
  size,
  active,
  children,
  ...props
}) => {
  return (
    <button
      className={clsx(buttonStyles({ intent, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
