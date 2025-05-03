
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Patient } from '@/types';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendEmail: (email: string) => Promise<void>;
  emailSending: boolean;
  activePatient?: Patient | null;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onOpenChange,
  onSendEmail,
  emailSending,
  activePatient,
}) => {
  const [email, setEmail] = useState('');

  const handleSendEmail = async () => {
    await onSendEmail(email);
    setEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Plano por Email</DialogTitle>
          <DialogDescription>
            Envie o plano alimentar diretamente para o email do paciente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Email do destinatário</p>
            <Input 
              type="email" 
              placeholder={activePatient?.email || "exemplo@email.com"} 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSendEmail} 
              disabled={emailSending}
              className="bg-nutri-blue hover:bg-nutri-blue-dark"
            >
              {emailSending ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
