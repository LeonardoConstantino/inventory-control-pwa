import React from 'react';

interface SettingsRowProps {
  label: string;
  description: string;
  children: React.ReactNode;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  description,
  children,
}) => {
  return (
    <div className="py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="sm:w-2/3">
        <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-300-dark">
          {label}
        </label>
        <p className="mt-1 text-xs text-neutral-500">{description}</p>
      </div>
      <div className="flex-shrink-0 sm:w-1/3 flex justify-start sm:justify-end">
        {children}
      </div>
    </div>
  );
};

export default SettingsRow;
