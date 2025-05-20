
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
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/Icons';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(8, {
    message: "A senha deve ter pelo menos 8 caracteres.",
  }),
})

interface LoginFormProps {
  onGoogleLogin?: () => Promise<{ success: boolean; error?: Error }>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onGoogleLogin }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await login(values.email, values.password);

      if (result.success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando...",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Erro ao realizar login",
          description: result.error?.message || "Credenciais inválidas.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container relative hidden h-[calc(100vh-3.5rem)] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col p-6 text-lg font-semibold lg:flex bg-muted">
        <div className="absolute inset-0 bg-zinc-900/20" />
        <Link to="/" className="flex items-center py-4">
          <Icons.logo className="mr-2 h-6 w-6" />
          <span>NutriAI</span>
        </Link>
        <div className="relative mt-32">
          <h3 className="text-2xl font-semibold">
            Bem-vindo de volta ao NutriAI
          </h3>
          <p className="mt-3">
            Faça login para acessar sua conta e continuar planejando refeições
            incríveis!
          </p>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Faça login na sua conta</h1>
            <p className="text-sm text-muted-foreground">
              Insira seu email e senha para acessar o painel.
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seuemail@exemplo.com" {...field} />
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
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isSubmitting} className="w-full" type="submit">
                {isSubmitting ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Aguarde...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </Form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continue com
              </span>
            </div>
          </div>
          <Button variant="outline" disabled={true} className="w-full">
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link
              to="/sign-up"
              className="hover:text-brand underline underline-offset-2"
            >
              Criar uma conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
