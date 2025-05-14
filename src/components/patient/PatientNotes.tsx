
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface PatientNotesProps {
  patientId: string;
  content: string;
  onSave: (notes: string) => Promise<void>;
}

const PatientNotes: React.FC<PatientNotesProps> = ({ patientId, content, onSave }) => {
  const [notes, setNotes] = useState(content || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(notes);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Anotações</h2>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          size="sm"
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
      
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Adicione anotações sobre o paciente aqui..."
        className="min-h-[300px]"
      />
    </div>
  );
};

export default PatientNotes;
