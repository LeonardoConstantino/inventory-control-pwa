import { AlertTriangle } from './Icons';

function ErrorScreen({ hasError, showInfo }: { hasError: unknown; showInfo: (title: string, message: string) => void }) {
  return (
    <div
      className="h-screen w-screen bg-gradient-to-br from-neutral via-gray-100 to-gray-200 
                  dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 
                  flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      {/* 🔴 Glow decorativo */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-red-600/20 rounded-full blur-2xl animate-pulse"></div>

      {/* 📦 Container com efeito glass */}
      <div
        className="relative z-10 max-w-md w-full text-center 
                    bg-white/20 dark:bg-gray-800/30 backdrop-blur-xl 
                    rounded-2xl shadow-2xl p-8 border border-white/10"
      >
        {/* ⚠️ Ícone de alerta */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-500/20 rounded-full animate-bounce">
            <AlertTriangle className="h-12 w-12 text-red-500 drop-shadow-lg" />
          </div>
        </div>

        {/* 📝 Título e mensagem */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          Erro ao Carregar Dados
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {String(hasError) ||
            'Ocorreu um erro inesperado ao carregar os dados.'}
        </p>

        {/* 🔘 Botão de ação */}
        <button
          onClick={() => {
            showInfo('Recarregando...', 'Tentando carregar dados novamente');
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 
                   text-white px-6 py-3 rounded-xl font-medium shadow-lg 
                   hover:scale-105 hover:shadow-xl active:scale-95 
                   transition-transform transition-shadow duration-200"
        >
          🔄 Tentar Novamente
        </button>
      </div>
    </div>
  );
}

export default ErrorScreen;
