
import React, { useState, useEffect } from 'react';
import { Patient } from '@/types/patient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth/AuthContext';
import { getPatientAnthropometryHistory } from '@/services/anthropometryService';
import { formatDate } from '@/utils/dateUtils';

interface PatientHistoryProps {
  patient: Patient;
}

const PatientHistory: React.FC<PatientHistoryProps> = ({ patient }) => {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient>(patient);

  useEffect(() => {
    const fetchMeasurements = async () => {
      if (!user?.id || !patient.id) return;
      
      setLoading(true);
      try {
        const result = await getPatientAnthropometryHistory(user.id, patient.id);
        if (result.success) {
          setMeasurements(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching measurements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurements();
  }, [user?.id, patient.id]);

  const handlePatientUpdate = (updatedData: Partial<Patient>) => {
    // Ensure birth_date is present when updating
    const updatedPatient = {
      ...selectedPatient,
      ...updatedData,
      birth_date: updatedData.birth_date || selectedPatient.birth_date || ''
    };
    setSelectedPatient(updatedPatient);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutri-green"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Medições - {selectedPatient.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {measurements.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nenhuma medição registrada para este paciente.
            </p>
          ) : (
            <div className="space-y-4">
              {measurements.map((measurement, index) => (
                <div key={measurement.id || index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">
                      {formatDate(measurement.date)}
                    </span>
                    <Badge variant="outline">
                      Consulta #{measurements.length - index}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {measurement.weight && (
                      <div>
                        <span className="text-gray-500">Peso:</span>
                        <span className="ml-1 font-medium">{measurement.weight} kg</span>
                      </div>
                    )}
                    {measurement.height && (
                      <div>
                        <span className="text-gray-500">Altura:</span>
                        <span className="ml-1 font-medium">{measurement.height} cm</span>
                      </div>
                    )}
                    {measurement.imc && (
                      <div>
                        <span className="text-gray-500">IMC:</span>
                        <span className="ml-1 font-medium">{measurement.imc}</span>
                      </div>
                    )}
                    {measurement.body_fat_pct && (
                      <div>
                        <span className="text-gray-500">% Gordura:</span>
                        <span className="ml-1 font-medium">{measurement.body_fat_pct}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientHistory;
