function LoadingScreen() {
  return (
    <div
      className="h-screen w-screen bg-gradient-to-br from-base via-neutral/50 to-neutral 
                  dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 
                  flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* 🔮 Partículas decorativas mais suaves */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-[ping_3s_infinite]"></div>
        <div className="absolute top-1/2 right-1/3 w-28 h-28 bg-secondary/20 rounded-full blur-2xl animate-[ping_4s_infinite]"></div>
      </div>

      {/* 🌐 Container com efeito glass */}
      <div
        className="relative z-10 flex flex-col items-center justify-center p-10 
                    bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg rounded-2xl shadow-xl"
      >
        {/* 🎡 Spinner futurista */}
        <div className="relative">
          {/* Halo externo */}
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-primary"></div>
          {/* Halo do meio */}
          <div className="absolute inset-1 animate-spin rounded-full h-18 w-18 border-4 border-transparent border-r-accent animation-delay-200"></div>
          {/* Halo interno */}
          <div
            className="absolute inset-3 animate-spin rounded-full h-14 w-14 border-4 border-transparent border-b-secondary animation-delay-400"
            style={{ animationDirection: 'reverse' }}
          ></div>
          {/* Núcleo pulsante */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-ping"></div>
          </div>
        </div>

        {/* 📜 Texto animado */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 tracking-wide animate-pulse">
            Carregando dados
            <span className="inline-block animate-bounce">.</span>
            <span className="inline-block animate-bounce animation-delay-150">
              .
            </span>
            <span className="inline-block animate-bounce animation-delay-300">
              .
            </span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 opacity-80">
            Preparando tudo pra você ✨
          </p>
        </div>

        {/* 📊 Barra de progresso mais moderna */}
        <div className="mt-6 w-64 h-2 bg-gray-300/30 dark:bg-gray-700/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-accent to-secondary 
                        animate-[progress_2s_infinite]"
          ></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;