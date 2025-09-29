import React from 'react';
import { inputStyles } from '../styles/formStyles';

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (
  props
) => {
  return (
    <textarea
      {...props}
      className={inputStyles({ className: props.className })}
    />
  );
};
