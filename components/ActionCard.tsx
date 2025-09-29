import React from 'react';
import { cva } from 'class-variance-authority';

const actionCardStyles = cva('p-6 rounded-lg border', {
  variants: {
    intent: {
      default:
        'bg-base dark:bg-neutral-800-dark border-neutral-200 dark:border-neutral-700-dark',
      danger:
        'bg-error/5 dark:bg-error/10 border-error/30 dark:border-error/50',
    },
  },
  defaultVariants: { intent: 'default' },
});

interface ActionCardProps {
  intent?: 'default' | 'danger';
  title: string;
  description: React.ReactNode;
  actionSlot: React.ReactNode;
}

const ActionCard: React.FC<ActionCardProps> = ({
  intent,
  title,
  description,
  actionSlot,
}) => {
  const titleColor =
    intent === 'danger'
      ? 'text-error-dark dark:text-error-light'
      : 'text-neutral-600 dark:text-neutral-300-dark';

  return (
    <div className={actionCardStyles({ intent })}>
      <h3 className={`text-md font-semibold ${titleColor}`}>{title}</h3>
      <div className="text-sm text-neutral-500 my-3">{description}</div>
      <div className="mt-4">{actionSlot}</div>
    </div>
  );
};
export default ActionCard;
