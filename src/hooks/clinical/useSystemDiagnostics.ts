
import { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticResult {
  category: string;
  status: 'pass' | 'warning' | 'critical';
  message: string;
  details?: string;
  action?: string;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  score: number;
  results: DiagnosticResult[];
  recommendations: string[];
}

// Lista manual de tabelas conhecidas - usando tipos explícitos
const REQUIRED_TABLES = ['patients', 'calculations', 'appointments', 'users'] as const;
const KNOWN_TABLES = [
  'patients', 'calculations', 'appointments', 'users', 'measurements',
  'meal_plans', 'meal_plan_items', 'foods', 'subscribers', 'user_settings'
] as const;

type KnownTable = typeof KNOWN_TABLES[number];

export const useSystemDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<SystemHealth | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();
  const { patients, activePatient } = usePatient();

  const testTableAccess = async (tableName: KnownTable): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('count')
        .limit(1);
      return !error;
    } catch {
      return false;
    }
  };

  const runFullDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];
    const recommendations: string[] = [];

    try {
      // 1. Authentication & User State Check
      if (!user?.id) {
        results.push({
          category: 'Authentication',
          status: 'critical',
          message: 'User not authenticated',
          details: 'No valid user session found',
          action: 'Redirect to login page'
        });
      } else {
        results.push({
          category: 'Authentication',
          status: 'pass',
          message: 'User authenticated successfully',
          details: `User ID: ${user.id}`
        });
      }

      // 2. Database Connectivity
      try {
        const isAccessible = await testTableAccess('patients');
        
        if (isAccessible) {
          results.push({
            category: 'Database',
            status: 'pass',
            message: 'Supabase connection active',
            details: 'Database queries executing successfully'
          });
        } else {
          throw new Error('Database connection test failed');
        }
      } catch (error) {
        results.push({
          category: 'Database',
          status: 'critical',
          message: 'Database connection failed',
          details: `Error: ${error}`,
          action: 'Check Supabase configuration'
        });
      }

      // 3. Patient Context & Data Flow
      if (!patients || patients.length === 0) {
        results.push({
          category: 'Patient Data',
          status: 'warning',
          message: 'No patients loaded',
          details: 'Patient list is empty',
          action: 'Check patient data loading'
        });
        recommendations.push('Verify patient loading hooks and API calls');
      } else {
        results.push({
          category: 'Patient Data',
          status: 'pass',
          message: `${patients.length} patients loaded`,
          details: `Active patient: ${activePatient?.name || 'None'}`
        });
      }

      // 4. Clinical Module Integration
      if (activePatient) {
        try {
          const { data: consultations } = await supabase
            .from('calculations')
            .select('*')
            .eq('patient_id', activePatient.id)
            .limit(5);

          if (!consultations || consultations.length === 0) {
            results.push({
              category: 'Clinical Integration',
              status: 'warning',
              message: 'No consultations found for active patient',
              details: 'Clinical module may not be saving data',
              action: 'Check clinical data persistence'
            });
            recommendations.push('Implement proper clinical session saving');
          } else {
            results.push({
              category: 'Clinical Integration',
              status: 'pass',
              message: `${consultations.length} consultations found`,
              details: 'Clinical data is being persisted'
            });
          }
        } catch (error) {
          results.push({
            category: 'Clinical Integration',
            status: 'critical',
            message: 'Clinical data query failed',
            details: `Error: ${error}`,
            action: 'Check calculations table and RLS policies'
          });
        }
      }

      // 5. Schema Validation (usando lista manual com tipos explícitos)
      try {
        const tableTests = await Promise.allSettled(
          REQUIRED_TABLES.map(async (table) => {
            const accessible = await testTableAccess(table);
            return { table, accessible };
          })
        );

        const inaccessibleTables = tableTests
          .map((result, index) => {
            if (result.status === 'fulfilled' && !result.value.accessible) {
              return REQUIRED_TABLES[index];
            }
            return null;
          })
          .filter(Boolean);

        if (inaccessibleTables.length > 0) {
          results.push({
            category: 'Schema',
            status: 'critical',
            message: 'Required tables not accessible',
            details: `Inaccessible: ${inaccessibleTables.join(', ')}`,
            action: 'Check RLS policies and table permissions'
          });
          recommendations.push('Verify database permissions and RLS policies');
        } else {
          results.push({
            category: 'Schema',
            status: 'pass',
            message: 'All required tables accessible',
            details: 'Database schema and permissions are working'
          });
        }
      } catch (error) {
        results.push({
          category: 'Schema',
          status: 'warning',
          message: 'Could not verify schema completely',
          details: 'Schema check had partial access'
        });
      }

      // 6. Performance & State Management
      const performanceIssues = [];
      if (patients && patients.length > 100) {
        performanceIssues.push('Large patient dataset may need pagination');
      }
      
      if (performanceIssues.length > 0) {
        results.push({
          category: 'Performance',
          status: 'warning',
          message: 'Performance concerns detected',
          details: performanceIssues.join(', '),
          action: 'Implement pagination and lazy loading'
        });
        recommendations.push('Optimize data loading with pagination');
      } else {
        results.push({
          category: 'Performance',
          status: 'pass',
          message: 'Performance indicators normal'
        });
      }

      // 7. Calculate Overall Health
      const criticalCount = results.filter(r => r.status === 'critical').length;
      const warningCount = results.filter(r => r.status === 'warning').length;
      const passCount = results.filter(r => r.status === 'pass').length;

      let overall: 'healthy' | 'degraded' | 'critical';
      let score: number;

      if (criticalCount > 0) {
        overall = 'critical';
        score = Math.max(0, (passCount / results.length) * 30);
      } else if (warningCount > 0) {
        overall = 'degraded';
        score = (passCount / results.length) * 75;
      } else {
        overall = 'healthy';
        score = 100;
      }

      // Add general recommendations
      if (criticalCount > 0) {
        recommendations.push('Address critical issues immediately');
      }
      if (warningCount > 0) {
        recommendations.push('Review warning items for optimization');
      }
      recommendations.push('Run diagnostics regularly to monitor system health');

      setDiagnostics({
        overall,
        score,
        results,
        recommendations
      });

    } catch (error) {
      console.error('Diagnostics failed:', error);
      setDiagnostics({
        overall: 'critical',
        score: 0,
        results: [{
          category: 'System',
          status: 'critical',
          message: 'Diagnostic system failure',
          details: `Error: ${error}`,
          action: 'Check console for detailed errors'
        }],
        recommendations: ['Fix diagnostic system errors']
      });
    } finally {
      setIsRunning(false);
    }
  };

  return {
    diagnostics,
    isRunning,
    runFullDiagnostics
  };
};
