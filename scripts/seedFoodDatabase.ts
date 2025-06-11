#!/usr/bin/env tsx

import dotenv from "dotenv";
import {createClient} from "@supabase/supabase-js";

// Load environment variables
dotenv.config();

// Database configuration - make sure to update with your Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SERVICE_KEY";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SeedFood {
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
	is_organic?: boolean;
	allergens?: string[];
	season?: string[];
	preparation_time?: number;
	cost_level?: string;
	availability?: string;
	sustainability_score?: number;
	fiber?: number;
	sodium?: number;
	sugar?: number;
	saturated_fat?: number;
	glycemic_index?: number;
}

const mealTimes = [
	"breakfast",
	"morning_snack",
	"lunch",
	"afternoon_snack",
	"dinner",
	"evening_snack",
];
const costLevels = ["baixo", "medio", "alto"];
const availabilities = ["comum", "sazonal", "raro", "regional"];

// Base foods database with variations
export const generateExtensiveFoodDatabase = (): SeedFood[] => {
	const foods: SeedFood[] = [];

	// Helper function to get random meal times
	const getRandomMealTimes = (count: number = 2): string[] => {
		const shuffled = [...mealTimes].sort(() => 0.5 - Math.random());
		return shuffled.slice(0, count);
	};

	// Helper function to get random cost level
	const getRandomCostLevel = (): string => {
		return costLevels[Math.floor(Math.random() * costLevels.length)];
	};

	// Helper function to get random availability
	const getRandomAvailability = (): string => {
		return availabilities[Math.floor(Math.random() * availabilities.length)];
	};

	// 1. PROTEÍNAS - CARNES BOVINAS (500+ variações)
	const beefCuts = [
		{name: "Alcatra", protein: 32, fat: 8, calories: 198},
		{name: "Picanha", protein: 28, fat: 12, calories: 218},
		{name: "Contrafilé", protein: 30, fat: 10, calories: 208},
		{name: "Filé Mignon", protein: 33, fat: 9, calories: 219},
		{name: "Patinho", protein: 35, fat: 7, calories: 195},
		{name: "Fraldinha", protein: 29, fat: 11, calories: 212},
		{name: "Maminha", protein: 31, fat: 9, calories: 205},
		{name: "Acém", protein: 26, fat: 13, calories: 225},
		{name: "Músculo", protein: 25, fat: 8, calories: 168},
		{name: "Lagarto", protein: 33, fat: 6, calories: 182},
		{name: "Coxão Mole", protein: 32, fat: 7, calories: 188},
		{name: "Coxão Duro", protein: 30, fat: 8, calories: 192},
		{name: "Cupim", protein: 22, fat: 15, calories: 235},
		{name: "Costela", protein: 20, fat: 18, calories: 265},
		{name: "T-Bone", protein: 29, fat: 14, calories: 238},
		{name: "Porterhouse", protein: 31, fat: 13, calories: 242},
		{name: "Baby Beef", protein: 34, fat: 6, calories: 185},
		{name: "Chã de Dentro", protein: 33, fat: 5, calories: 175},
		{name: "Chã de Fora", protein: 32, fat: 8, calories: 195},
		{name: "Ponta de Agulha", protein: 24, fat: 12, calories: 205},
		{name: "Peito", protein: 22, fat: 16, calories: 242},
	];

	const preparations = ["Grelhado", "Assado", "Cozido", "Refogado", "Na Chapa", "No Vapor"];
	const beefQualities = ["Premium", "Orgânico", "Tradicional", "Maturado"];

	beefCuts.forEach((cut) => {
		preparations.forEach((prep) => {
			beefQualities.forEach((quality) => {
				foods.push({
					name: `${cut.name} ${quality} ${prep}`,
					food_group: "Proteínas",
					category: "Carnes",
					calories: cut.calories,
					protein: cut.protein,
					carbs: 0,
					fats: cut.fat,
					portion_size: 100,
					portion_unit: "g",
					meal_time: ["lunch", "dinner"],
					is_organic: quality === "Orgânico",
					allergens: [],
					season: ["Ano todo"],
					preparation_time: prep === "Grelhado" ? 15 : prep === "Assado" ? 45 : 30,
					cost_level:
						quality === "Premium" || quality === "Orgânico" || quality === "Maturado"
							? "alto"
							: "medio",
					availability: quality === "Premium" ? "raro" : getRandomAvailability(),
					sustainability_score: quality === "Orgânico" ? 6 : 3,
					fiber: 0,
					sodium: 60,
					saturated_fat: cut.fat * 0.4,
				});
			});
		});
	});

	// 2. PROTEÍNAS - AVES (200+ variações)
	const poultryTypes = [
		{name: "Peito de Frango", protein: 31, fat: 3.6, calories: 165},
		{name: "Coxa de Frango", protein: 18, fat: 9, calories: 158},
		{name: "Sobrecoxa de Frango", protein: 16, fat: 10, calories: 155},
		{name: "Asa de Frango", protein: 18, fat: 12, calories: 186},
		{name: "Peito de Peru", protein: 29, fat: 1, calories: 135},
		{name: "Coxa de Peru", protein: 20, fat: 8, calories: 155},
		{name: "Peito de Pato", protein: 23, fat: 11, calories: 201},
		{name: "Frango Caipira", protein: 25, fat: 8, calories: 172},
		{name: "Frango Orgânico", protein: 28, fat: 4, calories: 155},
	];

	const poultryQualities = ["Caipira", "Orgânico", "Tradicional", "Congelado"];

	poultryTypes.forEach((poultry) => {
		preparations.forEach((prep) => {
			poultryQualities.forEach((quality) => {
				foods.push({
					name: `${poultry.name} ${quality} ${prep}`,
					food_group: "Proteínas",
					category: "Aves",
					calories: poultry.calories,
					protein: poultry.protein,
					carbs: 0,
					fats: poultry.fat,
					portion_size: 100,
					portion_unit: "g",
					meal_time: getRandomMealTimes(2),
					is_organic: quality === "Orgânico" || poultry.name.includes("Orgânico"),
					allergens: [],
					season: ["Ano todo"],
					preparation_time: 25,
					cost_level:
						quality === "Orgânico" || quality === "Caipira"
							? "alto"
							: getRandomCostLevel(),
					availability: quality === "Congelado" ? "comum" : getRandomAvailability(),
					sustainability_score: quality === "Caipira" || quality === "Orgânico" ? 6 : 4,
				});
			});
		});
	});

	// 3. PROTEÍNAS - PEIXES E FRUTOS DO MAR (400+ variações)
	const seafood = [
		{name: "Salmão", protein: 26, fat: 14, calories: 242},
		{name: "Tilápia", protein: 21, fat: 4, calories: 122},
		{name: "Bacalhau", protein: 25, fat: 0.9, calories: 107},
		{name: "Atum", protein: 30, fat: 1, calories: 128},
		{name: "Sardinha", protein: 25, fat: 11, calories: 208},
		{name: "Robalo", protein: 24, fat: 3, calories: 124},
		{name: "Dourado", protein: 23, fat: 1, calories: 105},
		{name: "Linguado", protein: 25, fat: 2, calories: 117},
		{name: "Pescada", protein: 22, fat: 1.5, calories: 100},
		{name: "Merluza", protein: 20, fat: 1, calories: 90},
		{name: "Camarão", protein: 18, fat: 1, calories: 85},
		{name: "Lagosta", protein: 26, fat: 1, calories: 112},
		{name: "Lula", protein: 18, fat: 1, calories: 85},
		{name: "Polvo", protein: 25, fat: 2, calories: 115},
		{name: "Mexilhão", protein: 20, fat: 2, calories: 95},
	];

	const seafoodPreparations = ["Grelhado", "Assado", "Cozido", "Ao Vapor", "Ensopado", "Frito"];
	const seafoodOrigins = ["Fresco", "Congelado", "Defumado", "Em Conserva"];

	seafood.forEach((fish) => {
		seafoodPreparations.forEach((prep) => {
			seafoodOrigins.forEach((origin) => {
				foods.push({
					name: `${fish.name} ${origin} ${prep}`,
					food_group: "Proteínas",
					category: "Peixes",
					calories: prep === "Frito" ? Math.round(fish.calories * 1.3) : fish.calories,
					protein: fish.protein,
					carbs: 0,
					fats: prep === "Frito" ? fish.fat * 2 : fish.fat,
					portion_size: 100,
					portion_unit: "g",
					meal_time: getRandomMealTimes(3),
					allergens:
						fish.name.includes("Camarão") || fish.name.includes("Lagosta")
							? ["crustáceos"]
							: [],
					season: origin === "Fresco" ? ["Verão", "Outono"] : ["Ano todo"],
					preparation_time: 20,
					cost_level:
						fish.name.includes("Salmão") ||
						fish.name.includes("Lagosta") ||
						origin === "Fresco"
							? "alto"
							: getRandomCostLevel(),
					availability: origin === "Fresco" ? "sazonal" : getRandomAvailability(),
					sustainability_score: origin === "Fresco" ? 7 : 5,
					sodium: origin === "Em Conserva" || origin === "Defumado" ? 300 : 150,
				});
			});
		});
	});

	// 4. CEREAIS E GRÃOS (480+ variações)
	const grains = [
		{name: "Arroz Branco", protein: 3, carbs: 28, fat: 0.3, calories: 130},
		{name: "Arroz Integral", protein: 3, carbs: 23, fat: 1, calories: 112},
		{name: "Arroz Vermelho", protein: 4, carbs: 24, fat: 1.5, calories: 120},
		{name: "Arroz Negro", protein: 5, carbs: 22, fat: 2, calories: 125},
		{name: "Quinoa", protein: 8, carbs: 22, fat: 3, calories: 143},
		{name: "Amaranto", protein: 9, carbs: 19, fat: 4, calories: 151},
		{name: "Aveia", protein: 11, carbs: 17, fat: 4, calories: 147},
		{name: "Centeio", protein: 8, carbs: 15, fat: 1, calories: 100},
		{name: "Cevada", protein: 8, carbs: 16, fat: 1, calories: 106},
		{name: "Trigo Sarraceno", protein: 8, carbs: 20, fat: 2, calories: 125},
		{name: "Painço", protein: 6, carbs: 17, fat: 2, calories: 110},
		{name: "Sorgo", protein: 6, carbs: 18, fat: 1.5, calories: 108},
		{name: "Linhaça", protein: 12, carbs: 8, fat: 18, calories: 244},
		{name: "Chia", protein: 9, carbs: 12, fat: 15, calories: 212},
		{name: "Gergelim", protein: 8, carbs: 6, fat: 22, calories: 262},
		{name: "Farro", protein: 7, carbs: 22, fat: 1, calories: 124},
		{name: "Espelta", protein: 9, carbs: 19, fat: 1.5, calories: 127},
		{name: "Bulgur", protein: 6, carbs: 19, fat: 0.8, calories: 107},
		{name: "Cuscuz Marroquino", protein: 4, carbs: 21, fat: 0.2, calories: 101},
		{name: "Milho", protein: 4, carbs: 19, fat: 1, calories: 96},
	];

	const grainPreparations = ["Cozido", "Refogado", "Pilaf", "Risotto", "Doce", "Salgado"];
	const grainQualities = ["Orgânico", "Integral", "Tradicional", "Premium"];

	grains.forEach((grain) => {
		grainPreparations.forEach((prep) => {
			grainQualities.forEach((quality) => {
				foods.push({
					name: `${grain.name} ${quality} ${prep}`,
					food_group: "Cereais e Grãos",
					category: "Cereais",
					calories: grain.calories,
					protein: grain.protein,
					carbs: grain.carbs,
					fats: grain.fat,
					portion_size: 100,
					portion_unit: "g",
					meal_time: getRandomMealTimes(3),
					is_organic: quality === "Orgânico",
					allergens:
						grain.name.includes("Aveia") || grain.name.includes("Centeio")
							? ["glúten"]
							: [],
					season: ["Ano todo"],
					preparation_time: 30,
					cost_level:
						grain.name.includes("Quinoa") ||
						grain.name.includes("Amaranto") ||
						quality === "Orgânico" ||
						quality === "Premium"
							? "alto"
							: getRandomCostLevel(),
					availability: quality === "Premium" ? "raro" : getRandomAvailability(),
					sustainability_score: quality === "Orgânico" ? 8 : 7,
					fiber: quality === "Integral" || grain.name.includes("Integral") ? 5 : 3,
					glycemic_index:
						grain.name.includes("Integral") || quality === "Integral" ? 55 : 70,
				});
			});
		});
	});

	// 5. TUBÉRCULOS (200+ variações)
	const tubers = [
		{name: "Batata Inglesa", protein: 2, carbs: 17, fat: 0.1, calories: 77},
		{name: "Batata Doce", protein: 2, carbs: 20, fat: 0.1, calories: 86},
		{name: "Mandioca", protein: 1, carbs: 38, fat: 0.3, calories: 160},
		{name: "Inhame", protein: 2, carbs: 27, fat: 0.2, calories: 118},
		{name: "Cará", protein: 2, carbs: 28, fat: 0.1, calories: 120},
		{name: "Mandioquinha", protein: 1, carbs: 22, fat: 0.3, calories: 95},
	];

	const tuberPreparations = ["Cozido", "Assado", "Frito", "Purê", "Refogado"];

	tubers.forEach((tuber) => {
		tuberPreparations.forEach((prep) => {
			foods.push({
				name: `${tuber.name} ${prep}`,
				food_group: "Tubérculos",
				category: "Raízes",
				calories: prep === "Frito" ? tuber.calories * 1.5 : tuber.calories,
				protein: tuber.protein,
				carbs: tuber.carbs,
				fats: prep === "Frito" ? tuber.fat * 3 : tuber.fat,
				portion_size: 100,
				portion_unit: "g",
				meal_time: ["lunch", "dinner"],
				allergens: [],
				season: ["Ano todo"],
				preparation_time: prep === "Cozido" ? 25 : 20,
				cost_level: "baixo",
				availability: "comum",
				sustainability_score: 8,
				fiber: 3,
				glycemic_index: prep === "Frito" ? 85 : 65,
			});
		});
	});

	// 6. VEGETAIS E LEGUMES (500+ variações)
	const vegetables = [
		{name: "Brócolis", protein: 3, carbs: 7, fat: 0.4, calories: 34},
		{name: "Couve-flor", protein: 2, carbs: 5, fat: 0.3, calories: 25},
		{name: "Abobrinha", protein: 1, carbs: 3, fat: 0.3, calories: 17},
		{name: "Berinjela", protein: 1, carbs: 6, fat: 0.2, calories: 25},
		{name: "Chuchu", protein: 1, carbs: 4, fat: 0.1, calories: 19},
		{name: "Cenoura", protein: 1, carbs: 10, fat: 0.2, calories: 41},
		{name: "Beterraba", protein: 2, carbs: 10, fat: 0.2, calories: 43},
		{name: "Pimentão", protein: 1, carbs: 7, fat: 0.3, calories: 31},
		{name: "Tomate", protein: 1, carbs: 4, fat: 0.2, calories: 18},
		{name: "Pepino", protein: 1, carbs: 4, fat: 0.1, calories: 16},
		{name: "Alface", protein: 1, carbs: 3, fat: 0.2, calories: 14},
		{name: "Rúcula", protein: 2, carbs: 4, fat: 0.7, calories: 25},
		{name: "Espinafre", protein: 3, carbs: 4, fat: 0.4, calories: 23},
		{name: "Couve", protein: 3, carbs: 6, fat: 0.7, calories: 36},
		{name: "Repolho", protein: 1, carbs: 6, fat: 0.1, calories: 25},
		{name: "Abóbora", protein: 1, carbs: 7, fat: 0.1, calories: 26},
		{name: "Quiabo", protein: 2, carbs: 7, fat: 0.2, calories: 33},
		{name: "Jiló", protein: 1, carbs: 5, fat: 0.1, calories: 22},
		{name: "Maxixe", protein: 1, carbs: 3, fat: 0.1, calories: 15},
		{name: "Vagem", protein: 2, carbs: 8, fat: 0.1, calories: 35},
		{name: "Aspargo", protein: 2, carbs: 4, fat: 0.1, calories: 20},
		{name: "Palmito", protein: 3, carbs: 4, fat: 0.2, calories: 26},
	];

	const vegetablePreparations = ["Cru", "Cozido", "Refogado", "Grelhado", "No Vapor", "Assado"];
	const seasonings = ["Natural", "com Alho", "com Cebola", "com Azeite", "com Limão"];

	vegetables.forEach((vegetable) => {
		vegetablePreparations.forEach((prep) => {
			seasonings.forEach((seasoning) => {
				foods.push({
					name: `${vegetable.name} ${prep} ${seasoning}`,
					food_group: "Vegetais",
					category: "Legumes",
					calories: vegetable.calories,
					protein: vegetable.protein,
					carbs: vegetable.carbs,
					fats: vegetable.fat,
					portion_size: 100,
					portion_unit: "g",
					meal_time: ["lunch", "dinner"],
					allergens: [],
					season: ["Ano todo"],
					preparation_time: prep === "Cru" ? 5 : 15,
					cost_level: "baixo",
					availability: "comum",
					sustainability_score: 9,
					fiber: 2.5,
					sodium: 10,
					glycemic_index: 25,
				});
			});
		});
	});

	// 6. FRUTAS (400+ variações)
	const fruits = [
		{name: "Maçã", protein: 0.3, carbs: 14, fat: 0.2, calories: 52},
		{name: "Banana", protein: 1, carbs: 23, fat: 0.3, calories: 89},
		{name: "Laranja", protein: 1, carbs: 12, fat: 0.1, calories: 47},
		{name: "Mamão", protein: 1, carbs: 11, fat: 0.3, calories: 43},
		{name: "Manga", protein: 1, carbs: 15, fat: 0.4, calories: 60},
		{name: "Abacaxi", protein: 1, carbs: 13, fat: 0.1, calories: 50},
		{name: "Melancia", protein: 1, carbs: 8, fat: 0.2, calories: 30},
		{name: "Melão", protein: 1, carbs: 8, fat: 0.2, calories: 34},
		{name: "Uva", protein: 1, carbs: 16, fat: 0.2, calories: 62},
		{name: "Morango", protein: 1, carbs: 8, fat: 0.3, calories: 32},
		{name: "Kiwi", protein: 1, carbs: 15, fat: 0.5, calories: 61},
		{name: "Pêssego", protein: 1, carbs: 10, fat: 0.3, calories: 39},
		{name: "Pêra", protein: 0.4, carbs: 15, fat: 0.1, calories: 57},
		{name: "Abacate", protein: 2, carbs: 9, fat: 15, calories: 160},
		{name: "Acerola", protein: 1, carbs: 8, fat: 0.2, calories: 32},
		{name: "Caju", protein: 1, carbs: 11, fat: 0.4, calories: 43},
		{name: "Goiaba", protein: 1, carbs: 14, fat: 0.9, calories: 68},
		{name: "Jabuticaba", protein: 1, carbs: 16, fat: 0.1, calories: 58},
		{name: "Pitanga", protein: 1, carbs: 10, fat: 0.4, calories: 41},
		{name: "Coco", protein: 3, carbs: 15, fat: 33, calories: 354},
	];

	const fruitPreparations = ["Natural", "em Fatias", "Amassada", "em Cubos", "Descascada"];
	const fruitStates = ["Madura", "Verde", "Doce", "Orgânica"];

	fruits.forEach((fruit) => {
		fruitPreparations.forEach((prep) => {
			fruitStates.forEach((state) => {
				foods.push({
					name: `${fruit.name} ${state} ${prep}`,
					food_group: "Frutas",
					category: "Frutas Tropicais",
					calories: fruit.calories,
					protein: fruit.protein,
					carbs: fruit.carbs,
					fats: fruit.fat,
					portion_size: 100,
					portion_unit: "g",
					meal_time: ["breakfast", "morning_snack", "afternoon_snack"],
					is_organic: state === "Orgânica",
					allergens: [],
					season: ["Ano todo"],
					preparation_time: 5,
					cost_level: state === "Orgânica" ? "alto" : "baixo",
					availability: "comum",
					sustainability_score: 8,
					fiber: 2,
					sugar: fruit.carbs * 0.8,
					glycemic_index: 35,
				});
			});
		});
	});

	// 7. LATICÍNIOS (150+ variações)
	const dairyProducts = [
		{name: "Leite Integral", protein: 3, carbs: 5, fat: 3, calories: 61},
		{name: "Leite Desnatado", protein: 3, carbs: 5, fat: 0.2, calories: 34},
		{name: "Iogurte Natural", protein: 4, carbs: 6, fat: 4, calories: 68},
		{name: "Queijo Minas", protein: 18, carbs: 3, fat: 20, calories: 264},
		{name: "Queijo Mussarela", protein: 22, carbs: 2, fat: 22, calories: 300},
		{name: "Requeijão", protein: 9, carbs: 3, fat: 17, calories: 200},
		{name: "Cream Cheese", protein: 6, carbs: 4, fat: 34, calories: 342},
		{name: "Ricota", protein: 11, carbs: 3, fat: 13, calories: 174},
		{name: "Queijo Coalho", protein: 21, carbs: 2, fat: 24, calories: 313},
		{name: "Queijo Prato", protein: 25, carbs: 1, fat: 28, calories: 360},
	];

	const dairyVariations = ["Light", "Zero Lactose", "Orgânico", "Tradicional", "Com Probióticos"];

	dairyProducts.forEach((dairy) => {
		dairyVariations.forEach((variation) => {
			foods.push({
				name: `${dairy.name} ${variation}`,
				food_group: "Proteínas",
				category: "Laticínios",
				calories: variation === "Light" ? dairy.calories * 0.7 : dairy.calories,
				protein: dairy.protein,
				carbs: dairy.carbs,
				fats: variation === "Light" ? dairy.fat * 0.5 : dairy.fat,
				portion_size: 100,
				portion_unit: dairy.name.includes("Leite") ? "ml" : "g",
				meal_time: ["breakfast", "afternoon_snack"],
				is_organic: variation === "Orgânico",
				allergens: variation === "Zero Lactose" ? [] : ["lactose"],
				season: ["Ano todo"],
				preparation_time: 0,
				cost_level: variation === "Orgânico" ? "alto" : "medio",
				availability: "comum",
				sustainability_score: 4,
				sodium: 50,
			});
		});
	});

	// 8. OLEAGINOSAS E SEMENTES (100+ variações)
	const nutsAndSeeds = [
		{name: "Amendoim", protein: 26, carbs: 16, fat: 49, calories: 567},
		{name: "Castanha de Caju", protein: 18, carbs: 30, fat: 44, calories: 553},
		{name: "Castanha do Pará", protein: 14, carbs: 12, fat: 67, calories: 656},
		{name: "Amêndoa", protein: 21, carbs: 22, fat: 50, calories: 579},
		{name: "Noz", protein: 15, carbs: 14, fat: 65, calories: 654},
		{name: "Avelã", protein: 15, carbs: 17, fat: 61, calories: 628},
		{name: "Pistache", protein: 20, carbs: 28, fat: 45, calories: 560},
		{name: "Semente de Girassol", protein: 21, carbs: 20, fat: 52, calories: 584},
		{name: "Semente de Abóbora", protein: 19, carbs: 54, fat: 19, calories: 446},
		{name: "Nozes Pecan", protein: 9, carbs: 14, fat: 72, calories: 691},
		{name: "Macadâmia", protein: 8, carbs: 14, fat: 76, calories: 718},
		{name: "Pinhão", protein: 4, carbs: 31, fat: 31, calories: 454},
		{name: "Semente de Chia", protein: 17, carbs: 42, fat: 31, calories: 486},
		{name: "Semente de Linhaça", protein: 18, carbs: 29, fat: 42, calories: 534},
	];

	const nutPreparations = [
		"Natural",
		"Torrada",
		"Salgada",
		"Sem Sal",
		"Orgânica",
		"Caramelizada",
		"com Mel",
		"Temperada",
	];

	nutsAndSeeds.forEach((nut) => {
		nutPreparations.forEach((prep) => {
			foods.push({
				name: `${nut.name} ${prep}`,
				food_group: "Gorduras",
				category: "Oleaginosas",
				calories: nut.calories,
				protein: nut.protein,
				carbs: nut.carbs,
				fats: nut.fat,
				portion_size: 30,
				portion_unit: "g",
				meal_time: ["morning_snack", "afternoon_snack"],
				is_organic: prep === "Orgânica",
				allergens: ["oleaginosas"],
				season: ["Ano todo"],
				preparation_time: 0,
				cost_level: "medio",
				availability: "comum",
				sustainability_score: 7,
				fiber: 6,
				glycemic_index: 15,
			});
		});
	});

	// 9. LEGUMINOSAS (60+ variações)
	const legumes = [
		{name: "Feijão Preto", protein: 21, carbs: 63, fat: 1.4, calories: 341},
		{name: "Feijão Carioca", protein: 20, carbs: 61, fat: 1.3, calories: 329},
		{name: "Lentilha", protein: 26, carbs: 60, fat: 1.1, calories: 353},
		{name: "Grão de Bico", protein: 20, carbs: 61, fat: 6, calories: 378},
		{name: "Ervilha", protein: 23, carbs: 60, fat: 1.2, calories: 341},
		{name: "Soja", protein: 37, carbs: 30, fat: 20, calories: 446},
	];

	const legumePreparations = ["Cozido", "Refogado", "em Salada", "Temperado", "com Bacon"];

	legumes.forEach((legume) => {
		legumePreparations.forEach((prep) => {
			foods.push({
				name: `${legume.name} ${prep}`,
				food_group: "Proteínas",
				category: "Leguminosas",
				calories: Math.round(legume.calories / 3), // Cooked portion
				protein: Math.round(legume.protein / 3),
				carbs: Math.round(legume.carbs / 3),
				fats: legume.fat,
				portion_size: 100,
				portion_unit: "g",
				meal_time: ["lunch", "dinner"],
				allergens: legume.name === "Soja" ? ["soja"] : [],
				season: ["Ano todo"],
				preparation_time: 60,
				cost_level: "baixo",
				availability: "comum",
				sustainability_score: 9,
				fiber: 8,
				glycemic_index: 30,
			});
		});
	});

	// 10. BEBIDAS (200+ variações)
	const beverages = [
		{name: "Suco de Laranja", protein: 1, carbs: 11, fat: 0.2, calories: 45},
		{name: "Suco de Maçã", protein: 0.1, carbs: 11, fat: 0.1, calories: 46},
		{name: "Água de Coco", protein: 2, carbs: 9, fat: 0.2, calories: 45},
		{name: "Chá Verde", protein: 0, carbs: 0, fat: 0, calories: 2},
		{name: "Café", protein: 0.3, carbs: 0, fat: 0, calories: 2},
		{name: "Kombucha", protein: 0, carbs: 7, fat: 0, calories: 30},
		{name: "Smoothie de Frutas", protein: 2, carbs: 15, fat: 0.5, calories: 72},
		{name: "Água Saborizada", protein: 0, carbs: 2, fat: 0, calories: 8},
		{name: "Isotônico", protein: 0, carbs: 6, fat: 0, calories: 25},
		{name: "Suco de Uva", protein: 0.6, carbs: 16, fat: 0.2, calories: 68},
		{name: "Leite de Coco", protein: 2, carbs: 3, fat: 21, calories: 197},
		{name: "Leite de Amêndoa", protein: 1, carbs: 1, fat: 3, calories: 39},
		{name: "Chá de Camomila", protein: 0, carbs: 0, fat: 0, calories: 1},
		{name: "Mate Gelado", protein: 0, carbs: 2, fat: 0, calories: 8},
		{name: "Refrigerante Zero", protein: 0, carbs: 0, fat: 0, calories: 0},
		{name: "Vitamina de Banana", protein: 4, carbs: 22, fat: 2, calories: 118},
	];

	const beverageVariations = [
		"Natural",
		"Sem Açúcar",
		"Orgânico",
		"Integral",
		"Concentrado",
		"Diet",
	];

	beverages.forEach((beverage) => {
		beverageVariations.forEach((variation) => {
			// Assign different meal times based on beverage type
			let beverageMealTimes: string[];
			if (beverage.name.includes("Café")) {
				beverageMealTimes = ["breakfast", "afternoon_snack"];
			} else if (beverage.name.includes("Chá")) {
				beverageMealTimes = ["afternoon_snack", "evening_snack"];
			} else if (beverage.name.includes("Smoothie")) {
				beverageMealTimes = ["breakfast", "morning_snack"];
			} else if (beverage.name.includes("Isotônico")) {
				beverageMealTimes = ["morning_snack", "afternoon_snack"];
			} else {
				beverageMealTimes = getRandomMealTimes(3);
			}

			foods.push({
				name: `${beverage.name} ${variation}`,
				food_group: "Bebidas",
				category: "Sucos",
				calories:
					variation === "Sem Açúcar" || variation === "Diet"
						? Math.round(beverage.calories * 0.5)
						: beverage.calories,
				protein: beverage.protein,
				carbs:
					variation === "Sem Açúcar" || variation === "Diet"
						? Math.round(beverage.carbs * 0.3)
						: beverage.carbs,
				fats: beverage.fat,
				portion_size: 200,
				portion_unit: "ml",
				meal_time: beverageMealTimes,
				is_organic: variation === "Orgânico",
				allergens: [],
				season: ["Ano todo"],
				preparation_time: 5,
				cost_level: variation === "Orgânico" ? "alto" : getRandomCostLevel(),
				availability: getRandomAvailability(),
				sustainability_score: variation === "Orgânico" ? 8 : 6,
				sugar: variation === "Sem Açúcar" || variation === "Diet" ? 0 : beverage.carbs,
			});
		});
	});

	// 11. CONDIMENTOS E TEMPEROS (200+ variações)
	const condiments = [
		{name: "Azeite Extra Virgem", calories: 884, fat: 100},
		{name: "Óleo de Coco", calories: 862, fat: 100},
		{name: "Vinagre Balsâmico", calories: 88, carbs: 17},
		{name: "Molho de Tomate", calories: 29, carbs: 7},
		{name: "Mostarda", calories: 66, carbs: 6},
		{name: "Ketchup", calories: 112, carbs: 25},
		{name: "Maionese", calories: 680, fat: 75},
	];

	const condimentVariations = [
		"Light",
		"Orgânico",
		"Artesanal",
		"Tradicional",
		"Sem Conservantes",
	];

	condiments.forEach((condiment) => {
		condimentVariations.forEach((variation) => {
			foods.push({
				name: `${condiment.name} ${variation}`,
				food_group: "Condimentos",
				category: "Molhos",
				calories:
					variation === "Light"
						? (condiment.calories || 50) * 0.6
						: condiment.calories || 50,
				protein: 0,
				carbs: condiment.carbs || 0,
				fats: variation === "Light" ? (condiment.fat || 0) * 0.6 : condiment.fat || 0,
				portion_size: 15,
				portion_unit: "ml",
				meal_time: ["lunch", "dinner"],
				is_organic: variation === "Orgânico",
				allergens: condiment.name === "Maionese" ? ["ovos"] : [],
				season: ["Ano todo"],
				preparation_time: 0,
				cost_level: variation === "Artesanal" ? "alto" : "medio",
				availability: "comum",
				sustainability_score: 5,
				sodium: 200,
			});
		});
	});

	// 12. MASSAS (80+ variações)
	const pastas = [
		{name: "Espaguete", protein: 13, carbs: 71, fat: 1.1, calories: 349},
		{name: "Penne", protein: 13, carbs: 71, fat: 1.1, calories: 349},
		{name: "Fusilli", protein: 13, carbs: 71, fat: 1.1, calories: 349},
		{name: "Lasanha", protein: 13, carbs: 71, fat: 1.1, calories: 349},
		{name: "Ravioli", protein: 13, carbs: 71, fat: 1.1, calories: 349},
	];

	const pastaTypes = ["Integral", "Tradicional", "Sem Glúten", "com Ovos", "de Arroz"];
	const pastaSauces = [
		"ao Molho de Tomate",
		"ao Pesto",
		"à Carbonara",
		"ao Alho e Óleo",
		"com Queijo",
	];

	pastas.forEach((pasta) => {
		pastaTypes.forEach((type) => {
			pastaSauces.forEach((sauce) => {
				foods.push({
					name: `${pasta.name} ${type} ${sauce}`,
					food_group: "Massas",
					category: "Massas",
					calories: pasta.calories,
					protein: pasta.protein,
					carbs: pasta.carbs,
					fats: pasta.fat,
					portion_size: 100,
					portion_unit: "g",
					meal_time: ["lunch", "dinner"],
					allergens: type === "Sem Glúten" ? [] : ["glúten"],
					season: ["Ano todo"],
					preparation_time: 15,
					cost_level: type === "Sem Glúten" ? "alto" : "medio",
					availability: "comum",
					sustainability_score: 5,
					glycemic_index: type === "Integral" ? 50 : 85,
				});
			});
		});
	});

	// 13. PRATOS BRASILEIROS TÍPICOS (300+ variações)
	const brazilianDishes = [
		{name: "Feijoada", protein: 15, carbs: 25, fat: 12, calories: 265},
		{name: "Moqueca", protein: 22, carbs: 8, fat: 18, calories: 278},
		{name: "Acarajé", protein: 8, carbs: 35, fat: 15, calories: 295},
		{name: "Vatapá", protein: 12, carbs: 20, fat: 22, calories: 318},
		{name: "Bobó de Camarão", protein: 18, carbs: 15, fat: 20, calories: 298},
		{name: "Baião de Dois", protein: 12, carbs: 40, fat: 8, calories: 268},
		{name: "Escondidinho", protein: 16, carbs: 28, fat: 14, calories: 285},
		{name: "Pastéis", protein: 8, carbs: 25, fat: 18, calories: 278},
		{name: "Coxinha", protein: 10, carbs: 22, fat: 16, calories: 258},
		{name: "Pão de Açúcar", protein: 6, carbs: 45, fat: 8, calories: 268},
	];

	const dishRegions = ["Nordestino", "Mineiro", "Baiano", "Gaúcho", "Paulista", "Carioca"];
	const dishSizes = ["Pequena", "Média", "Grande", "Individual"];

	brazilianDishes.forEach((dish) => {
		dishRegions.forEach((region) => {
			dishSizes.forEach((size) => {
				const multiplier = size === "Pequena" ? 0.7 : size === "Grande" ? 1.5 : 1;
				foods.push({
					name: `${dish.name} ${region} ${size}`,
					food_group: "Pratos Prontos",
					category: "Culinária Brasileira",
					calories: Math.round(dish.calories * multiplier),
					protein: Math.round(dish.protein * multiplier),
					carbs: Math.round(dish.carbs * multiplier),
					fats: Math.round(dish.fat * multiplier),
					portion_size: Math.round(200 * multiplier),
					portion_unit: "g",
					meal_time: ["lunch", "dinner"],
					allergens: dish.name.includes("Camarão") ? ["crustáceos"] : [],
					season: ["Ano todo"],
					preparation_time: 60,
					cost_level: getRandomCostLevel(),
					availability:
						region === "Baiano" || region === "Nordestino"
							? "regional"
							: getRandomAvailability(),
					sustainability_score: 6,
					fiber: 4,
					sodium: 400,
				});
			});
		});
	});

	// 14. LANCHES E PETISCOS (200+ variações)
	const snacks = [
		{name: "Mix de Oleaginosas", protein: 15, carbs: 12, fat: 45, calories: 485},
		{name: "Pipoca", protein: 4, carbs: 18, fat: 1, calories: 95},
		{name: "Chips de Batata", protein: 2, carbs: 15, fat: 10, calories: 152},
		{name: "Biscoito Integral", protein: 8, carbs: 20, fat: 12, calories: 208},
		{name: "Barra de Cereal", protein: 3, carbs: 25, fat: 5, calories: 148},
		{name: "Granola", protein: 8, carbs: 45, fat: 12, calories: 308},
		{name: "Tapioca Recheada", protein: 8, carbs: 35, fat: 6, calories: 228},
		{name: "Sanduíche Natural", protein: 12, carbs: 25, fat: 8, calories: 208},
	];

	const snackFlavors = ["Salgado", "Doce", "Natural", "Temperado", "Light"];
	const snackSizes = ["Mini", "Regular", "Grande"];

	snacks.forEach((snack) => {
		snackFlavors.forEach((flavor) => {
			snackSizes.forEach((size) => {
				const multiplier = size === "Mini" ? 0.5 : size === "Grande" ? 1.5 : 1;
				foods.push({
					name: `${snack.name} ${flavor} ${size}`,
					food_group: "Lanches",
					category: "Petiscos",
					calories: Math.round(snack.calories * multiplier),
					protein: Math.round(snack.protein * multiplier),
					carbs: Math.round(snack.carbs * multiplier),
					fats: Math.round(snack.fat * multiplier),
					portion_size: Math.round(50 * multiplier),
					portion_unit: "g",
					meal_time: ["morning_snack", "afternoon_snack"],
					allergens: snack.name.includes("Oleaginosas") ? ["oleaginosas"] : [],
					season: ["Ano todo"],
					preparation_time: 5,
					cost_level: flavor === "Light" ? "alto" : getRandomCostLevel(),
					availability: getRandomAvailability(),
					sustainability_score: 5,
					fiber: 3,
					sodium: flavor === "Salgado" ? 200 : 50,
				});
			});
		});
	});

	return foods;
};

// Function to standardize existing food_group values in the database
async function standardizeFoodGroups() {
	console.log("🔄 Standardizing food_group values...");

	// Define the mapping from various formats to standardized values
	const foodGroupMappings: Record<string, string> = {
		// Current inconsistent values to standardized values (lowercase/inconsistent formats)
		proteinas: "Proteínas",
		protein: "Proteínas",
		proteins: "Proteínas",
		meat: "Proteínas", // English meat -> Proteínas
		meats: "Proteínas",
		carne: "Proteínas",
		carnes: "Proteínas",
		frutas: "Frutas",
		fruit: "Frutas",
		fruits: "Frutas",
		fruta: "Frutas",
		vegetais: "Vegetais",
		vegetables: "Vegetais",
		vegetal: "Vegetais",
		verduras: "Vegetais",
		legumes: "Vegetais",
		gorduras: "Gorduras",
		fats: "Gorduras",
		lipids: "Gorduras",
		lipídios: "Gorduras",
		bebidas: "Bebidas",
		drinks: "Bebidas",
		beverages: "Bebidas",
		bebida: "Bebidas",
		carboidratos: "Cereais e Grãos", // Map old carboidratos to cereais e grãos
		carbohydrates: "Cereais e Grãos",
		carbs: "Cereais e Grãos",
		grains: "Cereais e Grãos",
		cereals: "Cereais e Grãos",
		condimentos: "Condimentos",
		spices: "Condimentos",
		seasonings: "Condimentos",
		temperos: "Condimentos",
		cereais_e_graos: "Cereais e Grãos",
		cereais: "Cereais e Grãos",
		graos: "Cereais e Grãos",
		grãos: "Cereais e Grãos",
		leguminosas: "Proteínas",
		legumes_secos: "Proteínas", // Dry legumes are protein sources
		tuberculos: "Tubérculos",
		tubers: "Tubérculos",
		raizes: "Tubérculos",
		massas: "Massas",
		pasta: "Massas",
		pastas: "Massas",
		dairy: "Proteínas",
		laticinios: "Proteínas",
		laticínios: "Proteínas",
		eggs: "Proteínas",
		ovos: "Proteínas",
		fibras: "Vegetais",
		fiber: "Vegetais",
		// Keep already correct values (proper case)
		Proteínas: "Proteínas",
		Frutas: "Frutas",
		Vegetais: "Vegetais",
		Gorduras: "Gorduras",
		Bebidas: "Bebidas",
		"Cereais e Grãos": "Cereais e Grãos",
		Massas: "Massas",
		Condimentos: "Condimentos",
		"Pratos Prontos": "Pratos Prontos",
		Lanches: "Lanches",
		// Legacy mappings with proper case
		Carboidratos: "Cereais e Grãos", // Convert old Carboidratos to Cereais e Grãos
		Leguminosas: "Proteínas",
		Tubérculos: "Tubérculos", // Note: this is the correct form
		Laticínios: "Proteínas",
		Ovos: "Proteínas",
		// Handle variations with mixed case
		PROTEINAS: "Proteínas",
		FRUTAS: "Frutas",
		VEGETAIS: "Vegetais",
		MEAT: "Proteínas",
		CARNES: "Proteínas",
		// Other potential variations
		snacks: "Lanches",
		lanches: "Lanches",
		ready_meals: "Pratos Prontos",
		pratos_prontos: "Pratos Prontos",
		refeicoes: "Pratos Prontos",
		// Nuts and seeds (should be fats/gorduras)
		nuts: "Gorduras",
		seeds: "Gorduras",
		nozes: "Gorduras",
		sementes: "Gorduras",
	};

	// Get all distinct food_group values
	const {data: foodGroups} = await supabase
		.from("foods")
		.select("food_group")
		.not("food_group", "is", null);

	if (!foodGroups) return;

	const distinctGroups = [...new Set(foodGroups.map((f) => f.food_group))];
	console.log("📋 Found food groups:", distinctGroups);

	// Update each non-standard food group
	for (const [oldValue, newValue] of Object.entries(foodGroupMappings)) {
		if (oldValue !== newValue && distinctGroups.includes(oldValue)) {
			console.log(`   🔄 Updating "${oldValue}" → "${newValue}"`);

			const {error} = await supabase
				.from("foods")
				.update({food_group: newValue})
				.eq("food_group", oldValue);

			if (error) {
				console.error(`   ❌ Error updating ${oldValue}:`, error);
			} else {
				console.log(`   ✓ Updated all "${oldValue}" foods to "${newValue}"`);
			}
		}
	}

	console.log("✅ Food group standardization completed!");
}

// Function to insert foods in batches
async function insertFoodsInBatches(foods: SeedFood[], batchSize: number = 100) {
	console.log(`Starting to insert ${foods.length} foods in batches of ${batchSize}...`);

	for (let i = 0; i < foods.length; i += batchSize) {
		const batch = foods.slice(i, i + batchSize);

		try {
			const {data, error} = await supabase.from("foods").insert(batch).select("id");

			if (error) {
				console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
				// Continue with next batch instead of stopping
				continue;
			}

			console.log(
				`✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
					foods.length / batchSize
				)} - ${batch.length} foods`
			);

			// Small delay to avoid overwhelming the database
			await new Promise((resolve) => setTimeout(resolve, 100));
		} catch (error) {
			console.error(`Unexpected error in batch ${Math.floor(i / batchSize) + 1}:`, error);
		}
	}
}

// Main execution function
async function main() {
	try {
		console.log("🌱 Starting food database seeding...");

		// Test connection
		const {data: testData, error: testError} = await supabase
			.from("foods")
			.select("count")
			.limit(1);

		if (testError) {
			console.error("❌ Database connection failed:", testError);
			process.exit(1);
		}

		console.log("✓ Database connection successful");

		// Standardize existing food groups first
		await standardizeFoodGroups();

		// Get current food count
		const {count: currentCount} = await supabase
			.from("foods")
			.select("*", {count: "exact", head: true});

		console.log(`📊 Current foods in database: ${currentCount || 0}`);

		// Generate food database
		console.log("🔄 Generating food database...");
		const foodsToInsert = generateExtensiveFoodDatabase();

		console.log(`📝 Generated ${foodsToInsert.length} food items`);

		// Insert foods in batches
		await insertFoodsInBatches(foodsToInsert, 50); // Smaller batches for better reliability

		// Get final count
		const {count: finalCount} = await supabase
			.from("foods")
			.select("*", {count: "exact", head: true});

		console.log(`🎉 Seeding completed! Total foods in database: ${finalCount || 0}`);
		console.log(`📈 Added ${(finalCount || 0) - (currentCount || 0)} new foods`);

		// Show some statistics
		const {data: categories} = await supabase
			.from("foods")
			.select("food_group")
			.order("food_group");

		if (categories) {
			const categoryCount: Record<string, number> = {};
			categories.forEach((item) => {
				categoryCount[item.food_group] = (categoryCount[item.food_group] || 0) + 1;
			});

			console.log("\n📊 Foods by category:");
			Object.entries(categoryCount).forEach(([category, count]) => {
				console.log(`  ${category}: ${count} items`);
			});
		}
	} catch (error) {
		console.error("❌ Seeding failed:", error);
		process.exit(1);
	}
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}

export default main;
