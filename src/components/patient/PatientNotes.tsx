
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PatientService } from '@/services/patient';
import { useToast } from '@/hooks/use-toast';

interface PatientNotesProps {
  patientId: string;
  content?: string | null;
  onSave: (notes: string) => Promise<void>;
}

const PatientNotes = ({ patientId, content: initialContent, onSave }: PatientNotesProps) => {
  const [notes, setNotes] = useState(initialContent || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleCancelClick = () => {
    setNotes(initialContent || '');
    setIsEditing(false);
  };
  
  const handleSaveClick = async () => {
    setIsSaving(true);
    
    try {
      await onSave(notes);
      setIsEditing(false);
      toast({
        description: "Observações salvas com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar as observações",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="py-4">
      {isEditing ? (
        <div className="space-y-4">
          <Textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Insira observações sobre o paciente"
            className="min-h-[200px]"
          />
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancelClick} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveClick} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {notes ? (
            <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md min-h-[200px]">
              {notes}
            </div>
          ) : (
            <p className="text-gray-500 italic">Nenhuma observação registrada</p>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleEditClick}>
              Editar Observações
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientNotes;
