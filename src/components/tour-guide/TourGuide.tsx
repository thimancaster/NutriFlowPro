
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ArrowRight, Lightbulb } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const TourGuide: React.FC = () => {
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const location = useLocation();

  const tourSteps = [
    {
      target: '.dashboard-section',
      title: 'Dashboard',
      content: 'Visualize um resumo das suas atividades e métricas principais.',
      page: '/dashboard'
    },
    {
      target: '.patients-link',
      title: 'Pacientes',
      content: 'Gerencie informações dos seus pacientes de forma organizada.',
      page: '/patients'
    },
    {
      target: '.calculator-link',
      title: 'Calculadora Nutricional',
      content: 'Calcule necessidades calóricas e distribuição de macronutrientes.',
      page: '/calculator'
    }
  ];

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('nutriflow-tour-completed');
    if (!hasSeenTour && location.pathname === '/dashboard') {
      setTimeout(() => setShowTour(true), 2000);
    }
  }, [location.pathname]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const completeTour = () => {
    setShowTour(false);
    localStorage.setItem('nutriflow-tour-completed', 'true');
  };

  if (!showTour) return null;

  const currentTourStep = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Tour do Sistema</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={completeTour}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-1 mt-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                {currentTourStep.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentTourStep.content}
              </p>
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={completeTour}
                className="text-sm"
              >
                Pular Tour
              </Button>
              <Button
                onClick={nextStep}
                className="text-sm flex items-center gap-2"
              >
                {currentStep === tourSteps.length - 1 ? 'Finalizar' : 'Próximo'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { TourGuide };
