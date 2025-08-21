
import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {ArrowLeft, Loader2, Edit, Download, Calendar} from "lucide-react";
import {useAuth} from "@/contexts/auth/AuthContext";
import {MealPlanService} from "@/services/mealPlanService";
import {DetailedMealPlan, MealPlanMeal} from "@/types/mealPlan";
import {ConsolidatedMeal} from "@/types/mealPlanTypes";
import {format} from "date-fns";
import {ptBR} from "date-fns/locale";
import {useToast} from "@/hooks/use-toast";
import MealEditDialog from "@/components/meal-plan/MealEditDialog";

const MealPlanViewPage: React.FC = () => {
	const {id} = useParams<{id: string}>();
	const navigate = useNavigate();
	const {user} = useAuth();
	const {toast} = useToast();

	const [mealPlan, setMealPlan] = useState<DetailedMealPlan | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [editingMeal, setEditingMeal] = useState<ConsolidatedMeal | null>(null);
	const [showEditDialog, setShowEditDialog] = useState(false);

	useEffect(() => {
		const fetchMealPlan = async () => {
			if (!id) {
				setError("ID do plano alimentar não fornecido");
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				const plan = await MealPlanService.getMealPlanById(id);

				if (plan) {
					setMealPlan(plan);
				} else {
					setError("Plano alimentar não encontrado");
				}
			} catch (error: any) {
				console.error("Erro ao carregar plano alimentar:", error);
				setError(error.message ?? "Erro ao carregar plano alimentar");
			} finally {
				setIsLoading(false);
			}
		};

		fetchMealPlan();
	}, [id]);

	const handleEditMeal = (meal: MealPlanMeal) => {
		// Convert MealPlanMeal to ConsolidatedMeal for the dialog
		const consolidatedMeal: ConsolidatedMeal = {
			id: meal.id || '',
			type: meal.type,
			name: meal.name,
			time: meal.time || '',
			items: meal.items || [],
			total_calories: meal.total_calories,
			total_protein: meal.total_protein,
			total_carbs: meal.total_carbs,
			total_fats: meal.total_fats,
			foods: meal.foods
		};
		setEditingMeal(consolidatedMeal);
		setShowEditDialog(true);
	};

	const handleSaveMeal = async (updatedMeal: ConsolidatedMeal) => {
		if (!mealPlan) return;

		try {
			// Convert back to MealPlanMeal format
			const mealPlanMeal: MealPlanMeal = {
				...updatedMeal,
				foods: updatedMeal.foods || []
			};

			// Update the meal in the plan
			const updatedMeals = mealPlan.meals?.map(meal => 
				meal.id === mealPlanMeal.id ? mealPlanMeal : meal
			) || [];

			// Recalculate totals
			const planTotals = updatedMeals.reduce(
				(totals, meal) => ({
					calories: totals.calories + meal.total_calories,
					protein: totals.protein + meal.total_protein,
					carbs: totals.carbs + meal.total_carbs,
					fats: totals.fats + meal.total_fats
				}),
				{ calories: 0, protein: 0, carbs: 0, fats: 0 }
			);

			const updatedPlan: DetailedMealPlan = {
				...mealPlan,
				meals: updatedMeals,
				total_calories: planTotals.calories,
				total_protein: planTotals.protein,
				total_carbs: planTotals.carbs,
				total_fats: planTotals.fats
			};

			// Save to backend
			const result = await MealPlanService.updateMealPlan(mealPlan.id, updatedPlan);
			
			if (result.success && result.data) {
				// Convert back to DetailedMealPlan
				const savedPlan = await MealPlanService.getMealPlanById(mealPlan.id);
				if (savedPlan) {
					setMealPlan(savedPlan);
				}
				toast({
					title: "Sucesso",
					description: "Refeição atualizada com sucesso!",
				});
			} else {
				throw new Error(result.error || "Erro ao salvar");
			}
		} catch (error: any) {
			console.error("Erro ao salvar refeição:", error);
			toast({
				title: "Erro",
				description: error.message || "Erro ao salvar a refeição",
				variant: "destructive",
			});
		}
	};

	const handleBackToList = () => {
		navigate("/meal-plans");
	};

	const handleEdit = () => {
		navigate(`/meal-plan-editor/${id}`);
	};

	const handleExportPDF = () => {
		// Export functionality will be implemented in a future update
		console.log("Export PDF functionality to be implemented");
	};

	if (!user) {
		return (
			<div className="container mx-auto p-6">
				<Card>
					<CardContent className="p-6 text-center">
						<p>Você precisa estar logado para visualizar planos alimentares.</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
						<p>Carregando plano alimentar...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error || !mealPlan) {
		return (
			<div className="container mx-auto p-6">
				<Card>
					<CardContent className="p-6 text-center">
						<p className="text-red-600 mb-4">
							{error || "Plano alimentar não encontrado"}
						</p>
						<Button onClick={() => navigate("/meal-plans")}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Voltar para Lista
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" onClick={() => navigate("/meal-plans")}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Voltar
					</Button>
					<div>
						<h1 className="text-3xl font-bold">Visualizar Plano Alimentar</h1>
						<p className="text-gray-600 flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							{format(new Date(mealPlan.date), "dd/MM/yyyy", {locale: ptBR})}
						</p>
					</div>
				</div>

				<div className="flex gap-2">
					<Button variant="outline">
						<Download className="h-4 w-4 mr-2" />
						Exportar PDF
					</Button>
					<Button onClick={() => navigate(`/meal-plan-editor/${id}`)}>
						<Edit className="h-4 w-4 mr-2" />
						Editar
					</Button>
				</div>
			</div>

			{/* Plan Overview */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Resumo Nutricional</CardTitle>
						<div className="flex gap-2">
							{mealPlan.is_template && <Badge variant="secondary">Template</Badge>}
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="text-center p-4 bg-blue-50 rounded-lg">
							<div className="text-2xl font-bold text-blue-600">
								{Math.round(mealPlan.total_calories)}
							</div>
							<div className="text-sm text-gray-600">Calorias</div>
						</div>
						<div className="text-center p-4 bg-red-50 rounded-lg">
							<div className="text-2xl font-bold text-red-600">
								{Math.round(mealPlan.total_protein)}g
							</div>
							<div className="text-sm text-gray-600">Proteínas</div>
						</div>
						<div className="text-center p-4 bg-yellow-50 rounded-lg">
							<div className="text-2xl font-bold text-yellow-600">
								{Math.round(mealPlan.total_carbs)}g
							</div>
							<div className="text-sm text-gray-600">Carboidratos</div>
						</div>
						<div className="text-center p-4 bg-green-50 rounded-lg">
							<div className="text-2xl font-bold text-green-600">
								{Math.round(mealPlan.total_fats)}g
							</div>
							<div className="text-sm text-gray-600">Gorduras</div>
						</div>
					</div>

					{mealPlan.notes && (
						<div className="mt-4 p-4 bg-gray-50 rounded-lg">
							<h4 className="font-medium mb-2">Observações:</h4>
							<p className="text-gray-700">{mealPlan.notes}</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Meals */}
			<div className="grid gap-6">
				{mealPlan.meals?.map((meal) => (
					<Card key={meal.id}>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg">{meal.name}</CardTitle>
								<div className="flex items-center gap-2">
									<Badge variant="outline">
										{Math.round(meal.total_calories)} kcal
									</Badge>
									<Button
										size="sm"
										variant="ghost"
										onClick={() => handleEditMeal(meal)}
										className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
									>
										<Edit className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{/* Meal Macros */}
								<div className="grid grid-cols-3 gap-4 text-sm">
									<div className="text-center p-2 bg-red-50 rounded">
										<div className="font-medium text-red-600">
											{Math.round(meal.total_protein)}g
										</div>
										<div className="text-gray-600">Proteína</div>
									</div>
									<div className="text-center p-2 bg-yellow-50 rounded">
										<div className="font-medium text-yellow-600">
											{Math.round(meal.total_carbs)}g
										</div>
										<div className="text-gray-600">Carboidratos</div>
									</div>
									<div className="text-center p-2 bg-green-50 rounded">
										<div className="font-medium text-green-600">
											{Math.round(meal.total_fats)}g
										</div>
										<div className="text-gray-600">Gorduras</div>
									</div>
								</div>

								{/* Foods List */}
								<div className="space-y-2">
									<h4 className="font-medium">Alimentos:</h4>
									{meal.foods?.length > 0 ? (
										<div className="space-y-2">
											{meal.foods.map((food) => (
												<div
													key={
														food.id ||
														food.food_id ||
														`${food.name}-${food.quantity}`
													}
													className="flex justify-between items-center p-3 bg-gray-50 rounded">
													<div>
														<span className="font-medium">
															{food.name}
														</span>
														<span className="text-gray-600 ml-2">
															{food.quantity}
															{food.unit}
														</span>
													</div>
													<div className="text-sm text-gray-600">
														{Math.round(food.calories)} kcal
													</div>
												</div>
											))}
										</div>
									) : (
										<p className="text-gray-500 italic">
											Nenhum alimento adicionado
										</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Meal Edit Dialog */}
			<MealEditDialog
				open={showEditDialog}
				onOpenChange={setShowEditDialog}
				meal={editingMeal}
				onSave={handleSaveMeal}
			/>
		</div>
	);
};

export default MealPlanViewPage;
