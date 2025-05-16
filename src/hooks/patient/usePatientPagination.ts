
import { useState, useCallback } from 'react';

/**
 * Hook for managing patient pagination state
 */
export const usePatientPagination = (options?: {
  initialPage?: number;
  initialPageSize?: number;
}) => {
  // Pagination state
  const [pagination, setPagination] = useState({
    page: options?.initialPage || 1,
    pageSize: options?.initialPageSize || 10,
    total: 0,
    totalPages: 0,
    limit: options?.initialPageSize || 10,
    offset: 0
  });

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    const offset = (page - 1) * pagination.pageSize;
    setPagination(prev => ({ 
      ...prev, 
      page,
      offset,
      limit: prev.pageSize
    }));
  }, [pagination.pageSize]);

  // Update total items and pages
  const updateTotalItems = useCallback((totalItems: number) => {
    const totalPages = Math.ceil(totalItems / pagination.pageSize);
    setPagination(prev => ({ ...prev, total: totalItems, totalPages }));
  }, [pagination.pageSize]);

  return {
    pagination,
    handlePageChange,
    updateTotalItems
  };
};
