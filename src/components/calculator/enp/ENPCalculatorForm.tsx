import React from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ENPDataInputs} from "../inputs/ENPDataInputs";
import {ENPValidation} from "../validation/ENPValidation";
import {ENPCalculationValidator} from "../validation/ENPCalculationValidator";
import {ENPResultsPanel} from "../ENPResultsPanel";
import CalculatorActions from "../CalculatorActions";
import GERFormulaSelection from "../inputs/GERFormulaSelection";
import {useSimpleCalculator} from "@/hooks/useSimpleCalculator";
import {ActivityLevel, Objective, Profile} from "@/types/consultation";
import {GERFormula} from "@/types/gerFormulas";
import {
	mapActivityLevelToNew,
	mapObjectiveToNew,
	mapProfileToNew,
	mapActivityLevelToLegacy,
	mapObjectiveToLegacy,
	mapProfileToLegacy,
} from "@/utils/nutrition/typeMapping";
import {usePatient} from "@/contexts/patient/PatientContext";

export const ENPCalculatorForm: React.FC = () => {
	const {
		formData,
		updateFormData,
		results,
		isCalculating,
		error,
		calculate,
	} = useSimpleCalculator();
	
	const {activePatient} = usePatient();

	// Local state for ENP-specific fields
	const [bodyFatPercentage, setBodyFatPercentage] = React.useState<number | undefined>();
	const [gerFormula, setGERFormula] = React.useState<GERFormula | undefined>();

	// Validation state
	const [validationErrors, setValidationErrors] = React.useState<Array<{message: string}>>([]);
	const [validationWarnings, setValidationWarnings] = React.useState<Array<{message: string}>>(
		[]
	);
	const [isValid, setIsValid] = React.useState(false);

	// Validação básica
	React.useEffect(() => {
		const errors: Array<{message: string}> = [];
		const warnings: Array<{message: string}> = [];

		if (!formData.weight || formData.weight <= 0) errors.push({message: "Peso é obrigatório"});
		if (!formData.height || formData.height <= 0)
			errors.push({message: "Altura é obrigatória"});
		if (!formData.age || formData.age <= 0) errors.push({message: "Idade é obrigatória"});

		if (formData.age > 65)
			warnings.push({message: "Paciente idoso - considere fatores especiais"});
		if (formData.weight < 50) warnings.push({message: "Peso baixo - monitore adequação"});

		setValidationErrors(errors);
		setValidationWarnings(warnings);
		setIsValid(errors.length === 0);
	}, [formData]);

	const validatedData = {
		weight: formData.weight,
		height: formData.height,
		age: formData.age,
		gender: formData.gender,
		activityLevel: formData.activityLevel,
		objective: formData.objective,
		profile: formData.profile,
		bodyFatPercentage,
	};

	const handleCalculate = async () => {
		console.log('[CALC:DEBUG] handleCalculate chamado', { isValid, formData });
		if (!isValid) {
			console.log('[CALC:DEBUG] Validação falhou', { validationErrors });
			return;
		}
	const handleCalculate = async () => {
		console.log('[CALC:DEBUG] handleCalculate chamado', { isValid, formData });
		if (!isValid) {
			console.log('[CALC:DEBUG] Validação falhou', { validationErrors });
			return;
		}
		console.log('[CALC:DEBUG] Iniciando cálculo...');
		try {
			console.log('[CALC:DEBUG] Chamando calculate com formData:', formData);
			const result = await calculate();
			console.log('[CALC:DEBUG] Resultado:', result);
		} catch (error) {
			console.error('[CALC:DEBUG] Erro no cálculo:', error);
		}
	};
	};

	const handleExportResults = () => {
		if (!results) return;

		const exportData = {
			system: "ENP - Engenharia Nutricional Padrão",
			timestamp: new Date().toISOString(),
			patient: activePatient
				? {
						id: activePatient.id,
						name: activePatient.name,
				  }
				: null,
			results: results,
			formula: gerFormula || "Mifflin-St Jeor",
			standardDistribution:
				"Café 25% | Lanche M 10% | Almoço 30% | Lanche T 10% | Jantar 20% | Ceia 5%",
		};

		const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: "application/json"});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `enp-calculo-${activePatient?.name || "paciente"}-${
			new Date().toISOString().split("T")[0]
		}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const transformedResults = results
		? {
				tmb: results.tmb.value,
				get: results.get,
				vet: results.vet,
				adjustment: 0, // Simplificado
				macros: {
					protein: {
						grams: results.macros.protein.grams,
						kcal: results.macros.protein.kcal,
					},
					carbs: {grams: results.macros.carbs.grams, kcal: results.macros.carbs.kcal},
					fat: {grams: results.macros.fat.grams, kcal: results.macros.fat.kcal},
				},
		  }
		: null;

	// Transform validation errors and warnings to string arrays
	const errorMessages = validationErrors.map((error) => error.message);
	const warningMessages = validationWarnings.map((warning) => warning.message);

	// Helper functions to handle type conversions
	const handleWeightChange = (value: string) => {
		const numValue = parseFloat(value) || 0;
		updateFormData({weight: numValue});
	};

	const handleHeightChange = (value: string) => {
		const numValue = parseFloat(value) || 0;
		updateFormData({height: numValue});
	};

	const handleAgeChange = (value: string) => {
		const numValue = parseInt(value) || 0;
		updateFormData({age: numValue});
	};

	const handleBodyFatChange = (value: string) => {
		const numValue = parseFloat(value) || undefined;
		setBodyFatPercentage(numValue);
	};

	const handleGenderChange = (gender: 'M' | 'F') => {
		updateFormData({gender});
	};

	const handleActivityLevelChange = (activityLevel: string) => {
		updateFormData({activityLevel});
	};

	const handleObjectiveChange = (objective: string) => {
		updateFormData({objective});
	};

	const handleProfileChange = (profile: string) => {
		updateFormData({profile});
	};

	return (
		<div className="w-full bg-card border border-border rounded-lg overflow-hidden">
			<Tabs defaultValue="calculator" className="w-full">
				<TabsList className="rounded-none mb-6 grid w-full grid-cols-2 px-2 h-12 gap-2">
					<TabsTrigger value="calculator" className="flex items-center gap-2">
						<span>Calculadora ENP</span>
					</TabsTrigger>
					<TabsTrigger value="validator" className="flex items-center gap-2">
						<span>Validação Sistema</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent
					value="calculator"
					className="space-y-6 bg-transparent border-0 rounded-none p-6">
					<ENPDataInputs
						weight={formData.weight.toString()}
						setWeight={handleWeightChange}
						height={formData.height.toString()}
						setHeight={handleHeightChange}
						age={formData.age.toString()}
						setAge={handleAgeChange}
						sex={formData.gender}
						setSex={handleGenderChange}
						activityLevel={formData.activityLevel as any}
						setActivityLevel={handleActivityLevelChange}
						objective={formData.objective as any}
						setObjective={handleObjectiveChange}
						profile={formData.profile as any}
						setProfile={handleProfileChange}
						bodyFatPercentage={bodyFatPercentage?.toString() || ""}
						setBodyFatPercentage={handleBodyFatChange}
					/>

					<GERFormulaSelection
						selectedFormula={gerFormula}
						onFormulaChange={setGERFormula}
						profile={formData.profile as any}
						hasBodyFat={!!bodyFatPercentage}
						age={formData.age}
						weight={formData.weight}
						height={formData.height}
					/>

					<ENPValidation errors={errorMessages} warnings={warningMessages} />

					{!results && (
						<CalculatorActions
							isCalculating={isCalculating}
							calculateResults={handleCalculate}
							disabled={!isValid}
						/>
					)}

					{error && (
						<div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
							<p className="text-destructive text-sm font-medium">{error}</p>
						</div>
					)}

					{results && transformedResults && (
						<div className="space-y-6">
							{/* Formula Info */}
							{gerFormula && (
								<div className="text-sm text-center text-muted-foreground bg-muted/30 p-3 rounded-md border">
									Cálculo de TMB realizado com a fórmula:{" "}
									<strong>{gerFormula}</strong>
								</div>
							)}

							{/* Main Results Display - Includes all components and actions */}
							<ENPResultsPanel
								results={transformedResults}
								weight={validatedData.weight}
								onExportResults={handleExportResults}
							/>
						</div>
					)}
				</TabsContent>

				<TabsContent value="validator" className="bg-transparent border-0 rounded-none p-6">
					<ENPCalculationValidator />
				</TabsContent>
			</Tabs>
		</div>
	);
};
