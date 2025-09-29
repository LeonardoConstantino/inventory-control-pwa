import React from 'react';

const StatCard: React.FC<{
  label: string;
  value: string;
  intent?: 'primary' | 'neutral';
}> = ({ label, value, intent = 'neutral' }) => {
  const valueColor =
    intent === 'primary'
      ? 'text-primary dark:text-accent'
      : 'text-neutral-600 dark:text-neutral-300-dark';
  return (
    <div className="bg-neutral-100 dark:bg-neutral-700-dark/50 p-4 rounded-lg">
      <div className="text-sm font-medium text-neutral-500">{label}</div>
      <div className={`text-xl font-bold ${valueColor}`}>{value}</div>
    </div>
  );
};

export default StatCard;
