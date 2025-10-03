/**
 * Constantes centralizadas de rotas da aplicação
 * Garante consistência e type-safety em toda a aplicação
 */
export const ROUTES = {
  // Rotas públicas
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  AUTH_CALLBACK: '/auth/callback',

  // Rotas protegidas - área do app
  APP: '/app',
  APP_DASHBOARD: '/app',
  APP_PATIENTS: '/app/patients',
  APP_PATIENT_PROFILE: '/app/patients/:patientId',
  APP_APPOINTMENTS: '/app/appointments',
  APP_CLINICAL: '/app/clinical',
  APP_CALCULATOR: '/app/calculator',
  APP_MEAL_PLANS: '/app/meal-plans',
  APP_FOOD_DATABASE: '/app/food-database',
  APP_SETTINGS: '/app/settings',
  APP_SUBSCRIPTION: '/app/subscription',
  APP_DEBUG: '/app/debug',
} as const;

/**
 * Helper para construir rotas dinâmicas
 */
export const buildRoute = {
  patientProfile: (patientId: string) => `/app/patients/${patientId}`,
} as const;
