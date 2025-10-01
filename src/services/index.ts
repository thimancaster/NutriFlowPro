
// Re-export patient services
export * from './patient';

// Re-export other services
export * from './cepService';
export * from './mealPlanService';
export * from './databaseService';
export { appointmentService } from './appointmentService';

// Clinical session service (unified workflow)
export * from './clinicalSessionService';
