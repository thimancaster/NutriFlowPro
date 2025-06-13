import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {FoodService} from "@/services/foodService";
import {supabase} from "@/integrations/supabase/client";

// Temporary debugging component for food search issues
const FoodSearchDebugger: React.FC = () => {
	const [result, setResult] = useState<string>("");
	const [isTestingConnection, setIsTestingConnection] = useState(false);
	const [isTestingForceLoad, setIsTestingForceLoad] = useState(false);
	const [isTestingDirect, setIsTestingDirect] = useState(false);

	const testDirectSupabase = async () => {
		setIsTestingDirect(true);
		setResult("Testing DIRECT Supabase connection...\n");

		try {
			const start = Date.now();

			// Direct Supabase query - no service layer
			const {data, error} = await supabase
				.from("foods")
				.select("id, name, food_group")
				.limit(3);

			const duration = Date.now() - start;

			if (error) {
				setResult((prev) => prev + `❌ Direct query failed: ${error.message}\n`);
				return;
			}

			setResult((prev) => prev + `✅ Direct query successful (${duration}ms)\n`);
			setResult((prev) => prev + `📊 Found ${data?.length || 0} items\n`);

			if (data && data.length > 0) {
				setResult((prev) => prev + `📋 Sample foods:\n`);
				data.forEach((food, i) => {
					setResult((prev) => prev + `  ${i + 1}. ${food.name} (${food.food_group})\n`);
				});
			}
		} catch (error) {
			setResult((prev) => prev + `❌ Direct query error: ${error.message}\n`);
		} finally {
			setIsTestingDirect(false);
		}
	};

	const testConnection = async () => {
		setIsTestingConnection(true);
		setResult("Testing basic connection...\n");

		try {
			const start = Date.now();
			// Simple query with minimal data
			const result = await FoodService.searchFoods({
				pageSize: 1,
				page: 1,
				forceLoad: false,
				query: "a", // Just find any food with 'a' in the name
			});

			const duration = Date.now() - start;
			setResult((prev) => prev + `✅ Connection successful (${duration}ms)\n`);
			setResult((prev) => prev + `📊 Found ${result.data.length} items\n`);

			if (result.data.length > 0) {
				setResult((prev) => prev + `📋 Sample: ${result.data[0].name}\n`);
			}
		} catch (error) {
			setResult((prev) => prev + `❌ Connection failed: ${error.message}\n`);
		} finally {
			setIsTestingConnection(false);
		}
	};

	const testForceLoad = async () => {
		setIsTestingForceLoad(true);
		setResult("Testing force load (dialog initial search)...\n");

		try {
			const start = Date.now();
			// This is exactly what the dialog does on open
			const result = await FoodService.searchFoods({
				page: 1,
				pageSize: 20,
				forceLoad: true,
			});

			const duration = Date.now() - start;
			setResult((prev) => prev + `✅ Force load successful (${duration}ms)\n`);
			setResult((prev) => prev + `📊 Found ${result.data.length} items\n`);
			setResult((prev) => prev + `📄 Total pages: ${result.totalPages}\n`);
			setResult((prev) => prev + `🔢 Total count: ${result.count}\n`);

			if (result.data.length > 0) {
				setResult(
					(prev) =>
						prev +
						`📋 Sample foods: ${result.data
							.slice(0, 3)
							.map((f) => f.name)
							.join(", ")}\n`
				);
			}
		} catch (error) {
			setResult((prev) => prev + `❌ Force load failed: ${error.message}\n`);
		} finally {
			setIsTestingForceLoad(false);
		}
	};

	const clearResults = () => {
		setResult("");
	};

	return (
		<div className="p-4 border border-orange-300 rounded-lg bg-orange-50">
			<h3 className="text-lg font-semibold text-orange-800 mb-3">🔧 Food Search Debugger</h3>

			<div className="space-x-2 mb-4">
				<Button
					onClick={testDirectSupabase}
					disabled={isTestingDirect}
					variant="outline"
					size="sm">
					{isTestingDirect ? "Testing..." : "Test Direct DB"}
				</Button>

				<Button
					onClick={testConnection}
					disabled={isTestingConnection}
					variant="outline"
					size="sm">
					{isTestingConnection ? "Testing..." : "Test Connection"}
				</Button>

				<Button
					onClick={testForceLoad}
					disabled={isTestingForceLoad}
					variant="outline"
					size="sm">
					{isTestingForceLoad ? "Testing..." : "Test Force Load"}
				</Button>

				<Button onClick={clearResults} variant="outline" size="sm">
					Clear
				</Button>
			</div>

			{result && (
				<div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
					{result}
				</div>
			)}
		</div>
	);
};

export default FoodSearchDebugger;
