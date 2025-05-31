
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface NutritionalValidationENPProps {
  vet: number;
  macros: {
    protein: { grams: number; kcal: number };
    carbs: { grams: number; kcal: number };
    fat: { grams: number; kcal: number };
  };
  weight: number;
}

export const NutritionalValidationENP: React.FC<NutritionalValidationENPProps> = ({
  vet,
  macros,
  weight
}) => {
  const validateENPStandards = () => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validações ENP específicas
    const proteinPerKg = macros.protein.grams / weight;
    const totalKcal = macros.protein.kcal + macros.carbs.kcal + macros.fat.kcal;
    const proteinPercent = (macros.protein.kcal / totalKcal) * 100;
    const carbsPercent = (macros.carbs.kcal / totalKcal) * 100;
    const fatPercent = (macros.fat.kcal / totalKcal) * 100;
    
    // Validação proteína por kg (ENP recomenda 1.6-2.0g/kg)
    if (proteinPerKg < 1.6) {
      warnings.push(`Proteína baixa: ${proteinPerKg.toFixed(1)}g/kg (ENP recomenda ≥1.6g/kg)`);
    } else if (proteinPerKg > 2.5) {
      warnings.push(`Proteína alta: ${proteinPerKg.toFixed(1)}g/kg (ENP recomenda ≤2.5g/kg)`);
    }
    
    // Validação percentual de gorduras (ENP recomenda 20-30%)
    if (fatPercent < 20) {
      warnings.push(`Gorduras baixas: ${fatPercent.toFixed(1)}% (ENP recomenda ≥20%)`);
    } else if (fatPercent > 35) {
      warnings.push(`Gorduras altas: ${fatPercent.toFixed(1)}% (ENP recomenda ≤35%)`);
    }
    
    // Validação percentual de carboidratos (ENP flexível: 40-65%)
    if (carbsPercent < 40) {
      warnings.push(`Carboidratos baixos: ${carbsPercent.toFixed(1)}% (ENP recomenda ≥40%)`);
    } else if (carbsPercent > 65) {
      warnings.push(`Carboidratos altos: ${carbsPercent.toFixed(1)}% (ENP recomenda ≤65%)`);
    }
    
    // Validação VET mínimo (ENP: não inferior a 1200 kcal)
    if (vet < 1200) {
      errors.push(`VET muito baixo: ${vet} kcal (ENP recomenda ≥1200 kcal)`);
    }
    
    // Validação soma de macros vs VET
    const macrosDifference = Math.abs(totalKcal - vet);
    if (macrosDifference > 50) {
      errors.push(`Inconsistência calórica: Macros ${totalKcal} kcal vs VET ${vet} kcal`);
    }
    
    return { errors, warnings, isValid: errors.length === 0 };
  };
  
  const validation = validateENPStandards();
  
  if (validation.isValid && validation.warnings.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          ✅ Distribuição nutricional conforme padrões ENP
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
            <strong>Inconsistências ENP detectadas:</strong>
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
            <strong>Recomendações ENP:</strong>
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
