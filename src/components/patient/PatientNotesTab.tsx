
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, FileText } from 'lucide-react';
import { useActivePatient } from '@/hooks/useActivePatient';
import { useToast } from '@/hooks/use-toast';

const PatientNotesTab: React.FC = () => {
  // Use unified patient context instead of local state
  const { patient: activePatient, setActivePatient, isLoading } = useActivePatient();
  const [notes, setNotes] = useState(activePatient?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Sync notes when active patient changes
  useEffect(() => {
    setNotes(activePatient?.notes || '');
  }, [activePatient?.notes]);

  const handleSaveNotes = async () => {
    if (!activePatient) {
      toast({
        title: 'Erro',
        description: 'Nenhum paciente selecionado',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Update patient with new notes
      const updatedPatient = { ...activePatient, notes };
      setActivePatient(updatedPatient);
      
      toast({
        title: 'Sucesso',
        description: 'Anotações salvas com sucesso!'
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar anotações',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!activePatient) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Selecione um paciente para visualizar as anotações</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Anotações do Paciente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Anotações para {activePatient.name}:
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Digite suas anotações sobre o paciente..."
            rows={8}
            className="resize-none"
            disabled={isLoading || isSaving}
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveNotes}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar Anotações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientNotesTab;
