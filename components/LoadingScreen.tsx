function LoadingScreen() {
  return (
    // 1. Cores do sistema e atributos de acessibilidade
    <div
      className="h-screen w-screen bg-gradient-to-br from-base via-neutral-100 to-neutral-200 
                  dark:from-neutral-900-dark dark:via-neutral-800-dark dark:to-neutral-900-dark 
                  flex flex-col items-center justify-center relative overflow-hidden"
      role="status"
      aria-live="polite"
    >
      {/* Partículas decorativas (já usavam cores do sistema - perfeito!) */}
      {/* ... */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-[ping_3s_infinite]"></div>
        <div className="absolute top-1/2 right-1/3 w-28 h-28 bg-secondary/20 rounded-full blur-2xl animate-[ping_4s_infinite]"></div>
      </div>

      {/* Card de vidro com cores do sistema */}
      <div
        className="relative z-10 flex flex-col items-center justify-center p-10 
                    bg-base/60 dark:bg-neutral-800-dark/60 backdrop-blur-lg rounded-2xl shadow-xl"
      >
        {/* Spinner (já usava cores do sistema - perfeito!) */}
        {/* ... */}
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-primary"></div>
          <div className="absolute inset-1 animate-spin rounded-full h-18 w-18 border-4 border-transparent border-r-accent animation-delay-200"></div>
          <div
            className="absolute inset-3 animate-spin rounded-full h-14 w-14 border-4 border-transparent border-b-secondary animation-delay-400"
            style={{ animationDirection: 'reverse' }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-ping"></div>
          </div>
        </div>

        {/* 2. Tipografia com cores do sistema */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-xl font-semibold text-neutral-600 dark:text-neutral-300-dark tracking-wide animate-pulse">
            Carregando dados
            <span className="inline-block animate-bounce">.</span>
            <span className="inline-block animate-bounce animation-delay-150">
              .
            </span>
            <span className="inline-block animate-bounce animation-delay-300">
              .
            </span>
          </p>
          <p className="text-sm text-neutral-500 opacity-80">
            Preparando tudo pra você ✨
          </p>
        </div>

        {/* Barra de progresso com cores e animação do sistema */}
        <div className="mt-6 w-64 h-2 bg-neutral-200/50 dark:bg-neutral-700-dark/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-accent to-secondary animate-progress" // 3. Usando a animação tokenizada
          ></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
