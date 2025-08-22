
import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import E2EAttendanceFlow from '@/components/clinical/E2EAttendanceFlow';
import PatientProgressChart from '@/components/patient/PatientProgressChart';

const E2EConsultationPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();

  if (!patientId) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Paciente não encontrado</h1>
            <p>ID do paciente não foi fornecido na URL.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-nutri-blue mb-2">
            Atendimento Nutricional E2E
          </h1>
          <p className="text-gray-600">
            Fluxo completo: autocarga → cálculo → plano → consulta → histórico
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <E2EAttendanceFlow 
              patientId={patientId} 
              onComplete={() => {
                console.log('[ATTEND:E2E] Complete workflow finished');
                window.location.reload(); // Refresh to update chart
              }}
            />
          </div>
          
          <div>
            <PatientProgressChart patientId={patientId} />
          </div>
        </div>
      </div>
    </>
  );
};

export default E2EConsultationPage;
