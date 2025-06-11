// Simple food counter - calculate expected foods mathematically

const categories = [
	{
		name: "Carnes Bovinas",
		cuts: 21, // Updated: expanded from 15 to 21 cuts
		preparations: 6,
		qualities: 4,
		total: function () {
			return this.cuts * this.preparations * this.qualities;
		},
	},
	{
		name: "Aves",
		types: 9, // from poultry types
		preparations: 6,
		qualities: 4,
		total: function () {
			return this.types * this.preparations * this.qualities;
		},
	},
	{
		name: "Peixes e Frutos do Mar",
		items: 15, // from seafood array
		preparations: 6,
		origins: 4,
		total: function () {
			return this.items * this.preparations * this.origins;
		},
	},
	{
		name: "Cereais e Grãos",
		grains: 20, // Updated: expanded from 10 to 20 grains
		preparations: 6,
		qualities: 4,
		total: function () {
			return this.grains * this.preparations * this.qualities;
		},
	},
	{
		name: "Vegetais e Legumes",
		vegetables: 22, // Updated: expanded from 15 to 22 vegetables
		preparations: 5,
		origins: 4,
		total: function () {
			return this.vegetables * this.preparations * this.origins;
		},
	},
	{
		name: "Frutas",
		fruits: 20, // Updated: expanded from 14 to 20 fruits
		origins: 4,
		ripeness: 3,
		total: function () {
			return this.fruits * this.origins * this.ripeness;
		},
	},
	{
		name: "Laticínios",
		types: 10, // Updated: expanded from 8 to 10 dairy products
		varieties: 3,
		fat_levels: 4,
		total: function () {
			return this.types * this.varieties * this.fat_levels;
		},
	},
	{
		name: "Oleaginosas",
		nuts: 14, // Updated: expanded from 9 to 14 nuts and seeds
		preparations: 8, // Updated: expanded from 4 to 8 preparation methods
		total: function () {
			return this.nuts * this.preparations;
		},
	},
	{
		name: "Leguminosas",
		legumes: 8, // estimated
		preparations: 4,
		total: function () {
			return this.legumes * this.preparations;
		},
	},
	{
		name: "Bebidas",
		beverages: 16, // Updated: expanded from 9 to 16 beverages
		variations: 5,
		total: function () {
			return this.beverages * this.variations;
		},
	},
	{
		name: "Condimentos",
		condiments: 20, // estimated
		variations: 3,
		total: function () {
			return this.condiments * this.variations;
		},
	},
	{
		name: "Massas",
		pastas: 8, // estimated
		preparations: 5,
		total: function () {
			return this.pastas * this.preparations;
		},
	},
	{
		name: "Pratos Brasileiros",
		dishes: 10, // estimated
		regions: 6,
		sizes: 4,
		total: function () {
			return this.dishes * this.regions * this.sizes;
		},
	},
	{
		name: "Lanches e Petiscos",
		snacks: 8, // estimated
		flavors: 5,
		sizes: 3,
		total: function () {
			return this.snacks * this.flavors * this.sizes;
		},
	},
];

console.log("🔢 NutriFlow Pro Food Database - Mathematical Count");
console.log("=".repeat(50));

let totalFoods = 0;

categories.forEach((category, index) => {
	const count = category.total();
	totalFoods += count;

	console.log(`${index + 1}. ${category.name}: ${count} foods`);
});

console.log("=".repeat(50));
console.log(`📊 TOTAL ESTIMATED FOODS: ${totalFoods}`);
console.log(`🎯 Target: 3,000+ foods`);
console.log(`✅ Status: ${totalFoods >= 3000 ? "TARGET REACHED! 🎉" : "NEED MORE FOODS ❌"}`);

if (totalFoods >= 3000) {
	console.log(`🚀 Exceeded target by: ${totalFoods - 3000} foods!`);
} else {
	console.log(`❗ Missing: ${3000 - totalFoods} foods to reach target`);
}

console.log("\n📋 Category Breakdown:");
categories.forEach((category) => {
	const count = category.total();
	const percentage = ((count / totalFoods) * 100).toFixed(1);
	console.log(`  ${category.name}: ${count} foods (${percentage}%)`);
});
