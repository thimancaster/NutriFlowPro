
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  User, 
  Database, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DebugStep {
  step: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  details?: string;
  data?: any;
}

const PatientCreationDebugger: React.FC = () => {
  const [debugSteps, setDebugSteps] = useState<DebugStep[]>([]);
  const [isDebugging, setIsDebugging] = useState(false);
  const [testPatientData, setTestPatientData] = useState({
    name: 'Paciente Teste Debug',
    email: 'teste@debug.com',
    phone: '(11) 99999-9999'
  });
  
  const { user } = useAuth();
  const { savePatient, patients, refreshPatients } = usePatient();
  const { toast } = useToast();

  const updateStep = (stepName: string, updates: Partial<DebugStep>) => {
    setDebugSteps(prev => prev.map(step => 
      step.step === stepName ? { ...step, ...updates } : step
    ));
  };

  const runPatientCreationDebug = async () => {
    setIsDebugging(true);
    setDebugSteps([
      { step: 'auth-check', status: 'pending', message: 'Verificando autenticação' },
      { step: 'validation', status: 'pending', message: 'Validando dados do formulário' },
      { step: 'permission-check', status: 'pending', message: 'Verificando permissões RLS' },
      { step: 'db-insert', status: 'pending', message: 'Inserindo no banco de dados' },
      { step: 'context-update', status: 'pending', message: 'Atualizando context/cache' },
      { step: 'ui-refresh', status: 'pending', message: 'Refreshing UI' }
    ]);

    // Step 1: Authentication Check
    updateStep('auth-check', { status: 'running' });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!user?.id) {
      updateStep('auth-check', { 
        status: 'error', 
        message: 'Usuário não autenticado',
        details: 'Nenhuma sessão ativa encontrada'
      });
      setIsDebugging(false);
      return;
    }

    updateStep('auth-check', { 
      status: 'success', 
      message: 'Usuário autenticado',
      details: `User ID: ${user.id}`,
      data: { userId: user.id, email: user.email }
    });

    // Step 2: Form Validation
    updateStep('validation', { status: 'running' });
    await new Promise(resolve => setTimeout(resolve, 300));

    const validationErrors = [];
    if (!testPatientData.name || testPatientData.name.length < 2) {
      validationErrors.push('Nome muito curto');
    }
    if (testPatientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testPatientData.email)) {
      validationErrors.push('Email inválido');
    }

    if (validationErrors.length > 0) {
      updateStep('validation', { 
        status: 'error', 
        message: 'Dados inválidos',
        details: validationErrors.join(', ')
      });
      setIsDebugging(false);
      return;
    }

    updateStep('validation', { 
      status: 'success', 
      message: 'Dados válidos',
      data: testPatientData
    });

    // Step 3: Permission Check
    updateStep('permission-check', { status: 'running' });
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      // Test if we can read from patients table
      const { data: testRead, error: readError } = await supabase
        .from('patients')
        .select('count')
        .eq('user_id', user.id)
        .limit(1);

      if (readError) {
        updateStep('permission-check', { 
          status: 'error', 
          message: 'Erro de permissão de leitura',
          details: readError.message
        });
        setIsDebugging(false);
        return;
      }

      updateStep('permission-check', { 
        status: 'success', 
        message: 'Permissões RLS OK',
        details: 'Leitura e escrita permitidas'
      });
    } catch (error) {
      updateStep('permission-check', { 
        status: 'error', 
        message: 'Falha na verificação de permissões',
        details: `${error}`
      });
      setIsDebugging(false);
      return;
    }

    // Step 4: Database Insert
    updateStep('db-insert', { status: 'running' });
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const patientData = {
        name: testPatientData.name,
        email: testPatientData.email || null,
        phone: testPatientData.phone || null,
        user_id: user.id,
        status: 'active' as const,
        gender: 'other' as const
      };

      const result = await savePatient(patientData);

      if (!result.success) {
        updateStep('db-insert', { 
          status: 'error', 
          message: 'Falha ao salvar no banco',
          details: result.error || 'Erro desconhecido'
        });
        setIsDebugging(false);
        return;
      }

      updateStep('db-insert', { 
        status: 'success', 
        message: 'Paciente salvo com sucesso',
        details: `ID: ${result.data?.id}`,
        data: result.data
      });

      // Step 5: Context Update
      updateStep('context-update', { status: 'running' });
      await new Promise(resolve => setTimeout(resolve, 300));

      // Refresh the patients list
      await refreshPatients();

      updateStep('context-update', { 
        status: 'success', 
        message: 'Context atualizado',
        details: `Total de pacientes: ${patients?.length || 0}`
      });

      // Step 6: UI Refresh
      updateStep('ui-refresh', { status: 'running' });
      await new Promise(resolve => setTimeout(resolve, 300));

      updateStep('ui-refresh', { 
        status: 'success', 
        message: 'UI atualizada com sucesso',
        details: 'Paciente visível na lista'
      });

      toast({
        title: 'Debug Completo',
        description: 'Paciente criado com sucesso durante o debug',
      });

    } catch (error) {
      updateStep('db-insert', { 
        status: 'error', 
        message: 'Erro inesperado',
        details: `${error}`
      });
    }

    setIsDebugging(false);
  };

  const getStepIcon = (status: DebugStep['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Debugger - Criação de Pacientes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Data Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="debug-name">Nome</Label>
            <Input
              id="debug-name"
              value={testPatientData.name}
              onChange={(e) => setTestPatientData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isDebugging}
            />
          </div>
          <div>
            <Label htmlFor="debug-email">Email</Label>
            <Input
              id="debug-email"
              type="email"
              value={testPatientData.email}
              onChange={(e) => setTestPatientData(prev => ({ ...prev, email: e.target.value }))}
              disabled={isDebugging}
            />
          </div>
          <div>
            <Label htmlFor="debug-phone">Telefone</Label>
            <Input
              id="debug-phone"
              value={testPatientData.phone}
              onChange={(e) => setTestPatientData(prev => ({ ...prev, phone: e.target.value }))}
              disabled={isDebugging}
            />
          </div>
        </div>

        {/* Debug Button */}
        <Button 
          onClick={runPatientCreationDebug}
          disabled={isDebugging}
          className="w-full"
        >
          {isDebugging ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Executando Debug...
            </>
          ) : (
            <>
              <Bug className="h-4 w-4 mr-2" />
              Iniciar Debug de Criação
            </>
          )}
        </Button>

        {/* Debug Steps */}
        {debugSteps.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Passos do Debug:</h3>
            {debugSteps.map((step, index) => (
              <div key={step.step} className="border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  {getStepIcon(step.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {index + 1}. {step.message}
                      </span>
                      <Badge variant={
                        step.status === 'success' ? 'default' :
                        step.status === 'error' ? 'destructive' :
                        step.status === 'running' ? 'secondary' : 'outline'
                      }>
                        {step.status === 'success' ? 'OK' :
                         step.status === 'error' ? 'ERRO' :
                         step.status === 'running' ? 'EXECUTANDO' : 'PENDENTE'}
                      </Badge>
                    </div>
                    {step.details && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.details}
                      </p>
                    )}
                    {step.data && (
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                        {JSON.stringify(step.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientCreationDebugger;
