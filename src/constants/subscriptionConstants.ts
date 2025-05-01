
// Query key for subscription data
export const SUBSCRIPTION_QUERY_KEY = "subscription-status";

// Default refetch settings - otimizados para melhor desempenho
export const SUBSCRIPTION_REFETCH_SETTINGS = {
  staleTime: 60000,      // 1 minuto antes dos dados serem considerados obsoletos
  refetchInterval: 300000, // Atualização a cada 5 minutos 
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  retry: 2,              // Reduzido para 2 tentativas
  cacheTime: 3600000     // Cache por 1 hora
};
