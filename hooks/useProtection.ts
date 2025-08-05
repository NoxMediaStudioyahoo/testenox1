import { useState, useRef } from 'react';

// Hook para proteção contra abusos (rate limiting local + preparação para reCAPTCHA)
export function useProtection() {
  const [isThrottled, setIsThrottled] = useState(false);
  const lastRequestTime = useRef<number>(0);
  const requestCount = useRef<number>(0);
  
  // Configurações de rate limiting
  const RATE_LIMIT_WINDOW = 60000; // 1 minuto
  const MAX_REQUESTS = 10; // máximo de 10 requisições por minuto
  const MIN_REQUEST_INTERVAL = 1000; // mínimo de 1 segundo entre requisições

  // Verifica se pode fazer uma nova requisição
  const canMakeRequest = () => {
    const now = Date.now();
    
    // Reset contador se passou a janela de tempo
    if (now - lastRequestTime.current > RATE_LIMIT_WINDOW) {
      requestCount.current = 0;
    }

    // Verifica limites
    if (
      requestCount.current >= MAX_REQUESTS ||
      now - lastRequestTime.current < MIN_REQUEST_INTERVAL
    ) {
      setIsThrottled(true);
      return false;
    }

    // Atualiza contadores
    lastRequestTime.current = now;
    requestCount.current++;
    setIsThrottled(false);
    return true;
  };

  // Função para fazer fetch com proteção
  async function protectedFetch(input: RequestInfo, init: RequestInit = {}) {
    if (!canMakeRequest()) {
      throw new Error('Muitas requisições. Aguarde um momento.');
    }

    // TODO: Quando implementar reCAPTCHA, adicionar verificação aqui
    // if (needsCaptcha) {
    //   const token = await executeRecaptcha();
    //   headers.set('X-ReCaptcha-Token', token);
    // }

    return fetch(input, init);
  }

  return { 
    protectedFetch,
    isThrottled,
    resetThrottle: () => {
      requestCount.current = 0;
      setIsThrottled(false);
    }
  };
}