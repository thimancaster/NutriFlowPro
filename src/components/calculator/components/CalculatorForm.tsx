import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Profile} from "@/types/consultation";
import {GERFormula} from "@/types/gerFormulas";
import {Calculator, User, Activity} from "lucide-react";
import GERFormulaSelection from "../inputs/GERFormulaSelection";

interface CalculatorFormProps {
	weight: number;
	height: number;
	age: number;
	sex: "M" | "F";
	profile: Profile;
	gerFormula?: GERFormula;
	bodyFatPercentage?: number;
	isCalculating: boolean;
	onInputChange: (field: string, value: any) => void;
	onSexChange: (sex: "M" | "F") => void;
	onProfileChange: (profile: Profile) => void;
	onGERFormulaChange: (formula: GERFormula) => void;
	onCalculate: () => void;
	patientSelected: boolean;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({
	weight,
	height,
	age,
	sex,
	profile,
	gerFormula,
	bodyFatPercentage,
	isCalculating,
	onInputChange,
	onSexChange,
	onProfileChange,
	onGERFormulaChange,
	onCalculate,
	patientSelected,
}) => {
	// Verificar se todos os campos obrigatórios estão preenchidos
	const isFormValid = weight && height && age && gerFormula;

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Dados Antropométricos
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<Label htmlFor="weight">Peso (kg) *</Label>
							<Input
								id="weight"
								type="number"
								value={weight || ""}
								onChange={(e) =>
									onInputChange("weight", parseFloat(e.target.value) || 0)
								}
								placeholder="Ex: 70"
								min="20"
								max="300"
								step="0.1"
								required
							/>
						</div>

						<div>
							<Label htmlFor="height">Altura (cm) *</Label>
							<Input
								id="height"
								type="number"
								value={height || ""}
								onChange={(e) =>
									onInputChange("height", parseFloat(e.target.value) || 0)
								}
								placeholder="Ex: 170"
								min="100"
								max="250"
								step="0.1"
								required
							/>
						</div>

						<div>
							<Label htmlFor="age">Idade (anos) *</Label>
							<Input
								id="age"
								type="number"
								value={age || ""}
								onChange={(e) =>
									onInputChange("age", parseInt(e.target.value) || 0)
								}
								placeholder="Ex: 30"
								min="1"
								max="120"
								required
							/>
						</div>
					</div>

					<div>
						<Label>Sexo *</Label>
						<RadioGroup
							value={sex}
							onValueChange={(value) => onSexChange(value as "M" | "F")}
							className="flex flex-row space-x-6 mt-2">
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="M" id="male" />
								<Label htmlFor="male" className="cursor-pointer">
									Masculino
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="F" id="female" />
								<Label htmlFor="female" className="cursor-pointer">
									Feminino
								</Label>
							</div>
						</RadioGroup>
					</div>

					<div>
						<Label htmlFor="profile">Perfil Corporal *</Label>
						<Select
							value={profile}
							onValueChange={(value) => onProfileChange(value as Profile)}>
							<SelectTrigger>
								<SelectValue placeholder="Selecione o perfil" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="eutrofico">Eutrófico (peso normal)</SelectItem>
								<SelectItem value="sobrepeso_obesidade">
									Sobrepeso/Obesidade
								</SelectItem>
								<SelectItem value="atleta">Atleta/Musculoso</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-xs text-gray-500 mt-1">
							O perfil determina a recomendação da fórmula GER ideal
						</p>
					</div>

					{/* Campo opcional para % de gordura corporal */}
					<div>
						<Label htmlFor="bodyFat">Percentual de Gordura Corporal (%)</Label>
						<Input
							id="bodyFat"
							type="number"
							value={bodyFatPercentage || ""}
							onChange={(e) =>
								onInputChange(
									"bodyFatPercentage",
									parseFloat(e.target.value) || undefined
								)
							}
							placeholder="Ex: 15"
							min="3"
							max="50"
							step="0.1"
						/>
						<p className="text-xs text-gray-500 mt-1">
							Opcional - necessário para fórmulas Katch-McArdle e Cunningham
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Seleção obrigatória da fórmula GER */}
			<GERFormulaSelection
				selectedFormula={gerFormula}
				onFormulaChange={onGERFormulaChange}
				profile={profile}
				hasBodyFat={!!bodyFatPercentage}
				required={true}
				age={age}
				weight={weight}
				height={height}
			/>

			<div className="flex justify-center">
				<Button
					onClick={onCalculate}
					disabled={isCalculating || !isFormValid}
					size="lg"
					className="w-full max-w-md">
					{isCalculating ? (
						<>
							<Calculator className="mr-2 h-4 w-4 animate-spin" />
							Calculando...
						</>
					) : (
						<>
							<Calculator className="mr-2 h-4 w-4" />
							Calcular TMB
						</>
					)}
				</Button>
			</div>

			{!isFormValid && (
				<div className="text-center text-sm text-destructive">
					{!gerFormula && "Selecione uma equação GER para continuar"}
					{gerFormula &&
						(!weight || !height || !age) &&
						"Preencha todos os dados antropométricos obrigatórios"}
				</div>
			)}

			{patientSelected && (
				<div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
					<div className="flex items-center gap-2 text-primary text-sm">
						<Activity className="h-4 w-4" />
						<span className="font-medium">Paciente selecionado</span>
					</div>
					<p className="text-primary/80 text-xs mt-1">
						Os dados foram preenchidos automaticamente. Selecione a equação GER
						apropriada para este paciente.
					</p>
				</div>
			)}
		</div>
	);
};

export default CalculatorForm;
