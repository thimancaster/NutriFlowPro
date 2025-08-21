
import React, {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {ConsolidatedMealPlan, ConsolidatedMealItem, MEAL_ORDER, MEAL_TYPES, MEAL_TIMES} from "@/types/mealPlanTypes";
import MealTypeSection from "./MealTypeSection";
import {format} from "date-fns";
import {ptBR} from "date-fns/locale";
import {useToast} from "@/hooks/use-toast";
import {MealPlanService} from "@/services/mealPlanService";

interface MealPlanEditorProps {
	mealPlan: ConsolidatedMealPlan;
	onMealPlanUpdate?: (updatedMealPlan: ConsolidatedMealPlan) => void;
}

type MealType = typeof MEAL_ORDER[number];

// Configuração das refeições em ordem cronológica brasileira
const MEAL_TYPE_CONFIG: Record<MealType, {name: string; time: string; color: string}> = {
	cafe_da_manha: {name: "Café da Manhã", time: "07:00", color: "bg-orange-100"},
	lanche_manha: {name: "Lanche da Manhã", time: "10:00", color: "bg-yellow-100"},
	almoco: {name: "Almoço", time: "12:30", color: "bg-green-100"},
	lanche_tarde: {name: "Lanche da Tarde", time: "15:30", color: "bg-blue-100"},
	jantar: {name: "Jantar", time: "19:00", color: "bg-purple-100"},
	ceia: {name: "Ceia", time: "21:30", color: "bg-pink-100"},
};

const MealPlanEditor: React.FC<MealPlanEditorProps> = ({mealPlan, onMealPlanUpdate}) => {
	const [items, setItems] = useState<ConsolidatedMealItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const {toast} = useToast();

	useEffect(() => {
		// Convert meals to items for backward compatibility
		const allItems: ConsolidatedMealItem[] = [];
		mealPlan.meals?.forEach(meal => {
			meal.items.forEach(item => {
				allItems.push({
					...item,
					meal_type: meal.type
				});
			});
		});
		setItems(allItems);
	}, [mealPlan]);

	// Group items by meal type
	const groupedItems = items.reduce((acc, item) => {
		const mealType = item.meal_type || 'cafe_da_manha';
		if (!acc[mealType]) {
			acc[mealType] = [];
		}
		acc[mealType].push(item);
		return acc;
	}, {} as Record<string, ConsolidatedMealItem[]>);

	const saveMealPlanChanges = async (updatedItems: ConsolidatedMealItem[]) => {
		try {
			setIsLoading(true);

			// Calculate new totals
			const newTotals = updatedItems.reduce(
				(acc, item) => {
					acc.calories += item.calories;
					acc.protein += item.protein;
					acc.carbs += item.carbs;
					acc.fats += item.fats;
					return acc;
				},
				{calories: 0, protein: 0, carbs: 0, fats: 0}
			);

			// Update the meal plan
			const updatedMealPlan = {
				...mealPlan,
				total_calories: newTotals.calories,
				total_protein: newTotals.protein,
				total_carbs: newTotals.carbs,
				total_fats: newTotals.fats,
			};

			const result = await MealPlanService.updateMealPlan(mealPlan.id, updatedMealPlan);

			if (result.success && result.data) {
				if (onMealPlanUpdate) {
					onMealPlanUpdate(result.data as ConsolidatedMealPlan);
				}
			} else {
				throw new Error(result.error || "Erro ao salvar alterações");
			}
		} catch (error: any) {
			console.error("Erro ao salvar plano alimentar:", error);
			toast({
				title: "Erro",
				description: error.message || "Erro ao salvar alterações no plano alimentar",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleItemUpdate = async (updatedItem: ConsolidatedMealItem) => {
		console.log("Updating item:", updatedItem);

		const updatedItems = items.map((item) => (item.id === updatedItem.id ? updatedItem : item));

		setItems(updatedItems);
		await saveMealPlanChanges(updatedItems);
	};

	const handleItemRemove = async (itemId: string) => {
		console.log("Removing item:", itemId);

		const updatedItems = items.filter((item) => item.id !== itemId);
		setItems(updatedItems);
		await saveMealPlanChanges(updatedItems);
	};

	const handleItemAdd = async (newItem: ConsolidatedMealItem) => {
		console.log("Adding new item:", newItem);

		const updatedItems = [...items, newItem];
		setItems(updatedItems);
		await saveMealPlanChanges(updatedItems);
	};

	// Calculate totals based on current items
	const currentTotals = items.reduce(
		(acc, item) => {
			acc.calories += item.calories;
			acc.protein += item.protein;
			acc.carbs += item.carbs;
			acc.fats += item.fats;
			return acc;
		},
		{calories: 0, protein: 0, carbs: 0, fats: 0}
	);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							🇧🇷 Plano Alimentar Brasileiro -{" "}
							{format(new Date(mealPlan.date), "dd/MM/yyyy", {locale: ptBR})}
						</CardTitle>
						<div className="flex gap-2">
							<Badge variant="outline">
								{currentTotals.calories.toFixed(0)} kcal
							</Badge>
							<Badge variant="outline">P: {currentTotals.protein.toFixed(0)}g</Badge>
							<Badge variant="outline">C: {currentTotals.carbs.toFixed(0)}g</Badge>
							<Badge variant="outline">G: {currentTotals.fats.toFixed(0)}g</Badge>
						</div>
					</div>
				</CardHeader>
			</Card>

			<div className="grid gap-6">
				{MEAL_ORDER.map((mealType) => (
					<MealTypeSection
						key={mealType}
						mealType={mealType}
						config={MEAL_TYPE_CONFIG[mealType]}
						items={groupedItems[mealType] || []}
						mealPlanId={mealPlan.id}
						onItemUpdate={handleItemUpdate}
						onItemRemove={handleItemRemove}
						onItemAdd={handleItemAdd}
						isLoading={isLoading}
					/>
				))}
			</div>
		</div>
	);
};

export default MealPlanEditor;
