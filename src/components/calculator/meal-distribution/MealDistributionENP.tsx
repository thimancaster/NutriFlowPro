import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Info, Utensils} from "lucide-react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

interface MealDistributionENPProps {
	vet: number;
	macros: {
		protein: {grams: number; kcal: number};
		carbs: {grams: number; kcal: number};
		fat: {grams: number; kcal: number};
	};
}

interface MealENP {
	id: string;
	name: string;
	time: string;
	percentage: number;
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
	description: string;
}

// Distribuição ENP padrão conforme especificação
const ENP_MEAL_DISTRIBUTION = [
	{
		name: "Café da Manhã",
		time: "07:00",
		percentage: 25,
		description: "Refeição principal matinal",
	},
	{name: "Lanche da Manhã", time: "10:00", percentage: 10, description: "Lanche intermediário"},
	{name: "Almoço", time: "12:30", percentage: 30, description: "Refeição principal do dia"},
	{name: "Lanche da Tarde", time: "15:30", percentage: 10, description: "Lanche intermediário"},
	{name: "Jantar", time: "19:00", percentage: 20, description: "Refeição principal noturna"},
	{name: "Ceia", time: "21:30", percentage: 5, description: "Lanche noturno leve"},
];

export const MealDistributionENP: React.FC<MealDistributionENPProps> = ({vet, macros}) => {
	const calculateMealDistribution = (): MealENP[] => {
		return ENP_MEAL_DISTRIBUTION.map((meal, index) => ({
			id: `meal-${index + 1}`,
			name: meal.name,
			time: meal.time,
			percentage: meal.percentage,
			calories: Math.round(vet * (meal.percentage / 100)),
			protein: Math.round(macros.protein.grams * (meal.percentage / 100)),
			carbs: Math.round(macros.carbs.grams * (meal.percentage / 100)),
			fat: Math.round(macros.fat.grams * (meal.percentage / 100)),
			description: meal.description,
		}));
	};

	const meals = calculateMealDistribution();
	const totalPercentage = ENP_MEAL_DISTRIBUTION.reduce((sum, meal) => sum + meal.percentage, 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center">
					<Utensils className="h-5 w-5 mr-2" />
					Distribuição de Refeições ENP
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<Info className="h-4 w-4 ml-2 text-blue-500" />
							</TooltipTrigger>
							<TooltipContent>
								<p className="max-w-xs">
									Distribuição padrão ENP:
									<br />
									Café 25% | Lanche M 10% | Almoço 30%
									<br />
									Lanche T 10% | Jantar 20% | Ceia 5%
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Resumo Total */}
				<div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
					<div className="flex justify-between items-center">
						<div>
							<h3 className="font-medium text-gray-900">Total Distribuído</h3>
							<p className="text-sm text-gray-600">{totalPercentage}% do VET</p>
						</div>
						<div className="text-right">
							<div className="text-2xl font-bold text-blue-600">{vet} kcal</div>
							<div className="text-sm text-gray-600">
								P: {macros.protein.grams}g | C: {macros.carbs.grams}g | G:{" "}
								{macros.fat.grams}g
							</div>
						</div>
					</div>
				</div>

				{/* Lista de Refeições */}
				<div className="grid gap-3">
					{meals.map((meal) => (
						<div
							key={meal.id}
							className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
							<div className="flex justify-between items-start mb-2">
								<div>
									<h4 className="font-medium text-gray-900">{meal.name}</h4>
									<p className="text-sm text-gray-600">
										{meal.time} • {meal.description}
									</p>
								</div>
								<Badge variant="outline" className="text-blue-600 border-blue-200">
									{meal.percentage}%
								</Badge>
							</div>

							<div className="grid grid-cols-4 gap-4 text-sm">
								<div className="text-center">
									<div className="font-medium text-gray-900">{meal.calories}</div>
									<div className="text-gray-500">kcal</div>
								</div>
								<div className="text-center">
									<div className="font-medium text-gray-900">{meal.protein}g</div>
									<div className="text-gray-500">Proteína</div>
								</div>
								<div className="text-center">
									<div className="font-medium text-gray-900">{meal.carbs}g</div>
									<div className="text-gray-500">Carboidratos</div>
								</div>
								<div className="text-center">
									<div className="font-medium text-gray-900">{meal.fat}g</div>
									<div className="text-gray-500">Gorduras</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Nota ENP */}
				<div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
					<strong>Padrão ENP:</strong> Distribuição baseada em estudos de cronobiologia
					nutricional. Café da manhã e almoço concentram maior aporte calórico para
					otimizar metabolismo diurno.
				</div>
			</CardContent>
		</Card>
	);
};
