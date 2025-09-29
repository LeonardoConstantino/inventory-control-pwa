import React from 'react';
import { cva } from 'class-variance-authority';
import { Check } from './Icons';

// 1. Definindo as variantes de estilo com CVA
const stepBubbleStyles = cva(
  'w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300',
  {
    variants: {
      state: {
        completed: 'bg-primary text-white',
        active: 'border-2 border-primary text-primary bg-base',
        inactive: 'bg-neutral-200 dark:bg-neutral-700-dark text-neutral-500',
      },
    },
  }
);

const stepLabelStyles = cva('font-medium transition-colors duration-300', {
  variants: {
    state: {
      completed: 'text-neutral-600 dark:text-neutral-300-dark',
      active: 'text-primary dark:text-accent',
      inactive: 'text-neutral-400 dark:text-neutral-500',
    },
  },
});

// 2. Componente para uma única etapa
const Step = ({ step, state }) => {
  const isCompleted = state === 'completed';
  return (
    <div className="flex items-center space-x-2">
      <div className={stepBubbleStyles({ state })}>
        {isCompleted ? <Check className="w-5 h-5" /> : step.id}
      </div>
      {/* 3. Rótulo responsivo */}
      <span
        className={stepLabelStyles({ state, className: 'hidden sm:block' })}
      >
        {step.label}
      </span>
    </div>
  );
};

// 4. API de props genérica
interface StepData {
  id: number;
  label: string;
}

interface ProgressIndicatorProps {
  steps: StepData[];
  currentStepId: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStepId,
}) => {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, index) => {
        const state =
          currentStepId > step.id
            ? 'completed'
            : currentStepId === step.id
            ? 'active'
            : 'inactive';
        const isConnectorActive = currentStepId > step.id;

        return (
          <React.Fragment key={step.id}>
            <Step step={step} state={state} />

            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 bg-neutral-200 dark:bg-neutral-700-dark rounded-full">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: isConnectorActive ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressIndicator;
