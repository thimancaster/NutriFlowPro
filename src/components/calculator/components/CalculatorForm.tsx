import React from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Button} from "@/components/ui/button";
import {AlertCircle, Flame} from "lucide-react";
import {Alert, AlertDescription} from "@/components/ui/alert";

export interface CalculatorFormProps {
	weight: number | "";
	height: number | "";
	age: number | "";
	sex: "M" | "F";
	profile: string; // Changed type to string to match any profile value
	isCalculating: boolean;
	onInputChange: (name: string, value: number | "") => void;
	onSexChange: (value: "M" | "F") => void;
	onProfileChange: (value: string) => void;
	onCalculate: () => void;
	patientSelected: boolean;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
	weight,
	height,
	age,
	sex,
	profile,
	isCalculating,
	onInputChange,
	onSexChange,
	onProfileChange,
	onCalculate,
	patientSelected,
}) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value} = e.target;
		onInputChange(name, value === "" ? "" : Number(value));
	};

	return (
		<div className="space-y-6">
			{!patientSelected && (
				<Alert variant="default" className="bg-blue-50 border-blue-200">
					<AlertCircle className="h-4 w-4 text-blue-500" />
					<AlertDescription>
						Selecione um paciente para preencher automaticamente os dados ou cadastre um
						novo.
					</AlertDescription>
				</Alert>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-4">
					<div>
						<Label htmlFor="weight">Peso (kg)</Label>
						<Input
							id="weight"
							name="weight"
							type="number"
							value={weight}
							onChange={handleChange}
							placeholder="Ex: 70"
							className="mt-1"
						/>
					</div>

					<div>
						<Label htmlFor="height">Altura (cm)</Label>
						<Input
							id="height"
							name="height"
							type="number"
							value={height}
							onChange={handleChange}
							placeholder="Ex: 170"
							className="mt-1"
						/>
					</div>

					<div>
						<Label htmlFor="age">Idade</Label>
						<Input
							id="age"
							name="age"
							type="number"
							value={age}
							onChange={handleChange}
							placeholder="Ex: 35"
							className="mt-1"
						/>
					</div>
				</div>

				<div className="space-y-6">
					<div>
						<Label>Sexo</Label>
						<RadioGroup
							value={sex}
							onValueChange={(value) => onSexChange(value as "M" | "F")}
							className="flex space-x-4 mt-1">
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
						<Label>Perfil Corporal</Label>
						<RadioGroup
							value={profile}
							onValueChange={(value) => onProfileChange(value)}
							className="grid grid-cols-1 gap-2 mt-1">
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="magro" id="magro" />
								<Label htmlFor="magro" className="cursor-pointer">
									Eutrófico (Magro)
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="normal" id="normal" />
								<Label htmlFor="normal" className="cursor-pointer">
									Normal (Médio)
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="sobrepeso" id="sobrepeso" />
								<Label htmlFor="sobrepeso" className="cursor-pointer">
									Sobrepeso (Maior)
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="atleta" id="atleta" />
								<Label htmlFor="atleta" className="cursor-pointer">
									Atleta
								</Label>
							</div>
						</RadioGroup>
					</div>
				</div>
			</div>

			<div className="flex justify-end mt-6">
				<Button
					onClick={onCalculate}
					disabled={isCalculating || !weight || !height || !age}
					className="flex items-center gap-2">
					<Flame className="h-4 w-4" />
					Calcular TMB
				</Button>
			</div>
		</div>
	);
};

export default CalculatorForm;
