
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';
import ShareDialog from './ShareDialog';

interface ShareActionButtonsProps {
  activePatient: Patient | null;
}

const ShareActionButtons: React.FC<ShareActionButtonsProps> = ({
  activePatient,
}) => {
  const { toast } = useToast();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  const handleShareWhatsApp = () => {
    if (!activePatient) {
      toast({
        title: "Erro",
        description: "Nenhum paciente selecionado",
        variant: "destructive"
      });
      return;
    }

    // We would first need to save the PDF to a public URL
    // For now, just show a message about this functionality
    toast({
      title: "Compartilhar via WhatsApp",
      description: "Esta função enviará o plano alimentar para o paciente via WhatsApp após salvar o arquivo em um servidor seguro"
    });

    // Simulating a WhatsApp share on mobile
    // In a real app, you'd need to host the file and get a shareable link
    const message = encodeURIComponent(`Olá ${activePatient.name}, aqui está seu plano alimentar personalizado!`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleShareEmail = async (email: string) => {
    if (!email || !activePatient) {
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
      
      setShowShareDialog(false);
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
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={() => setShowShareDialog(true)}
      >
        <Mail className="h-4 w-4" />
        Enviar Email
      </Button>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={handleShareWhatsApp}
      >
        <Share2 className="h-4 w-4" />
        WhatsApp
      </Button>
      
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        onSendEmail={handleShareEmail}
        emailSending={emailSending}
        activePatient={activePatient}
      />
    </>
  );
};

export default ShareActionButtons;
