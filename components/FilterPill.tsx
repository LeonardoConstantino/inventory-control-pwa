import React from 'react';

const FilterPill: React.FC<{
  icon: React.ElementType;
  children: React.ReactNode;
  intent?: 'accent' | 'primary';
}> = ({ icon: Icon, children, intent = 'accent' }) => {
  const colors =
    intent === 'accent'
      ? 'bg-accent/20 text-accent'
      : 'bg-primary/20 text-primary';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${colors} text-xs font-medium rounded-full`}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  );
};

export default FilterPill;

