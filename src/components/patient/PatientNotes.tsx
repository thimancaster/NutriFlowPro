
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PatientNotesProps {
  patientId: string;
  notes?: string;
}

const PatientNotes = ({ patientId, notes: initialNotes = '' }: PatientNotesProps) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Save the notes to the database
  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update({ notes })
        .eq('id', patientId);
      
      if (error) throw error;
      
      toast({
        title: "Anotações salvas",
        description: "As anotações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as anotações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Anotações Gerais</h3>
        <Button 
          onClick={handleSaveNotes}
          className="bg-nutri-blue hover:bg-blue-700"
          disabled={isSaving}
        >
          {isSaving ? "Salvando..." : "Salvar Anotações"}
        </Button>
      </div>
      
      <div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-64 p-3 border rounded-md focus:ring-2 focus:ring-nutri-blue focus:border-transparent"
          placeholder="Adicione anotações sobre o paciente, como preferências alimentares, alergias, observações comportamentais, etc."
        />
      </div>
      
      <div className="bg-blue-50 p-3 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Dica:</strong> Utilize este espaço para registrar informações qualitativas importantes 
          sobre seu paciente que não se encaixam em outros campos estruturados.
        </p>
      </div>
    </div>
  );
};

export default PatientNotes;
