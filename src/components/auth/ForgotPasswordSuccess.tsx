
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw, Mail } from 'lucide-react';

interface ForgotPasswordSuccessProps {
  onTryAgain: () => void;
}

const ForgotPasswordSuccess = ({ onTryAgain }: ForgotPasswordSuccessProps) => {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-16 h-16 bg-green-100/20 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="h-8 w-8 text-white" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">E-mail Enviado!</h2>
        <p className="text-blue-100">
          Se o e-mail fornecido estiver associado a uma conta, você receberá instruções para redefinir sua senha.
        </p>
      </div>
      
      <div className="bg-blue-100/10 border border-blue-200/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Mail className="h-5 w-5 text-blue-200 mt-0.5" />
          <div className="text-left">
            <p className="text-sm text-blue-100">
              <strong>Não encontrou o e-mail?</strong>
            </p>
            <p className="text-sm text-blue-200 mt-1">
              Verifique também sua pasta de spam ou lixo eletrônico.
            </p>
          </div>
        </div>
      </div>
      
      <Button
        variant="outline"
        className="bg-transparent border-white text-white hover:bg-white/20 hover:text-white"
        onClick={onTryAgain}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Tentar com outro e-mail
      </Button>
    </div>
  );
};

export default ForgotPasswordSuccess;
