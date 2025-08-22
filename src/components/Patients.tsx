
import React, { useState, useEffect } from 'react';
import { usePatient } from '@/contexts/patient/PatientContext';
import { Patient } from '@/types/patient';

const Patients: React.FC = () => {
  const { patients, loading, error, loadPatients } = usePatient();
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    setFilteredPatients(patients);
  }, [patients]);

  if (loading) {
    return <div>Carregando pacientes...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pacientes</h2>
      <div className="grid gap-4">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{patient.name}</h3>
            <p className="text-gray-600">{patient.email}</p>
            <p className="text-sm text-gray-500">
              Status: {patient.status === 'active' ? 'Ativo' : 'Arquivado'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Patients;
