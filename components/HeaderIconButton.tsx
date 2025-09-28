import React from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';

const headerButtonStyles = cva(
  'p-2 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-primary focus-visible:ring-white',
  {
    variants: {
      intent: {
        default: 'hover:bg-white/10 active:bg-white/20',
      },
    },
    defaultVariants: {
      intent: 'default',
    },
  }
);

interface HeaderIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const HeaderIconButton: React.FC<HeaderIconButtonProps> = ({ className, children, ...props }) => {
  return (
    <button className={clsx(headerButtonStyles(), className)} {...props}>
      {children}
    </button>
  );
};

export default HeaderIconButton;