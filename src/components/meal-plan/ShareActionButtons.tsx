
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';
import ShareDialog from './ShareDialog';

interface ShareActionButtonsProps {
  activePatient: Patient;
}

const ShareActionButtons: React.FC<ShareActionButtonsProps> = ({ activePatient }) => {
  const { toast } = useToast();
  const [showShareDialog, setShowShareDialog] = useState(false);
  
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
        patientEmail={activePatient?.email}
        patientName={activePatient?.name}
      />
    </>
  );
};

export default ShareActionButtons;
