
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  id?: string;
  user_id: string;
  event_type: string;
  event_data: any;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_data: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

class AuditLogService {
  /**
   * Log a security/audit event
   */
  async logEvent(entry: Omit<AuditLogEntry, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('security_audit_log')
        .insert([{
          ...entry,
          ip_address: entry.ip_address || await this.getClientIP(),
          user_agent: entry.user_agent || navigator.userAgent,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error logging audit event:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in logEvent:', error);
      return false;
    }
  }

  /**
   * Log login attempt
   */
  async logLoginAttempt(userId: string, email: string, success: boolean, errorMessage?: string) {
    return this.logEvent({
      user_id: userId,
      event_type: success ? 'login_success' : 'login_failed',
      event_data: {
        email,
        timestamp: new Date().toISOString(),
        ...(errorMessage && { error: errorMessage })
      }
    });
  }

  /**
   * Log data access
   */
  async logDataAccess(userId: string, resourceType: string, resourceId: string, action: string) {
    return this.logEvent({
      user_id: userId,
      event_type: 'data_access',
      event_data: {
        resource_type: resourceType,
        resource_id: resourceId,
        action,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log patient data modification
   */
  async logPatientDataChange(userId: string, patientId: string, changeType: string, changes: any) {
    return this.logEvent({
      user_id: userId,
      event_type: 'patient_data_change',
      event_data: {
        patient_id: patientId,
        change_type: changeType,
        changes,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log meal plan generation
   */
  async logMealPlanGeneration(userId: string, patientId: string, mealPlanId: string) {
    return this.logEvent({
      user_id: userId,
      event_type: 'meal_plan_generated',
      event_data: {
        patient_id: patientId,
        meal_plan_id: mealPlanId,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log consultation creation/update
   */
  async logConsultationActivity(userId: string, patientId: string, consultationId: string, activity: string) {
    return this.logEvent({
      user_id: userId,
      event_type: 'consultation_activity',
      event_data: {
        patient_id: patientId,
        consultation_id: consultationId,
        activity,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Get recent security events (admin only)
   */
  async getSecurityEvents(limit: number = 100): Promise<SecurityEvent[]> {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching security events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSecurityEvents:', error);
      return [];
    }
  }

  /**
   * Get events by user
   */
  async getUserEvents(userId: string, limit: number = 50): Promise<SecurityEvent[]> {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserEvents:', error);
      return [];
    }
  }

  /**
   * Get client IP address
   */
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
}

export const auditLogService = new AuditLogService();
