
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { CalculatorInputsProps } from './types';

const CalculatorInputs: React.FC<CalculatorInputsProps> = ({
  patientName,
  setPatientName,
  gender,
  setGender,
  age,
  setAge,
  weight,
  setWeight,
  height,
  setHeight,
  objective,
  setObjective,
  activityLevel,
  setActivityLevel,
  consultationType,
  setConsultationType,
  profile,
  setProfile,
  user,
  activePatient
}) => {
  // Remove auto-population effect - fields should always start empty
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do Paciente</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Patient Name */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">Nome do Paciente</Label>
            <Input
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Nome completo"
              className="w-full"
            />
          </div>
        </div>
        
        {/* Patient Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Sexo</Label>
            <Select 
              value={gender} 
              onValueChange={setGender as (value: string) => void}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age">
              Idade <span className="text-red-500">*</span>
            </Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Anos"
              className="w-full"
              min="1"
              max="120"
            />
          </div>
          
          {/* Patient Profile */}
          <div className="space-y-2">
            <Label htmlFor="profile">Perfil</Label>
            <Select 
              value={profile} 
              onValueChange={(value) => {
                if (setProfile) setProfile(value);
              }}
            >
              <SelectTrigger id="profile">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="magro">Eutrófico</SelectItem>
                  <SelectItem value="obeso">Sobrepeso/Obesidade</SelectItem>
                  <SelectItem value="atleta">Atleta</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Anthropometry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Height */}
          <div className="space-y-2">
            <Label htmlFor="height">
              Altura (cm) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Em centímetros"
              className="w-full"
              min="50"
              max="250"
            />
          </div>
          
          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight">
              Peso (kg) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Em quilogramas"
              className="w-full"
              min="1"
              max="500"
              step="0.1"
            />
          </div>
        </div>
        
        {/* Activity Level and Objective */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Activity Level */}
          <div className="space-y-2">
            <Label htmlFor="activityLevel">Nível de Atividade</Label>
            <Select 
              value={activityLevel} 
              onValueChange={setActivityLevel}
            >
              <SelectTrigger id="activityLevel">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="sedentario">Sedentário (1.2)</SelectItem>
                  <SelectItem value="leve">Levemente Ativo (1.375)</SelectItem>
                  <SelectItem value="moderado">Moderadamente Ativo (1.55)</SelectItem>
                  <SelectItem value="intenso">Muito Ativo (1.725)</SelectItem>
                  <SelectItem value="muito_intenso">Extremamente Ativo (1.9)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {/* Objective */}
          <div className="space-y-2">
            <Label htmlFor="objective">Objetivo</Label>
            <Select 
              value={objective} 
              onValueChange={setObjective}
            >
              <SelectTrigger id="objective">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                  <SelectItem value="manutenção">Manutenção</SelectItem>
                  <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Consultation Type */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="consultationType">Tipo de Consulta</Label>
            <Select 
              value={consultationType} 
              onValueChange={setConsultationType as (value: string) => void}
            >
              <SelectTrigger id="consultationType">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="primeira_consulta">Primeira Consulta</SelectItem>
                  <SelectItem value="retorno">Retorno</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          <span className="text-red-500">*</span> Campos obrigatórios
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculatorInputs;
