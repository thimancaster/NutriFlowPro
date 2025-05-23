
// Export all types from their respective files
export * from './appointment';
export * from './consultation';
export * from './meal';
export * from './patient';
export * from './nutrition';
export * from './auth';

// Common types used across the application
export interface PaginationParams {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  limit?: number;
  offset?: number;
}
