/**
 * OFFICIAL CALCULATOR FORM - Single Source of Truth UI
 * Uses useOfficialCalculations hook for all calculations
 */

import React, {useEffect, useState} from "react";
import {useOfficialCalculations} from "@/hooks/useOfficialCalculations";
import {useActivePatient} from "@/hooks/useActivePatient";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Calculator, Activity, Target, Scale, Ruler, User} from "lucide-react";
import {Badge} from "@/components/ui/badge";

interface OfficialCalculatorFormProps {
	onCalculationComplete?: (results: any) => void;
	initialData?: {
		weight?: number;
		height?: number;
		age?: number;
		gender?: "M" | "F";
	};
}

export const OfficialCalculatorForm: React.FC<OfficialCalculatorFormProps> = ({
	onCalculationComplete,
	initialData,
}) => {
	const {
		inputs,
		results,
		updateInputs,
		updateMacroInputs,
		calculate,
		loading,
		error,
		canCalculate,
		getValidation,
	} = useOfficialCalculations();

	const {activePatient} = useActivePatient();

	console.log("🔍 [OFFICIAL FORM] RENDER - activePatient:", {
		id: activePatient?.id,
		name: activePatient?.name,
		weight: activePatient?.weight,
		height: activePatient?.height,
		gender: activePatient?.gender,
		birth_date: activePatient?.birth_date,
		goals: activePatient?.goals,
	});

	// Auto-fill from active patient
	useEffect(() => {
		console.log("⚡ [OFFICIAL FORM] useEffect triggered");

		if (!activePatient) {
			console.log("   ❌ No active patient");
			return;
		}

		console.log("   ✅ Has active patient, calculating data...");

		const patientAge = activePatient.birth_date
			? Math.floor(
					(new Date().getTime() - new Date(activePatient.birth_date).getTime()) /
						(365.25 * 24 * 60 * 60 * 1000)
			  )
			: 0;

		const patientData = {
			weight: activePatient.weight || 0,
			height: activePatient.height || 0,
			age: patientAge,
			gender: (activePatient.gender === "male"
				? "M"
				: activePatient.gender === "female"
				? "F"
				: "") as "M" | "F",
			profile: activePatient.goals?.profile as any,
			activityLevel: activePatient.goals?.activityLevel as any,
			objective: activePatient.goals?.objective as any,
		};

		console.log("   📝 Updating inputs with:", patientData);
		updateInputs(patientData);
	}, [activePatient?.id, updateInputs]);

	// Load initial data (fallback if no active patient)
	useEffect(() => {
		if (initialData && !activePatient) {
			console.log("   📥 Loading initialData:", initialData);
			updateInputs(initialData);
		}
	}, [initialData, activePatient, updateInputs]);

	// Notify parent when calculation completes
	useEffect(() => {
		if (results && onCalculationComplete) {
			onCalculationComplete(results);
		}
	}, [results, onCalculationComplete]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await calculate();
	};

	const validation = getValidation();

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Anthropometry Section */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<User className="h-5 w-5" />
						Dados Antropométricos
					</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="weight" className="flex items-center gap-2">
							<Scale className="h-4 w-4" />
							Peso (kg)
						</Label>
						<Input
							id="weight"
							type="number"
							step="0.1"
							placeholder="Ex: 70.5"
							value={inputs.weight || ""}
							onChange={(e) => updateInputs({weight: Number(e.target.value)})}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="height" className="flex items-center gap-2">
							<Ruler className="h-4 w-4" />
							Altura (cm)
						</Label>
						<Input
							id="height"
							type="number"
							step="0.1"
							placeholder="Ex: 170"
							value={inputs.height || ""}
							onChange={(e) => updateInputs({height: Number(e.target.value)})}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="age">Idade (anos)</Label>
						<Input
							id="age"
							type="number"
							placeholder="Ex: 30"
							value={inputs.age || ""}
							onChange={(e) => updateInputs({age: Number(e.target.value)})}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="gender">Sexo</Label>
						<Select
							value={inputs.gender}
							onValueChange={(value) => updateInputs({gender: value as "M" | "F"})}>
							<SelectTrigger id="gender">
								<SelectValue placeholder="Selecione" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="M">Masculino</SelectItem>
								<SelectItem value="F">Feminino</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Profile & Activity */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Activity className="h-5 w-5" />
						Perfil e Atividade
					</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="profile">Perfil Corporal</Label>
						<Select
							value={inputs.profile}
							onValueChange={(value) => updateInputs({profile: value as any})}>
							<SelectTrigger id="profile">
								<SelectValue placeholder="Selecione" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="eutrofico">
									<div>
										<div className="font-medium">Eutrófico</div>
										<div className="text-xs text-muted-foreground">
											Harris-Benedict
										</div>
									</div>
								</SelectItem>
								<SelectItem value="sobrepeso_obesidade">
									<div>
										<div className="font-medium">Sobrepeso/Obesidade</div>
										<div className="text-xs text-muted-foreground">
											Mifflin-St Jeor
										</div>
									</div>
								</SelectItem>
								<SelectItem value="atleta">
									<div>
										<div className="font-medium">Atleta</div>
										<div className="text-xs text-muted-foreground">Tinsley</div>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="activityLevel">Nível de Atividade</Label>
						<Select
							value={inputs.activityLevel}
							onValueChange={(value) => updateInputs({activityLevel: value as any})}>
							<SelectTrigger id="activityLevel">
								<SelectValue placeholder="Selecione" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="sedentario">Sedentário (1.2)</SelectItem>
								<SelectItem value="leve">Leve (1.375)</SelectItem>
								<SelectItem value="moderado">Moderado (1.55)</SelectItem>
								<SelectItem value="intenso">Intenso (1.725)</SelectItem>
								<SelectItem value="muito_intenso">Muito Intenso (1.9)</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="objective" className="flex items-center gap-2">
							<Target className="h-4 w-4" />
							Objetivo
						</Label>
						<Select
							value={inputs.objective}
							onValueChange={(value) => updateInputs({objective: value as any})}>
							<SelectTrigger id="objective">
								<SelectValue placeholder="Selecione" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="emagrecimento">
									Emagrecimento (-500 kcal)
								</SelectItem>
								<SelectItem value="manutenção">Manutenção (0 kcal)</SelectItem>
								<SelectItem value="hipertrofia">Hipertrofia (+400 kcal)</SelectItem>
								<SelectItem value="personalizado">Personalizado</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{inputs.objective === "personalizado" && (
						<div className="space-y-2">
							<Label htmlFor="customAdjustment">Ajuste Personalizado (kcal)</Label>
							<Input
								id="customAdjustment"
								type="number"
								placeholder="Ex: -300 ou +200"
								value={inputs.customAdjustment || ""}
								onChange={(e) =>
									updateInputs({customAdjustment: Number(e.target.value)})
								}
							/>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Macros Input (g/kg method) */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Macronutrientes (g/kg)</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="proteinPerKg">Proteína (g/kg)</Label>
						<Input
							id="proteinPerKg"
							type="number"
							step="0.1"
							placeholder="Ex: 1.6"
							value={inputs.macroInputs?.proteinPerKg || ""}
							onChange={(e) =>
								updateMacroInputs({
									proteinPerKg: Number(e.target.value),
									fatPerKg: inputs.macroInputs?.fatPerKg || 1.0,
								})
							}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="fatPerKg">Gordura (g/kg)</Label>
						<Input
							id="fatPerKg"
							type="number"
							step="0.1"
							placeholder="Ex: 1.0"
							value={inputs.macroInputs?.fatPerKg || ""}
							onChange={(e) =>
								updateMacroInputs({
									proteinPerKg: inputs.macroInputs?.proteinPerKg || 1.6,
									fatPerKg: Number(e.target.value),
								})
							}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Validation Errors/Warnings */}
			{!validation.isValid && validation.errors.length > 0 && (
				<div className="p-4 bg-destructive/10 text-destructive rounded-lg">
					<p className="font-semibold mb-2">Erros de Validação:</p>
					<ul className="list-disc list-inside space-y-1">
						{validation.errors.map((err, idx) => (
							<li key={idx} className="text-sm">
								{err}
							</li>
						))}
					</ul>
				</div>
			)}

			{validation.warnings.length > 0 && (
				<div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
					<p className="font-semibold mb-2">Avisos:</p>
					<ul className="list-disc list-inside space-y-1">
						{validation.warnings.map((warn, idx) => (
							<li key={idx} className="text-sm">
								{warn}
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Results Display */}
			{results && (
				<Card className="bg-primary/5 border-primary">
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Calculator className="h-5 w-5" />
								Resultados
							</span>
							<Badge variant="default">Cálculo Oficial</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Energy Values */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="text-center p-4 bg-background rounded-lg">
								<p className="text-sm text-muted-foreground mb-1">TMB</p>
								<p className="text-3xl font-bold text-primary">
									{results.tmb.value}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									{results.tmb.formula}
								</p>
							</div>

							<div className="text-center p-4 bg-background rounded-lg">
								<p className="text-sm text-muted-foreground mb-1">GET</p>
								<p className="text-3xl font-bold text-primary">{results.get}</p>
								<p className="text-xs text-muted-foreground mt-1">kcal/dia</p>
							</div>

							<div className="text-center p-4 bg-background rounded-lg border-2 border-primary">
								<p className="text-sm text-muted-foreground mb-1">VET</p>
								<p className="text-3xl font-bold text-primary">{results.vet}</p>
								<p className="text-xs text-muted-foreground mt-1">kcal/dia</p>
							</div>
						</div>

						{/* Macros */}
						<div>
							<h4 className="font-semibold mb-3">Macronutrientes</h4>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="p-3 bg-background rounded-lg">
									<p className="text-sm font-medium text-blue-600 mb-1">
										Proteína
									</p>
									<p className="text-xl font-bold">
										{results.macros.protein.grams}g
									</p>
									<p className="text-sm text-muted-foreground">
										{results.macros.protein.kcal} kcal (
										{results.macros.protein.percentage}%)
									</p>
									{results.proteinPerKg && (
										<p className="text-xs text-muted-foreground mt-1">
											{results.proteinPerKg.toFixed(1)} g/kg
										</p>
									)}
								</div>

								<div className="p-3 bg-background rounded-lg">
									<p className="text-sm font-medium text-green-600 mb-1">
										Carboidratos
									</p>
									<p className="text-xl font-bold">
										{results.macros.carbs.grams}g
									</p>
									<p className="text-sm text-muted-foreground">
										{results.macros.carbs.kcal} kcal (
										{results.macros.carbs.percentage}%)
									</p>
								</div>

								<div className="p-3 bg-background rounded-lg">
									<p className="text-sm font-medium text-orange-600 mb-1">
										Gordura
									</p>
									<p className="text-xl font-bold">{results.macros.fat.grams}g</p>
									<p className="text-sm text-muted-foreground">
										{results.macros.fat.kcal} kcal (
										{results.macros.fat.percentage}%)
									</p>
									{results.fatPerKg && (
										<p className="text-xs text-muted-foreground mt-1">
											{results.fatPerKg.toFixed(1)} g/kg
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Calculation Steps */}
						<div className="text-xs text-muted-foreground border-t pt-4">
							<p className="font-semibold mb-2">Sequência de Cálculo:</p>
							<ol className="list-decimal list-inside space-y-1">
								{results.calculationOrder.map((step: string, idx: number) => (
									<li key={idx}>{step}</li>
								))}
							</ol>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Submit Button */}
			<Button
				type="submit"
				disabled={!canCalculate() || loading}
				className="w-full"
				size="lg">
				{loading ? (
					<>Calculando...</>
				) : (
					<>
						<Calculator className="mr-2 h-5 w-5" />
						Calcular
					</>
				)}
			</Button>

			{error && (
				<div className="p-4 bg-destructive/10 text-destructive rounded-lg">
					<p className="font-semibold">Erro:</p>
					<p className="text-sm">{error}</p>
				</div>
			)}
		</form>
	);
};
