import { Patient } from '@/types';
import { PatientService } from './index';
import { getPatientAnthropometryHistory, getLatestAnthropometryByPatient } from '../anthropometryService';
import { getConsultationHistory } from '../consultationHistoryService';

export interface PatientCompleteData {
  patient: Patient;
  anthropometryHistory: any[];
  consultationHistory: any[];
  lastMeasurement: any | null;
  lastConsultation: any | null;
}

export class PatientDataService {
  private static cache = new Map<string, { data: PatientCompleteData; timestamp: number }>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async getCompletePatientData(
    userId: string, 
    patientId: string, 
    forceRefresh = false
  ): Promise<PatientCompleteData | null> {
    const cacheKey = `${userId}_${patientId}`;
    const now = Date.now();

    // Check cache first
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (now - cached.timestamp < this.CACHE_DURATION) {
        console.log('Returning cached patient data for:', patientId);
        return cached.data;
      }
    }

    try {
      console.log('Loading complete patient data for:', patientId);

      // Load all data in parallel for better performance
      const [
        patientResult,
        anthropometryHistoryResult,
        consultationHistoryResult,
        latestMeasurementResult
      ] = await Promise.all([
        PatientService.getPatient(patientId),
        getPatientAnthropometryHistory(userId, patientId),
        getConsultationHistory(patientId, userId).catch(() => []), // Handle gracefully
        getLatestAnthropometryByPatient(userId, patientId)
      ]);

      if (!patientResult.success || !patientResult.data) {
        console.error('Failed to load patient data');
        return null;
      }

      const completeData: PatientCompleteData = {
        patient: patientResult.data,
        anthropometryHistory: anthropometryHistoryResult.success 
          ? anthropometryHistoryResult.data || [] 
          : [],
        consultationHistory: Array.isArray(consultationHistoryResult) 
          ? consultationHistoryResult 
          : [],
        lastMeasurement: latestMeasurementResult.success && latestMeasurementResult.data 
          ? latestMeasurementResult.data[0] 
          : null,
        lastConsultation: Array.isArray(consultationHistoryResult) && consultationHistoryResult.length > 0
          ? consultationHistoryResult[0]
          : null
      };

      // Update cache
      this.cache.set(cacheKey, {
        data: completeData,
        timestamp: now
      });

      console.log('Complete patient data loaded:', {
        patient: completeData.patient.name,
        anthropometryCount: completeData.anthropometryHistory.length,
        consultationCount: completeData.consultationHistory.length,
        hasLastMeasurement: !!completeData.lastMeasurement,
        hasLastConsultation: !!completeData.lastConsultation
      });

      return completeData;

    } catch (error) {
      console.error('Error loading complete patient data:', error);
      return null;
    }
  }

  static async getLatestPatientMeasurements(
    userId: string, 
    patientId: string
  ): Promise<{ weight?: number; height?: number; age?: number } | null> {
    try {
      const completeData = await this.getCompletePatientData(userId, patientId);
      
      if (!completeData) return null;

      return {
        weight: completeData.lastMeasurement?.weight || undefined,
        height: completeData.lastMeasurement?.height || undefined,
        age: completeData.patient.age || undefined
      };
    } catch (error) {
      console.error('Error getting latest measurements:', error);
      return null;
    }
  }

  static async getPatientEvolutionData(
    userId: string, 
    patientId: string
  ): Promise<{
    weightEvolution: Array<{ date: string; weight: number }>;
    consultationEvolution: Array<{ date: string; calories: number; protein: number }>;
  }> {
    try {
      const completeData = await this.getCompletePatientData(userId, patientId);
      
      if (!completeData) {
        return { weightEvolution: [], consultationEvolution: [] };
      }

      // Process weight evolution from anthropometry history
      const weightEvolution = completeData.anthropometryHistory
        .filter(measurement => measurement.weight && measurement.date)
        .map(measurement => ({
          date: measurement.date,
          weight: measurement.weight
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Process consultation evolution
      const consultationEvolution = completeData.consultationHistory
        .map(consultation => ({
          date: consultation.calculation_date || consultation.created_at,
          calories: consultation.get || 0,
          protein: consultation.protein_g || 0
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return { weightEvolution, consultationEvolution };

    } catch (error) {
      console.error('Error getting patient evolution data:', error);
      return { weightEvolution: [], consultationEvolution: [] };
    }
  }

  static clearCache(userId?: string, patientId?: string) {
    if (userId && patientId) {
      const cacheKey = `${userId}_${patientId}`;
      this.cache.delete(cacheKey);
      console.log('Cleared cache for patient:', patientId);
    } else {
      this.cache.clear();
      console.log('Cleared all patient data cache');
    }
  }

  static getCacheStatus() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}