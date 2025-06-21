import React, {useState} from "react";
import {FoodService} from "@/services/foodService";
import {Button} from "@/components/ui/button";

const DebugSupabase: React.FC = () => {
	const [result, setResult] = useState<any>(null);
	const [loading, setLoading] = useState(false);

	const testFoodService = async () => {
		setLoading(true);
		setResult(null);

		try {
			console.log("Testing FoodService.searchFoods...");

			// Test optimized search
			const start = Date.now();
			const results = await FoodService.searchFoods({
				page: 1,
				pageSize: 20,
				forceLoad: true,
			});
			const duration = Date.now() - start;

			console.log("FoodService test result:", results);

			setResult({
				success: true,
				duration: `${duration}ms`,
				count: results.count,
				dataLength: results.data.length,
				totalPages: results.totalPages,
				hasMore: results.hasMore,
				sampleFoods: results.data.slice(0, 3).map((f) => f.name),
				message: `Search completed in ${duration}ms`,
			});
		} catch (err) {
			console.error("FoodService test failed:", err);
			setResult({error: "FoodService test failed", details: err});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4 border rounded-lg bg-gray-50">
			<h3 className="font-medium mb-2">FoodService Performance Test</h3>

			<Button onClick={testFoodService} disabled={loading}>
				{loading ? "Testing..." : "Test FoodService"}
			</Button>

			{result && (
				<div className="mt-4 p-3 bg-white rounded border">
					<pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
				</div>
			)}
		</div>
	);
};

export default DebugSupabase;
