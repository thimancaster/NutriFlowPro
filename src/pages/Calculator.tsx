
import React, { useState, useEffect } from 'react';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCalculationQuota } from '@/hooks/useCalculationQuota';
import CalculationQuotaDisplay from '@/components/CalculationQuotaDisplay';
import PatientSelector from '@/components/Calculator/PatientSelector';
import CalculatorForm from '@/components/Calculator/CalculatorForm';
import { ConsultationData } from '@/types';
import { saveCalculationResults } from '@/services/calculationService';
import { saveConsultationHistory } from '@/services/consultationHistoryService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';

const Calculator = () => {
  const { activePatient } = usePatient();
  const { user } = useAuth();
  const { toast } = useToast();
  const { canCalculate, quotaStatus, isPremium, attemptsRemaining } = useCalculationQuota();
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleCalculate = async (data: ConsultationData) => {
    if (!user || !activePatient) {
      toast({
        title: "Erro",
        description: "Usuário ou paciente não encontrado",
        variant: "destructive",
      });
      return;
    }

    // Check quota before proceeding
    if (!canCalculate) {
      setShowUpgradeModal(true);
      return;
    }

    setIsCalculating(true);

    try {
      const calculationData = {
        user_id: user.id,
        patient_id: activePatient.id,
        weight: data.weight || 0,
        height: data.height || 0,
        age: data.age || 0,
        gender: data.gender || '',
        activity_level: data.activity_level || '',
        goal: data.goal || '',
        bmr: data.bmr || 0,
        tdee: data.tdee || 0,
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fats: data.fats || 0,
        tipo: 'primeira_consulta',
        status: 'completed'
      };

      const result = await saveCalculationResults(calculationData);

      if (!result.success) {
        if (result.quota_exceeded) {
          setShowUpgradeModal(true);
          return;
        }
        throw new Error(result.error);
      }

      // Save to consultation history
      try {
        await saveConsultationHistory(activePatient.id, user.id, {
          calculation_date: new Date().toISOString(),
          consultation_number: 1,
          tmb: data.bmr || 0,
          vet: data.tdee || 0,
          get: data.tdee || 0,
          protein_g: data.protein || 0,
          carbs_g: data.carbs || 0,
          fat_g: data.fats || 0,
          protein_kcal: (data.protein || 0) * 4,
          carbs_kcal: (data.carbs || 0) * 4,
          fat_kcal: (data.fats || 0) * 9,
          formula_used: 'harris_benedict',
          activity_level: data.activity_level || '',
          objective: data.goal || '',
          body_profile: 'normal',
          sex: data.gender === 'male' ? 'M' : 'F',
          age: data.age || 0,
          weight: data.weight || 0,
          height: data.height || 0
        });
      } catch (historyError) {
        console.warn('Failed to save consultation history:', historyError);
      }

      toast({
        title: "Cálculo realizado com sucesso!",
        description: `Cálculo salvo para ${activePatient.name}. ${
          !isPremium ? `Restam ${attemptsRemaining} cálculos gratuitos.` : ''
        }`,
      });

    } catch (error: any) {
      console.error('Error in calculation:', error);
      toast({
        title: "Erro no cálculo",
        description: error.message || "Ocorreu um erro ao realizar o cálculo",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Calculadora Nutricional</h1>
        <p className="text-muted-foreground">
          Calcule as necessidades nutricionais dos seus pacientes
        </p>
      </div>

      {/* Quota Display */}
      <CalculationQuotaDisplay />

      {/* Patient Selector */}
      <PatientSelector />

      {/* Calculator Form */}
      {activePatient && (
        <CalculatorForm
          patient={activePatient}
          onCalculate={handleCalculate}
          isCalculating={isCalculating}
          disabled={!canCalculate}
        />
      )}

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Upgrade para Premium
            </DialogTitle>
            <DialogDescription>
              Você atingiu o limite de 10 cálculos gratuitos. Faça upgrade para o plano premium e tenha acesso ilimitado!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Benefícios do Plano Premium:</h3>
              <ul className="space-y-1 text-sm">
                <li>✅ Cálculos nutricionais ilimitados</li>
                <li>✅ Pacientes ilimitados</li>
                <li>✅ Planos alimentares ilimitados</li>
                <li>✅ Relatórios avançados</li>
                <li>✅ Suporte prioritário</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowUpgradeModal(false)} variant="outline" className="flex-1">
                Continuar Gratuito
              </Button>
              <Button className="flex-1">
                <Crown className="h-4 w-4 mr-2" />
                Fazer Upgrade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calculator;
