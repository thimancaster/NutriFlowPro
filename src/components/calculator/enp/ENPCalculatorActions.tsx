import React from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Download, Utensils, RefreshCcw} from "lucide-react";
import {useAuth} from "@/contexts/auth/AuthContext";
import {usePatient} from "@/contexts/patient/PatientContext";

interface ENPCalculatorActionsProps {
	results: any;
	onExport: () => void;
	onGenerateMealPlan: () => void;
	onReset: () => void;
	isGeneratingMealPlan?: boolean;
}

const ENPCalculatorActions: React.FC<ENPCalculatorActionsProps> = ({
	results,
	onExport,
	onGenerateMealPlan,
	onReset,
	isGeneratingMealPlan = false,
}) => {
	const {user} = useAuth();
	const {activePatient} = usePatient();

	if (!results) return null;

	// Get professional info - prioritize name and CRN over email
	const getProfessionalInfo = () => {
		if (user?.name && user?.crn) {
			return `${user.name} - CRN: ${user.crn}`;
		} else if (user?.name) {
			return user.name;
		} else if (user?.crn) {
			return `CRN: ${user.crn}`;
		} else {
			return user?.email || "Nutricionista";
		}
	};

	return (
		<Card className="mt-6">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<RefreshCcw className="h-5 w-5" />
					Próximos Passos ENP
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Professional and Patient Info */}
				<div className="text-sm text-gray-600 space-y-1">
					<div>
						<strong>Paciente:</strong>{" "}
						{activePatient?.name || "Paciente não selecionado"}
					</div>
					<div>
						<strong>Profissional:</strong> {getProfessionalInfo()}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="space-y-3">
					<Button
						onClick={onGenerateMealPlan}
						disabled={isGeneratingMealPlan}
						className="w-full bg-blue-600 hover:bg-blue-700"
						size="lg">
						{isGeneratingMealPlan ? (
							<>
								<RefreshCcw className="mr-2 h-5 w-5 animate-spin" />
								Gerando plano...
							</>
						) : (
							<>
								<Utensils className="mr-2 h-5 w-5" />
								Gerar Plano Alimentar ENP
							</>
						)}
					</Button>

					<Button onClick={onExport} variant="outline" className="w-full" size="lg">
						<Download className="mr-2 h-5 w-5" />
						Exportar Resultados ENP
					</Button>
				</div>

				{/* ENP System Info */}
				<div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-md">
					<strong>Sistema ENP:</strong> O plano alimentar será gerado seguindo a
					distribuição padrão de 6 refeições com proporções otimizadas para metabolismo e
					adesão do paciente.
				</div>
			</CardContent>
		</Card>
	);
};

export default ENPCalculatorActions;
