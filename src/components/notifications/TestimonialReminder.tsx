import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, MessageSquareHeart, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Confetti } from '@/components/ui/confetti';

type ReminderStatus = 'pending' | 'later' | 'cancelled' | 'completed';

interface TestimonialReminderProps {
  minDaysBeforeShow?: number;
}

const TestimonialReminder: React.FC<TestimonialReminderProps> = ({ 
  minDaysBeforeShow = 7 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
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

      if (reminderStatus === 'cancelled' || reminderStatus === 'completed') {
        return;
      }

      const daysSinceCreation = Math.floor(
        (Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceCreation < minDaysBeforeShow) {
        return;
      }

      if (reminderStatus === 'later' && reminderDate) {
        if (new Date() < reminderDate) {
          return;
        }
      }

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
    setShowConfetti(true);
    setTimeout(() => {
      setIsOpen(false);
      navigate('/add-testimonial');
    }, 800);
  };

  const handleLater = () => {
    updateReminderStatus('later', 7);
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
    <>
      <Confetti isActive={showConfetti} />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <AnimatePresence>
          {isOpen && (
            <DialogContent 
              className="sm:max-w-[420px] max-w-[calc(100vw-2rem)] p-0 overflow-hidden border-0 shadow-2xl"
              onInteractOutside={() => setIsOpen(false)}
              onEscapeKeyDown={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-card rounded-lg"
              >
                {/* Header com ícone centralizado */}
                <div className="pt-6 px-6">
                  <DialogHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                      <motion.div 
                        initial={{ rotate: -10, scale: 0.9 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                        className="p-3 bg-primary/15 rounded-xl"
                      >
                        <MessageSquareHeart className="h-7 w-7 text-primary" />
                      </motion.div>
                    </div>
                    <DialogTitle className="text-xl font-semibold text-foreground text-center">
                      Sua opinião é valiosa!
                    </DialogTitle>
                  </DialogHeader>
                </div>

                {/* Conteúdo centralizado */}
                <div className="px-6 pt-3 pb-2">
                  <DialogDescription className="text-muted-foreground text-sm leading-relaxed text-center">
                    Você está usando o NutriFlow Pro há algum tempo. Gostaríamos muito de saber sua experiência! Seu depoimento ajuda outros profissionais a conhecerem nossa plataforma.
                  </DialogDescription>

                  {/* Estrelas animadas */}
                  <motion.div 
                    className="flex justify-center py-5 gap-1.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    {[1, 2, 3, 4, 5].map((star, index) => (
                      <motion.div
                        key={star}
                        initial={{ opacity: 0, scale: 0, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ 
                          delay: 0.2 + index * 0.08, 
                          type: "spring", 
                          stiffness: 300 
                        }}
                      >
                        <Star className="h-9 w-9 text-yellow-400 fill-yellow-400 drop-shadow-md" />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Botões com hover melhorado */}
                <div className="p-6 pt-2 space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant="default" 
                      className="w-full gap-2 h-12 font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:brightness-110"
                      onClick={handleDoNow}
                      disabled={isLoading}
                    >
                      <Star className="h-5 w-5" />
                      Deixar Depoimento
                    </Button>
                  </motion.div>
                  
                  <div className="flex gap-3">
                    <motion.div 
                      className="flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="outline" 
                        className="w-full gap-2 h-11 transition-all duration-200 hover:bg-accent hover:border-primary/30"
                        onClick={handleLater}
                        disabled={isLoading}
                      >
                        <Clock className="h-4 w-4" />
                        Mais Tarde
                      </Button>
                    </motion.div>
                    
                    <motion.div 
                      className="flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="ghost" 
                        className="w-full gap-2 h-11 text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/50"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        <XCircle className="h-4 w-4" />
                        Não Lembrar
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          )}
        </AnimatePresence>
      </Dialog>
    </>
  );
};

export default TestimonialReminder;
