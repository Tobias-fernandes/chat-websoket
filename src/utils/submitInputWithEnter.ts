import { KeyboardEvent } from "react";

/**
 * Cria um manipulador onKeyDown que aciona um callback
 * quando a tecla "Enter" é pressionada (e "Shift" não está pressionado).
 *
 * @param callback A função a ser chamada no Enter.
 * @returns Um manipulador de evento onKeyDown.
 */
export function onEnterPress<T extends HTMLElement>(
  callback: (event: KeyboardEvent<T>) => void
) {
  /**
   * Este é o manipulador de evento real que será
   * anexado ao seu elemento (input, textarea, etc.).
   */
  return (event: KeyboardEvent<T>) => {
    // 1. Só aciona se for "Enter"
    // 2. E se o "Shift" NÃO estiver pressionado (permite Shift+Enter para nova linha)
    if (event.key === "Enter" && !event.shiftKey) {
      // Impede o comportamento padrão (como nova linha ou submit de formulário)
      event.preventDefault();
      // Chama a sua função de submit
      callback(event);
    }
  };
}
