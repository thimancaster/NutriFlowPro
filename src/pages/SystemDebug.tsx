
import React from 'react';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SystemDiagnosticsDashboard from '@/components/system/SystemDiagnosticsDashboard';
import PatientCreationDebugger from '@/components/system/PatientCreationDebugger';
import ClinicalFlowAuditPanel from '@/components/clinical/ClinicalFlowAuditPanel';
import EcosystemIntegrationFixer from '@/components/system/EcosystemIntegrationFixer';

const SystemDebug = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">System Debug & Diagnostics</h1>
          <p className="text-gray-600 mt-2">
            Ferramentas para diagnosticar e corrigir problemas do sistema
          </p>
        </div>

        <Tabs defaultValue="diagnostics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="diagnostics">Diagnóstico Geral</TabsTrigger>
            <TabsTrigger value="patient-debug">Debug Pacientes</TabsTrigger>
            <TabsTrigger value="clinical-audit">Auditoria Clínica</TabsTrigger>
            <TabsTrigger value="ecosystem-fixer">Correção Ecossistema</TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostics" className="space-y-4">
            <SystemDiagnosticsDashboard />
          </TabsContent>

          <TabsContent value="patient-debug" className="space-y-4">
            <PatientCreationDebugger />
          </TabsContent>

          <TabsContent value="clinical-audit" className="space-y-4">
            <ClinicalFlowAuditPanel />
          </TabsContent>

          <TabsContent value="ecosystem-fixer" className="space-y-4">
            <EcosystemIntegrationFixer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemDebug;
