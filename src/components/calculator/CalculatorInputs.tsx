
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalculatorInputsProps } from './types';

const CalculatorInputs = ({
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
  user
}: CalculatorInputsProps) => {
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dados do Paciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Sexo</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Selecione o sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="age">Idade</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Idade em anos"
              className="w-full"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Peso em kg"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="height">Altura (cm)</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Altura em cm"
              className="w-full"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="objective">Objetivo</Label>
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger id="objective">
                <SelectValue placeholder="Selecione o objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                <SelectItem value="manutenção">Manutenção</SelectItem>
                <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="activityLevel">Nível de Atividade</Label>
            <Select value={activityLevel} onValueChange={setActivityLevel}>
              <SelectTrigger id="activityLevel">
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentario">Sedentário</SelectItem>
                <SelectItem value="leve">Leve</SelectItem>
                <SelectItem value="moderado">Moderado</SelectItem>
                <SelectItem value="intenso">Intenso</SelectItem>
                <SelectItem value="muito_intenso">Muito Intenso</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="consultationType">Tipo de Consulta</Label>
            <Select value={consultationType} onValueChange={setConsultationType}>
              <SelectTrigger id="consultationType">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primeira_consulta">Primeira Consulta</SelectItem>
                <SelectItem value="retorno">Retorno</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile">Perfil</Label>
            <Select value={objective === "hipertrofia" ? "atleta" : objective === "emagrecimento" ? "obeso" : "magro"} onValueChange={(value) => {}}>
              <SelectTrigger id="profile" disabled>
                <SelectValue placeholder="Perfil selecionado automaticamente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="magro">Magro/Eutrófico</SelectItem>
                <SelectItem value="obeso">Sobrepeso/Obesidade</SelectItem>
                <SelectItem value="atleta">Atleta</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">O perfil é determinado automaticamente com base no objetivo.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculatorInputs;
