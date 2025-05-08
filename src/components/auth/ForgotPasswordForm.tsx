
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-1">
          E-mail
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
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
    </form>
  );
};

export default ForgotPasswordForm;
