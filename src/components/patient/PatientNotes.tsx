
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { validateSecureForm, rateLimiter } from '@/utils/securityValidation';
import { useToast } from '@/hooks/use-toast';

interface PatientNotesProps {
  patientId: string;
  content: string;
  onSave: (notes: string) => Promise<void>;
}

const PatientNotes: React.FC<PatientNotesProps> = ({ patientId, content, onSave }) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState(content || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Rate limiting for notes saving
    const rateCheck = rateLimiter.checkLimit(`notes_save_${patientId}`, 10, 60000); // 10 saves per minute
    
    if (!rateCheck.allowed) {
      toast({
        title: "Muitas tentativas",
        description: "Aguarde um momento antes de salvar novamente.",
        variant: "destructive"
      });
      return;
    }

    // Validate and sanitize notes content
    const validation = validateSecureForm.notes(notes);
    
    if (!validation.isValid) {
      toast({
        title: "Conteúdo inválido",
        description: validation.error || "Erro ao validar o conteúdo das notas.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave(validation.sanitizedContent);
      toast({
        title: "Notas salvas",
        description: "As anotações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as anotações.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Client-side length validation
    if (value.length > 10000) {
      toast({
        title: "Texto muito longo",
        description: "As anotações devem ter no máximo 10.000 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setNotes(value);
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
        onChange={handleNotesChange}
        placeholder="Adicione anotações sobre o paciente aqui..."
        className="min-h-[300px]"
        maxLength={10000}
      />
      
      <div className="text-xs text-gray-500 text-right">
        {notes.length}/10.000 caracteres
      </div>
    </div>
  );
};

export default PatientNotes;
