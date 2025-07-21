
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Users, FileText, BarChart3, Utensils, Stethoscope, Zap, Shield, Clock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const LandingPage = () => {
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

  const features = [
    {
      icon: <Calculator className="h-8 w-8 text-nutri-blue" />,
      title: "Calculadora Nutricional",
      description: "Calcule TMB, GET, VET e distribuição de macronutrientes automaticamente"
    },
    {
      icon: <Users className="h-8 w-8 text-nutri-blue" />,
      title: "Gestão de Pacientes",
      description: "Organize e acompanhe o progresso de todos os seus pacientes"
    },
    {
      icon: <Utensils className="h-8 w-8 text-nutri-blue" />,
      title: "Planos Alimentares",
      description: "Crie planos alimentares personalizados com base nos cálculos nutricionais"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-nutri-blue" />,
      title: "Relatórios e Gráficos",
      description: "Visualize a evolução dos seus pacientes com gráficos detalhados"
    },
    {
      icon: <FileText className="h-8 w-8 text-nutri-blue" />,
      title: "Prescrições Digitais",
      description: "Gere prescrições profissionais em PDF prontas para impressão"
    },
    {
      icon: <Stethoscope className="h-8 w-8 text-nutri-blue" />,
      title: "Fluxo Clínico",
      description: "Conduza consultas completas com fluxo estruturado"
    }
  ];

  const benefits = [
    {
      icon: <Zap className="h-6 w-6 text-nutri-green" />,
      title: "Mais Produtividade",
      description: "Automatize cálculos e economize tempo em cada consulta"
    },
    {
      icon: <Shield className="h-6 w-6 text-nutri-green" />,
      title: "Segurança de Dados",
      description: "Seus dados e dos pacientes protegidos com criptografia avançada"
    },
    {
      icon: <Clock className="h-6 w-6 text-nutri-green" />,
      title: "Acesso 24/7",
      description: "Trabalhe de qualquer lugar, a qualquer hora"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
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

      {/* Features Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ferramentas profissionais desenvolvidas especificamente para nutricionistas
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-gray-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-nutri-blue/5 to-nutri-green/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Por que escolher o NutriFlow Pro?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="mb-4 flex justify-center">{benefit.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              O que dizem nossos usuários
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-gray-600 italic">
                    "O NutriFlow Pro revolucionou minha prática. Consigo atender mais pacientes 
                    com maior qualidade e precisão nos cálculos."
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-nutri-blue rounded-full flex items-center justify-center text-white font-semibold">
                      Dr
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-800">Dr. Maria Silva</p>
                      <p className="text-sm text-gray-600">Nutricionista Clínica</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-nutri-blue to-nutri-green text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para transformar sua prática?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Junte-se a centenas de nutricionistas que já usam o NutriFlow Pro
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="bg-white text-nutri-blue hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
          >
            Começar Agora - É Grátis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-nutri-blue rounded-lg flex items-center justify-center">
                <Utensils className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">NutriFlow Pro</span>
            </div>
            <p className="text-gray-400 mb-4">
              Desenvolvido especialmente para nutricionistas brasileiros
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white">Termos de Uso</a>
              <a href="#" className="hover:text-white">Política de Privacidade</a>
              <a href="#" className="hover:text-white">Suporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
