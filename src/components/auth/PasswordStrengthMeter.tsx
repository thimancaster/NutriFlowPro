
import React from 'react';
import { validatePasswordStrength } from '@/utils/securityUtils';
import { CheckCircle, XCircle } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password, className = '' }) => {
  const validation = validatePasswordStrength(password);
  
  const requirements = [
    { label: 'Pelo menos 8 caracteres', test: password.length >= 8 },
    { label: 'Uma letra maiúscula', test: /[A-Z]/.test(password) },
    { label: 'Uma letra minúscula', test: /[a-z]/.test(password) },
    { label: 'Um número', test: /\d/.test(password) },
    { label: 'Um caractere especial', test: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const getStrengthColor = () => {
    if (validation.score <= 2) return 'text-red-300';
    if (validation.score <= 3) return 'text-yellow-300';
    return 'text-green-300';
  };

  const getStrengthText = () => {
    if (validation.score <= 2) return 'Fraca';
    if (validation.score <= 3) return 'Média';
    return 'Forte';
  };

  if (!password) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-white font-semibold text-base">Força da senha:</span>
        <span className={`font-bold text-base ${getStrengthColor()}`}>
          {getStrengthText()}
        </span>
      </div>
      
      <div className="space-y-2">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center space-x-3">
            {req.test ? (
              <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-red-300 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${req.test ? 'text-green-200' : 'text-white/70'}`}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
