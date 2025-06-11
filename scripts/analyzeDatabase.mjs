import {createClient} from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
	process.env.SUPABASE_URL || "",
	process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function analyzeFoodDatabase() {
	console.log("🔍 Analyzing current food database state...\n");

	try {
		// 1. Get total count
		const {count: totalCount} = await supabase
			.from("foods")
			.select("*", {count: "exact", head: true});

		console.log(`📊 Total foods in database: ${totalCount}`);

		// 2. Get all food groups and their counts
		const {data: allFoods} = await supabase.from("foods").select("food_group");

		if (allFoods) {
			const groupCounts = {};
			allFoods.forEach((food) => {
				const group = food.food_group || "NULL";
				groupCounts[group] = (groupCounts[group] || 0) + 1;
			});

			console.log("\n📂 Food groups distribution:");
			Object.entries(groupCounts)
				.sort(([, a], [, b]) => b - a)
				.forEach(([group, count]) => {
					console.log(`  ${group}: ${count} foods`);
				});
		}

		// 3. Sample foods from each category
		const distinctGroups = [...new Set(allFoods?.map((f) => f.food_group) || [])];

		console.log("\n🔍 Sample foods from each category:");
		for (const group of distinctGroups.sort()) {
			const {data: sampleFoods} = await supabase
				.from("foods")
				.select("name, protein, calories")
				.eq("food_group", group)
				.limit(3);

			console.log(`\n📂 ${group}:`);
			sampleFoods?.forEach((food) => {
				console.log(`  - ${food.name} (${food.calories}kcal, ${food.protein}g protein)`);
			});
		}

		// 4. Test search functionality
		console.log("\n🔍 Testing search functionality:");

		// Search for proteins
		const {data: proteinFoods} = await supabase
			.from("foods")
			.select("name, food_group, protein")
			.gt("protein", 20)
			.limit(5);

		console.log("\n🥩 High protein foods (>20g):");
		proteinFoods?.forEach((food) => {
			console.log(`  - ${food.name} (${food.food_group}) - ${food.protein}g protein`);
		});

		// Search for specific food
		const {data: chickenSearch} = await supabase
			.from("foods")
			.select("name, food_group")
			.ilike("name", "%frango%")
			.limit(5);

		console.log("\n🐔 Chicken foods search:");
		chickenSearch?.forEach((food) => {
			console.log(`  - ${food.name} (${food.food_group})`);
		});

		// 5. Test category filtering
		console.log("\n🔍 Testing category filtering:");
		const expectedCategories = [
			"Proteínas",
			"Vegetais",
			"Frutas",
			"Cereais e Grãos",
			"Bebidas",
		];

		for (const category of expectedCategories) {
			const {count} = await supabase
				.from("foods")
				.select("*", {count: "exact", head: true})
				.eq("food_group", category);

			if (count && count > 0) {
				console.log(`✅ ${category}: ${count} foods`);
			} else {
				console.log(`❌ ${category}: 0 foods (missing category)`);
			}
		}

		console.log("\n✅ Database analysis completed!");
	} catch (error) {
		console.error("❌ Error analyzing database:", error);
	}
}

analyzeFoodDatabase();
