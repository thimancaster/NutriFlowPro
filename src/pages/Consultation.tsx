import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import PatientHeader from '@/components/Anthropometry/PatientHeader';
import { supabase } from '@/integrations/supabase/client';
import { 
  activityFactors, 
  calculateTMB, 
  calcGET, 
  calculateMacros 
} from '@/utils/nutritionCalculations';

const Consultation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const patientData = location.state?.patientData;
  const repeatConsultation = location.state?.repeatConsultation;
  
  const [patient, setPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    sex: 'M',
    objective: 'manutenção',
    profile: 'magro',
    activityLevel: 'moderado',
  });
  
  const [results, setResults] = useState({
    tmb: 0,
    fa: 1.55, // default moderate
    get: 0,
    macros: { protein: 0, carbs: 0, fat: 0 }
  });

  useEffect(() => {
    const fetchPatient = async () => {
      if (patientData) {
        setPatient(patientData);
        if (patientData.birth_date) {
          const birthDate = new Date(patientData.birth_date);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          setFormData(prev => ({ 
            ...prev, 
            age: age.toString(),
            sex: patientData.gender === 'female' ? 'F' : 'M',
            objective: patientData.goals?.objective || 'manutenção'
          }));
        }
        return;
      }
      
      const urlParams = new URLSearchParams(location.search);
      const patientId = urlParams.get('patientId');
      
      if (patientId) {
        try {
          const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('id', patientId)
            .single();
          
          if (error) throw error;
          
          setPatient(data);
          
          if (data.birth_date) {
            const birthDate = new Date(data.birth_date);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            setFormData(prev => ({ 
              ...prev, 
              age: age.toString(),
              sex: data.gender === 'female' ? 'F' : 'M',
              objective: data.goals?.objective || 'manutenção'
            }));
          }
        } catch (error: any) {
          console.error('Error fetching patient:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do paciente.",
            variant: "destructive"
          });
        }
      }
    };
    
    fetchPatient();
    
    if (repeatConsultation) {
      setFormData(prev => ({
        ...prev,
        weight: repeatConsultation.weight?.toString() || '',
        height: repeatConsultation.height?.toString() || '',
        sex: repeatConsultation.sex || 'M',
        objective: repeatConsultation.objective || 'manutenção',
        profile: repeatConsultation.profile || 'magro',
        activityLevel: repeatConsultation.activityLevel || 'moderado'
      }));
    }
  }, [location, patientData, repeatConsultation, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  useEffect(() => {
    const { weight, height, age, sex, objective, profile, activityLevel } = formData;
    
    if (weight && height && age) {
      try {
        const weightNum = parseFloat(weight);
        const heightNum = parseFloat(height);
        const ageNum = parseInt(age);
        
        const tmb = calculateTMB(
          weightNum,
          heightNum,
          ageNum,
          sex as 'M' | 'F',
          profile as 'magro' | 'obeso' | 'atleta'
        );
        
        const fa = activityFactors[activityLevel as keyof typeof activityFactors];
        
        const get = calcGET(tmb, fa);
        
        const macros = calculateMacros(get, objective);
        
        setResults({
          tmb: Math.round(tmb),
          fa,
          get: Math.round(get),
          macros
        });
      } catch (error) {
        console.error('Error calculating results:', error);
      }
    }
  }, [formData]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const consultationData = {
      ...formData,
      results
    };
    
    console.log('Consultation data:', consultationData);
    
    toast({
      title: "Consulta salva com sucesso",
      description: "Os resultados foram calculados e estão prontos para gerar um plano alimentar.",
    });
    
    if (patient?.id) {
      try {
        // Here you would save the consultation to the database
        // For now, we'll just navigate to the meal plan generator
      } catch (error) {
        console.error('Error saving consultation:', error);
      }
    }
    
    navigate('/meal-plan-generator', { state: { consultation: consultationData, patient } });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-nutri-blue">Nova Consulta</h1>
        
        {patient && (
          <PatientHeader 
            patientName={patient.name}
            patientAge={formData.age ? parseInt(formData.age) : undefined}
            patientGender={patient.gender}
            patientObjective={formData.objective}
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="nutri-card shadow-lg border-none">
              <CardHeader>
                <CardTitle>Dados da Consulta</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)*</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.1"
                      min="30"
                      max="300"
                      value={formData.weight}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)*</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      step="1"
                      min="100"
                      max="250"
                      value={formData.height}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Idade (anos)*</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      step="1"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Sexo*</Label>
                    <RadioGroup 
                      value={formData.sex} 
                      onValueChange={(value) => handleSelectChange('sex', value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="M" id="sex-m" />
                        <Label htmlFor="sex-m">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="F" id="sex-f" />
                        <Label htmlFor="sex-f">Feminino</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="objective">Objetivo*</Label>
                    <Select 
                      value={formData.objective} 
                      onValueChange={(value) => handleSelectChange('objective', value)}
                    >
                      <SelectTrigger id="objective">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                        <SelectItem value="manutenção">Manutenção</SelectItem>
                        <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Perfil*</Label>
                    <RadioGroup 
                      value={formData.profile} 
                      onValueChange={(value) => handleSelectChange('profile', value)}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="magro" id="profile-magro" />
                        <Label htmlFor="profile-magro">Magro</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="obeso" id="profile-obeso" />
                        <Label htmlFor="profile-obeso">Obeso</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="atleta" id="profile-atleta" />
                        <Label htmlFor="profile-atleta">Atleta</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="activityLevel">Nível de Atividade*</Label>
                    <Select 
                      value={formData.activityLevel} 
                      onValueChange={(value) => handleSelectChange('activityLevel', value)}
                    >
                      <SelectTrigger id="activityLevel">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentário">Sedentário</SelectItem>
                        <SelectItem value="moderado">Moderado</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-nutri-green hover:bg-nutri-green-dark"
                    >
                      Gerar Plano Alimentar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card className="nutri-card shadow-lg border-none">
              <CardHeader>
                <CardTitle>Resultados do Cálculo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-nutri-gray-light rounded-xl p-4 text-center">
                    <h3 className="text-sm text-gray-500 mb-1">Taxa Metabólica Basal</h3>
                    <p className="text-3xl font-bold text-nutri-blue">{results.tmb}</p>
                    <p className="text-sm text-gray-500">kcal/dia</p>
                  </div>
                  
                  <div className="bg-nutri-gray-light rounded-xl p-4 text-center">
                    <h3 className="text-sm text-gray-500 mb-1">Fator de Atividade</h3>
                    <p className="text-3xl font-bold text-nutri-green">{results.fa}</p>
                  </div>
                  
                  <div className="bg-nutri-gray-light rounded-xl p-4 text-center">
                    <h3 className="text-sm text-gray-500 mb-1">Gasto Energético Total</h3>
                    <p className="text-3xl font-bold text-purple-600">{results.get}</p>
                    <p className="text-sm text-gray-500">kcal/dia</p>
                  </div>
                </div>
                
                <h3 className="font-medium text-lg mb-4">Distribuição de Macronutrientes</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Proteínas</span>
                      <span className="font-medium">{results.macros.protein}g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-nutri-blue h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (results.macros.protein * 100) / (results.macros.protein + results.macros.carbs + results.macros.fat))}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((results.macros.protein * 4 * 100) / results.get)}% do total de calorias
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Carboidratos</span>
                      <span className="font-medium">{results.macros.carbs}g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-nutri-green h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (results.macros.carbs * 100) / (results.macros.protein + results.macros.carbs + results.macros.fat))}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((results.macros.carbs * 4 * 100) / results.get)}% do total de calorias
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Gorduras</span>
                      <span className="font-medium">{results.macros.fat}g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-amber-500 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (results.macros.fat * 100) / (results.macros.protein + results.macros.carbs + results.macros.fat))}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((results.macros.fat * 9 * 100) / results.get)}% do total de calorias
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consultation;
