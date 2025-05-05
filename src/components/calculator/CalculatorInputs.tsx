import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  user
}: CalculatorInputsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="patientName">Nome do Paciente</Label>
            <Input 
              id="patientName" 
              value={patientName} 
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Nome do paciente"
            />
          </div>
          
          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
            <Label htmlFor="age">Idade (anos)</Label>
            <Input 
              id="age" 
              type="number" 
              value={age} 
              onChange={(e) => setAge(e.target.value)}
              placeholder="Ex: 35"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input 
              id="weight" 
              type="number" 
              value={weight} 
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ex: 70"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="height">Altura (cm)</Label>
            <Input 
              id="height" 
              type="number" 
              value={height} 
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Ex: 170"
            />
          </div>
          
          <div className="space-y-1.5">
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
        </div>
      </div>

      <div className="space-y-1.5 mt-4">
        <Label htmlFor="activity">Nível de Atividade</Label>
        <Select value={activityLevel} onValueChange={setActivityLevel}>
          <SelectTrigger id="activity">
            <SelectValue placeholder="Selecione o nível de atividade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1.2">Sedentário (pouco ou nenhum exercício)</SelectItem>
            <SelectItem value="1.375">Levemente ativo (exercício leve 1-3 dias/semana)</SelectItem>
            <SelectItem value="1.55">Moderadamente ativo (exercício moderado 3-5 dias/semana)</SelectItem>
            <SelectItem value="1.725">Muito ativo (exercício intenso 6-7 dias/semana)</SelectItem>
            <SelectItem value="1.9">Extremamente ativo (exercício muito intenso, trabalho físico)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {patientName && user && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
          <p className="font-medium">Nota: Os dados serão automaticamente pré-salvos quando o cálculo for realizado.</p>
          <p>Para completar o cadastro do paciente, clique em "Salvar Paciente" após o cálculo.</p>
        </div>
      )}
    </div>
  );
};

export default CalculatorInputs;
