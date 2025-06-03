
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordFormProps {
  onSuccess: () => void;
}

const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email) {
        toast({
          title: "E-mail inválido",
          description: "Por favor, forneça um e-mail válido.",
          variant: "destructive",
        });
        return;
      }

      const { success } = await resetPassword(email);
      
      if (success) {
        onSuccess();
      }
    } catch (error) {
      // Error handling is done in the resetPassword function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-blue-100/20 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-white">Recuperar Senha</h2>
        <p className="text-blue-100">
          Digite seu e-mail para receber um link de recuperação de senha.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-1">
            E-mail
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white focus-visible:ring-2"
            placeholder="seu@email.com"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-white text-nutri-blue hover:bg-blue-100 font-medium"
          disabled={isLoading}
        >
          {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
        </Button>

        <div className="text-center">
          <Link 
            to="/login" 
            className="inline-flex items-center text-sm text-blue-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
