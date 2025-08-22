import React, { useState, useEffect } from 'react';
import { Patient } from '@/types/patient'; // Import from correct location
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { patientService } from '@/services';

interface MealPlanGeneratorProps {
  onMealPlanGenerated?: (mealPlanId: string) => void;
}

const MealPlanGenerator: React.FC<MealPlanGeneratorProps> = ({
  onMealPlanGenerated
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [totalCalories, setTotalCalories] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPatients = async () => {
      if (user?.id) {
        const result = await patientService.getPatients(user.id);
        if (result.success && result.data) {
          // Ensure patients have the required status property
          const patientsWithStatus = result.data.map(patient => ({
            ...patient,
            status: patient.status || 'active' as 'active' | 'archived'
          }));
          setPatients(patientsWithStatus);
        }
      }
    };

    fetchPatients();
  }, [user?.id]);

  const handleGenerateMealPlan = async () => {
    if (!selectedPatient || !startDate || !totalCalories) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate meal plan generation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate success
      toast({
        title: 'Sucesso',
        description: `Plano alimentar gerado para ${selectedPatient.name} em ${format(startDate, 'dd/MM/yyyy')}.`,
      });

      // Call the callback with a dummy meal plan ID
      onMealPlanGenerated?.('dummy-meal-plan-id');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao gerar plano alimentar.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerador de Plano Alimentar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="patient">Paciente</Label>
          <Select onValueChange={(value) => {
            const patient = patients.find(p => p.id === value);
            setSelectedPatient(patient || null);
          }}>
            <SelectTrigger id="patient">
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
        <div>
          <Label>Data</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PP', { locale: ptBR }) : <span>Selecione a data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                locale={ptBR}
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="calories">Total de Calorias</Label>
          <Input
            type="number"
            id="calories"
            placeholder="Ex: 2000"
            value={totalCalories}
            onChange={(e) => setTotalCalories(e.target.value)}
          />
        </div>
        <Button onClick={handleGenerateMealPlan} disabled={isLoading}>
          {isLoading ? 'Gerando...' : 'Gerar Plano Alimentar'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MealPlanGenerator;
