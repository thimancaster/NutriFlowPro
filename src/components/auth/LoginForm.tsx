
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
        
        // Clear the form password on authentication failure
        if (result.error?.message.includes("credenciais") || 
            result.error?.message.includes("senha") ||
            result.error?.message.includes("email")) {
          form.setValue("password", "");
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
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-white">Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="seuemail@exemplo.com" 
                    autoComplete="email"
                    disabled={isSubmitting}
                    className="h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white focus:ring-white/50"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-200 text-sm font-medium" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base font-semibold text-white">Senha</FormLabel>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-white/80 hover:text-white underline font-medium transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <FormControl>
                  <Input 
                    type="password" 
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    className="h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white focus:ring-white/50"
                    placeholder="Digite sua senha"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-200 text-sm font-medium" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                    className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-nutri-blue"
                  />
                </FormControl>
                <FormLabel className="text-sm font-medium text-white cursor-pointer">
                  Lembrar de mim
                </FormLabel>
              </FormItem>
            )}
          />
          
          <div className="space-y-4 pt-2">
            <Button 
              disabled={isSubmitting} 
              variant="nutri-blue"
              animation="shimmer"
              className="w-full h-12 text-base font-semibold" 
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
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
                className="w-full h-12 text-base font-semibold bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200 hover:scale-[1.02]"
              >
                <Icons.google className="mr-2 h-5 w-5" />
                Continuar com Google
              </Button>
            )}
          </div>
        </form>
      </Form>
      
      <div className="text-center border-t border-white/20 pt-6">
        <p className="text-base text-white/90">
          Não tem uma conta?{" "}
          <Link to="/register" className="text-white font-semibold hover:underline transition-colors">
            Registre-se agora
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
