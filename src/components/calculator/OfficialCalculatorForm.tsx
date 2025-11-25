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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Calculator, Activity, Target, Scale, Ruler, User, Utensils, Dumbbell, Info, AlertTriangle, HelpCircle} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {useToast} from "@/hooks/use-toast";
import SkinfoldForm from "./SkinfoldForm";
import { cn } from "@/lib/utils";

// TMB Formula descriptions for tooltips
const TMB_FORMULA_INFO: Record<string, string> = {
	harris_benedict: "Ideal para adultos saudáveis com peso normal. Fórmula clássica e amplamente validada.",
	mifflin_st_jeor: "Recomendada para pessoas com sobrepeso ou obesidade. Mais precisa que Harris-Benedict nestes casos.",
	tinsley: "Desenvolvida especificamente para atletas e praticantes de musculação com alta massa muscular.",
	katch_mcardle: "Baseada em massa magra. Ideal quando há dados precisos de composição corporal disponíveis.",
	cunningham: "Similar à Katch-McArdle, mas com ajuste para atletas. Requer medição de massa magra.",
	who_fao_unu: "Fórmula da OMS validada internacionalmente. Boa para populações diversas e estudos científicos.",
	penn_state: "Desenvolvida para pacientes hospitalizados, críticos ou com obesidade severa."
};

// Activity level descriptions with practical examples
const ACTIVITY_LEVEL_INFO: Record<string, string> = {
	sedentario: "Sedentário: Pouca ou nenhuma atividade física. Ex: trabalho de escritório sentado, sem exercícios regulares, deslocamento de carro.",
	leve: "Leve: Exercícios leves 1-3x/semana. Ex: caminhadas ocasionais, yoga, pilates, trabalho que exige ficar em pé.",
	moderado: "Moderado: Exercícios moderados 3-5x/semana. Ex: academia regular, corrida 3x/semana, natação, trabalho físico moderado.",
	intenso: "Intenso: Exercícios intensos 6-7x/semana. Ex: treinos diários de musculação, corrida 5x/semana, esportes competitivos.",
	muito_intenso: "Muito Intenso: Exercícios muito intensos 2x/dia ou atletas profissionais. Ex: preparação para competições, crossfit diário, trabalho físico pesado."
};

// Profile descriptions with clinical characteristics
const PROFILE_INFO: Record<string, string> = {
	eutrofico: "Eutrófico: Peso adequado para altura (IMC 18.5-24.9). Composição corporal equilibrada. Usa fórmula Harris-Benedict (padrão ouro para adultos saudáveis).",
	sobrepeso_obesidade: "Sobrepeso/Obesidade: IMC ≥ 25 ou excesso de gordura corporal. Usa Mifflin-St Jeor (mais precisa para este perfil, evita superestimação).",
	atleta: "Atleta: Alta massa muscular e baixo percentual de gordura. Praticantes de musculação/esportes de alta intensidade. Usa Tinsley (considera massa muscular elevada)."
};

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
		getSuggestedActivityFactor,
	} = useOfficialCalculations();

	const {activePatient} = useActivePatient();
	const {toast} = useToast();

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

	// Auto-fill activity factor based on formula, gender and activity level
	useEffect(() => {
		const suggestedFactor = getSuggestedActivityFactor();
		
		// Only auto-fill if:
		// 1. There's a suggested factor
		// 2. User hasn't manually entered a value yet
		if (suggestedFactor && !inputs.manualActivityFactor) {
			console.log(`🎯 [AUTO-FILL] Setting activity factor to ${suggestedFactor} based on formula, gender and activity level`);
			updateInputs({ manualActivityFactor: suggestedFactor });
		}
	}, [
		inputs.manualTmbFormula, 
		inputs.profile, 
		inputs.activityLevel, 
		inputs.gender,
		getSuggestedActivityFactor
		// Note: NOT including inputs.manualActivityFactor to avoid infinite loop
	]);

	// Check if selected formula is incompatible (requires lean body mass)
	const isFormulaIncompatible = 
		(inputs.manualTmbFormula === 'katch_mcardle' || inputs.manualTmbFormula === 'cunningham') 
		&& !inputs.leanBodyMass;

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

			{/* Advanced TMB Options */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Calculator className="h-5 w-5" />
						Opções Avançadas de Cálculo (Opcional)
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Manual TMB Formula Selection */}
					<div className="space-y-2">
						<Label htmlFor="manualTmbFormula" className="flex items-center gap-2">
							<Calculator className="h-4 w-4" />
							Fórmula TMB (Sobrescreve seleção automática)
						</Label>
						<Select
							value={inputs.manualTmbFormula || 'auto'}
							onValueChange={(value) => updateInputs({ 
								manualTmbFormula: value === 'auto' ? undefined : value as any 
							})}>
							<SelectTrigger id="manualTmbFormula">
								<SelectValue placeholder="Automático (baseado no perfil)" />
							</SelectTrigger>
							<SelectContent className="bg-background z-50">
								<SelectItem value="auto">
									<div className="flex items-start gap-2">
										<span>Automático</span>
									</div>
								</SelectItem>
								<TooltipProvider>
									<Tooltip delayDuration={200}>
										<TooltipTrigger asChild>
											<SelectItem value="harris_benedict">
												<div className="flex items-center gap-2">
													<span>Harris-Benedict Revisada</span>
													<Info className="h-3 w-3 text-muted-foreground" />
												</div>
											</SelectItem>
										</TooltipTrigger>
										<TooltipContent side="right" className="max-w-xs">
											<p>{TMB_FORMULA_INFO.harris_benedict}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								<TooltipProvider>
									<Tooltip delayDuration={200}>
										<TooltipTrigger asChild>
											<SelectItem value="mifflin_st_jeor">
												<div className="flex items-center gap-2">
													<span>Mifflin-St Jeor</span>
													<Info className="h-3 w-3 text-muted-foreground" />
												</div>
											</SelectItem>
										</TooltipTrigger>
										<TooltipContent side="right" className="max-w-xs">
											<p>{TMB_FORMULA_INFO.mifflin_st_jeor}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								<TooltipProvider>
									<Tooltip delayDuration={200}>
										<TooltipTrigger asChild>
											<SelectItem value="tinsley">
												<div className="flex items-center gap-2">
													<span>Tinsley (Atletas)</span>
													<Info className="h-3 w-3 text-muted-foreground" />
												</div>
											</SelectItem>
										</TooltipTrigger>
										<TooltipContent side="right" className="max-w-xs">
											<p>{TMB_FORMULA_INFO.tinsley}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								<TooltipProvider>
									<Tooltip delayDuration={200}>
										<TooltipTrigger asChild>
											<SelectItem value="katch_mcardle">
												<div className="flex items-center gap-2">
													<span>Katch-McArdle (requer MM)</span>
													<Info className="h-3 w-3 text-muted-foreground" />
												</div>
											</SelectItem>
										</TooltipTrigger>
										<TooltipContent side="right" className="max-w-xs">
											<p>{TMB_FORMULA_INFO.katch_mcardle}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								<TooltipProvider>
									<Tooltip delayDuration={200}>
										<TooltipTrigger asChild>
											<SelectItem value="cunningham">
												<div className="flex items-center gap-2">
													<span>Cunningham (requer MM)</span>
													<Info className="h-3 w-3 text-muted-foreground" />
												</div>
											</SelectItem>
										</TooltipTrigger>
										<TooltipContent side="right" className="max-w-xs">
											<p>{TMB_FORMULA_INFO.cunningham}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								<TooltipProvider>
									<Tooltip delayDuration={200}>
										<TooltipTrigger asChild>
											<SelectItem value="who_fao_unu">
												<div className="flex items-center gap-2">
													<span>OMS/FAO/UNU</span>
													<Info className="h-3 w-3 text-muted-foreground" />
												</div>
											</SelectItem>
										</TooltipTrigger>
										<TooltipContent side="right" className="max-w-xs">
											<p>{TMB_FORMULA_INFO.who_fao_unu}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								<TooltipProvider>
									<Tooltip delayDuration={200}>
										<TooltipTrigger asChild>
											<SelectItem value="penn_state">
												<div className="flex items-center gap-2">
													<span>Penn State</span>
													<Info className="h-3 w-3 text-muted-foreground" />
												</div>
											</SelectItem>
										</TooltipTrigger>
										<TooltipContent side="right" className="max-w-xs">
											<p>{TMB_FORMULA_INFO.penn_state}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</SelectContent>
						</Select>
						<p className="text-xs text-muted-foreground">
							💡 Se não selecionado, o sistema escolherá automaticamente baseado no perfil corporal
						</p>
					</div>

					{/* Lean Body Mass Input - Conditional */}
					{(inputs.manualTmbFormula === 'katch_mcardle' || 
					  inputs.manualTmbFormula === 'cunningham') && (
						<div className="space-y-2">
							<Label htmlFor="leanBodyMass" className="flex items-center gap-2 text-orange-600">
								<Dumbbell className="h-4 w-4" />
								Massa Magra (kg) - Obrigatório para esta fórmula
							</Label>
							<Input
								id="leanBodyMass"
								type="number"
								step="0.1"
								placeholder="Ex: 65.5"
								value={inputs.leanBodyMass || ''}
								onChange={(e) => updateInputs({ 
									leanBodyMass: e.target.value ? Number(e.target.value) : undefined 
								})}
							/>
							<div className="flex items-center justify-between gap-2">
								<p className="text-xs text-muted-foreground">
									💡 Use a calculadora de composição corporal para obter este valor
								</p>
								<Dialog>
									<DialogTrigger asChild>
										<Button type="button" variant="outline" size="sm">
											<Calculator className="h-4 w-4 mr-2" />
											Calcular MM
										</Button>
									</DialogTrigger>
									<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
										<DialogHeader>
											<DialogTitle>Calculadora de Composição Corporal</DialogTitle>
										</DialogHeader>
										<SkinfoldForm
											weight={inputs.weight || 0}
											age={inputs.age || 0}
											gender={inputs.gender || 'M'}
											onLeanMassCalculated={(leanMass) => {
												updateInputs({ leanBodyMass: leanMass });
												toast({
													title: "Massa Magra Calculada",
													description: `${leanMass.toFixed(1)} kg foi preenchido automaticamente`,
												});
											}}
										/>
									</DialogContent>
								</Dialog>
							</div>
						</div>
					)}
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
								<TooltipProvider>
									<Tooltip delayDuration={300}>
										<TooltipTrigger asChild>
											<SelectItem value="eutrofico">
												<div className="flex items-center justify-between w-full">
													<div className="flex flex-col">
														<span className="font-medium">Eutrófico</span>
														<span className="text-xs text-muted-foreground">Harris-Benedict</span>
													</div>
													<Info className="h-3 w-3 text-muted-foreground ml-2 shrink-0" />
												</div>
											</SelectItem>
										</TooltipTrigger>
										<TooltipContent side="right" className="max-w-xs z-[60]">
											<p className="text-sm">{PROFILE_INFO.eutrofico}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								
								<TooltipProvider>
									<Tooltip delayDuration={300}>
										<TooltipTrigger asChild>
											<SelectItem value="sobrepeso_obesidade">
												<div className="flex items-center justify-between w-full">
													<div className="flex flex-col">
														<span className="font-medium">Sobrepeso/Obesidade</span>
														<span className="text-xs text-muted-foreground">Mifflin-St Jeor</span>
													</div>
													<Info className="h-3 w-3 text-muted-foreground ml-2 shrink-0" />
												</div>
											</SelectItem>
										</TooltipTrigger>
										<TooltipContent side="right" className="max-w-xs z-[60]">
											<p className="text-sm">{PROFILE_INFO.sobrepeso_obesidade}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								
								<TooltipProvider>
									<Tooltip delayDuration={300}>
										<TooltipTrigger asChild>
											<SelectItem value="atleta">
												<div className="flex items-center justify-between w-full">
													<div className="flex flex-col">
														<span className="font-medium">Atleta</span>
														<span className="text-xs text-muted-foreground">Tinsley</span>
													</div>
													<Info className="h-3 w-3 text-muted-foreground ml-2 shrink-0" />
												</div>
											</SelectItem>
										</TooltipTrigger>
										<TooltipContent side="right" className="max-w-xs z-[60]">
											<p className="text-sm">{PROFILE_INFO.atleta}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</SelectContent>
						</Select>

						{/* Incompatible Formula Alert */}
						{isFormulaIncompatible && (
							<div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg mt-2">
								<AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" />
								<span className="text-sm text-orange-700 dark:text-orange-300">
									<strong>Atenção:</strong> A fórmula {inputs.manualTmbFormula === 'katch_mcardle' ? 'Katch-McArdle' : 'Cunningham'} requer a Massa Magra (MM) para calcular corretamente. Preencha o campo abaixo ou use o botão "Calcular MM".
								</span>
							</div>
						)}
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
							<TooltipProvider>
								<Tooltip delayDuration={300}>
									<TooltipTrigger asChild>
										<SelectItem value="sedentario">
											<div className="flex items-center gap-2">
												Sedentário (1.2)
												<Info className="h-3 w-3 text-muted-foreground" />
											</div>
										</SelectItem>
									</TooltipTrigger>
									<TooltipContent side="right" className="max-w-xs">
										<p className="text-sm">{ACTIVITY_LEVEL_INFO.sedentario}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							
							<TooltipProvider>
								<Tooltip delayDuration={300}>
									<TooltipTrigger asChild>
										<SelectItem value="leve">
											<div className="flex items-center gap-2">
												Leve (1.375)
												<Info className="h-3 w-3 text-muted-foreground" />
											</div>
										</SelectItem>
									</TooltipTrigger>
									<TooltipContent side="right" className="max-w-xs">
										<p className="text-sm">{ACTIVITY_LEVEL_INFO.leve}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							
							<TooltipProvider>
								<Tooltip delayDuration={300}>
									<TooltipTrigger asChild>
										<SelectItem value="moderado">
											<div className="flex items-center gap-2">
												Moderado (1.55)
												<Info className="h-3 w-3 text-muted-foreground" />
											</div>
										</SelectItem>
									</TooltipTrigger>
									<TooltipContent side="right" className="max-w-xs">
										<p className="text-sm">{ACTIVITY_LEVEL_INFO.moderado}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							
							<TooltipProvider>
								<Tooltip delayDuration={300}>
									<TooltipTrigger asChild>
										<SelectItem value="intenso">
											<div className="flex items-center gap-2">
												Intenso (1.725)
												<Info className="h-3 w-3 text-muted-foreground" />
											</div>
										</SelectItem>
									</TooltipTrigger>
									<TooltipContent side="right" className="max-w-xs">
										<p className="text-sm">{ACTIVITY_LEVEL_INFO.intenso}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							
							<TooltipProvider>
								<Tooltip delayDuration={300}>
									<TooltipTrigger asChild>
										<SelectItem value="muito_intenso">
											<div className="flex items-center gap-2">
												Muito Intenso (1.9)
												<Info className="h-3 w-3 text-muted-foreground" />
											</div>
										</SelectItem>
									</TooltipTrigger>
									<TooltipContent side="right" className="max-w-xs">
										<p className="text-sm">{ACTIVITY_LEVEL_INFO.muito_intenso}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</SelectContent>
						</Select>
					</div>

				<div className="space-y-2">
					<Label htmlFor="manualActivityFactor" className="flex items-center gap-2">
						<Activity className="h-4 w-4" />
						Fator de Atividade Manual
						
						{/* Helper Modal */}
						<Dialog>
							<DialogTrigger asChild>
								<button 
									type="button" 
									className="inline-flex items-center justify-center h-5 w-5 rounded-full hover:bg-muted transition-colors"
								>
									<HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
								</button>
							</DialogTrigger>
							<DialogContent className="max-w-lg">
								<DialogHeader>
									<DialogTitle>📊 Entendendo o Fator de Atividade</DialogTitle>
								</DialogHeader>
								<div className="space-y-4 text-sm">
									<div>
										<h4 className="font-semibold text-primary mb-1">O que é?</h4>
										<p className="text-muted-foreground">
											O Fator de Atividade (FA) é um multiplicador aplicado à Taxa Metabólica Basal (TMB) 
											para estimar o Gasto Energético Total (GET) do paciente.
										</p>
									</div>
									
									<div>
										<h4 className="font-semibold text-primary mb-1">🤖 Auto-preenchimento</h4>
										<p className="text-muted-foreground">
											O sistema preenche automaticamente baseado na <strong>fórmula TMB selecionada</strong>, 
											<strong> sexo</strong> e <strong>nível de atividade</strong>. Cada fórmula tem fatores 
											específicos validados na literatura científica.
										</p>
									</div>
									
									<div>
										<h4 className="font-semibold text-primary mb-1">✏️ Quando editar manualmente?</h4>
										<ul className="text-muted-foreground list-disc list-inside space-y-1">
											<li>Paciente com condições especiais (gestantes, idosos, doenças)</li>
											<li>Atividade física não convencional (trabalho braçal intenso)</li>
											<li>Ajuste fino baseado em resultados anteriores</li>
											<li>Protocolos específicos da sua prática clínica</li>
										</ul>
									</div>
									
									<div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
										<p className="text-blue-700 dark:text-blue-300 text-xs">
											💡 <strong>Dica:</strong> Mesmo editando manualmente, o valor permanece vinculado 
											ao cálculo. Você pode redefinir limpando o campo e alterando o nível de atividade.
										</p>
									</div>
								</div>
							</DialogContent>
						</Dialog>
						
						{inputs.manualActivityFactor && getSuggestedActivityFactor() === inputs.manualActivityFactor && (
							<Badge variant="secondary" className="text-xs">
								Auto-preenchido
							</Badge>
						)}
					</Label>
					<Input
						id="manualActivityFactor"
						type="number"
						step="0.01"
						min="1.0"
						max="2.5"
						placeholder="Ex: 1.65"
						value={inputs.manualActivityFactor || ""}
						onChange={(e) =>
							updateInputs({
								manualActivityFactor: e.target.value ? Number(e.target.value) : undefined
							})
						}
					/>
					<p className="text-xs text-muted-foreground">
						💡 Valor auto-preenchido baseado na fórmula TMB, sexo e nível de atividade (editável)
						{inputs.manualActivityFactor && (
							<span className="block text-primary mt-1">
								✓ Fator atual: {inputs.manualActivityFactor}
							</span>
						)}
					</p>
				</div>

				{/* Superávit/Déficit Calórico - Always Visible */}
				<div className="space-y-2">
					<Label htmlFor="customAdjustmentAlways" className="flex items-center gap-2">
						<Target className="h-4 w-4" />
						Superávit/Déficit Calórico (kcal)
					</Label>
					<Input
						id="customAdjustmentAlways"
						type="number"
						placeholder="Ex: +400 ou -500"
						value={inputs.customAdjustment || ''}
						onChange={(e) => updateInputs({
							customAdjustment: e.target.value ? Number(e.target.value) : undefined
						})}
					/>
					<p className="text-xs text-muted-foreground">
						⚠️ Ajuste personalizado ao GET. Use + para superávit (hipertrofia) ou - para déficit (emagrecimento)
					</p>
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

		{/* Submit Button - Changes based on results */}
		{!results ? (
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
		) : (
			<div className="space-y-3">
				<Button
					type="submit"
					disabled={loading}
					variant="outline"
					className="w-full"
					size="lg">
					{loading ? (
						<>Calculando...</>
					) : (
						<>
							<Calculator className="mr-2 h-5 w-5" />
							Recalcular
						</>
					)}
				</Button>
			<Button
				type="button"
				variant="default"
				className="w-full"
				size="lg"
				onClick={async () => {
					if (!results || !activePatient) {
						toast({
							title: "Erro",
							description: "Complete o cálculo e selecione um paciente primeiro.",
							variant: "destructive"
						});
						return;
					}

					try {
						// Sanity check: ensure macros are numbers
						const macros = {
							protein: results.macros.protein.grams,
							carbs: results.macros.carbs.grams,
							fat: results.macros.fat.grams,
						};
						
						console.log('[CALCULATOR] Sending macros to parent:', macros, {
							types: {
								protein: typeof macros.protein,
								carbs: typeof macros.carbs,
								fat: typeof macros.fat
							}
						});
						
						// Notify parent if callback exists
						if (onCalculationComplete) {
							await onCalculationComplete({
								tmb: results.tmb.value,
								get: results.get,
								vet: results.vet,
								weight: inputs.weight || 0,
								height: inputs.height || 0,
								age: inputs.age || 0,
								macros
							});
						}

						toast({
							title: "✅ Cálculos Salvos",
							description: "Avançando para o plano alimentar...",
						});

						// Navigate to meal plan (if in clinical flow, parent handles it)
						// If standalone, we can add navigation here
					} catch (error) {
						console.error("Error advancing to meal plan:", error);
						toast({
							title: "❌ Erro",
							description: "Não foi possível avançar para o plano alimentar.",
							variant: "destructive"
						});
					}
				}}>
				<Utensils className="mr-2 h-5 w-5" />
				Gerar Plano Alimentar
			</Button>
			</div>
		)}

			{error && (
				<div className="p-4 bg-destructive/10 text-destructive rounded-lg">
					<p className="font-semibold">Erro:</p>
					<p className="text-sm">{error}</p>
				</div>
			)}
		</form>
	);
};
