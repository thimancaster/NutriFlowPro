
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientEmail?: string;
  patientName?: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ 
  open, 
  onOpenChange, 
  patientEmail,
  patientName
}) => {
  const { toast } = useToast();
  const [email, setEmail] = useState(patientEmail || '');
  const [emailSending, setEmailSending] = useState(false);
  
  const handleShareEmail = async () => {
    if (!email) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido",
        variant: "destructive"
      });
      return;
    }

    setEmailSending(true);

    try {
      // This is where you'd implement the email sending logic
      // Typically by calling a serverless function
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating API call
      
      toast({
        title: "Email enviado",
        description: `O plano alimentar foi enviado para ${email}`
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email",
        variant: "destructive"
      });
    } finally {
      setEmailSending(false);
    }
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
              placeholder={patientEmail || "exemplo@email.com"} 
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
              onClick={handleShareEmail} 
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
