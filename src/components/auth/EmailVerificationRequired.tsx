
import React from 'react';
import { AlertTriangle, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EmailVerificationRequiredProps {
  email?: string;
  onResendSuccess?: () => void;
}

const EmailVerificationRequired: React.FC<EmailVerificationRequiredProps> = ({
  email,
  onResendSuccess
}) => {
  const { toast } = useToast();
  const [isResending, setIsResending] = React.useState(false);

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Email não informado",
        description: "Não foi possível reenviar o email de verificação.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    
    try {
      // Note: Supabase doesn't have a direct resend method, user needs to sign up again
      toast({
        title: "Para reenviar a verificação",
        description: "Tente fazer login novamente. Se a conta não estiver verificada, um novo email será enviado automaticamente.",
      });
      onResendSuccess?.();
    } catch (error) {
      toast({
        title: "Erro ao reenviar",
        description: "Não foi possível reenviar o email de verificação. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-yellow-600" />
        </div>
        <CardTitle className="text-xl font-semibold">
          Verificação de Email Necessária
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-yellow-800">
                Confirme seu email para continuar
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Enviamos um link de verificação para{" "}
                {email && (
                  <span className="font-medium">{email}</span>
                )}. 
                Clique no link no email para ativar sua conta.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600 text-center">
            Não recebeu o email? Verifique sua caixa de spam ou solicite um novo.
          </p>
          
          <Button
            onClick={handleResendVerification}
            disabled={isResending}
            variant="outline"
            className="w-full"
          >
            {isResending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Reenviando...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Reenviar Email
              </>
            )}
          </Button>
        </div>

        <div className="text-center pt-4">
          <p className="text-xs text-gray-500">
            Após verificar seu email, você poderá fazer login normalmente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailVerificationRequired;
