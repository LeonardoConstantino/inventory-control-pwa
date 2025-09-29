import React from 'react';
import { clsx } from 'clsx';

interface ToggleSwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ className, ...props }) => {
  return (
    <label
      className={clsx(
        'relative inline-flex items-center cursor-pointer',
        className
      )}
    >
      <input type="checkbox" className="sr-only peer" {...props} />
      <div className="w-11 h-6 bg-neutral-200 rounded-full peer dark:bg-neutral-700-dark peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-accent" />
    </label>
  );
};

export default ToggleSwitch;
