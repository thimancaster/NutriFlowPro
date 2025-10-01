/**
 * Clinical Page - Unified Clinical Workflow
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useClinicalWorkflow } from '@/contexts/ClinicalWorkflowContext';
import { usePatient } from '@/contexts/patient/PatientContext';

/**
 * Esta página agora serve como o ponto de entrada para o fluxo clínico unificado.
 */
export default function ClinicalPage() {
  const navigate = useNavigate();
  const { startSession } = useClinicalWorkflow();
  const { patients } = usePatient();

  const handleStartSession = async (patient: any) => {
    await startSession(patient);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Fluxo Clínico Unificado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Selecione um paciente para iniciar uma sessão clínica:</p>
          <div className="space-y-2">
            {patients.map((patient) => (
              <Button
                key={patient.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleStartSession(patient)}
              >
                {patient.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
