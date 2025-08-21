
import React, {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {Users, Calculator, Utensils, Loader2} from "lucide-react";
import {useAuth} from "@/contexts/auth/AuthContext";
import {PatientService} from "@/services/patientService";
import {MealPlanService} from "@/services/mealPlanService";
import {useToast} from "@/hooks/use-toast";
import {Patient} from "@/types/patient";
import {MealPlanGenerationParams} from "@/types/mealPlanTypes";

interface MealPlanGeneratorProps {
  onMealPlanGenerated?: (mealPlan: any) => void;
}

const MealPlanGenerator: React.FC<MealPlanGeneratorProps> = ({onMealPlanGenerated}) => {
	const {user} = useAuth();
	const {toast} = useToast();
	const [patients, setPatients] = useState<Patient[]>([]);
	const [selectedPatient, setSelectedPatient] = useState<string>("");
	const [targetCalories, setTargetCalories] = useState<number>(2000);
	const [targetProtein, setTargetProtein] = useState<number>(120);
	const [targetCarbs, setTargetCarbs] = useState<number>(250);
	const [targetFats, setTargetFats] = useState<number>(67);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isLoadingPatients, setIsLoadingPatients] = useState(false);

	useEffect(() => {
		loadPatients();
	}, [user]);

	const loadPatients = async () => {
		if (!user) return;

		try {
			setIsLoadingPatients(true);
			const response = await PatientService.getPatients(user.id);
			
			if (response.success && response.data) {
				setPatients(response.data);
			} else {
				console.error("Erro ao carregar pacientes:", response.error);
				toast({
					title: "Erro",
					description: "Erro ao carregar lista de pacientes",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Erro ao carregar pacientes:", error);
			toast({
				title: "Erro",
				description: "Erro ao carregar lista de pacientes",
				variant: "destructive",
			});
		} finally {
			setIsLoadingPatients(false);
		}
	};

	const handleGenerateMealPlan = async () => {
		if (!user || !selectedPatient) {
			toast({
				title: "Erro",
				description: "Por favor, selecione um paciente",
				variant: "destructive",
			});
			return;
		}

		try {
			setIsGenerating(true);

			const params: MealPlanGenerationParams = {
				userId: user.id,
				patientId: selectedPatient,
				totalCalories: targetCalories,
				totalProtein: targetProtein,
				totalCarbs: targetCarbs,
				totalFats: targetFats,
				date: new Date().toISOString().split('T')[0]
			};

			const result = await MealPlanService.generateMealPlan(
				params.userId,
				params.patientId,
				{
					calories: params.totalCalories,
					protein: params.totalProtein,
					carbs: params.totalCarbs,
					fats: params.totalFats
				}
			);

			if (result.success && result.data) {
				toast({
					title: "Sucesso",
					description: "Plano alimentar gerado com sucesso!",
				});

				if (onMealPlanGenerated) {
					onMealPlanGenerated(result.data);
				}
			} else {
				throw new Error(result.error || "Erro ao gerar plano alimentar");
			}
		} catch (error: any) {
			console.error("Erro ao gerar plano alimentar:", error);
			toast({
				title: "Erro",
				description: error.message || "Erro ao gerar plano alimentar",
				variant: "destructive",
			});
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Utensils className="h-5 w-5" />
						Gerador de Plano Alimentar Brasileiro
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Seleção de Paciente */}
					<div className="space-y-2">
						<Label htmlFor="patient-select">Selecionar Paciente</Label>
						<Select value={selectedPatient} onValueChange={setSelectedPatient}>
							<SelectTrigger>
								<SelectValue placeholder="Selecione um paciente" />
							</SelectTrigger>
							<SelectContent>
								{isLoadingPatients ? (
									<SelectItem value="" disabled>
										Carregando pacientes...
									</SelectItem>
								) : patients.length === 0 ? (
									<SelectItem value="" disabled>
										Nenhum paciente encontrado
									</SelectItem>
								) : (
									patients.map((patient) => (
										<SelectItem key={patient.id} value={patient.id}>
											{patient.name} - {patient.age} anos
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>
					</div>

					{/* Metas Nutricionais */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<Calculator className="h-4 w-4" />
							Metas Nutricionais
						</h3>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="calories">Calorias (kcal)</Label>
								<Input
									id="calories"
									type="number"
									value={targetCalories}
									onChange={(e) => setTargetCalories(Number(e.target.value))}
									min="800"
									max="5000"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="protein">Proteínas (g)</Label>
								<Input
									id="protein"
									type="number"
									value={targetProtein}
									onChange={(e) => setTargetProtein(Number(e.target.value))}
									min="20"
									max="300"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="carbs">Carboidratos (g)</Label>
								<Input
									id="carbs"
									type="number"
									value={targetCarbs}
									onChange={(e) => setTargetCarbs(Number(e.target.value))}
									min="50"
									max="500"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="fats">Gorduras (g)</Label>
								<Input
									id="fats"
									type="number"
									value={targetFats}
									onChange={(e) => setTargetFats(Number(e.target.value))}
									min="20"
									max="200"
								/>
							</div>
						</div>

						{/* Preview das Metas */}
						<div className="flex flex-wrap gap-2">
							<Badge variant="outline">{targetCalories} kcal</Badge>
							<Badge variant="outline">P: {targetProtein}g</Badge>
							<Badge variant="outline">C: {targetCarbs}g</Badge>
							<Badge variant="outline">G: {targetFats}g</Badge>
						</div>
					</div>

					{/* Botão de Geração */}
					<Button
						onClick={handleGenerateMealPlan}
						disabled={isGenerating || !selectedPatient}
						className="w-full"
						size="lg"
					>
						{isGenerating ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Gerando Plano Inteligente...
							</>
						) : (
							<>
								<Utensils className="h-4 w-4 mr-2" />
								Gerar Plano Alimentar Brasileiro
							</>
						)}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};

export default MealPlanGenerator;
