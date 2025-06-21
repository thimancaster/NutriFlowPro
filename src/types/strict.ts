
/**
 * Strict TypeScript definitions for Phase 2
 * Ensuring type safety across the application
 */

// Enhanced Patient type with strict validation
export interface StrictPatient {
  readonly id: string;
  readonly name: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly secondaryPhone: string | null;
  readonly cpf: string | null;
  readonly birth_date: string | null;
  readonly gender: 'male' | 'female' | 'other';
  readonly address: string | null;
  readonly notes: string | null;
  readonly status: 'active' | 'archived';
  readonly goals: Record<string, unknown>;
  readonly created_at: string;
  readonly updated_at: string;
  readonly user_id: string;
  readonly age?: number;
}

// Strict calculation inputs
export interface StrictCalculationInputs {
  readonly weight: number;
  readonly height: number;
  readonly age: number;
  readonly sex: 'M' | 'F';
  readonly activityLevel: 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';
  readonly objective: 'emagrecimento' | 'manutenção' | 'hipertrofia' | 'personalizado';
  readonly profile: 'eutrofico' | 'sobrepeso_obesidade' | 'atleta';
}

// Strict validation result
export interface StrictValidationResult<T = unknown> {
  readonly isValid: boolean;
  readonly errors: Record<string, string>;
  readonly sanitizedData?: T;
  readonly warnings?: string[];
}

// Performance metrics
export interface PerformanceMetrics {
  readonly queryTime: number;
  readonly renderTime: number;
  readonly cacheHits: number;
  readonly cacheMisses: number;
}
