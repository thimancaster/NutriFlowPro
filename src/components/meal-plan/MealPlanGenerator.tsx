import React, {useState, useEffect} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Calendar} from 'lucide-react';
import {Calendar as CalendarDate} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {cn} from '@/lib/utils';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';
import {useToast} from '@/hooks/use-toast';
import {PatientService} from '@/services/patient';
import {useAuth} from '@/contexts/auth/AuthContext';
import {MealPlanService} from '@/services/mealPlanService';
import {ConsolidatedMealPlan, MealPlanGenerationParams} from '@/types/mealPlan';
import {MacroTargets} from '@/types/mealPlan';
import {useNavigate} from 'react-router-dom';

const MealPlanGenerator: React.FC = () => {
	const [patients, setPatients] = useState<any[]>([]);
	const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
	const [planDate, setPlanDate] = useState<Date | undefined>(new Date());
	const [nutritionalTargets, setNutritionalTargets] = useState<MacroTargets>({
		calories: 2000,
		protein: 100,
		carbs: 250,
		fats: 70,
	});
	const [isLoading, setIsLoading] = useState(false);
	const {toast} = useToast();
	const {user} = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchPatients = async () => {
			if (user) {
				try {
					const fetchedPatients = await PatientService.getPatients(user.id);
					setPatients(fetchedPatients);
				} catch (error) {
					console.error('Erro ao buscar pacientes:', error);
					toast({
						title: 'Erro',
						description: 'Falha ao carregar a lista de pacientes.',
						variant: 'destructive',
					});
				}
			}
		};

		fetchPatients();
	}, [user, toast]);

	const handleGenerateMealPlan = async () => {
		if (!selectedPatient) {
			toast({
				title: 'Atenção',
				description: 'Selecione um paciente para gerar o plano alimentar.',
				variant: 'warning',
			});
			return;
		}

		if (!planDate) {
			toast({
				title: 'Atenção',
				description: 'Selecione uma data para o plano alimentar.',
				variant: 'warning',
			});
			return;
		}

		setIsLoading(true);

		try {
			if (!user?.id) {
				toast({
					title: 'Erro',
					description: 'Usuário não autenticado.',
					variant: 'destructive',
				});
				return;
			}

			const generationParams: MealPlanGenerationParams = {
				userId: user.id,
				patientId: selectedPatient.id,
				totalCalories: nutritionalTargets.calories,
				totalProtein: nutritionalTargets.protein,
				totalCarbs: nutritionalTargets.carbs,
				totalFats: nutritionalTargets.fats,
				date: planDate,
			};

			const result = await MealPlanService.generateMealPlan(generationParams);

			if (result.success && result.data) {
				toast({
					title: 'Sucesso',
					description: 'Plano alimentar gerado com sucesso!',
				});

				// Redirecionar para a página de visualização do plano alimentar
				navigate(`/meal-plan-editor/${result.data.id}`);
			} else {
				throw new Error(result.error || 'Falha ao gerar o plano alimentar.');
			}
		} catch (error: any) {
			console.error('Erro ao gerar plano alimentar:', error);
			toast({
				title: 'Erro',
				description: error.message || 'Erro ao gerar o plano alimentar.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container mx-auto p-6 space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Gerador de Plano Alimentar</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Select Patient */}
					<div>
						<Label htmlFor="patient">Paciente</Label>
						<Select
							onValueChange={(value) => {
								const patient = patients.find((p) => p.id === value);
								setSelectedPatient(patient);
							}}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Selecione um paciente" />
							</SelectTrigger>
							<SelectContent>
								{patients.map((patient) => (
									<SelectItem key={patient.id} value={patient.id}>
										{patient.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Date Picker */}
					<div>
						<Label>Data do Plano</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={'outline'}
									className={cn(
										'w-full justify-start text-left font-normal',
										!planDate && 'text-muted-foreground'
									)}
								>
									<Calendar className="mr-2 h-4 w-4" />
									{planDate ? format(planDate, 'dd/MM/yyyy', {locale: ptBR}) : <span>Selecione a data</span>}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="center" side="bottom">
								<CalendarDate
									mode="single"
									selected={planDate}
									onSelect={setPlanDate}
									disabled={(date) => date > new Date() /* Prevents choosing future dates */}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>

					{/* Nutritional Targets */}
					<div>
						<Label>Meta de Calorias (kcal)</Label>
						<Input
							type="number"
							value={nutritionalTargets.calories}
							onChange={(e) =>
								setNutritionalTargets({...nutritionalTargets, calories: Number(e.target.value)})
							}
						/>
					</div>
					<div>
						<Label>Meta de Proteínas (g)</Label>
						<Input
							type="number"
							value={nutritionalTargets.protein}
							onChange={(e) =>
								setNutritionalTargets({...nutritionalTargets, protein: Number(e.target.value)})
							}
						/>
					</div>
					<div>
						<Label>Meta de Carboidratos (g)</Label>
						<Input
							type="number"
							value={nutritionalTargets.carbs}
							onChange={(e) =>
								setNutritionalTargets({...nutritionalTargets, carbs: Number(e.target.value)})
							}
						/>
					</div>
					<div>
						<Label>Meta de Gorduras (g)</Label>
						<Input
							type="number"
							value={nutritionalTargets.fats}
							onChange={(e) =>
								setNutritionalTargets({...nutritionalTargets, fats: Number(e.target.value)})
							}
						/>
					</div>

					{/* Generate Button */}
					<Button onClick={handleGenerateMealPlan} disabled={isLoading}>
						{isLoading ? 'Gerando...' : 'Gerar Plano Alimentar'}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};

export default MealPlanGenerator;
