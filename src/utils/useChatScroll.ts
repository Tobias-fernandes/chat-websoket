import { useRef, useLayoutEffect, DependencyList, RefObject } from "react";

interface UseChatScrollOptions {
  /**
   * Quantos pixels de distância do fundo para
   * ainda ser considerado "perto do fundo".
   * @default 65
   */
  threshold?: number;
}

/**
 * Hook para controlar o scroll automático de um container de chat.
 * Ele rola para o final no primeiro carregamento e
 * rola para o final em novas mensagens, mas apenas se o
 * usuário já estava perto do fundo.
 *
 * @param dependencies - Array de dependências que disparam o efeito (ex: [messages])
 * @param options - Opções de configuração (ex: threshold)
 * @returns Um React Ref para ser anexado ao elemento do container.
 */
export function useChatScroll<T extends HTMLElement>(
  dependencies: DependencyList,
  options: UseChatScrollOptions = {}
): RefObject<T | null> {
  const { threshold = 65 } = options;
  const chatContainerRef = useRef<T | null>(null);
  const prevScrollHeightRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainer;
    const newScrollHeight = scrollHeight;
    const oldScrollHeight = prevScrollHeightRef.current;

    // 1. Caso de Scroll Inicial (primeira carga)
    if (oldScrollHeight === null || oldScrollHeight === 0) {
      chatContainer.scrollTop = newScrollHeight;
    }
    // 2. Caso de Nova Mensagem (altura aumentou)
    else if (newScrollHeight > oldScrollHeight) {
      // Verifica se o usuário estava perto do final *antes* da nova mensagem
      const wasNearBottom =
        oldScrollHeight - clientHeight - scrollTop < threshold;

      if (wasNearBottom) {
        chatContainer.scrollTop = newScrollHeight;
      }
    }

    // Sempre atualiza o ref com a altura mais recente
    prevScrollHeightRef.current = newScrollHeight;

    // Usamos ...dependencies para garantir que o array seja espalhado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);

  return chatContainerRef;
}
