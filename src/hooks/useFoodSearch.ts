import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  searchFoodsEnhanced,
  getUserMostUsedFoods,
  getPopularFoods,
  toggleFavoriteFood,
  trackFoodUsage,
  type AlimentoV2,
  type EnhancedSearchFilters,
} from '@/services/enhancedFoodSearchService';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

export function useFoodSearch(initialFilters: EnhancedSearchFilters = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<EnhancedSearchFilters>(initialFilters);
  
  // Debounce search query for better performance (reduced to 150ms for faster response)
  const debouncedQuery = useDebounce(filters.query, 150);

  const debouncedFilters = {
    ...filters,
    query: debouncedQuery,
  };

  // Search foods
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
  } = useQuery({
    queryKey: ['food-search', debouncedFilters, user?.id],
    queryFn: () => searchFoodsEnhanced(debouncedFilters, user?.id),
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get most used foods
  const { data: mostUsedFoods, isLoading: isLoadingMostUsed } = useQuery({
    queryKey: ['most-used-foods', user?.id],
    queryFn: () => (user?.id ? getUserMostUsedFoods(user.id, 20) : Promise.resolve([])),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Get popular foods
  const { data: popularFoods, isLoading: isLoadingPopular } = useQuery({
    queryKey: ['popular-foods'],
    queryFn: () => getPopularFoods(20),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Toggle favorite mutation
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
    onSuccess: (newStatus, { alimentoId }) => {
      // Optimistic update
      queryClient.setQueryData(['food-search', debouncedFilters, user?.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          foods: old.foods.map((food: AlimentoV2) =>
            food.id === alimentoId ? { ...food, is_favorite: newStatus } : food
          ),
        };
      });

      queryClient.invalidateQueries({ queryKey: ['most-used-foods', user?.id] });
      
      toast({
        title: newStatus ? '⭐ Adicionado aos favoritos' : 'Removido dos favoritos',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar favorito',
        variant: 'destructive',
      });
      console.error('Toggle favorite error:', error);
    },
  });

  // Track food usage (non-blocking)
  const trackUsage = useCallback(
    async (alimentoId: string) => {
      if (!user?.id) return;
      try {
        await trackFoodUsage(user.id, alimentoId);
        // Invalidate most used foods to reflect new usage
        queryClient.invalidateQueries({ queryKey: ['most-used-foods', user.id] });
      } catch (error) {
        // Silent fail - non-critical
        console.error('Track usage error:', error);
      }
    },
    [user?.id, queryClient]
  );

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<EnhancedSearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Load more (pagination)
  const loadMore = useCallback(() => {
    const currentOffset = filters.offset || 0;
    const limit = filters.limit || 50;
    updateFilters({ offset: currentOffset + limit });
  }, [filters.offset, filters.limit, updateFilters]);

  return {
    // Search results
    foods: searchResults?.foods || [],
    total: searchResults?.total || 0,
    hasMore: searchResults?.hasMore || false,
    
    // Most used & popular
    mostUsedFoods: mostUsedFoods || [],
    popularFoods: popularFoods || [],
    
    // Loading states
    isSearching,
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
    
    // Error
    error: searchError,
  };
}
