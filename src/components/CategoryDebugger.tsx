import React, {useState} from "react";
import {FoodService} from "@/services/foodService";
import {Button} from "@/components/ui/button";

const CategoryDebugger: React.FC = () => {
	const [results, setResults] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	const testCategory = async (category: string) => {
		setLoading(true);
		try {
			console.log(`🧪 Testing category: ${category}`);

			const searchResult = await FoodService.searchFoods({
				food_group: category,
				page: 1,
				pageSize: 20,
			});

			console.log(`📊 Results for ${category}:`, searchResult);
			setResults(searchResult.data || []);

			// Check if all results actually belong to the selected category
			const incorrectItems = searchResult.data.filter(
				(food) => food.food_group !== FoodService.mapCategoryToFoodGroup(category)
			);

			if (incorrectItems.length > 0) {
				console.error(
					`❌ Found ${incorrectItems.length} items with wrong food_group:`,
					incorrectItems
				);
			} else {
				console.log(`✅ All items correctly belong to category: ${category}`);
			}
		} catch (error) {
			console.error("Error testing category:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4 border rounded-lg space-y-4">
			<h3 className="text-lg font-semibold">Category Filter Debugger</h3>

			<div className="flex flex-wrap gap-2">
				{["frutas", "proteinas", "vegetais", "cereais_e_graos"].map((category) => (
					<Button
						key={category}
						onClick={() => testCategory(category)}
						disabled={loading}
						variant="outline"
						size="sm">
						Test {category}
					</Button>
				))}
			</div>

			{loading && <p>Testing...</p>}

			{results.length > 0 && (
				<div className="space-y-2">
					<h4 className="font-medium">Results ({results.length} items):</h4>
					<div className="max-h-60 overflow-y-auto space-y-1">
						{results.map((food, index) => (
							<div key={index} className="text-sm p-2 border rounded">
								<strong>{food.name}</strong> -
								<span
									className={
										food.food_group !== results[0]?.food_group
											? "text-red-500"
											: ""
									}>
									{food.food_group}
								</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default CategoryDebugger;
