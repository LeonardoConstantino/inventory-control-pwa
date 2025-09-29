import React, { useCallback } from 'react';
import TutorialCard from '../components/TutorialCard';
// Importe seus ícones. Estes são exemplos.
import {
  Add,
  ArrowsLeftRight,
  LocationIcon,
  Report,
  ArrowDownTray,
  DevicePhoneMobile,
  ChevronUp,
  Sparkles,
} from '../components/Icons';
import Button from '../components/Button';
import { Page } from '../types';

// Definição do conteúdo do tutorial. Manter isso separado facilita a manutenção.
const tutorialSteps = [
  {
    id: 1,
    icon: <Add className="w-8 h-8 text-primary dark:text-accent" />,
    title: 'Adicionando seu Primeiro Item',
    description:
      'Tudo começa aqui! Na tela de Inventário, clique no botão azul flutuante (+) no canto inferior direito para abrir o formulário e cadastrar um novo produto com nome, quantidade, foto e outros detalhes.',
  },
  {
    id: 2,
    icon: <ArrowsLeftRight className="w-8 h-8 text-green-500" />,
    title: 'Gerenciando o Estoque',
    description:
      'Após adicionar um item, clique nele para ver os detalhes. Use os botões "Adicionar" e "Remover" para registrar entradas e saídas. Todas as movimentações ficam salvas no Histórico para sua consulta.',
  },
  {
    id: 3,
    icon: <LocationIcon className="w-8 h-8 text-purple-500" />,
    title: 'Organizando com Localizações',
    description:
      'Vá em Configurações > Gerenciar Locais para criar sua estrutura física (ex: Corredor A, Prateleira 01). Depois, ao criar ou editar um item, você poderá associá-lo a um local específico para encontrá-lo facilmente.',
  },
  {
    id: 4,
    icon: <Report className="w-8 h-8 text-yellow-500" />,
    title: 'Analisando seus Relatórios',
    description:
      'A aba Relatório oferece uma visão geral do seu inventário. Monitore o valor total em estoque, veja quais itens estão com estoque baixo e descubra quais são os produtos mais movimentados.',
  },
  {
    id: 5,
    icon: <ArrowDownTray className="w-8 h-8 text-blue-500" />,
    title: 'Backup e Restauração',
    description:
      'Seus dados são valiosos. Em Configurações, use a opção "Exportar Dados" para salvar um backup completo em um arquivo. Se precisar restaurar ou migrar para outro dispositivo, use a opção "Importar Dados".',
  },
  {
    id: 6,
    icon: <DevicePhoneMobile className="w-8 h-8 text-gray-500" />,
    title: 'Instale como um Aplicativo',
    description:
      'Para uma experiência mais rápida e nativa, instale este site em seu celular ou computador. Procure pela opção "Adicionar à tela inicial" ou "Instalar aplicativo" no menu do seu navegador.',
  },
];

const TutorialPage: React.FC = ({ onNavigate }) => {
  const handleAddClick = useCallback(() => {
    onNavigate(Page.INVENTORY);
  }, [onNavigate]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* 1. Cabeçalho Engajador e Coeso */}
        <header className="text-center mb-12 relative">
          <Sparkles className="h-12 w-12 text-accent mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl font-bold text-neutral-600 dark:text-neutral-300-dark tracking-tight">
            Guia de Início Rápido
          </h1>
          <p className="mt-2 text-lg text-neutral-500">
            Aprenda a usar os principais recursos em poucos passos.
          </p>
        </header>

        {/* 2. Main com a "Linha do Tempo" */}
        <main className="relative space-y-12">
          {/* A linha da timeline posicionada por trás dos cards */}
          <div className="absolute left-4 md:left-1/2 top-4 bottom-4 w-0.5 bg-neutral-200 dark:bg-neutral-700-dark -translate-x-1/2" />

          {tutorialSteps.map((step) => (
            <div key={step.id} className="relative">
              {/* O "ponto" na timeline para cada passo */}
              <div className="absolute left-4 md:left-1/2 top-8 w-3 h-3 bg-primary rounded-full -translate-x-1/2 border-4 border-base dark:border-neutral-800-dark" />
              <TutorialCard
                stepNumber={step.id}
                icon={step.icon}
                title={step.title}
                description={step.description}
                // imageSlot={...} (se aplicável)
              />
            </div>
          ))}
        </main>

        {/* 3. Call to Action (CTA) no final */}
        <footer className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-neutral-600 dark:text-neutral-300-dark">
            Pronto para começar?
          </h2>
          <p className="mt-2 text-neutral-500">
            Agora você está pronto para organizar seu inventário como nunca.
          </p>
          <div className="mt-6">
            <Button
              intent="primary"
              size="lg"
              onClick={handleAddClick}
            >
              <span className="animate-bounce">Ir para o Meu Inventário</span>
              <ChevronUp className="h-5 w-5 ml-2 rotate-90" />
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TutorialPage;
