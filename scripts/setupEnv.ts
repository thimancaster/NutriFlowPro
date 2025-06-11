#!/usr/bin/env node

import {readFileSync, writeFileSync, existsSync} from "fs";
import {createInterface} from "readline";

const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
});

function question(prompt: string): Promise<string> {
	return new Promise((resolve) => {
		rl.question(prompt, resolve);
	});
}

async function setupEnvironment() {
	console.log("🔧 NutriFlow Pro - Food Database Seeder Setup");
	console.log("=".repeat(50));

	// Check if .env already exists
	if (existsSync(".env")) {
		const overwrite = await question("⚠️  .env file already exists. Overwrite? (y/N): ");
		if (overwrite.toLowerCase() !== "y" && overwrite.toLowerCase() !== "yes") {
			console.log("✅ Setup cancelled. Using existing .env file.");
			rl.close();
			return;
		}
	}

	console.log("\n📝 Please provide your Supabase credentials:");
	console.log("   You can find these in your Supabase project settings under API\n");

	const supabaseUrl = await question("🔗 Supabase Project URL: ");
	const serviceKey = await question("🔑 Service Role Key: ");

	if (!supabaseUrl || !serviceKey) {
		console.log("❌ Both URL and Service Role Key are required!");
		rl.close();
		return;
	}

	// Validate URL format
	if (!supabaseUrl.startsWith("https://") || !supabaseUrl.includes(".supabase.co")) {
		console.log("⚠️  Warning: URL doesn't look like a valid Supabase URL");
		console.log("   Expected format: https://your-project-ref.supabase.co");
	}

	// Create .env content
	const envContent = `# NutriFlow Pro - Food Database Seeder Configuration
# Generated on ${new Date().toISOString()}

# Supabase Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}

# Note: Keep this file secure and never commit it to version control
`;

	try {
		writeFileSync(".env", envContent);
		console.log("\n✅ Environment file created successfully!");
		console.log("\n🚀 You can now run the seeder with:");
		console.log("   npm run seed");
		console.log("   or");
		console.log("   bun run seed");
	} catch (error) {
		console.error("❌ Error creating .env file:", error);
	}

	rl.close();
}

setupEnvironment().catch(console.error);
