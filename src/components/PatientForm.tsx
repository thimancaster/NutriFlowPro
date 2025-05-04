import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { BirthDateInput } from '@/components/BirthDateInput';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PatientFormProps {
  onSuccess?: () => void;
  editPatient?: any;
  onCancel?: () => void;
}

const PatientForm = ({ onSuccess, editPatient, onCancel }: PatientFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sex: '',
    objective: '',
    profile: '',
    email: '',
    phone: '',
  });

  // If we're editing a patient, populate the form
  useEffect(() => {
    if (editPatient) {
      setFormData({
        name: editPatient.name || '',
        sex: editPatient.gender === 'F' ? 'F' : 'M',
        objective: editPatient.goals?.objective || '',
        profile: editPatient.goals?.profile || '',
        email: editPatient.email || '',
        phone: editPatient.phone || '',
      });

      if (editPatient.birth_date) {
        setBirthDate(new Date(editPatient.birth_date));
      }
    }
  }, [editPatient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!birthDate) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione a data de nascimento.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para cadastrar pacientes.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Format data for Supabase
      const patientData = {
        name: formData.name,
        gender: formData.sex,
        birth_date: birthDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        email: formData.email || null,
        phone: formData.phone || null,
        user_id: user.id,
        goals: {
          objective: formData.objective,
          profile: formData.profile,
        },
      };

      let result;
      
      if (editPatient) {
        // Update existing patient
        result = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', editPatient.id);
      } else {
        // Insert new patient
        result = await supabase
          .from('patients')
          .insert(patientData);
      }
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      toast({
        title: editPatient ? "Paciente atualizado" : "Paciente cadastrado",
        description: `${formData.name} foi ${editPatient ? 'atualizado' : 'adicionado(a)'} com sucesso.`,
      });
      
      // Reset form
      if (!editPatient) {
        setFormData({
          name: '',
          sex: '',
          objective: '',
          profile: '',
          email: '',
          phone: '',
        });
        setBirthDate(undefined);
      }
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error("Error saving patient:", error);
      toast({
        title: "Erro ao salvar paciente",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="nutri-card w-full">
      <CardHeader>
        <CardTitle>{editPatient ? "Editar Paciente" : "Cadastro de Paciente"}</CardTitle>
        <CardDescription>
          Preencha os dados para {editPatient ? "atualizar" : "cadastrar"} um {editPatient ? "" : "novo"} paciente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo*</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email"
                  value={formData.email} 
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  value={formData.phone} 
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Sexo*</Label>
              <RadioGroup 
                value={formData.sex} 
                onValueChange={(value) => handleSelectChange('sex', value)}
                required
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
            
            <BirthDateInput 
              value={birthDate} 
              onChange={setBirthDate} 
            />
            
            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo*</Label>
              <Select 
                value={formData.objective} 
                onValueChange={(value) => handleSelectChange('objective', value)}
                required
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
                required
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
          </div>
          
          <CardFooter className="px-0 pt-2 pb-0 flex justify-end">
            {onCancel && (
              <Button variant="outline" type="button" onClick={onCancel} className="mr-2">
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              className="bg-nutri-green hover:bg-nutri-green-dark"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editPatient ? "Atualizando..." : "Salvando..."}
                </>
              ) : (
                editPatient ? "Atualizar Paciente" : "Salvar Paciente"
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientForm;
