import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Utensils, ArrowLeft } from 'lucide-react';
import MealPlanStep from '@/components/clinical/MealPlanStep';
import { useConsultationData } from '@/contexts/ConsultationDataContext';

/**
 * MealPlanBuilder Page
 * 
 * This page is accessed when a user calculates from the Calculator tab
 * and clicks "Generate Meal Plan". It bypasses the Clinical workflow
 * and goes directly to the meal plan editor.
 */
const MealPlanBuilder: React.FC = () => {
	const { consultationData } = useConsultationData();
	const navigate = useNavigate();

	// Check if we have the required calculation data
	const hasCalculations = consultationData?.results?.vet && consultationData?.results?.macros;

	if (!hasCalculations) {
		return (
			<div className="container mx-auto p-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Utensils className="h-5 w-5" />
							Plano Alimentar
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								É necessário completar os cálculos nutricionais antes de gerar o plano alimentar.
							</AlertDescription>
						</Alert>
						<Button 
							onClick={() => navigate('/calculator')}
							className="w-full"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Voltar para a Calculadora
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			<div className="mb-4">
				<Button 
					variant="outline" 
					onClick={() => navigate('/calculator')}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Voltar para Calculadora
				</Button>
			</div>
			<MealPlanStep />
		</div>
	);
};

export default MealPlanBuilder;
