
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProgressIndicator from './registration/ProgressIndicator';
import PersonalInfoStep, { PersonalInfoData } from './registration/PersonalInfoStep';
import PasswordStep, { PasswordData } from './registration/PasswordStep';

interface UnifiedRegistrationFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

const UnifiedRegistrationForm: React.FC<UnifiedRegistrationFormProps> = ({
  onSuccess,
  onBackToLogin
}) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [step1Data, setStep1Data] = useState<PersonalInfoData | null>(null);
  
  const { signup } = useAuth();
  const { toast } = useToast();

  const handleStep1Next = (data: PersonalInfoData) => {
    setStep1Data(data);
    setStep(2);
  };

  const handleStep2Submit = async (data: PasswordData) => {
    if (!step1Data) return;

    setIsLoading(true);
    
    try {
      const result = await signup(step1Data.email, data.password, step1Data.name);
      
      if (result.success) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar sua conta antes de fazer login.",
        });
        onSuccess?.();
      } else {
        throw new Error(result.error?.message || 'Erro ao criar conta');
      }
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro ao criar sua conta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      onBackToLogin?.();
    } else {
      setStep(1);
    }
  };

  return (
    <div className="space-y-6">
      <ProgressIndicator currentStep={step} totalSteps={2} />

      {step === 1 ? (
        <PersonalInfoStep 
          onNext={handleStep1Next}
          onBack={handleBack}
        />
      ) : (
        <PasswordStep 
          onSubmit={handleStep2Submit}
          onBack={handleBack}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default UnifiedRegistrationForm;
