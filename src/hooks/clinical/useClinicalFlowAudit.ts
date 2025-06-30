
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePatient } from '@/contexts/patient/PatientContext';

interface AuditResult {
  category: string;
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  details: string;
  fix?: string;
}

interface ClinicalFlowAudit {
  patientIntegration: AuditResult[];
  appointmentIntegration: AuditResult[];
  consultationPersistence: AuditResult[];
  moduleConnections: AuditResult[];
  dataConsistency: AuditResult[];
  backendIntegration: AuditResult[];
  recommendations: string[];
}

export const useClinicalFlowAudit = (patientId?: string, appointmentId?: string) => {
  const [auditResults, setAuditResults] = useState<ClinicalFlowAudit | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const { user } = useAuth();
  const { activePatient } = usePatient();

  const runAudit = async () => {
    setIsAuditing(true);
    
    const audit: ClinicalFlowAudit = {
      patientIntegration: [],
      appointmentIntegration: [],
      consultationPersistence: [],
      moduleConnections: [],
      dataConsistency: [],
      backendIntegration: [],
      recommendations: []
    };

    try {
      // 1. PATIENT INTEGRATION CHECK
      if (!patientId && !activePatient?.id) {
        audit.patientIntegration.push({
          category: 'Patient Integration',
          issue: 'No patient ID available',
          severity: 'critical',
          details: 'Clinical Flow não possui referência ao paciente ativo',
          fix: 'Implementar passagem de patientId via route params ou context'
        });
      }

      const currentPatientId = patientId || activePatient?.id;
      if (currentPatientId) {
        const { data: patient, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', currentPatientId)
          .single();

        if (patientError || !patient) {
          audit.patientIntegration.push({
            category: 'Patient Integration',
            issue: 'Patient data not found',
            severity: 'critical',
            details: `Paciente ${currentPatientId} não encontrado na base de dados`,
            fix: 'Verificar se o ID do paciente está correto e se existe na tabela patients'
          });
        } else {
          audit.patientIntegration.push({
            category: 'Patient Integration',
            issue: 'Patient integration OK',
            severity: 'info',
            details: `Paciente ${patient.name} carregado corretamente`
          });
        }
      }

      // 2. APPOINTMENT INTEGRATION CHECK
      if (appointmentId) {
        const { data: appointment, error: appointmentError } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', appointmentId)
          .single();

        if (appointmentError || !appointment) {
          audit.appointmentIntegration.push({
            category: 'Appointment Integration',
            issue: 'Appointment not found',
            severity: 'warning',
            details: `Agendamento ${appointmentId} não encontrado`,
            fix: 'Verificar se o appointment_id está sendo passado corretamente'
          });
        } else if (appointment.patient_id !== currentPatientId) {
          audit.appointmentIntegration.push({
            category: 'Appointment Integration',
            issue: 'Patient-Appointment mismatch',
            severity: 'critical',
            details: 'Agendamento não pertence ao paciente atual',
            fix: 'Validar a relação entre patient_id e appointment_id'
          });
        }
      } else {
        audit.appointmentIntegration.push({
          category: 'Appointment Integration',
          issue: 'No appointment linked',
          severity: 'warning',
          details: 'Clinical Flow não está vinculado a um agendamento específico'
        });
      }

      // 3. CONSULTATION PERSISTENCE CHECK
      const { data: calculations, error: calculationsError } = await supabase
        .from('calculations')
        .select('*')
        .eq('patient_id', currentPatientId)
        .order('created_at', { ascending: false });

      if (calculationsError) {
        audit.consultationPersistence.push({
          category: 'Consultation Persistence',
          issue: 'Error fetching consultations',
          severity: 'critical',
          details: `Erro ao buscar consultas: ${calculationsError.message}`,
          fix: 'Verificar permissões RLS na tabela calculations'
        });
      } else if (!calculations?.length) {
        audit.consultationPersistence.push({
          category: 'Consultation Persistence',
          issue: 'No consultations found',
          severity: 'warning',
          details: 'Nenhuma consulta salva encontrada para este paciente'
        });
      }

      // 4. MODULE CONNECTIONS CHECK
      // Check if anthropometry data exists
      const { data: anthropometry } = await supabase
        .from('anthropometry')
        .select('*')
        .eq('patient_id', currentPatientId)
        .order('created_at', { ascending: false })
        .limit(1);

      // Check if meal plans exist
      const { data: mealPlans } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('patient_id', currentPatientId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!anthropometry?.length) {
        audit.moduleConnections.push({
          category: 'Module Connections',
          issue: 'No anthropometry data',
          severity: 'warning',
          details: 'Sem dados antropométricos vinculados'
        });
      }

      if (!mealPlans?.length) {
        audit.moduleConnections.push({
          category: 'Module Connections',
          issue: 'No meal plans',
          severity: 'info',
          details: 'Nenhum plano alimentar gerado para este paciente'
        });
      }

      // 5. DATA CONSISTENCY CHECK
      if (calculations?.length) {
        const latestCalculation = calculations[0];
        if (!latestCalculation.weight || !latestCalculation.height) {
          audit.dataConsistency.push({
            category: 'Data Consistency',
            issue: 'Incomplete consultation data',
            severity: 'warning',
            details: 'Consulta mais recente possui dados incompletos (peso/altura)'
          });
        }

        if (latestCalculation.status === 'em_andamento') {
          audit.dataConsistency.push({
            category: 'Data Consistency',
            issue: 'Unfinished consultation',
            severity: 'info',
            details: 'Existe uma consulta em andamento'
          });
        }
      }

      // 6. BACKEND INTEGRATION CHECK
      try {
        const { data: testConnection } = await supabase
          .from('patients')
          .select('count')
          .limit(1);
        
        audit.backendIntegration.push({
          category: 'Backend Integration',
          issue: 'Supabase connection OK',
          severity: 'info',
          details: 'Conexão com Supabase funcionando corretamente'
        });
      } catch (error) {
        audit.backendIntegration.push({
          category: 'Backend Integration',
          issue: 'Supabase connection error',
          severity: 'critical',
          details: `Erro de conexão: ${error}`,
          fix: 'Verificar configuração do cliente Supabase'
        });
      }

      // GENERATE RECOMMENDATIONS
      const criticalIssues = Object.values(audit).flat().filter(issue => 
        typeof issue === 'object' && issue.severity === 'critical'
      ).length;

      if (criticalIssues > 0) {
        audit.recommendations.push('🚨 Existem problemas críticos que impedem o funcionamento adequado');
        audit.recommendations.push('📋 Criar tabela clinical_sessions para melhor organização dos dados');
        audit.recommendations.push('🔗 Implementar hook useClinicalSession(patientId, appointmentId)');
      }

      audit.recommendations.push('✅ Implementar testes automatizados para detectar quebras');
      audit.recommendations.push('📊 Adicionar logging detalhado para debug');
      audit.recommendations.push('🔄 Considerar usar React Query para cache centralizado');

    } catch (error) {
      console.error('Audit error:', error);
    }

    setAuditResults(audit);
    setIsAuditing(false);
  };

  useEffect(() => {
    if (user?.id && (patientId || activePatient?.id)) {
      runAudit();
    }
  }, [user?.id, patientId, activePatient?.id]);

  return {
    auditResults,
    isAuditing,
    runAudit
  };
};
