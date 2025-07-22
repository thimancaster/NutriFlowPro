
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { ArrowRight, Utensils } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const HeroSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGetStarted = () => {
    try {
      console.log('Navigating to signup...');
      navigate('/signup');
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Erro de navegação",
        description: "Ocorreu um erro ao tentar acessar a página. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleLogin = () => {
    try {
      console.log('Navigating to login...');
      navigate('/login');
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Erro de navegação",
        description: "Ocorreu um erro ao tentar acessar a página. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-nutri-blue rounded-lg flex items-center justify-center">
                <Utensils className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-nutri-blue">NutriFlow Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={handleLogin}
                className="text-nutri-blue hover:text-nutri-blue/80 hover:bg-nutri-blue/10"
              >
                Login
              </Button>
              <Button 
                onClick={handleGetStarted}
                className="bg-nutri-blue hover:bg-nutri-blue/90 text-white"
              >
                Começar Agora
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-6">
            <Badge variant="secondary" className="bg-nutri-blue/10 text-nutri-blue border-nutri-blue/20">
              ✨ Plataforma Completa para Nutricionistas
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Revolucione sua
            <span className="text-nutri-blue"> prática nutricional</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Sistema completo com calculadora nutricional, gestão de pacientes, 
            planos alimentares e muito mais. Tudo em uma plataforma intuitiva e profissional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-nutri-blue hover:bg-nutri-blue/90 text-white px-8 py-3 text-lg"
            >
              Começar Gratuitamente
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/pricing')}
              className="border-nutri-blue text-nutri-blue hover:bg-nutri-blue/5 px-8 py-3 text-lg"
            >
              Ver Preços
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            ✓ Sem cartão de crédito necessário  ✓ Configuração em 2 minutos
          </p>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
