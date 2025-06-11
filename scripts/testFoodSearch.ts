#!/usr/bin/env tsx

import dotenv from "dotenv";
import {createClient} from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(
	process.env.SUPABASE_URL || "",
	process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function testFoodSearch() {
	console.log("🧪 Testing food search functionality...");

	try {
		// Test 1: Get total count
		const {count: totalCount} = await supabase
			.from("foods")
			.select("*", {count: "exact", head: true});

		console.log(`📊 Total foods in database: ${totalCount}`);

		// Test 2: Get distinct food groups
		const {data: foodGroupsData} = await supabase
			.from("foods")
			.select("food_group")
			.not("food_group", "is", null);

		if (foodGroupsData) {
			const uniqueGroups = [...new Set(foodGroupsData.map((f) => f.food_group))];
			console.log(`\n📂 Found ${uniqueGroups.length} distinct food groups:`);

			for (const group of uniqueGroups.sort()) {
				const {count} = await supabase
					.from("foods")
					.select("*", {count: "exact", head: true})
					.eq("food_group", group);

				console.log(`  ${group}: ${count} foods`);
			}
		}

		// Test 3: Search for specific foods
		console.log("\n🔍 Searching for protein foods:");
		const {data: proteinFoods} = await supabase
			.from("foods")
			.select("name, food_group, protein, calories")
			.gt("protein", 20) // Foods with high protein content
			.limit(10);

		if (proteinFoods && proteinFoods.length > 0) {
			proteinFoods.forEach((food) => {
				console.log(`  - ${food.name} (${food.food_group}) - ${food.protein}g protein`);
			});
		} else {
			console.log("  ❌ No high-protein foods found");
		}

		// Test 4: Check category filtering
		console.log("\n🔍 Testing category filtering:");
		const categories = ["Proteínas", "Vegetais", "Frutas", "Cereais e Grãos"];

		for (const category of categories) {
			const {count} = await supabase
				.from("foods")
				.select("*", {count: "exact", head: true})
				.eq("food_group", category);

			console.log(`  ${category}: ${count || 0} foods`);

			if (count && count > 0) {
				// Get sample foods from this category
				const {data: sampleFoods} = await supabase
					.from("foods")
					.select("name")
					.eq("food_group", category)
					.limit(3);

				sampleFoods?.forEach((food) => {
					console.log(`    - ${food.name}`);
				});
			}
		}

		// Test 5: Check pagination
		console.log("\n📄 Testing pagination:");
		const {data: page1, count: page1Count} = await supabase
			.from("foods")
			.select("name, food_group", {count: "exact"})
			.range(0, 19); // First 20 items

		console.log(`  Page 1: ${page1?.length} foods (total: ${page1Count})`);
	} catch (error) {
		console.error("❌ Error during testing:", error);
	}
}

testFoodSearch();
