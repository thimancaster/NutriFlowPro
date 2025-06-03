
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/Icons';
import { Checkbox } from "@/components/ui/checkbox"
import { csrfTokenManager } from '@/utils/securityUtils';

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres.",
  }),
  rememberMe: z.boolean().default(false)
})

interface LoginFormProps {
  onGoogleLogin?: () => Promise<{ success: boolean; error?: Error }>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onGoogleLogin }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      console.log('Login form submission:', { 
        email: values.email, 
        rememberMe: values.rememberMe,
        timestamp: new Date().toISOString()
      });
      
      // Generate CSRF token for this login attempt
      const csrfToken = csrfTokenManager.generate();
      console.log('CSRF token generated for login');
      
      const result = await login(values.email, values.password, values.rememberMe);

      console.log('Login result:', { 
        success: result.success, 
        hasSession: !!result.session,
        errorMessage: result.error?.message 
      });

      if (result.success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o painel...",
        });
        
        // Give a moment for state to update then navigate
        setTimeout(() => {
          console.log('Navigating to:', from);
          navigate(from, { replace: true });
        }, 100);
      } else {
        console.error('Login failed:', result.error);
        
        // Clear the form on authentication failure
        if (result.error?.message.includes("credenciais") || 
            result.error?.message.includes("senha") ||
            result.error?.message.includes("email")) {
          form.reset({
            email: values.email,
            password: "",
            rememberMe: values.rememberMe
          });
        }
      }
    } catch (error: any) {
      console.error('Login exception:', error);
      toast({
        title: "Erro ao realizar login",
        description: error?.message || "Ocorreu um erro durante o login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    if (onGoogleLogin) {
      try {
        // Generate CSRF token for Google login
        const csrfToken = csrfTokenManager.generate();
        console.log('CSRF token generated for Google login');
        
        const result = await onGoogleLogin();
        if (!result.success && result.error) {
          toast({
            title: "Erro de autenticação Google",
            description: result.error.message,
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Erro ao fazer login com Google",
          description: error.message || "Não foi possível conectar com o Google",
          variant: "destructive",
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="seuemail@exemplo.com" 
                  autoComplete="email"
                  disabled={isSubmitting}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Senha</FormLabel>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-800">
                  Esqueceu a senha?
                </Link>
              </div>
              <FormControl>
                <Input 
                  type="password" 
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox 
                  checked={field.value} 
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Lembrar de mim
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <Button 
            disabled={isSubmitting} 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Aguarde...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
          
          {onGoogleLogin && (
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full"
            >
              <Icons.google className="mr-2 h-4 w-4" />
              Continuar com Google
            </Button>
          )}
        </div>
      </form>
      
      <div className="mt-6 text-center text-sm">
        Não tem uma conta?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          Registre-se agora
        </Link>
      </div>
    </Form>
  );
};

export default LoginForm;
