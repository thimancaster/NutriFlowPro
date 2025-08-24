import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {ActivityLevel, Objective, Profile} from "@/types/consultation";
import {Info} from "lucide-react";

interface ENPDataInputsProps {
	weight: string;
	setWeight: (value: string) => void;
	height: string;
	setHeight: (value: string) => void;
	age: string;
	setAge: (value: string) => void;
	sex: "M" | "F";
	setSex: (value: "M" | "F") => void;
	activityLevel: ActivityLevel;
	setActivityLevel: (value: ActivityLevel) => void;
	objective: Objective;
	setObjective: (value: Objective) => void;
	profile: Profile;
	setProfile: (value: Profile) => void;
	bodyFatPercentage: string;
	setBodyFatPercentage: (value: string) => void;
}

export const ENPDataInputs: React.FC<ENPDataInputsProps> = ({
	weight,
	setWeight,
	height,
	setHeight,
	age,
	setAge,
	sex,
	setSex,
	activityLevel,
	setActivityLevel,
	objective,
	setObjective,
	profile,
	setProfile,
	bodyFatPercentage,
	setBodyFatPercentage,
}) => {
	// Opções de nível de atividade conforme ENP Seção 3.2
	const activityOptions = [
		{
			value: "sedentario",
			label: "Sedentário",
			description: "Pouco ou nenhum exercício (FA = 1.2)",
		},
		{
			value: "leve",
			label: "Levemente Ativo",
			description: "Exercício leve 1-3 dias/semana (FA = 1.375)",
		},
		{
			value: "moderado",
			label: "Moderadamente Ativo",
			description: "Exercício moderado 3-5 dias/semana (FA = 1.55)",
		},
		{
			value: "intenso",
			label: "Muito Ativo",
			description: "Exercício intenso 6-7 dias/semana (FA = 1.725)",
		},
		{
			value: "muito_intenso",
			label: "Extremamente Ativo",
			description: "Exercício muito intenso, trabalho físico (FA = 1.9)",
		},
	];

	// Opções de objetivo conforme ENP Seção 3.3
	const objectiveOptions = [
		{value: "manutenção", label: "Manter Peso", description: "GET = GEA (sem ajuste calórico)"},
		{value: "emagrecimento", label: "Perder Peso", description: "GET = GEA - 500 kcal"},
		{value: "hipertrofia", label: "Ganhar Peso/Massa", description: "GET = GEA + 400 kcal"},
		{
			value: "personalizado",
			label: "Personalizado",
			description: "Ajuste manual pelo nutricionista",
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center">
					Dados do Paciente (ENP)
					<div className="relative group ml-2">
						<Info className="h-4 w-4 text-blue-500 cursor-help" />
						<div className="absolute left-0 top-6 hidden group-hover:block z-50 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap max-w-xs">
							Campos obrigatórios conforme documento
							<br />
							Engenharia Nutricional Padrão (ENP) Seção 2
						</div>
					</div>
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Dados Antropométricos */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="space-y-2">
						<Label htmlFor="weight">
							Peso (kg) <span className="text-red-500">*</span>
						</Label>
						<Input
							id="weight"
							type="number"
							value={weight}
							onChange={(e) => setWeight(e.target.value)}
							placeholder="Ex: 70"
							min="1"
							max="500"
							step="0.1"
							autoComplete="off"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="height">
							Altura (cm) <span className="text-red-500">*</span>
						</Label>
						<Input
							id="height"
							type="number"
							value={height}
							onChange={(e) => setHeight(e.target.value)}
							placeholder="Ex: 175"
							min="1"
							max="250"
							step="0.1"
							autoComplete="off"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="age">
							Idade (anos) <span className="text-red-500">*</span>
						</Label>
						<Input
							id="age"
							type="number"
							value={age}
							onChange={(e) => setAge(e.target.value)}
							placeholder="Ex: 30"
							min="1"
							max="120"
							autoComplete="off"
						/>
					</div>
				</div>

				{/* Sexo */}
				<div className="space-y-3">
					<Label>
						Sexo <span className="text-red-500">*</span>
					</Label>
					<RadioGroup
						value={sex}
						onValueChange={(value) => setSex(value as "M" | "F")}
						className="flex gap-6">
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="M" id="male" />
							<Label htmlFor="male">Masculino</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="F" id="female" />
							<Label htmlFor="female">Feminino</Label>
						</div>
					</RadioGroup>
				</div>

				{/* Profile and Body Fat */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-3">
						<Label htmlFor="profile">
							Perfil Corporal <span className="text-red-500">*</span>
						</Label>
						<Select
							value={profile}
							onValueChange={(value) => setProfile(value as Profile)}>
							<SelectTrigger id="profile">
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
						<p className="text-xs text-muted-foreground">
							O perfil ajuda a recomendar a equação GER ideal.
						</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="bodyFat">Gordura Corporal (%)</Label>
						<Input
							id="bodyFat"
							type="number"
							value={bodyFatPercentage}
							onChange={(e) => setBodyFatPercentage(e.target.value)}
							placeholder="Ex: 15"
							min="3"
							max="50"
							step="0.1"
							autoComplete="off"
						/>
						<p className="text-xs text-muted-foreground">
							Necessário para fórmulas como Katch-McArdle.
						</p>
					</div>
				</div>

				{/* Nível de Atividade Física */}
				<div className="space-y-3">
					<Label>
						Nível de Atividade Física <span className="text-red-500">*</span>
					</Label>
					<Select
						value={activityLevel}
						onValueChange={(value) => setActivityLevel(value as ActivityLevel)}>
						<SelectTrigger>
							<SelectValue placeholder="Selecione o nível de atividade" />
						</SelectTrigger>
						<SelectContent>
							{activityOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									<div>
										<div className="font-medium">{option.label}</div>
										<div className="text-sm text-muted-foreground">
											{option.description}
										</div>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Objetivo */}
				<div className="space-y-3">
					<Label>
						Objetivo Principal <span className="text-red-500">*</span>
					</Label>
					<Select
						value={objective}
						onValueChange={(value) => setObjective(value as Objective)}>
						<SelectTrigger>
							<SelectValue placeholder="Selecione o objetivo" />
						</SelectTrigger>
						<SelectContent>
							{objectiveOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									<div>
										<div className="font-medium">{option.label}</div>
										<div className="text-sm text-muted-foreground">
											{option.description}
										</div>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="text-xs text-muted-foreground">
					<span className="text-red-500">*</span> Campos obrigatórios
				</div>
			</CardContent>
		</Card>
	);
};
