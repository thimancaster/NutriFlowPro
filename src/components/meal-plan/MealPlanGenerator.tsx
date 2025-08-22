
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Utensils, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';
import { PatientService } from '@/services';
import { MealPlanService } from '@/services/mealPlanService';

interface MealPlanGeneratorProps {
  patientId: string;
  onMealPlanGenerated: (mealPlanId: string) => void;
}

interface MealSettings {
  numMeals: string;
  totalCalories: string;
  dietType: string;
  restrictions: string;
}

const MealPlanGenerator: React.FC<MealPlanGeneratorProps> = ({ patientId, onMealPlanGenerated }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [mealSettings, setMealSettings] = useState<MealSettings>({
    numMeals: '3',
    totalCalories: '2000',
    dietType: 'balanced',
    restrictions: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPatient = async () => {
      setIsLoading(true);
      try {
        const result = await PatientService.getPatient(patientId);
        if (result.success && result.data) {
          setPatient(result.data);
        } else {
          toast({
            title: 'Erro',
            description: 'Paciente não encontrado.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Falha ao buscar paciente.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMealSettings(prevSettings => ({
      ...prevSettings,
      [name]: value
    }));
  };

  const generateMealPlan = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const generatedMealPlanId = 'meal-plan-123';
      toast({
        title: 'Sucesso',
        description: 'Plano alimentar gerado com sucesso!'
      });
      onMealPlanGenerated(generatedMealPlanId);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao gerar plano alimentar.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
      </div>
    );
  }

  if (!patient) {
    return <div className="text-center">Paciente não encontrado.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerar Plano Alimentar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numMeals">Número de Refeições</Label>
            <Select value={mealSettings.numMeals} onValueChange={(value) => handleInputChange({ target: { name: 'numMeals', value } } as any)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Refeições</SelectItem>
                <SelectItem value="5">5 Refeições</SelectItem>
                <SelectItem value="6">6 Refeições</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="totalCalories">Total de Calorias</Label>
            <Input
              type="number"
              id="totalCalories"
              name="totalCalories"
              value={mealSettings.totalCalories}
              onChange={handleInputChange}
              className="text-sm"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="dietType">Tipo de Dieta</Label>
          <Select value={mealSettings.dietType} onValueChange={(value) => handleInputChange({ target: { name: 'dietType', value } } as any)}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balanced">Balanceada</SelectItem>
              <SelectItem value="low-carb">Low Carb</SelectItem>
              <SelectItem value="vegetarian">Vegetariana</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="restrictions">Restrições Alimentares</Label>
          <Textarea
            id="restrictions"
            name="restrictions"
            value={mealSettings.restrictions}
            onChange={handleInputChange}
            placeholder="Ex: Sem glúten, sem lactose"
            className="text-sm"
          />
        </div>
        <Button onClick={generateMealPlan} className="w-full bg-green-500 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
          Gerar Plano Alimentar
        </Button>
      </CardContent>
    </Card>
  );
};

export default MealPlanGenerator;
