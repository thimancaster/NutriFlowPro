
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const PatientForm = () => {
  const { toast } = useToast();
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sex: '',
    objective: '',
    profile: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!birthDate) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione a data de nascimento.",
        variant: "destructive",
      });
      return;
    }
    
    const patientData = {
      ...formData,
      birthDate,
    };
    
    console.log('Form data submitted:', patientData);
    
    toast({
      title: "Paciente cadastrado",
      description: `${formData.name} foi adicionado(a) com sucesso.`,
    });
    
    // Reset form
    setFormData({
      name: '',
      sex: '',
      objective: '',
      profile: '',
    });
    setBirthDate(undefined);
  };

  return (
    <Card className="nutri-card w-full">
      <CardHeader>
        <CardTitle>Cadastro de Paciente</CardTitle>
        <CardDescription>
          Preencha os dados para cadastrar um novo paciente
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
            
            <div className="space-y-2">
              <Label htmlFor="birthdate">Data de Nascimento*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !birthDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthDate ? format(birthDate, "dd/MM/yyyy") : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={setBirthDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                  />
                </PopoverContent>
              </Popover>
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
            <Button variant="outline" type="reset" className="mr-2">Cancelar</Button>
            <Button type="submit" className="bg-nutri-green hover:bg-nutri-green-dark">
              Salvar Paciente
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientForm;
