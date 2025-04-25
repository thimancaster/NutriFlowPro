
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Check } from 'lucide-react';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [clinicName, setClinicName] = useState('');
  const [crn, setCrn] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Update user profile
      const { error } = await supabase
        .from('users')
        .update({
          clinic_name: clinicName,
          crn,
          specialty
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Register as a subscriber
      const { error: subError } = await supabase
        .from('subscribers')
        .insert([
          {
            user_id: user.id,
            email: user.email,
            role: 'user',
            is_premium: false
          }
        ]);

      if (subError) {
        throw subError;
      }

      toast({
        title: 'Configuração concluída',
        description: 'Bem-vindo ao NutriFlow Pro!',
      });

      // Redirect to dashboard
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao salvar suas informações.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-nutri-blue flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Bem-vindo ao NutriFlow Pro</h1>
          <p className="text-blue-100 text-lg">Vamos configurar sua conta</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div 
                key={stepNumber} 
                className={`flex flex-col items-center ${stepNumber < step ? 'text-green-400' : stepNumber === step ? 'text-white' : 'text-blue-300/50'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 ${
                  stepNumber < step ? 'bg-green-400 border-green-400' : 
                  stepNumber === step ? 'border-white' : 'border-blue-300/50'
                }`}>
                  {stepNumber < step ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                <span className="text-sm">
                  {stepNumber === 1 && "Informações básicas"}
                  {stepNumber === 2 && "Preferências"}
                  {stepNumber === 3 && "Conclusão"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 bg-white/20 h-1 rounded-full">
            <div 
              className="bg-white h-full rounded-full transition-all" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/10 backdrop-blur-md text-white">
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Informações profissionais</CardTitle>
                <CardDescription className="text-blue-100">
                  Conte-nos um pouco sobre sua prática profissional
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="clinic-name" className="block text-sm font-medium text-blue-100 mb-1">
                    Nome da clínica/consultório
                  </label>
                  <Input
                    id="clinic-name"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
                    placeholder="Nome da sua clínica ou consultório"
                  />
                </div>
                <div>
                  <label htmlFor="crn" className="block text-sm font-medium text-blue-100 mb-1">
                    CRN (Conselho Regional de Nutrição)
                  </label>
                  <Input
                    id="crn"
                    value={crn}
                    onChange={(e) => setCrn(e.target.value)}
                    className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
                    placeholder="Seu número de registro no CRN"
                  />
                </div>
                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-blue-100 mb-1">
                    Especialidade
                  </label>
                  <Input
                    id="specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
                    placeholder="Ex: Nutrição Esportiva, Clínica, etc."
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={nextStep}>
                  Próximo
                </Button>
              </CardFooter>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Preferências de trabalho</CardTitle>
                <CardDescription className="text-blue-100">
                  Defina como você prefere trabalhar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-900/30 p-4 rounded-lg text-blue-100 text-sm">
                  <p>Você poderá personalizar mais configurações no painel administrativo posteriormente.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Algumas configurações disponíveis:</h3>
                  <ul className="list-disc list-inside space-y-1 text-blue-100">
                    <li>Horários de atendimento</li>
                    <li>Duração padrão de consultas</li>
                    <li>Metas nutricionais padrão</li>
                    <li>Preferências de relatórios</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" onClick={prevStep} className="border-white text-white hover:bg-white hover:text-nutri-blue">
                  Voltar
                </Button>
                <Button onClick={nextStep}>
                  Próximo
                </Button>
              </CardFooter>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Tudo pronto!</CardTitle>
                <CardDescription className="text-blue-100">
                  Seu perfil está configurado e você está pronto para começar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-center text-blue-100">
                    Parabéns! Sua conta foi configurada com sucesso. 
                    Clique em "Concluir" para acessar o dashboard do NutriFlow Pro.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" onClick={prevStep} className="border-white text-white hover:bg-white hover:text-nutri-blue">
                  Voltar
                </Button>
                <Button 
                  onClick={handleComplete} 
                  disabled={isLoading} 
                  className="bg-green-400 hover:bg-green-500 text-white"
                >
                  {isLoading ? "Processando..." : "Concluir"}
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
