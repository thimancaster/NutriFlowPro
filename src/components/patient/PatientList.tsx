
import React from 'react';
import { Patient } from '@/types/patient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Eye, Trash2 } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onView: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
}

const PatientList: React.FC<PatientListProps> = ({ patients, onEdit, onView, onDelete }) => {
  if (patients.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum paciente encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {patients.map((patient) => (
        <Card key={patient.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{patient.name}</h3>
                <p className="text-gray-600">{patient.email}</p>
                <p className="text-sm text-gray-500">
                  Status: {patient.status === 'active' ? 'Ativo' : 'Arquivado'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onView(patient)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(patient)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(patient.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PatientList;
