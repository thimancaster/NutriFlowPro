/**
 * ⚠️ DEPRECATED - Use enhancedFoodSearchService.ts instead
 * This service is kept for backward compatibility with legacy code
 * All new code should use: @/services/enhancedFoodSearchService
 * 
 * This service now queries foods_legacy table for compatibility
 */

import {supabase} from "@/integrations/supabase/client";

export interface Food {
	id: string;
	name: string;
	food_group: string;
	category: string;
	calories: number;
	protein: number;
	carbs: number;
	fats: number;
	portion_size: number;
	portion_unit: string;
	meal_time: string[];
	is_organic: boolean;
	allergens: string[];
	season: string[];
	preparation_time: number;
	cost_level: string;
	availability: string;
	sustainability_score: number;
}

export interface FoodSearchFilters {
	query?: string;
	food_group?: string;
	meal_time?: string;
	is_organic?: boolean;
	allergens?: string[];
	limit?: number;
	page?: number;
	pageSize?: number;
	forceLoad?: boolean;
}

export interface FoodSearchResult {
	data: Food[];
	count: number;
	hasMore: boolean;
	currentPage: number;
	totalPages: number;
}

export class FoodService {
	/**
	 * Map user-friendly category values to database food_group values
	 */
	public static mapCategoryToFoodGroup(category: string): string {
		const categoryMapping: Record<string, string> = {
			proteinas: "Proteínas",
			frutas: "Frutas",
			cereais_e_graos: "Cereais e Grãos",
			tuberculos: "Tubérculos",
			vegetais: "Vegetais",
			gorduras: "Gorduras",
			bebidas: "Bebidas",
			massas: "Massas",
			condimentos: "Condimentos",
			pratos_prontos: "Pratos Prontos",
			lanches: "Lanches",
		};

		return categoryMapping[category] || category;
	}

	/**
	 * Helper function to build the Supabase query with filters
	 */
	private static buildQuery(filters: FoodSearchFilters) {
		let query = supabase.from("foods_legacy").select("*");
		console.log("🔨 Building query with filters:", filters);

		// Filtro por nome
		if (filters.query) {
			console.log("🔍 Adding name filter:", filters.query);
			query = query.ilike("name", `%${filters.query}%`);
		}

		// Filtro por grupo alimentar
		if (filters.food_group) {
			const mappedFoodGroup = this.mapCategoryToFoodGroup(filters.food_group);
			console.log("🏷️ Category mapping:", {
				original: filters.food_group,
				mapped: mappedFoodGroup,
			});
			query = query.eq("food_group", mappedFoodGroup);
		}

		// Filtro por horário de refeição
		if (filters.meal_time) {
			console.log("⏰ Adding meal time filter:", filters.meal_time);
			query = query.contains("meal_time", [filters.meal_time]);
		}

		// Filtro por orgânico
		if (filters.is_organic !== undefined) {
			console.log("🌱 Adding organic filter:", filters.is_organic);
			query = query.eq("is_organic", filters.is_organic);
		}

		// Filtro por alérgenos (excluir alimentos com alérgenos específicos)
		if (filters.allergens && filters.allergens.length > 0) {
			console.log("🚫 Adding allergen filters:", filters.allergens);
			for (const allergen of filters.allergens) {
				query = query.not("allergens", "cs", `{${allergen}}`);
			}
		}

		console.log("✅ Query built successfully");
		return query;
	}

	/**
	 * Helper function to apply pagination and ordering to query
	 */
	private static applyPaginationAndOrdering(
		query: any,
		filters: FoodSearchFilters,
		pageSize: number,
		offset: number
	) {
		console.log("📄 Applying pagination:", {pageSize, offset, forceLoad: filters.forceLoad});

		// Apply pagination unless limit is explicitly set (for backward compatibility)
		if (filters.limit) {
			console.log("🔢 Using explicit limit:", filters.limit);
			query = query.limit(filters.limit);
		} else {
			// For category-only searches or forceLoad, get more results initially
			const isSimpleCategorySearch =
				filters.food_group && !filters.query && !filters.meal_time;
			const effectivePageSize = filters.forceLoad || isSimpleCategorySearch ? 100 : pageSize;
			console.log("📊 Using range:", {
				start: offset,
				end: offset + effectivePageSize - 1,
				effectivePageSize,
				isSimpleCategorySearch,
			});
			query = query.range(offset, offset + effectivePageSize - 1);
		}

		// Ordenar por nome
		console.log("🔤 Adding order by name");
		return query.order("name");
	}

	/**
	 * Helper function to calculate pagination metadata
	 */
	private static calculatePaginationMetadata(
		filters: FoodSearchFilters,
		actualCount: number,
		pageSize: number,
		hasFilters: boolean
	) {
		const isSimpleCategorySearch = filters.food_group && !filters.query && !filters.meal_time;
		const effectivePageSize = filters.forceLoad || isSimpleCategorySearch ? 100 : pageSize;

		// Calculate estimated total count
		let estimatedTotalCount: number;
		if (filters.forceLoad) {
			estimatedTotalCount = 3500;
		} else if (hasFilters) {
			// For category searches, estimate based on actual results
			if (isSimpleCategorySearch && actualCount === effectivePageSize) {
				estimatedTotalCount = actualCount * 2; // More conservative estimate for larger page sizes
			} else {
				estimatedTotalCount = actualCount * 2;
			}
		} else {
			estimatedTotalCount = actualCount;
		}

		const totalPages = Math.ceil(estimatedTotalCount / effectivePageSize);
		const hasMore = actualCount === effectivePageSize; // If we got a full page, assume there might be more

		return {totalPages, hasMore, estimatedTotalCount};
	}

	/**
	 * Buscar alimentos com filtros e paginação
	 */
	static async searchFoods(filters: FoodSearchFilters = {}): Promise<FoodSearchResult> {
		const page = filters.page || 1;
		const pageSize = filters.pageSize || 50;
		const offset = (page - 1) * pageSize;

		try {
			// Check if we have any meaningful filters
			const hasFilters = !!(
				filters.query ||
				filters.food_group ||
				filters.meal_time ||
				filters.is_organic !== undefined ||
				(filters.allergens && filters.allergens.length > 0)
			);

			// If no filters are provided and not forced, return empty results
			if (!hasFilters && !filters.forceLoad) {
				console.log("No filters provided, returning empty results");
				return {
					data: [],
					count: 0,
					hasMore: false,
					currentPage: page,
					totalPages: 0,
				};
			}

			console.log("Starting food search with:", {
				hasFilters,
				forceLoad: filters.forceLoad,
				page,
				pageSize,
			});

			// Build and execute query using helper functions
			const query = this.buildQuery(filters);
			const finalQuery = this.applyPaginationAndOrdering(query, filters, pageSize, offset);

			console.log("Executing Supabase query...");

			// Execute query with timeout wrapper - simplified approach
			let timeoutId: ReturnType<typeof setTimeout>;
			const timeoutPromise = new Promise<never>((_, reject) => {
				timeoutId = setTimeout(() => {
					console.error("Supabase query timed out after 8 seconds");
					reject(new Error("Database query timeout - please try again"));
				}, 8000);
			});

			const {data, error} = await Promise.race([finalQuery, timeoutPromise]).finally(() => {
				if (timeoutId) clearTimeout(timeoutId);
			});

			console.log("Supabase query completed:", {
				dataLength: data?.length,
				error: error?.message,
				hasError: !!error,
			});

			if (error) {
				console.error("Supabase error:", error);
				throw error;
			}

			// Calculate pagination metadata using helper function
			const actualCount = data?.length ?? 0;
			const {totalPages, hasMore} = this.calculatePaginationMetadata(
				filters,
				actualCount,
				pageSize,
				hasFilters
			);

			const results = {
				data: data ?? [],
				count: actualCount,
				hasMore,
				currentPage: page,
				totalPages,
			};

			console.log("Search completed:", {
				resultsCount: results.data.length,
				currentPage: results.currentPage,
				totalPages: results.totalPages,
				hasMore: results.hasMore,
			});

			return results;
		} catch (error) {
			console.error("Food search error:", error);
			throw error; // Re-throw the error instead of returning empty results
		}
	}

	/**
	 * Buscar alimento por ID
	 */
	static async getFoodById(id: string): Promise<Food | null> {
		try {
			const {data, error} = await supabase.from("foods_legacy").select("*").eq("id", id).single();

			if (error) {
				throw error;
			}

			return data;
		} catch (error) {
			console.error("Erro ao buscar alimento por ID:", error);
			return null;
		}
	}

	/**
	 * Buscar alimentos por categoria
	 */
	static async getFoodsByCategory(category: string): Promise<Food[]> {
		const result = await this.searchFoods({food_group: category});
		return result.data;
	}

	/**
	 * Buscar alimentos por horário de refeição
	 */
	static async getFoodsForMealTime(mealTime: string): Promise<Food[]> {
		const result = await this.searchFoods({meal_time: mealTime});
		return result.data;
	}

	/**
	 * Buscar alimentos populares
	 */
	static async getPopularFoods(limit: number = 20): Promise<Food[]> {
		try {
			const {data, error} = await supabase
		.from("foods_legacy")
				.select("*")
				.in("food_group", ["proteinas", "frutas", "cereais_e_graos", "vegetais"])
				.order("sustainability_score", {ascending: false})
				.limit(limit);

			if (error) {
				throw error;
			}

			return data || [];
		} catch (error) {
			console.error("Erro ao buscar alimentos populares:", error);
			return [];
		}
	}

	/**
	 * Calcular valores nutricionais para uma quantidade específica
	 */
	static calculateNutrition(
		food: Food,
		quantity: number
	): {
		calories: number;
		protein: number;
		carbs: number;
		fats: number;
	} {
		const factor = quantity / food.portion_size;

		return {
			calories: Math.round(food.calories * factor * 10) / 10,
			protein: Math.round(food.protein * factor * 10) / 10,
			carbs: Math.round(food.carbs * factor * 10) / 10,
			fats: Math.round(food.fats * factor * 10) / 10,
		};
	}
}
