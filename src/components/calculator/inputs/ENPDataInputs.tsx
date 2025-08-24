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
				<CardTitle className="flex items-center gap-2">
					Dados do Paciente
					<div className="relative group">
						<Info className="h-4 w-4 text-primary cursor-help" />
						<div className="absolute left-0 top-6 hidden group-hover:block z-50 bg-popover text-popover-foreground text-xs rounded px-2 py-1 whitespace-nowrap max-w-xs border shadow-md">
							Campos obrigatórios conforme documento
							<br />
							Engenharia Nutricional Padrão (ENP) Seção 2
						</div>
					</div>
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-8">
				{/* Seção 1: Dados Antropométricos Básicos */}
				<div className="space-y-4">
					<div className="flex items-center gap-2 pb-2 border-b">
						<div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
							<span className="text-xs font-medium text-primary">1</span>
						</div>
						<h3 className="font-medium text-foreground">Dados Antropométricos</h3>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<div className="space-y-2">
							<Label htmlFor="weight" className="text-sm font-medium">
								Peso (kg) <span className="text-destructive">*</span>
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
								className="text-center"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="height" className="text-sm font-medium">
								Altura (cm) <span className="text-destructive">*</span>
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
								className="text-center"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="age" className="text-sm font-medium">
								Idade (anos) <span className="text-destructive">*</span>
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
								className="text-center"
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-sm font-medium">
								Sexo <span className="text-destructive">*</span>
							</Label>
							<RadioGroup
								value={sex}
								onValueChange={(value) => setSex(value as "M" | "F")}
								className="flex gap-4 pt-2">
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="M" id="male" />
									<Label htmlFor="male" className="text-sm">
										Masculino
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="F" id="female" />
									<Label htmlFor="female" className="text-sm">
										Feminino
									</Label>
								</div>
							</RadioGroup>
						</div>
					</div>
				</div>

				{/* Seção 2: Perfil e Composição Corporal */}
				<div className="space-y-4">
					<div className="flex items-center gap-2 pb-2 border-b">
						<div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
							<span className="text-xs font-medium text-primary">2</span>
						</div>
						<h3 className="font-medium text-foreground">Perfil Corporal</h3>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-3">
							<Label htmlFor="profile" className="text-sm font-medium">
								Perfil Corporal <span className="text-destructive">*</span>
							</Label>
							<Select
								value={profile}
								onValueChange={(value) => setProfile(value as Profile)}>
								<SelectTrigger id="profile">
									<SelectValue placeholder="Selecione o perfil" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="eutrofico">
										Eutrófico (peso normal)
									</SelectItem>
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
						<div className="space-y-3">
							<Label htmlFor="bodyFat" className="text-sm font-medium">
								Gordura Corporal (%)
								<span className="text-muted-foreground font-normal ml-1">
									- Opcional
								</span>
							</Label>
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
								className="text-center"
							/>
							<p className="text-xs text-muted-foreground">
								Necessário para fórmulas como Katch-McArdle.
							</p>
						</div>
					</div>
				</div>

				{/* Seção 3: Atividade Física e Objetivo */}
				<div className="space-y-4">
					<div className="flex items-center gap-2 pb-2 border-b">
						<div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
							<span className="text-xs font-medium text-primary">3</span>
						</div>
						<h3 className="font-medium text-foreground">Estilo de Vida e Objetivos</h3>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Nível de Atividade Física */}
						<div className="space-y-3">
							<Label className="text-sm font-medium">
								Nível de Atividade Física{" "}
								<span className="text-destructive">*</span>
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
							<Label className="text-sm font-medium">
								Objetivo Principal <span className="text-destructive">*</span>
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
					</div>
				</div>

				{/* Footer com informação sobre campos obrigatórios */}
				<div className="flex items-center justify-center gap-2 pt-4 border-t bg-muted/20 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
					<span className="text-destructive text-lg">*</span>
					<span className="text-sm text-muted-foreground">Campos obrigatórios</span>
				</div>
			</CardContent>
		</Card>
	);
};
