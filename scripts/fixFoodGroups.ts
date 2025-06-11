#!/usr/bin/env tsx

import dotenv from "dotenv";
import {createClient} from "@supabase/supabase-js";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findAndFixInconsistentFoodGroups() {
	console.log("🔍 Finding all food groups in the database...");

	// Get ALL food groups including inconsistent ones
	const {data: allFoods} = await supabase
		.from("foods")
		.select("food_group")
		.not("food_group", "is", null);

	if (!allFoods) {
		console.error("❌ Could not fetch foods");
		return;
	}

	const uniqueGroups = [...new Set(allFoods.map((f) => f.food_group))];
	console.log("📋 Found food groups:", uniqueGroups.sort());

	// Define comprehensive mapping
	const foodGroupMappings: Record<string, string> = {
		// Proteins
		meat: "Proteínas",
		proteinas: "Proteínas",
		protein: "Proteínas",
		proteins: "Proteínas",
		carne: "Proteínas",
		carnes: "Proteínas",
		dairy: "Proteínas",
		eggs: "Proteínas",
		ovos: "Proteínas",
		leguminosas: "Proteínas",

		// Vegetables
		vegetais: "Vegetais",
		vegetables: "Vegetais",
		verduras: "Vegetais",
		legumes: "Vegetais",

		// Fruits
		frutas: "Frutas",
		fruit: "Frutas",
		fruits: "Frutas",

		// Grains
		carboidratos: "Cereais e Grãos",
		carbohydrates: "Cereais e Grãos",
		cereais: "Cereais e Grãos",
		grains: "Cereais e Grãos",

		// Fats
		gorduras: "Gorduras",
		fats: "Gorduras",
		lipids: "Gorduras",

		// Beverages
		bebidas: "Bebidas",
		drinks: "Bebidas",
		beverages: "Bebidas",

		// Other categories
		condimentos: "Condimentos",
		spices: "Condimentos",
		temperos: "Condimentos",

		massas: "Massas",
		pasta: "Massas",

		tuberculos: "Tubérculos",
		tubers: "Tubérculos",

		lanches: "Lanches",
		snacks: "Lanches",
	};

	console.log("\n🔄 Fixing inconsistent food groups...");

	// Update each inconsistent food group
	for (const group of uniqueGroups) {
		const standardizedGroup = foodGroupMappings[group];

		if (standardizedGroup && standardizedGroup !== group) {
			console.log(`   🔄 Updating "${group}" → "${standardizedGroup}"`);

			const {error} = await supabase
				.from("foods")
				.update({food_group: standardizedGroup})
				.eq("food_group", group);

			if (error) {
				console.error(`   ❌ Error updating ${group}:`, error);
			} else {
				console.log(`   ✓ Updated all "${group}" foods to "${standardizedGroup}"`);
			}
		} else if (!standardizedGroup) {
			console.log(`   ⚠️  Unknown food group: "${group}" - keeping as is`);
		} else {
			console.log(`   ✓ "${group}" already standardized`);
		}
	}

	// Show final results
	console.log("\n📊 Final food group counts:");

	const {data: finalFoods} = await supabase
		.from("foods")
		.select("food_group")
		.not("food_group", "is", null);

	if (finalFoods) {
		const finalGroups = [...new Set(finalFoods.map((f) => f.food_group))];

		for (const group of finalGroups.sort()) {
			const {count} = await supabase
				.from("foods")
				.select("*", {count: "exact", head: true})
				.eq("food_group", group);

			console.log(`  ${group}: ${count} items`);
		}
	}

	console.log("\n✅ Food group standardization completed!");
}

findAndFixInconsistentFoodGroups()
	.then(() => console.log("🎉 Done!"))
	.catch(console.error);
