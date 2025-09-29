import React from 'react';
import { NoPhoto } from './Icons'; // Um ícone mais adequado para o placeholder

interface TutorialCardProps {
  stepNumber: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  imageSlot?: React.ReactNode; // 3. Prop para a imagem real
}

const TutorialCard: React.FC<TutorialCardProps> = ({
  stepNumber,
  title,
  icon,
  description,
  imageSlot,
}) => {
  const isReversed = stepNumber % 2 === 0;

  return (
    // 1. Coesão: Usando tokens para fundo, sombra e interação
    <div className="bg-base dark:bg-neutral-800-dark rounded-lg shadow-card overflow-hidden transition-shadow duration-300 hover:shadow-card-hover">
      <div
        className={`flex flex-col md:flex-row ${
          isReversed ? 'md:flex-row-reverse' : ''
        }`}
      >
        {/* Lado do Conteúdo (Texto) */}
        <div className="p-8 md:w-1/2 flex flex-col justify-center">
          <div>
            {/* 1. Coesão: Usando tokens para tipografia */}
            <span className="text-sm font-semibold text-primary">
              PASSO {stepNumber}
            </span>
            <h3 className="mt-2 text-2xl font-bold text-neutral-600 dark:text-neutral-300-dark flex items-center">
              <span className="mr-3 text-accent">{icon}</span>
              {title}
            </h3>
            <p className="mt-4 text-neutral-500">
              {description}
            </p>
          </div>
        </div>

        {/* Lado da Imagem (Real ou Placeholder) */}
        <div className="md:w-1/2 bg-neutral-100 dark:bg-neutral-900-dark/50 min-h-[250px] flex items-center justify-center p-4">
          {imageSlot ? (
            // Renderiza a imagem real se fornecida
            <div className="w-full h-full object-cover">{imageSlot}</div>
          ) : (
            // 2. Placeholder com estilo padronizado (como EmptyState)
            <div className="text-center w-full h-full p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-700-dark rounded-lg flex flex-col items-center justify-center">
              <NoPhoto className="h-12 w-12 text-neutral-400" />
              <span className="mt-2 block text-sm font-medium text-neutral-500">
                Visualização do Recurso
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialCard;