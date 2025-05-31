
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { ActivityLevel, Objective } from '@/types/consultation';

interface ENPValidationProps {
  data: {
    weight: number;
    height: number;
    age: number;
    sex: 'M' | 'F';
    activityLevel: ActivityLevel;
    objective: Objective;
  };
}

export const ENPValidation: React.FC<ENPValidationProps> = ({ data }) => {
  const validateENPRequirements = () => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validações obrigatórias ENP Seção 2
    if (!data.weight || data.weight <= 0 || data.weight > 500) {
      errors.push('Peso deve estar entre 1 e 500 kg');
    }
    
    if (!data.height || data.height <= 0 || data.height > 250) {
      errors.push('Altura deve estar entre 1 e 250 cm');
    }
    
    if (!data.age || data.age <= 0 || data.age > 120) {
      errors.push('Idade deve estar entre 1 e 120 anos');
    }
    
    if (!data.sex || !['M', 'F'].includes(data.sex)) {
      errors.push('Sexo deve ser informado (Masculino/Feminino)');
    }
    
    if (!data.activityLevel) {
      errors.push('Nível de atividade física deve ser selecionado');
    }
    
    if (!data.objective) {
      errors.push('Objetivo deve ser selecionado');
    }
    
    // Validações de alerta ENP
    if (data.age && data.age < 18) {
      warnings.push('Cálculos ENP são validados para adultos (≥18 anos)');
    }
    
    if (data.weight && data.height) {
      const imc = data.weight / Math.pow(data.height / 100, 2);
      if (imc < 16 || imc > 40) {
        warnings.push('IMC fora da faixa usual - considere avaliação médica');
      }
    }
    
    return { errors, warnings, isValid: errors.length === 0 };
  };
  
  const validation = validateENPRequirements();
  
  if (validation.isValid && validation.warnings.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          ✅ Todos os dados necessários para cálculo ENP foram informados corretamente
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-2">
      {validation.errors.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Dados obrigatórios ENP faltando:</strong>
            <ul className="mt-1 ml-4 list-disc">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {validation.warnings.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            <strong>Atenção:</strong>
            <ul className="mt-1 ml-4 list-disc">
              {validation.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
