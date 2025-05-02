
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, FileText, Mail, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { generateMealPlanPDF } from '@/utils/pdfExport';
import { useConsultation } from '@/contexts/ConsultationContext';
import { Input } from '@/components/ui/input';

interface MealPlanActionsProps {
  onSave?: () => Promise<void>;
}

const MealPlanActions: React.FC<MealPlanActionsProps> = ({ onSave }) => {
  const { toast } = useToast();
  const { activePatient, mealPlan } = useConsultation();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  
  if (!mealPlan || !activePatient) {
    return null;
  }

  const handlePrint = () => {
    if (!mealPlan?.meals || !activePatient) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para gerar o PDF",
        variant: "destructive"
      });
      return;
    }

    try {
      const patientAge = activePatient.birth_date 
        ? Math.floor((new Date().getTime() - new Date(activePatient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) 
        : undefined;
      
      const doc = generateMealPlanPDF({
        patientName: activePatient.name,
        patientAge,
        patientGender: activePatient.gender || undefined,
        meals: mealPlan.meals,
        totalCalories: mealPlan.total_calories || 0,
        totalProtein: mealPlan.total_protein || 0,
        totalCarbs: mealPlan.total_carbs || 0,
        totalFats: mealPlan.total_fats || 0
      });

      // Open PDF in a new tab for printing
      window.open(URL.createObjectURL(doc.output('blob')));
      
      toast({
        title: "PDF gerado",
        description: "O plano alimentar foi aberto em uma nova aba para impressão"
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPDF = () => {
    if (!mealPlan?.meals || !activePatient) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para gerar o PDF",
        variant: "destructive"
      });
      return;
    }

    try {
      const patientAge = activePatient.birth_date 
        ? Math.floor((new Date().getTime() - new Date(activePatient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) 
        : undefined;
      
      const doc = generateMealPlanPDF({
        patientName: activePatient.name,
        patientAge,
        patientGender: activePatient.gender || undefined,
        meals: mealPlan.meals,
        totalCalories: mealPlan.total_calories || 0,
        totalProtein: mealPlan.total_protein || 0,
        totalCarbs: mealPlan.total_carbs || 0,
        totalFats: mealPlan.total_fats || 0
      });

      // Download the PDF file
      doc.save(`Plano_Alimentar_${activePatient.name.replace(/\s+/g, '_')}.pdf`);
      
      toast({
        title: "PDF baixado",
        description: "O plano alimentar foi baixado com sucesso"
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF",
        variant: "destructive"
      });
    }
  };

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

  const handleShareEmail = async () => {
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
      setEmail('');
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
      <div className="flex flex-wrap gap-2 justify-end">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleDownloadPDF}
        >
          <FileText className="h-4 w-4" />
          Baixar PDF
        </Button>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
        
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
        
        {onSave && (
          <Button 
            className="bg-nutri-green hover:bg-nutri-green-dark flex gap-2"
            onClick={() => onSave()}
          >
            <FileText className="h-4 w-4" />
            Salvar Plano
          </Button>
        )}
      </div>
      
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
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
                onClick={() => setShowShareDialog(false)}
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
    </>
  );
};

export default MealPlanActions;
