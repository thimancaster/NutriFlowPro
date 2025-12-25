/**
 * OPTIMIZED FOOD SEARCH HOOK
 * - Smart debounce: instant for filters, 200ms for text
 * - Prefetching of popular categories
 * - Aggressive caching with React Query
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  searchFoodsEnhanced,
  getUserMostUsedFoods,
  getPopularFoods,
  toggleFavoriteFood,
  trackFoodUsage,
  getFoodCategories,
  type AlimentoV2,
  type EnhancedSearchFilters,
} from '@/services/enhancedFoodSearchService';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

// Prefetch categories for instant filter switching
const PREFETCH_CATEGORIES = ['Carnes Bovinas', 'Aves', 'Frutas', 'Cereais e Grãos', 'Laticínios'];

export function useFoodSearchOptimized(initialFilters?: EnhancedSearchFilters) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Controlled mode: when initialFilters is provided, treat it as the source of truth (used by FoodSearchPanel).
  // Uncontrolled mode: when omitted, manage filters internally (used by other flows).
  const [internalFilters, setInternalFilters] = useState<EnhancedSearchFilters>({});
  const isControlled = initialFilters !== undefined;
  const filters = isControlled ? initialFilters : internalFilters;

  // Smart debounce: 200ms for text search (balance between responsiveness and performance)
  const debouncedQuery = useDebounce(filters.query, 200);

  // Filters without query are applied instantly
  const debouncedFilters = useMemo(
    () => ({
      ...filters,
      query: debouncedQuery,
    }),
    [filters, debouncedQuery]
  );

  // Prefetch popular categories on mount
  useEffect(() => {
    PREFETCH_CATEGORIES.forEach(category => {
      queryClient.prefetchQuery({
        queryKey: ['food-search', { category, limit: 50 }, user?.id],
        queryFn: () => searchFoodsEnhanced({ category, limit: 50 }, user?.id),
        staleTime: 1000 * 60 * 10, // 10 minutes
      });
    });
  }, [queryClient, user?.id]);

  // Main search query
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
    isFetching,
  } = useQuery({
    queryKey: ['food-search', debouncedFilters, user?.id],
    queryFn: () => searchFoodsEnhanced(debouncedFilters, user?.id),
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    placeholderData: (previousData) => previousData, // Show stale data while fetching
  });

  // Most used foods - prefetched and cached longer
  const { data: mostUsedFoods, isLoading: isLoadingMostUsed } = useQuery({
    queryKey: ['most-used-foods', user?.id],
    queryFn: () => (user?.id ? getUserMostUsedFoods(user.id, 20) : Promise.resolve([])),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  // Popular foods - cached for a long time
  const { data: popularFoods, isLoading: isLoadingPopular } = useQuery({
    queryKey: ['popular-foods'],
    queryFn: () => getPopularFoods(30),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // Categories - cached very long
  const { data: categories } = useQuery({
    queryKey: ['food-categories'],
    queryFn: getFoodCategories,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // Toggle favorite mutation with optimistic updates
  const toggleFavoriteMutation = useMutation({
    mutationFn: ({
      alimentoId,
      isFavorite,
    }: {
      alimentoId: string;
      isFavorite: boolean;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      return toggleFavoriteFood(user.id, alimentoId, isFavorite);
    },
    onMutate: async ({ alimentoId, isFavorite }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['food-search'] });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['food-search', debouncedFilters, user?.id]);
      
      // Optimistically update
      queryClient.setQueryData(['food-search', debouncedFilters, user?.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          foods: old.foods.map((food: AlimentoV2) =>
            food.id === alimentoId ? { ...food, is_favorite: !isFavorite } : food
          ),
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['food-search', debouncedFilters, user?.id], context.previousData);
      }
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar favorito',
        variant: 'destructive',
      });
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['most-used-foods', user?.id] });
      toast({
        title: newStatus ? '⭐ Adicionado aos favoritos' : 'Removido dos favoritos',
      });
    },
  });

  // Track usage (non-blocking, fire and forget)
  const trackUsage = useCallback(
    (alimentoId: string) => {
      if (!user?.id) return;
      // Fire and forget - don't await
      trackFoodUsage(user.id, alimentoId)
        .then(() => {
          // Invalidate in background after tracking
          queryClient.invalidateQueries({ queryKey: ['most-used-foods', user.id] });
        })
        .catch(console.error);
    },
    [user?.id, queryClient]
  );

  // Update filters - instant for category, debounced for query
  const updateFilters = useCallback((newFilters: Partial<EnhancedSearchFilters>) => {
    setInternalFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setInternalFilters({});
  }, []);

  // Load more (pagination)
  const loadMore = useCallback(() => {
    const currentOffset = filters.offset || 0;
    const limit = filters.limit || 50;
    updateFilters({ offset: currentOffset + limit });
  }, [filters.offset, filters.limit, updateFilters]);

  // Prefetch next page
  const prefetchNextPage = useCallback(() => {
    const currentOffset = filters.offset || 0;
    const limit = filters.limit || 50;
    const nextFilters = { ...debouncedFilters, offset: currentOffset + limit };
    
    queryClient.prefetchQuery({
      queryKey: ['food-search', nextFilters, user?.id],
      queryFn: () => searchFoodsEnhanced(nextFilters, user?.id),
      staleTime: 1000 * 60 * 5,
    });
  }, [filters, debouncedFilters, user?.id, queryClient]);

  return {
    // Search results
    foods: searchResults?.foods || [],
    total: searchResults?.total || 0,
    hasMore: searchResults?.hasMore || false,
    
    // Most used & popular
    mostUsedFoods: mostUsedFoods || [],
    popularFoods: popularFoods || [],
    categories: categories || [],
    
    // Loading states
    isSearching: isSearching && !isFetching, // Only show spinner on initial load
    isFetching, // Background fetch indicator
    isLoadingMostUsed,
    isLoadingPopular,
    
    // Filters
    filters,
    updateFilters,
    resetFilters,
    
    // Actions
    toggleFavorite: toggleFavoriteMutation.mutate,
    trackUsage,
    loadMore,
    prefetchNextPage,
    
    // Error
    error: searchError,
  };
}
