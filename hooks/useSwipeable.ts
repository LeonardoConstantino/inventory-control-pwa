// hooks/useSwipeable.ts
import React, { useState, useRef, useCallback, useMemo } from 'react';

interface SwipeableOptions {
  threshold?: number;
  minSwipeDistance?: number;
  velocityThreshold?: number;
  enableMouse?: boolean; // Habilita suporte a mouse para desktop
  responsiveThreshold?: boolean; // Ajusta threshold baseado na largura da tela
  thresholdPercentage?: number; // Porcentagem da largura da tela (usado se responsiveThreshold = true)
}

interface SwipeableReturn {
  translateX: number;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
  };
  isSwipeActive: boolean; // Indica se está ATIVAMENTE deslizando (dedo na tela)
  isSwiped: boolean; // Indica se o elemento está na posição deslizada
  setTranslateX: (Number) => void;
  resetPosition: () => void;
}

export const useSwipeable = ({
  threshold = -120,
  minSwipeDistance = 10,
  velocityThreshold = 0.5,
  enableMouse = true, // Por padrão, habilita suporte a mouse
}: SwipeableOptions = {}): SwipeableReturn => {
  const [translateX, setTranslateX] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [isSwiped, setIsSwiped] = useState(false); // Nova flag para estado deslizado

  const startX = useRef(0); // Renomeado para funcionar com touch e mouse
  const startTime = useRef(0);
  const isDragging = useRef(false); // Controla se está arrastando com mouse

  // Memoriza o threshold médio para evitar cálculos repetidos
  const halfThreshold = useMemo(() => threshold / 2, [threshold]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startTime.current = Date.now();
    setIsSwipeActive(false);
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const deltaX = e.touches[0].clientX - startX.current;

      // Marca como swipe ativo após movimento mínimo
      if (Math.abs(deltaX) > minSwipeDistance && !isSwipeActive) {
        setIsSwipeActive(true);
      }

      // Permite apenas swipe para esquerda e respeita o threshold
      if (deltaX < 0) {
        setTranslateX(Math.max(deltaX, threshold));
      }
    },
    [threshold, minSwipeDistance, isSwipeActive]
  );

  const handleTouchEnd = useCallback(() => {
    const swipeDuration = Date.now() - startTime.current;
    const velocity = Math.abs(translateX / swipeDuration);

    // Completa o swipe se passou da metade OU se foi rápido
    if (translateX < halfThreshold || velocity > velocityThreshold) {
      setTranslateX(threshold);
      setIsSwiped(true); // Marca como deslizado
    } else {
      setTranslateX(0);
      setIsSwiped(false); // Marca como NÃO deslizado
    }

    if (enableMouse && translateX < halfThreshold) {
      setTranslateX(threshold);
      setIsSwiped(true); // Marca como deslizado
    }

    setIsSwipeActive(false);
  }, [translateX, halfThreshold, threshold, velocityThreshold]);

  // ========== MOUSE HANDLERS (DESKTOP) ==========

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enableMouse) return;

    startX.current = e.clientX;
    startTime.current = Date.now();
    isDragging.current = true;
    setIsSwipeActive(false);

    // Previne seleção de texto durante o drag
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enableMouse || !isDragging.current) return;

      const deltaX = e.clientX - startX.current;

      // Marca como swipe ativo após movimento mínimo
      if (Math.abs(deltaX) > minSwipeDistance && !isSwipeActive) {
        setIsSwipeActive(true);
      }

      // Permite apenas swipe para esquerda e respeita o threshold
      if (deltaX < 0) {
        setTranslateX(Math.max(deltaX, threshold));
      }
    },
    [threshold, minSwipeDistance, isSwipeActive, enableMouse]
  );

  const handleMouseUp = useCallback(() => {
    if (!enableMouse || !isDragging.current) return;

    const swipeDuration = Date.now() - startTime.current;
    const velocity = Math.abs(translateX / swipeDuration);

    // Completa o swipe se passou da metade OU se foi rápido
    if (translateX < halfThreshold || velocity > velocityThreshold) {
      setTranslateX(threshold);
      setIsSwiped(true);
    } else {
      setTranslateX(0);
      setIsSwiped(false);
    }

    isDragging.current = false;
    setIsSwipeActive(false);
  }, [translateX, halfThreshold, threshold, velocityThreshold, enableMouse]);

  const handleMouseLeave = useCallback(() => {
    // Se o mouse sair do elemento durante o drag, cancela a operação
    if (isDragging.current) {
      handleMouseUp();
    }
  }, [handleMouseUp]);

  const resetPosition = useCallback(() => {
    setTranslateX(0);
    setIsSwipeActive(false);
    setIsSwiped(false); // Reseta o estado deslizado
  }, []);

  const handlers = useMemo(
    () => ({
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
    }),
    [
      handleTouchMove,
      handleTouchEnd,
      handleMouseMove,
      handleMouseUp,
      handleMouseLeave,
    ]
  );

  return {
    translateX,
    handlers,
    isSwipeActive,
    isSwiped,
    setTranslateX,
    resetPosition,
  };
};
