
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCalculationHistory } from '@/hooks/useCalculationHistory';
import { CreateCalculationHistory } from '@/services/calculationHistoryService';
import { Save, CheckCircle } from 'lucide-react';

interface SaveCalculationDialogProps {
  calculationData: CreateCalculationHistory;
  disabled?: boolean;
}

const SaveCalculationDialog: React.FC<SaveCalculationDialogProps> = ({ 
  calculationData, 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const { saveCalculation, isSaving, isSuccess } = useCalculationHistory();

  const handleSave = async () => {
    try {
      await saveCalculation({
        ...calculationData,
        notes: notes.trim() || undefined
      });
      setNotes('');
      setIsOpen(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled}
          className="flex items-center gap-2"
        >
          {isSuccess ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              Salvo no Histórico
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar no Histórico
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-dark-bg-elevated border-gray-200 dark:border-dark-border-secondary">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-dark-text-primary">Salvar Cálculo no Histórico</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-dark-text-secondary">
            Este cálculo será salvo no histórico do paciente para acompanhamento da evolução.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-dark-text-muted">TMB:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-dark-text-primary">{calculationData.tmb} kcal</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-dark-text-muted">GET:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-dark-text-primary">{calculationData.get} kcal</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-dark-text-muted">VET:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-dark-text-primary">{calculationData.vet} kcal</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-dark-text-muted">Objetivo:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-dark-text-primary">{calculationData.objective}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-900 dark:text-dark-text-primary">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre este cálculo..."
              rows={3}
              className="bg-white dark:bg-dark-bg-elevated border-gray-300 dark:border-dark-border-secondary text-gray-900 dark:text-dark-text-primary placeholder:text-gray-500 dark:placeholder:text-dark-text-placeholder"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveCalculationDialog;
