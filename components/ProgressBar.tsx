import React from 'react';
import { cva } from 'class-variance-authority';

const progressBarStyles = cva('h-2 rounded-full transition-all duration-500', {
  variants: {
    intent: {
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-error',
    },
  },
  defaultVariants: { intent: 'success' },
});

const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
  const intent =
    percentage > 80 ? 'error' : percentage > 60 ? 'warning' : 'success';

  return (
    <section
      className="w-full bg-neutral-200 dark:bg-neutral-700-dark rounded-full h-2"
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <progress
        value={Math.min(percentage, 100)}
        max="100"
        className={progressBarStyles({ intent })}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      >
        {/* Fallback para navegadores antigos */}
        {Math.min(percentage, 100)}%
      </progress>
    </section>
  );
};

export default ProgressBar;
