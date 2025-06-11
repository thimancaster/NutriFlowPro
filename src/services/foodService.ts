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
	private static mapCategoryToFoodGroup(category: string): string {
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
	 * Buscar alimentos com filtros e paginação
	 */
	static async searchFoods(filters: FoodSearchFilters = {}): Promise<FoodSearchResult> {
		const page = filters.page || 1;
		const pageSize = filters.pageSize || 50;
		const offset = (page - 1) * pageSize;

		try {
			let query = supabase.from("foods").select("*", {count: "exact"});

			// Filtro por nome
			if (filters.query) {
				query = query.ilike("name", `%${filters.query}%`);
			}

			// Filtro por grupo alimentar
			if (filters.food_group) {
				const mappedFoodGroup = this.mapCategoryToFoodGroup(filters.food_group);
				query = query.eq("food_group", mappedFoodGroup);
			}

			// Filtro por horário de refeição
			if (filters.meal_time) {
				query = query.contains("meal_time", [filters.meal_time]);
			}

			// Filtro por orgânico
			if (filters.is_organic !== undefined) {
				query = query.eq("is_organic", filters.is_organic);
			}

			// Filtro por alérgenos (excluir alimentos com alérgenos específicos)
			if (filters.allergens && filters.allergens.length > 0) {
				for (const allergen of filters.allergens) {
					query = query.not("allergens", "cs", `{${allergen}}`);
				}
			}

			// Apply pagination unless limit is explicitly set (for backward compatibility)
			if (filters.limit) {
				query = query.limit(filters.limit);
			} else {
				query = query.range(offset, offset + pageSize - 1);
			}

			// Ordenar por nome
			query = query.order("name");

			const {data, error, count} = await query;

			if (error) {
				throw error;
			}

			return {
				data: data || [],
				count: count || 0,
				hasMore: (count || 0) > offset + pageSize,
				currentPage: page,
				totalPages: Math.ceil((count || 0) / pageSize),
			};
		} catch (error) {
			console.error("Erro ao buscar alimentos:", error);
			return {
				data: [],
				count: 0,
				hasMore: false,
				currentPage: 1,
				totalPages: 0,
			};
		}
	}

	/**
	 * Buscar alimento por ID
	 */
	static async getFoodById(id: string): Promise<Food | null> {
		try {
			const {data, error} = await supabase.from("foods").select("*").eq("id", id).single();

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
				.from("foods")
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
