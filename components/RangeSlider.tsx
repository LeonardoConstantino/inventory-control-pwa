import React from 'react';

const RangeSlider: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => {
  return (
    <input
      type="range"
      {...props}
      className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-primary"
    />
  );
};

export default RangeSlider
