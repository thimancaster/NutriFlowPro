import React, {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {ChevronRight, User, Calculator, FileText, Utensils} from "lucide-react";
import {useConsultationData} from "@/contexts/ConsultationDataContext";
import {usePatient} from "@/contexts/patient/PatientContext";
import PatientSelectionStep from "./PatientSelectionStep";
import AnthropometryStep from "./AnthropometryStep";
import MealPlanStep from "./MealPlanStep";
import EvolutionStep from "./EvolutionStep";
import {AlertCircle, TrendingUp} from "lucide-react";

export type ClinicalWorkflowStep =
	| "patient-selection"
	| "anthropometry"
	| "meal-plan"
	| "evolution";

const ClinicalWorkflow: React.FC = () => {
	const {consultationData, currentStep, setCurrentStep, isConsultationActive} =
		useConsultationData();

	const {activePatient} = usePatient();

	const [completedSteps, setCompletedSteps] = useState<ClinicalWorkflowStep[]>([]);

	const steps: Array<{
		id: ClinicalWorkflowStep;
		title: string;
		icon: React.ReactNode;
		description: string;
	}> = [
		{
			id: "patient-selection",
			title: "Seleção do Paciente",
			icon: <User className="h-5 w-5" />,
			description: "Escolha o paciente para atendimento",
		},
		{
			id: "anthropometry",
			title: "Cálculo Nutricional",
			icon: <Calculator className="h-5 w-5" />,
			description: "Dados antropométricos e cálculos",
		},
		{
			id: "meal-plan",
			title: "Plano Alimentar",
			icon: <Utensils className="h-5 w-5" />,
			description: "Geração do plano alimentar personalizado",
		},
		{
			id: "evolution",
			title: "Evolução",
			icon: <TrendingUp className="h-5 w-5" />,
			description: "Gráficos e análise com IA Aura",
		},
	];

	useEffect(() => {
		const newCompletedSteps: ClinicalWorkflowStep[] = [];

		if (activePatient) {
			newCompletedSteps.push("patient-selection");
		}

		if ((consultationData?.results && consultationData.results.vet > 0) || 
		    (consultationData?.bmr && consultationData.bmr > 0)) {
			newCompletedSteps.push("anthropometry");
		}

		setCompletedSteps(newCompletedSteps);
	}, [activePatient, consultationData]);

	// Reset to patient selection when no patient is active
	useEffect(() => {
		if (!activePatient) {
			setCurrentStep("patient-selection");
		}
	}, [activePatient, setCurrentStep]);

	const handleStepClick = (stepId: ClinicalWorkflowStep) => {
		if (stepId === "patient-selection") {
			setCurrentStep(stepId);
		} else if (stepId === "anthropometry" && activePatient) {
			setCurrentStep(stepId);
		} else if (stepId === "meal-plan" && 
		           (completedSteps.includes("anthropometry") || 
		            (consultationData?.results && consultationData.results.vet > 0))) {
			setCurrentStep(stepId);
		}
	};

	const handleNextStep = () => {
		const currentIndex = steps.findIndex((step) => step.id === currentStep);
		if (currentIndex < steps.length - 1) {
			const nextStep = steps[currentIndex + 1];
			setCurrentStep(nextStep.id);
		}
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case "patient-selection":
				return <PatientSelectionStep onPatientSelected={handleNextStep} />;
			case "anthropometry":
				return <AnthropometryStep onCalculationsComplete={handleNextStep} />;
			case "meal-plan":
				return <MealPlanStep />;
			case "evolution":
				return <EvolutionStep />;
			default:
				return <PatientSelectionStep onPatientSelected={handleNextStep} />;
		}
	};

	return (
		<div className="space-y-6">
			{/* Progress Steps */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5 text-nutri-green" />
						Fluxo de Atendimento Clínico
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						{steps.map((step, index) => (
							<React.Fragment key={step.id}>
								<div className="flex flex-col items-center">
									<Button
										variant={currentStep === step.id ? "default" : "outline"}
										size="sm"
										className={`w-12 h-12 rounded-full p-0 ${
											completedSteps.includes(step.id)
												? "bg-nutri-green text-white"
												: currentStep === step.id
												? "bg-nutri-blue text-white"
												: "bg-gray-100"
										}`}
										onClick={() => handleStepClick(step.id)}
										disabled={
											step.id !== "patient-selection" &&
											!completedSteps.includes(steps[index - 1]?.id)
										}>
										{step.icon}
									</Button>
									<div className="text-center mt-2 max-w-[120px]">
										<p className="text-sm font-medium">{step.title}</p>
										<p className="text-xs text-gray-500">{step.description}</p>
										{completedSteps.includes(step.id) && (
											<Badge variant="secondary" className="mt-1 text-xs">
												Concluído
											</Badge>
										)}
									</div>
								</div>
								{index < steps.length - 1 && (
									<ChevronRight className="h-5 w-5 text-gray-400 mx-2" />
								)}
							</React.Fragment>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Step Content */}
			{renderStepContent()}

			{/* Patient Status */}
			{activePatient && (
				<Card className="bg-nutri-light border-nutri-green">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">Paciente Ativo: {activePatient.name}</p>
								<p className="text-sm text-gray-600">
									{activePatient.age ? `${activePatient.age} anos` : ""} •{" "}
									{activePatient.gender === "male" ? "Masculino" : "Feminino"}
								</p>
							</div>
							<Badge variant="secondary" className="bg-nutri-green text-white">
								Em Atendimento
							</Badge>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default ClinicalWorkflow;
