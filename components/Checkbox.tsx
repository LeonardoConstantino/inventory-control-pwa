import React from 'react';

const Checkbox: React.FC<
  { label: string } & React.InputHTMLAttributes<HTMLInputElement>
> = ({ label, id, ...props }) => {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        id={id}
        {...props}
        className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-accent accent-accent"
      />
      <label
        htmlFor={id}
        className="text-sm font-medium text-neutral-600 dark:text-neutral-300-dark cursor-pointer"
      >
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
