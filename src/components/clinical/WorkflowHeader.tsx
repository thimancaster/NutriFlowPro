
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, User, CalendarClock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatAppointmentDate } from '@/components/appointment/utils/dateUtils';
import { useClinical } from '@/contexts/ClinicalContext';

const WorkflowHeader = () => {
  const navigate = useNavigate();
  const { 
    activePatient, 
    activeConsultation,
    currentStep,
    resetWorkflow,
    lastSaved,
    isSaving
  } = useClinical();
  
  if (!activePatient) return null;
  
  return (
    <Card className="mb-4 bg-white border-nutri-blue/20">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                if (confirm('Deseja realmente sair da consulta? Dados não salvos serão perdidos.')) {
                  resetWorkflow();
                  navigate('/');
                }
              }}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-800 p-2 rounded-full">
                <User className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="font-semibold text-sm text-gray-800">{activePatient.name}</p>
                <p className="text-xs text-gray-500">
                  {activePatient.gender === 'male' ? 'Masculino' : 'Feminino'} • 
                  {activePatient.age ? ` ${activePatient.age} anos` : ' Idade não informada'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            {activeConsultation && (
              <div className="flex items-center text-xs text-gray-500">
                <CalendarClock className="h-3 w-3 mr-1" />
                {formatAppointmentDate(activeConsultation.date)}
              </div>
            )}
            
            {lastSaved && (
              <div className="flex items-center text-xs text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Salvo às {lastSaved.toLocaleTimeString()}
              </div>
            )}
            
            {isSaving && (
              <div className="flex items-center text-xs text-blue-600">
                <Save className="h-3 w-3 mr-1 animate-pulse" />
                Salvando...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowHeader;
