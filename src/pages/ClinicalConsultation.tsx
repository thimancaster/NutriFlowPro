
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Calculator, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActivePatient } from '@/hooks/useActivePatient';
import { useConsultationData } from '@/contexts/ConsultationDataContext';

const ClinicalConsultation: React.FC = () => {
  const navigate = useNavigate();
  const { patient: activePatient, isLoading } = useActivePatient(); // Use unified hook
  const { consultationData, currentStep } = useConsultationData();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutri-blue mx-auto mb-4"></div>
            <p>Carregando dados da consulta...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!activePatient) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-6 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">Nenhum paciente selecionado para consulta</p>
            <Button onClick={() => navigate('/patients')} className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Selecionar Paciente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Consulta Clínica</h1>
          <p className="text-gray-600">Paciente: {activePatient.name}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nome</label>
                <p className="font-medium">{activePatient.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="font-medium">{activePatient.email || 'Não informado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Telefone</label>
                <p className="font-medium">{activePatient.phone || 'Não informado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="font-medium capitalize">{activePatient.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Status da Consulta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Etapa Atual</label>
                <p className="font-medium capitalize">{currentStep.replace('-', ' ')}</p>
              </div>
              
              {consultationData && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Dados da Consulta</label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Peso:</span>
                      <p className="font-medium">{consultationData.weight || 'N/A'} kg</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Altura:</span>
                      <p className="font-medium">{consultationData.height || 'N/A'} cm</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">TMB:</span>
                      <p className="font-medium">{consultationData.bmr || 'N/A'} kcal</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Calorias Totais:</span>
                      <p className="font-medium">{consultationData.totalCalories || 'N/A'} kcal</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Ações Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => navigate('/calculator')}
                className="flex items-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                Calculadora Nutricional
              </Button>
              
              <Button 
                onClick={() => navigate('/meal-plans')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Gerar Plano Alimentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClinicalConsultation;
