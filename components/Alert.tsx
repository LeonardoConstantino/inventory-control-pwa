import React from 'react';
import { cva } from 'class-variance-authority';
import { AlertTriangle, HelpCircle } from './Icons';

const alertStyles = cva('p-4 rounded-lg border flex', {
  variants: {
    intent: {
      info: 'bg-info/10 border-info/20 text-info-dark dark:text-info-light',
      warning:
        'bg-warning/10 border-warning/20 text-warning-dark dark:text-warning-light',
      error:
        'bg-error/10 border-error/20 text-error-dark dark:text-error-light',
    },
  },
});

const Alert: React.FC<{
  intent: 'info' | 'warning' | 'error';
  children: React.ReactNode;
}> = ({ intent, children }) => {
  const Icon =
    intent === 'error' || intent === 'warning' ? AlertTriangle : HelpCircle;
  return (
    <div className={alertStyles({ intent })}>
      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
      <div className="text-sm">{children}</div>
    </div>
  );
};

export default Alert;
