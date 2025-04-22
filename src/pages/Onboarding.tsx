
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, ClipboardList, Calculator, FileText, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const onboardingSteps = [
  {
    title: "Cadastro de Pacientes",
    description: "Cadastre e gerencie seus pacientes de forma simples. Mantenha todos os dados importantes organizados em um só lugar.",
    icon: ClipboardList,
    color: "bg-nutri-blue"
  },
  {
    title: "Cálculos Nutricionais",
    description: "Calcule TMB, GET e distribuição de macronutrientes com precisão, adaptados ao perfil de cada paciente.",
    icon: Calculator,
    color: "bg-nutri-green"
  },
  {
    title: "Geração de Planos",
    description: "Crie planos alimentares personalizados com distribuição de macros por refeição e sugestões de alimentos.",
    icon: FileText,
    color: "bg-purple-600"
  },
  {
    title: "Histórico de Consultas",
    description: "Acompanhe a evolução de cada paciente com históricos detalhados e dados comparativos entre consultas.",
    icon: BarChart3,
    color: "bg-amber-500"
  }
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-nutri-blue mb-2">Bem-vindo ao NutriFlow Pro</h1>
          <p className="text-gray-600">Vamos conhecer as principais funcionalidades</p>
        </div>

        <Card className="shadow-lg border-none bg-white">
          <CardContent className="p-6">
            <div className="flex justify-center items-center mb-6">
              <div className={`rounded-full p-4 ${onboardingSteps[currentStep].color}`}>
                {React.createElement(onboardingSteps[currentStep].icon, { className: "h-10 w-10 text-white" })}
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-center mb-3">
              {onboardingSteps[currentStep].title}
            </h2>
            
            <p className="text-gray-600 text-center mb-8">
              {onboardingSteps[currentStep].description}
            </p>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={currentStep === 0 ? "opacity-0" : ""}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>

              <div className="flex space-x-1">
                {onboardingSteps.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStep ? "bg-nutri-blue" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                className="bg-nutri-green hover:bg-nutri-green-dark"
              >
                {currentStep === onboardingSteps.length - 1 ? "Começar" : "Próximo"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            {currentStep < onboardingSteps.length - 1 && (
              <div className="text-center mt-5">
                <button 
                  onClick={handleSkip} 
                  className="text-gray-500 text-sm hover:text-nutri-blue"
                >
                  Pular introdução
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
