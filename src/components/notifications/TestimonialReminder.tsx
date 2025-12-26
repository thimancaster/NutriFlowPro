import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, MessageSquareHeart, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type ReminderStatus = 'pending' | 'later' | 'cancelled' | 'completed';

interface TestimonialReminderProps {
  minDaysBeforeShow?: number;
}

const TestimonialReminder: React.FC<TestimonialReminderProps> = ({ 
  minDaysBeforeShow = 7 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      checkShouldShowReminder();
    }
  }, [user?.id]);

  const checkShouldShowReminder = async () => {
    if (!user?.id) return;

    try {
      const { data: settings, error } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking testimonial reminder:', error);
        return;
      }

      const settingsData = settings?.settings as Record<string, any> || {};
      const reminderStatus = settingsData.testimonial_reminder_status as ReminderStatus || 'pending';
      const reminderDate = settingsData.testimonial_reminder_date ? new Date(settingsData.testimonial_reminder_date) : null;
      const accountCreated = user.created_at ? new Date(user.created_at) : new Date();

      // Don't show if cancelled or completed
      if (reminderStatus === 'cancelled' || reminderStatus === 'completed') {
        return;
      }

      // Check if enough days have passed since account creation
      const daysSinceCreation = Math.floor(
        (Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceCreation < minDaysBeforeShow) {
        return;
      }

      // If status is 'later', check if reminder date has passed
      if (reminderStatus === 'later' && reminderDate) {
        if (new Date() < reminderDate) {
          return;
        }
      }

      // Show the dialog
      setIsOpen(true);
    } catch (err) {
      console.error('Error in checkShouldShowReminder:', err);
    }
  };

  const updateReminderStatus = async (status: ReminderStatus, reminderDays?: number) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentSettings = existingSettings?.settings as Record<string, any> || {};
      
      const updates: Record<string, any> = {
        ...currentSettings,
        testimonial_reminder_status: status,
      };

      if (reminderDays) {
        const reminderDate = new Date();
        reminderDate.setDate(reminderDate.getDate() + reminderDays);
        updates.testimonial_reminder_date = reminderDate.toISOString();
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setIsOpen(false);
    } catch (err) {
      console.error('Error updating reminder status:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar sua preferência',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoNow = () => {
    setIsOpen(false);
    navigate('/add-testimonial');
  };

  const handleLater = () => {
    updateReminderStatus('later', 7); // Remind in 7 days
    toast({
      title: 'Tudo bem! 👍',
      description: 'Lembraremos você em 7 dias.'
    });
  };

  const handleCancel = () => {
    updateReminderStatus('cancelled');
    toast({
      title: 'Preferência salva',
      description: 'Não enviaremos mais lembretes sobre depoimentos.'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] overflow-hidden">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
              <MessageSquareHeart className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-left">Sua opinião é valiosa!</DialogTitle>
          </div>
          <DialogDescription className="text-left break-words">
            Você está usando o NutriFlow Pro há algum tempo. 
            Gostaríamos muito de saber sua experiência! 
            Seu depoimento ajuda outros profissionais a conhecerem nossa plataforma.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-8 w-8 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 w-full">
          <Button 
            variant="default" 
            className="w-full sm:flex-1 gap-2"
            onClick={handleDoNow}
            disabled={isLoading}
          >
            <Star className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Deixar Depoimento</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full sm:flex-1 gap-2"
            onClick={handleLater}
            disabled={isLoading}
          >
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Mais Tarde</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full sm:flex-1 gap-2 text-muted-foreground"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <XCircle className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Não Lembrar</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestimonialReminder;
