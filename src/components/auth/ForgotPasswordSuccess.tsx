
import React from 'react';
import { Button } from '@/components/ui/button';

interface ForgotPasswordSuccessProps {
  onTryAgain: () => void;
}

const ForgotPasswordSuccess = ({ onTryAgain }: ForgotPasswordSuccessProps) => {
  return (
    <div className="space-y-5">
      <div className="bg-blue-900/30 text-blue-100 p-4 rounded-lg text-sm">
        <p>Se o e-mail fornecido estiver associado a uma conta, você receberá instruções para redefinir sua senha.</p>
        <p className="mt-2">Verifique também sua pasta de spam se não encontrar o e-mail em sua caixa de entrada.</p>
      </div>
      
      <div className="text-center">
        <Button
          variant="outline"
          className="bg-transparent border-white text-white hover:bg-white hover:text-nutri-blue"
          onClick={onTryAgain}
        >
          Tentar com outro e-mail
        </Button>
      </div>
    </div>
  );
};

export default ForgotPasswordSuccess;
