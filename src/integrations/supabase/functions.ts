import {supabase} from "./client";

// Function to get all food categories from the new standardized table
export const getFoodCategories = async () => {
	const {data, error} = await supabase
		.from("food_categories")
		.select("id, name, display_name, color, icon, description")
		.order("sort_order");

	if (error) {
		console.error("Error fetching food categories:", error);
		return [];
	}

	return (
		data?.map((category) => ({
			id: category.id,
			name: category.display_name,
			color: category.color,
			icon: category.icon,
			description: category.description,
		})) || []
	);
};

// Enhanced function to get foods with pagination and proper category filtering
export const getFoodsWithNutrition = async (filters?: {
	category?: string;
	searchTerm?: string;
	mealTime?: string[];
	isOrganic?: boolean;
	allergensFree?: string[];
	page?: number;
	pageSize?: number;
}) => {
	const page = filters?.page || 1;
	const pageSize = filters?.pageSize || 50;
	const offset = (page - 1) * pageSize;

	let query = supabase.from("foods").select(
		`
      id,
      name,
      food_group,
      calories,
      protein,
      carbs,
      fats,
      fiber,
      sodium,
      sugar,
      saturated_fat,
      portion_size,
      portion_unit,
      meal_time,
      glycemic_index,
      is_organic,
      allergens,
      season,
      preparation_time,
      cost_level,
      availability,
      sustainability_score,
      serving_suggestion
    `,
		{count: "exact"}
	);

	// Category filtering - first try to get the category name from food_categories table
	if (filters?.category) {
		// Check if it's a category ID (from food_categories table) or direct food_group value
		const {data: categoryData} = await supabase
			.from("food_categories")
			.select("display_name")
			.eq("id", filters.category)
			.single();

		if (categoryData?.display_name) {
			// Use the display_name to filter by food_group
			query = query.eq("food_group", categoryData.display_name);
		} else {
			// Fallback to direct food_group filtering
			query = query.eq("food_group", filters.category);
		}
	}

	if (filters?.searchTerm) {
		query = query.ilike("name", `%${filters.searchTerm}%`);
	}

	if (filters?.mealTime && filters.mealTime.length > 0) {
		query = query.overlaps("meal_time", filters.mealTime);
	}

	if (filters?.isOrganic !== undefined) {
		query = query.eq("is_organic", filters.isOrganic);
	}

	if (filters?.allergensFree && filters.allergensFree.length > 0) {
		// Filter out foods that contain any of the specified allergens
		for (const allergen of filters.allergensFree) {
			query = query.not("allergens", "cs", `{${allergen}}`);
		}
	}

	// Apply pagination
	const {data, error, count} = await query.order("name").range(offset, offset + pageSize - 1);

	if (error) {
		console.error("Error fetching foods:", error);
		return {data: [], count: 0, hasMore: false};
	}

	return {
		data: data || [],
		count: count || 0,
		hasMore: (count || 0) > offset + pageSize,
		currentPage: page,
		totalPages: Math.ceil((count || 0) / pageSize),
	};
};

// Function to get food details with enhanced nutritional information
export const getFoodDetails = async (foodId: string) => {
	const {data, error} = await supabase
		.from("foods")
		.select(
			`
      id,
      name,
      food_group,
      calories,
      protein,
      carbs,
      fats,
      fiber,
      sodium,
      sugar,
      saturated_fat,
      portion_size,
      portion_unit,
      meal_time,
      glycemic_index,
      is_organic,
      allergens,
      season,
      preparation_time,
      cost_level,
      availability,
      sustainability_score,
      serving_suggestion,
      nutritional_info
    `
		)
		.eq("id", foodId)
		.single();

	if (error) {
		console.error("Error fetching food details:", error);
		return null;
	}

	return data;
};

// Simple nutritional density calculation (local implementation)
export const calculateNutritionalDensity = async (foodId: string) => {
	try {
		const food = await getFoodDetails(foodId);
		if (!food) return 0;

		// Simple calculation based on protein content, fiber, and calories
		const proteinScore = (food.protein / food.calories) * 100 || 0;
		const fiberScore = (food.fiber || 0) * 2;
		const density = Math.min(100, (proteinScore + fiberScore) * 2);

		return density;
	} catch (error) {
		console.error("Error calculating nutritional density:", error);
		return 0;
	}
};

// Enhanced function to generate meal plans using existing database function
interface MealPlanOptions {
	userId: string;
	patientId: string;
	targetCalories: number;
	targetProtein: number;
	targetCarbs: number;
	targetFats: number;
	preferences?: string[];
	restrictions?: string[];
	date?: string;
}

export const generateIntelligentMealPlan = async (options: MealPlanOptions) => {
	const {
		userId,
		patientId,
		targetCalories,
		targetProtein,
		targetCarbs,
		targetFats,
		preferences = [],
		restrictions = [],
		date = new Date().toISOString().split("T")[0],
	} = options;

	const {data, error} = await supabase.rpc("generate_meal_plan", {
		p_user_id: userId,
		p_patient_id: patientId,
		p_target_calories: targetCalories,
		p_target_protein: targetProtein,
		p_target_carbs: targetCarbs,
		p_target_fats: targetFats,
		p_date: date,
	});

	if (error) {
		console.error("Error generating meal plan:", error);
		throw error;
	}

	return data;
};

// Function to get food substitutions with nutritional similarity
export const getFoodSubstitutions = async (foodId: string) => {
	const {data, error} = await supabase
		.from("food_substitutions")
		.select(
			`
      id,
      reason,
      recommendations,
      nutritional_similarity,
      substitute:foods!substitute_id (
        id,
        name,
        calories,
        protein,
        carbs,
        fats,
        food_group
      )
    `
		)
		.eq("food_id", foodId);

	if (error) {
		console.error("Error fetching food substitutions:", error);
		return [];
	}

	return data || [];
};

// Function to search foods by nutritional criteria
interface NutritionalCriteria {
	minProtein?: number;
	maxCalories?: number;
	minFiber?: number;
	maxSodium?: number;
	maxGlycemicIndex?: number;
	sustainabilityScore?: number;
}

export const searchFoodsByNutrition = async (criteria: NutritionalCriteria) => {
	let query = supabase.from("foods").select(`
      id,
      name,
      food_group,
      calories,
      protein,
      carbs,
      fats,
      fiber,
      sodium,
      glycemic_index,
      sustainability_score,
      portion_size,
      portion_unit
    `);

	if (criteria.minProtein !== undefined) {
		query = query.gte("protein", criteria.minProtein);
	}

	if (criteria.maxCalories !== undefined) {
		query = query.lte("calories", criteria.maxCalories);
	}

	if (criteria.minFiber !== undefined) {
		query = query.gte("fiber", criteria.minFiber);
	}

	if (criteria.maxSodium !== undefined) {
		query = query.lte("sodium", criteria.maxSodium);
	}

	if (criteria.maxGlycemicIndex !== undefined) {
		query = query.lte("glycemic_index", criteria.maxGlycemicIndex);
	}

	if (criteria.sustainabilityScore !== undefined) {
		query = query.gte("sustainability_score", criteria.sustainabilityScore);
	}

	const {data, error} = await query.order("protein", {ascending: false});

	if (error) {
		console.error("Error searching foods by nutrition:", error);
		return [];
	}

	return data || [];
};

// Legacy functions for backward compatibility
export const getNutritionalValues = async (foodId: string) => {
	const food = await getFoodDetails(foodId);

	if (!food) return null;

	return {
		id: foodId,
		measure_id: foodId,
		calories: food.calories,
		protein: food.protein,
		carbs: food.carbs,
		fat: food.fats,
	};
};

export const getFoodRestrictions = async (foodId: string) => {
	const food = await getFoodDetails(foodId);

	if (!food) return [];

	return (
		food.allergens?.map((allergen: string) => ({
			id: `${foodId}-${allergen}`,
			restriction_name: allergen,
		})) || []
	);
};
