#!/usr/bin/env tsx

// Import the food generation function
import {generateExtensiveFoodDatabase} from "./seedFoodDatabase";

// Generate the foods and count them
const foods = generateExtensiveFoodDatabase();

console.log("🔢 Food Database Statistics:");
console.log("=".repeat(40));
console.log(`📊 Total foods generated: ${foods.length}`);

// Count by category
const categoryCount: Record<string, number> = {};
foods.forEach((food) => {
	categoryCount[food.food_group] = (categoryCount[food.food_group] || 0) + 1;
});

console.log("\n📋 Foods by category:");
Object.entries(categoryCount)
	.sort(([, a], [, b]) => b - a)
	.forEach(([category, count]) => {
		console.log(`  ${category}: ${count} items`);
	});

console.log("\n🎯 Target: 3000+ foods");
console.log(`✅ Status: ${foods.length >= 3000 ? "TARGET REACHED!" : "NEED MORE FOODS"}`);

if (foods.length < 3000) {
	console.log(`❗ Missing: ${3000 - foods.length} foods to reach target`);
}
