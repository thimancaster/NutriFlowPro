
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw } from 'lucide-react';

interface ForgotPasswordSuccessProps {
  onTryAgain: () => void;
}

const ForgotPasswordSuccess = ({ onTryAgain }: ForgotPasswordSuccessProps) => {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-center mb-6">
        <div className="p-3 rounded-full bg-blue-100/20 animate-pulse-soft">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
      </div>
      
      <div className="bg-blue-900/30 text-blue-100 p-4 rounded-lg text-sm animate-scale-in">
        <p>Se o e-mail fornecido estiver associado a uma conta, você receberá instruções para redefinir sua senha.</p>
        <p className="mt-2">Verifique também sua pasta de spam se não encontrar o e-mail em sua caixa de entrada.</p>
      </div>
      
      <div className="text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
        <Button
          variant="outline"
          className="bg-transparent border-white text-white hover:bg-white hover:text-nutri-blue hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
          onClick={onTryAgain}
          animation="shimmer"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar com outro e-mail
        </Button>
      </div>
    </div>
  );
};

export default ForgotPasswordSuccess;
