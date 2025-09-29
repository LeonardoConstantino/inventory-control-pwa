import React from 'react';

const LoadingState: React.FC<{ text?: string }> = ({
  text = 'Carregando...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-sm text-neutral-500">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-accent border-t-transparent mb-4"></div>
      <span>{text}</span>
    </div>
  );
};

export default LoadingState;
