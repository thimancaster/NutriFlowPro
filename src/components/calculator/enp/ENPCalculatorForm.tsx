
import React from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ENPDataInputs} from "../inputs/ENPDataInputs";
import {ENPValidation} from "../validation/ENPValidation";
import {ENPCalculationValidator} from "../validation/ENPCalculationValidator";
import {ENPResultsPanel} from "../ENPResultsPanel";
import CalculatorActions from "../CalculatorActions";
import GERFormulaSelection from "../inputs/GERFormulaSelection";
import {useCalculator} from "@/hooks/useCalculator";
import {ActivityLevel, Objective, Profile} from "@/types/consultation";
import {GERFormula} from "@/types/gerFormulas";
import {
	mapActivityLevelToNew,
	mapObjectiveToNew,
	mapProfileToNew,
	mapActivityLevelToLegacy,
	mapObjectiveToLegacy,
	mapProfileToLegacy
} from "@/utils/nutrition/typeMapping";

export const ENPCalculatorForm: React.FC = () => {
	const {
		formData,
		updateFormData,
		results,
		isCalculating,
		error,
		calculate,
		hasActivePatient,
		activePatient
	} = useCalculator();

	// Local state for ENP-specific fields
	const [bodyFatPercentage, setBodyFatPercentage] = React.useState<number | undefined>();
	const [gerFormula, setGERFormula] = React.useState<GERFormula | undefined>();

	// Validation state
	const [validationErrors, setValidationErrors] = React.useState<Array<{message: string}>>([]);
	const [validationWarnings, setValidationWarnings] = React.useState<Array<{message: string}>>([]);
	const [isValid, setIsValid] = React.useState(false);

	// Validate form data
	React.useEffect(() => {
		const errors: Array<{message: string}> = [];
		const warnings: Array<{message: string}> = [];

		if (!formData.weight || formData.weight <= 0) errors.push({message: "Peso é obrigatório"});
		if (!formData.height || formData.height <= 0) errors.push({message: "Altura é obrigatória"});
		if (!formData.age || formData.age <= 0) errors.push({message: "Idade é obrigatória"});
		if (!gerFormula) errors.push({message: "Fórmula GER é obrigatória"});

		if (formData.age > 65) warnings.push({message: "Paciente idoso - considere fatores especiais"});
		if (formData.weight < 50) warnings.push({message: "Peso baixo - monitore adequação"});

		setValidationErrors(errors);
		setValidationWarnings(warnings);
		setIsValid(errors.length === 0);
	}, [formData, gerFormula]);

	const validatedData = {
		weight: formData.weight,
		height: formData.height,
		age: formData.age,
		gender: formData.gender, // Use gender instead of sex
		activityLevel: mapActivityLevelToLegacy(formData.activityLevel),
		objective: mapObjectiveToLegacy(formData.objective),
		profile: mapProfileToLegacy(formData.profile),
		bodyFatPercentage
	};

	const handleCalculate = async () => {
		if (!isValid) return;
		await calculate();
	};

	const handleExportResults = () => {
		if (!results) return;
		
		const exportData = {
			system: 'ENP - Engenharia Nutricional Padrão',
			timestamp: new Date().toISOString(),
			patient: activePatient ? { 
				id: activePatient.id, 
				name: activePatient.name 
			} : null,
			results: results,
			formula: gerFormula || 'Mifflin-St Jeor',
			standardDistribution: 'Café 25% | Lanche M 10% | Almoço 30% | Lanche T 10% | Jantar 20% | Ceia 5%'
		};
		
		const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `enp-calculo-${activePatient?.name || 'paciente'}-${new Date().toISOString().split('T')[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const transformedResults = results
		? {
				tmb: results.tmb.value, // Extract numeric value from TMBResult
				get: results.get,
				vet: results.vet,
				adjustment: results.adjustment,
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
		updateFormData({ weight: numValue });
	};

	const handleHeightChange = (value: string) => {
		const numValue = parseFloat(value) || 0;
		updateFormData({ height: numValue });
	};

	const handleAgeChange = (value: string) => {
		const numValue = parseInt(value) || 0;
		updateFormData({ age: numValue });
	};

	const handleBodyFatChange = (value: string) => {
		const numValue = parseFloat(value) || undefined;
		setBodyFatPercentage(numValue);
	};

	return (
		<Tabs defaultValue="calculator" className="w-full">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="calculator">Calculadora ENP</TabsTrigger>
				<TabsTrigger value="validator">Validação Sistema</TabsTrigger>
			</TabsList>

			<TabsContent value="calculator" className="space-y-6">
				<ENPDataInputs
					weight={formData.weight.toString()}
					setWeight={handleWeightChange}
					height={formData.height.toString()}
					setHeight={handleHeightChange}
					age={formData.age.toString()}
					setAge={handleAgeChange}
					sex={formData.gender}
					setSex={(gender) => updateFormData({ gender })}
					activityLevel={mapActivityLevelToLegacy(formData.activityLevel)}
					setActivityLevel={(activityLevel) => updateFormData({ 
						activityLevel: mapActivityLevelToNew(activityLevel as ActivityLevel) 
					})}
					objective={mapObjectiveToLegacy(formData.objective)}
					setObjective={(objective) => updateFormData({ 
						objective: mapObjectiveToNew(objective as Objective) 
					})}
					profile={mapProfileToLegacy(formData.profile)}
					setProfile={(profile) => updateFormData({ 
						profile: mapProfileToNew(profile as Profile) 
					})}
					bodyFatPercentage={bodyFatPercentage?.toString() || ''}
					setBodyFatPercentage={handleBodyFatChange}
				/>

				<GERFormulaSelection
					selectedFormula={gerFormula}
					onFormulaChange={setGERFormula}
					profile={mapProfileToLegacy(formData.profile)}
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
					<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-600 text-sm font-medium">{error}</p>
					</div>
				)}

				{results && transformedResults && (
					<div className="space-y-6">
						{/* Formula Info */}
						{gerFormula && (
							<div className="text-sm text-center text-gray-700 bg-gray-50 p-3 rounded-md border">
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

			<TabsContent value="validator">
				<ENPCalculationValidator />
			</TabsContent>
		</Tabs>
	);
};
