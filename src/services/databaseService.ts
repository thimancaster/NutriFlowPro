
import { supabase } from '@/integrations/supabase/client';
import { patientService } from './patientService';
import { ConsultationService } from './consultationService';

export const databaseService = {
  patients: patientService,
  consultations: ConsultationService
};
