
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Edit, FileText } from 'lucide-react';
import { Patient } from '@/types';

interface PatientNotesTabProps {
  patient: Patient;
  onUpdatePatient: (data: Partial<Patient>) => Promise<void>;
}

const PatientNotesTab: React.FC<PatientNotesTabProps> = ({ patient, onUpdatePatient }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(patient.notes || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdatePatient({ notes });
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar notas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNotes(patient.notes || '');
    setIsEditing(false);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Anotações do Paciente
          </CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione suas anotações sobre o paciente..."
              rows={10}
              className="min-h-[200px]"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg min-h-[200px]">
            {notes ? (
              <p className="whitespace-pre-wrap text-gray-700">{notes}</p>
            ) : (
              <p className="text-gray-500 italic">Nenhuma anotação registrada.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientNotesTab;
