
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUnifiedEcosystem } from '@/contexts/UnifiedEcosystemContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Calculator, 
  Stethoscope, 
  Utensils, 
  CheckCircle,
  ArrowRight 
} from 'lucide-react';

const EcosystemNavigation: React.FC = () => {
  const { state, setCurrentStep } = useUnifiedEcosystem();
  const navigate = useNavigate();

  const steps = [
    {
      id: 'patient',
      title: 'Selecionar Paciente',
      icon: User,
      description: 'Escolha o paciente para atendimento',
      completed: !!state.activePatient,
      path: '/patients'
    },
    {
      id: 'calculation',
      title: 'Cálculo Nutricional',
      icon: Calculator,
      description: 'Calcule TMB, GET e macronutrientes',
      completed: !!state.calculationData,
      path: '/calculator'
    },
    {
      id: 'clinical',
      title: 'Fluxo Clínico',
      icon: Stethoscope,
      description: 'Avaliação e consulta completa',
      completed: !!state.consultationData,
      path: '/clinical'
    },
    {
      id: 'meal_plan',
      title: 'Plano Alimentar',
      icon: Utensils,
      description: 'Gere plano alimentar inteligente',
      completed: !!state.mealPlan,
      path: '/meal-plan-generator'
    }
  ];

  const handleStepClick = (step: any) => {
    setCurrentStep(step.id);
    navigate(step.path);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Fluxo de Atendimento</h3>
          <div className="text-sm text-muted-foreground">
            Etapa: {steps.find(s => s.id === state.currentStep)?.title}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = state.currentStep === step.id;
            const isCompleted = step.completed;
            
            return (
              <div key={step.id} className="relative">
                <Button
                  variant={isActive ? "default" : isCompleted ? "secondary" : "outline"}
                  className={`w-full h-auto p-4 flex flex-col items-center space-y-2 ${
                    isActive ? 'ring-2 ring-nutri-green' : ''
                  }`}
                  onClick={() => handleStepClick(step)}
                >
                  <div className="flex items-center justify-center relative">
                    <Icon className="h-6 w-6" />
                    {isCompleted && (
                      <CheckCircle className="h-4 w-4 text-green-600 absolute -top-1 -right-1" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{step.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </Button>
                
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progresso</span>
            <span>{steps.filter(s => s.completed).length} de {steps.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-nutri-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EcosystemNavigation;
