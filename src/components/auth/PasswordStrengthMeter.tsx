
import React from 'react';
import { validatePasswordStrength } from '@/utils/securityUtils';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  className = ''
}) => {
  const validation = validatePasswordStrength(password);
  
  if (!password) return null;
  
  const getStrengthColor = (score: number): string => {
    if (score < 2) return 'bg-red-500';
    if (score < 4) return 'bg-yellow-500';
    if (score < 6) return 'bg-green-500';
    return 'bg-emerald-500';
  };
  
  const getStrengthText = (score: number): string => {
    if (score < 2) return 'Muito fraca';
    if (score < 4) return 'Fraca';
    if (score < 6) return 'Boa';
    return 'Muito forte';
  };
  
  const strengthPercentage = Math.min((validation.score / 6) * 100, 100);
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Força da senha:</span>
        <span className={`font-medium ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
          {getStrengthText(validation.score)}
        </span>
      </div>
      
      <Progress 
        value={strengthPercentage} 
        className="h-2"
      />
      
      {validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-center text-xs text-red-600">
              <X className="h-3 w-3 mr-1" />
              {error}
            </div>
          ))}
        </div>
      )}
      
      {validation.isValid && (
        <div className="flex items-center text-xs text-green-600">
          <Check className="h-3 w-3 mr-1" />
          Senha atende aos requisitos de segurança
        </div>
      )}
    </div>
  );
};
