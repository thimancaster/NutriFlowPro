import {createClient} from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
	console.log("🔍 Testing database connection...");
	console.log("=".repeat(40));

	const supabaseUrl = process.env.SUPABASE_URL;
	const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !supabaseServiceKey) {
		console.error("❌ Missing environment variables!");
		console.log("Please run: npm run setup");
		process.exit(1);
	}

	console.log("✓ Environment variables found");
	console.log(`  URL: ${supabaseUrl}`);
	console.log(`  Key: ${supabaseServiceKey.substring(0, 20)}...`);

	try {
		const supabase = createClient(supabaseUrl, supabaseServiceKey);

		// Test basic connection
		console.log("\n🔄 Testing connection...");
		const {data: testData, error: testError} = await supabase
			.from("foods")
			.select("count")
			.limit(1);

		if (testError) {
			console.error("❌ Connection failed:", testError.message);
			process.exit(1);
		}

		console.log("✅ Connection successful!");

		// Get current food count
		console.log("\n📊 Getting current database stats...");
		const {count: currentCount, error: countError} = await supabase
			.from("foods")
			.select("*", {count: "exact", head: true});

		if (countError) {
			console.error("❌ Error getting count:", countError.message);
			process.exit(1);
		}

		console.log(`📈 Current foods in database: ${currentCount || 0}`);

		// Test insert permission (we'll insert and immediately delete a test record)
		console.log("\n🔧 Testing insert permissions...");
		const testFood = {
			name: "TEST_FOOD_DELETE_ME",
			food_group: "Test",
			category: "Test",
			calories: 0,
			protein: 0,
			carbs: 0,
			fats: 0,
			portion_size: 1,
			portion_unit: "g",
			meal_time: ["breakfast"],
		};

		const {data: insertData, error: insertError} = await supabase
			.from("foods")
			.insert(testFood)
			.select("id");

		if (insertError) {
			console.error("❌ Insert permission failed:", insertError.message);
			console.log("💡 Make sure you're using the SERVICE ROLE key, not the anon key");
			process.exit(1);
		}

		console.log("✅ Insert permission verified");

		// Clean up test record
		if (insertData && insertData.length > 0) {
			await supabase.from("foods").delete().eq("id", insertData[0].id);
			console.log("✅ Test record cleaned up");
		}

		// Show some existing food categories
		console.log("\n📋 Existing food categories:");
		const {data: categories} = await supabase
			.from("foods")
			.select("food_group")
			.order("food_group");

		if (categories && categories.length > 0) {
			const categoryCount: Record<string, number> = {};
			categories.forEach((item) => {
				categoryCount[item.food_group] = (categoryCount[item.food_group] || 0) + 1;
			});

			Object.entries(categoryCount).forEach(([category, count]) => {
				console.log(`  ${category}: ${count} items`);
			});
		} else {
			console.log("  No existing foods found");
		}

		console.log("\n🎉 Database test completed successfully!");
		console.log("🚀 You can now run the seeder with: npm run seed");
	} catch (error) {
		console.error("❌ Unexpected error:", error);
		process.exit(1);
	}
}

testDatabaseConnection();
