import { AlertTriangle, ArrowPath } from './Icons'; // Usando ícones consistentes
import Button from './Button'; // Importando nosso componente de botão

function ErrorScreen({
  hasError,
  showInfo,
}: {
  hasError: unknown;
  showInfo: (title: string, message: string) => void;
}) {
  return (
    // 1. Fundo com gradientes baseados nos tokens de design
    <div
      className="h-screen w-screen bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-100 
                  dark:from-neutral-800-dark dark:via-neutral-900-dark dark:to-neutral-800-dark 
                  flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Glows decorativos usando a cor de erro do nosso tema */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-error/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-error/20 rounded-full blur-2xl animate-pulse"></div>

      {/* 2. Card de vidro refinado com cores do sistema */}
      <div
        className="relative z-10 max-w-md w-full text-center 
                    bg-base/60 dark:bg-neutral-800-dark/60 backdrop-blur-xl 
                    rounded-2xl shadow-2xl p-8 border border-base/20"
      >
        {/* Ícone usando a cor de erro */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-error/10 rounded-full animate-bounce">
            <AlertTriangle className="h-12 w-12 text-error drop-shadow-lg" />
          </div>
        </div>

        {/* Tipografia com cores do sistema */}
        <h2 className="text-2xl font-bold text-neutral-600 dark:text-neutral-300-dark mb-3">
          Ocorreu um Erro
        </h2>
        <p className="text-neutral-500 mb-8 leading-relaxed">
          {String(hasError) ||
            'Não foi possível carregar os dados da aplicação.'}
        </p>

        {/* 3. Botão de ação consistente com o nosso design system */}
        <Button
          onClick={() => {
            showInfo('Recarregando...', 'Tentando carregar dados novamente');
            setTimeout(() => window.location.reload(), 1000);
          }}
          intent="danger"
          size="lg"
          className="w-full" // Garante que o botão ocupe toda a largura
        >
          <ArrowPath className="h-5 w-5 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    </div>
  );
}

export default ErrorScreen;
