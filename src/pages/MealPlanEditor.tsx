import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {ArrowLeft, Loader2} from "lucide-react";
import {useAuth} from "@/contexts/auth/AuthContext";
import {MealPlanService} from "@/services/mealPlanService";
import MealPlanEditor from "@/components/meal-plan/MealPlanEditor";
import {DetailedMealPlan} from "@/types/mealPlan";
import {useToast} from "@/hooks/use-toast";

const MealPlanEditorPage: React.FC = () => {
	const {id} = useParams<{id: string}>();
	const navigate = useNavigate();
	const {user} = useAuth();
	const {toast} = useToast();

	const [mealPlan, setMealPlan] = useState<DetailedMealPlan | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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

	const handleMealPlanUpdate = (updatedMealPlan: DetailedMealPlan) => {
		setMealPlan(updatedMealPlan);
		toast({
			title: "Sucesso",
			description: "Plano alimentar atualizado com sucesso!",
		});
	};

	const handleBackToList = () => {
		navigate("/meal-plans");
	};

	if (!user) {
		return (
			<div className="container mx-auto p-6">
				<Card>
					<CardContent className="p-6 text-center">
						<p>Você precisa estar logado para editar planos alimentares.</p>
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
						<Button onClick={handleBackToList}>
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
			<div className="flex items-center gap-4">
				<Button variant="outline" onClick={handleBackToList}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Voltar
				</Button>
				<div>
					<h1 className="text-3xl font-bold">Editar Plano Alimentar</h1>
					<p className="text-gray-600">Edite e personalize seu plano alimentar</p>
				</div>
			</div>

			<MealPlanEditor mealPlan={mealPlan} onMealPlanUpdate={handleMealPlanUpdate} />
		</div>
	);
};

export default MealPlanEditorPage;
