import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Simple execution script for the food database seeder
import seedFoods from "./seedFoodDatabase";

async function run() {
	console.log("🚀 Starting NutriFlow Pro Food Database Seeder");
	console.log("=".repeat(50));

	await seedFoods();

	console.log("=".repeat(50));
	console.log("✨ Seeding process completed!");
}

run().catch(console.error);
