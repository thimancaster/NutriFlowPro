import React from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Calculator, CheckCircle2} from "lucide-react";
import {OfficialCalculatorForm} from "./OfficialCalculatorForm";
import {useActivePatient} from "@/hooks/useActivePatient";
import {useConsultationData} from "@/contexts/ConsultationDataContext";
import {useAuth} from "@/contexts/auth/AuthContext";
import {useNavigate} from "react-router-dom";
import {useToast} from "@/hooks/use-toast";
import {saveCalculationResults} from "@/services/calculationService";

const CalculatorTool: React.FC = () => {
	const {activePatient} = useActivePatient();
	const {updateConsultationData, setCurrentStep} = useConsultationData();
	const {user} = useAuth();
	const navigate = useNavigate();
	const {toast} = useToast();

	console.log("[CALCULATOR TOOL] Rendering, activePatient:", {
		id: activePatient?.id,
		name: activePatient?.name,
		weight: activePatient?.weight,
		height: activePatient?.height,
	});

	const handleCalculationComplete = async (results: any) => {
		if (!activePatient) {
			toast({
				title: "Erro",
				description: "Nenhum paciente selecionado",
				variant: "destructive",
			});
			return;
		}

		if (!user?.id) {
			toast({
				title: "Erro",
				description: "Usuário não autenticado",
				variant: "destructive",
			});
			return;
		}

		console.log("[CALCULATOR TOOL] Calculation complete, updating context:", results);

		// Update consultation data with calculation results
		updateConsultationData({
			weight: results.weight,
			height: results.height,
			age: results.age,
			bmr: results.tmb,
			results: {
				bmr: results.tmb,
				get: results.get,
				vet: results.vet,
				adjustment: results.vet - results.get,
				macros: {
					protein: results.macros.protein,
					carbs: results.macros.carbs,
					fat: results.macros.fat,
				},
			},
		});

		// Save calculation to Supabase
		try {
			const saveResult = await saveCalculationResults({
				patient_id: activePatient.id,
				user_id: user.id,
				weight: results.weight,
				height: results.height,
				age: results.age,
				gender: activePatient.gender === "male" ? "M" : "F",
				activity_level: results.activityLevel || "moderado",
				goal: results.goal || "manutenção",
				bmr: results.tmb,
				tdee: results.vet,
				protein: results.macros.protein,
				carbs: results.macros.carbs,
				fats: results.macros.fat,
				tipo: "oficial",
				status: "concluida",
			});

			if (!saveResult.success) {
				console.error("[CALCULATOR TOOL] Failed to save calculation:", saveResult.error);
				toast({
					title: "Erro ao Salvar",
					description: saveResult.error || "Não foi possível salvar o cálculo. Tente novamente.",
					variant: "destructive",
				});
				return; // ← NÃO AVANÇAR SE FALHOU
			}

			console.log("[CALCULATOR TOOL] Calculation saved successfully");
		} catch (error) {
			console.error("[CALCULATOR TOOL] Error saving calculation:", error);
			toast({
				title: "Erro ao Salvar",
				description: "Não foi possível salvar o cálculo. Tente novamente.",
				variant: "destructive",
			});
			return; // ← NÃO AVANÇAR SE ERRO
		}

		// SÓ avançar se salvamento OK
		setCurrentStep("meal-plan");

		// Navigate to clinical flow
		toast({
			title: "Sucesso",
			description: "Cálculo salvo! Navegando para o plano alimentar...",
		});

		setTimeout(() => {
				// Navigate to meal plan builder instead of clinical to avoid loop
				navigate("/meal-plan-builder");
		}, 500);
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Calculator className="h-6 w-6 text-primary" />
								Calculadora Nutricional Oficial
							</CardTitle>
							<CardDescription className="mt-2">
								Motor de cálculo unificado - 100% fiel às especificações científicas
							</CardDescription>
						</div>
						<Badge variant="default" className="bg-green-600">
							<CheckCircle2 className="h-3 w-3 mr-1" />
							Motor Oficial Ativo
						</Badge>
					</div>
			</CardHeader>
			<CardContent>
				<OfficialCalculatorForm onCalculationComplete={handleCalculationComplete} />
			</CardContent>
		</Card>
		</div>
	);
};

export default CalculatorTool;
