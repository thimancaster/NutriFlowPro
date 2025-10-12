import React from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Calculator, CheckCircle2} from "lucide-react";
import {OfficialCalculatorForm} from "./OfficialCalculatorForm";
import {useActivePatient} from "@/hooks/useActivePatient";

const CalculatorTool: React.FC = () => {
	const {activePatient} = useActivePatient();

	console.log("[CALCULATOR TOOL] Rendering, activePatient:", {
		id: activePatient?.id,
		name: activePatient?.name,
		weight: activePatient?.weight,
		height: activePatient?.height,
	});

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
					<OfficialCalculatorForm />
				</CardContent>
			</Card>
		</div>
	);
};

export default CalculatorTool;
