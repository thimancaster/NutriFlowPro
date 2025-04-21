
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";

const PatientForm = () => {
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    gender: '',
    height: '',
    weight: '',
    objectives: '',
    allergies: '',
    medicalConditions: '',
    dietaryRestrictions: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data submitted:', formData);
    
    toast({
      title: "Paciente cadastrado",
      description: `${formData.name} foi adicionado(a) com sucesso.`,
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      birthdate: '',
      gender: '',
      height: '',
      weight: '',
      objectives: '',
      allergies: '',
      medicalConditions: '',
      dietaryRestrictions: ''
    });
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
            <h3 className="text-lg font-medium">Informações Pessoais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome Completo*</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone*</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="birthdate">Data de Nascimento*</Label>
                <Input 
                  id="birthdate" 
                  name="birthdate" 
                  type="date" 
                  value={formData.birthdate} 
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Físicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="gender">Sexo*</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => handleSelectChange('gender', value)}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="height">Altura (cm)*</Label>
                <Input 
                  id="height" 
                  name="height" 
                  type="number" 
                  value={formData.height} 
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="weight">Peso (kg)*</Label>
                <Input 
                  id="weight" 
                  name="weight" 
                  type="number" 
                  value={formData.weight} 
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Nutricionais</h3>
            
            <div className="space-y-1.5">
              <Label htmlFor="objectives">Objetivos</Label>
              <Textarea 
                id="objectives" 
                name="objectives" 
                value={formData.objectives} 
                onChange={handleChange} 
                placeholder="Perda de peso, ganho de massa muscular, etc."
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="allergies">Alergias Alimentares</Label>
              <Textarea 
                id="allergies" 
                name="allergies" 
                value={formData.allergies} 
                onChange={handleChange} 
                placeholder="Liste alergias conhecidas, se houver"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="medicalConditions">Condições Médicas</Label>
              <Textarea 
                id="medicalConditions" 
                name="medicalConditions" 
                value={formData.medicalConditions} 
                onChange={handleChange} 
                placeholder="Diabetes, hipertensão, etc., se aplicável"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="dietaryRestrictions">Restrições Alimentares</Label>
              <Textarea 
                id="dietaryRestrictions" 
                name="dietaryRestrictions" 
                value={formData.dietaryRestrictions} 
                onChange={handleChange} 
                placeholder="Vegetariano, sem glúten, etc."
              />
            </div>
          </div>
          
          <div className="space-y-1.5 pt-2">
            <p className="text-sm text-gray-500">* Campos obrigatórios</p>
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
