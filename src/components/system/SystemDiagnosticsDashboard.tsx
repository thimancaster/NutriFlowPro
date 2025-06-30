
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Activity,
  Database,
  Users,
  Stethoscope
} from 'lucide-react';
import { useSystemDiagnostics } from '@/hooks/clinical/useSystemDiagnostics';

const SystemDiagnosticsDashboard: React.FC = () => {
  const { diagnostics, isRunning, runFullDiagnostics } = useSystemDiagnostics();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'database': return <Database className="h-4 w-4" />;
      case 'patient data': return <Users className="h-4 w-4" />;
      case 'clinical integration': return <Stethoscope className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Diagnóstico do Sistema
            </CardTitle>
            <Button 
              onClick={runFullDiagnostics} 
              disabled={isRunning}
              variant="outline"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Executar Diagnóstico
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {diagnostics && (
          <CardContent>
            {/* Overall Health Score */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Saúde Geral do Sistema</span>
                <Badge 
                  variant={
                    diagnostics.overall === 'healthy' ? 'default' :
                    diagnostics.overall === 'degraded' ? 'secondary' : 'destructive'
                  }
                >
                  {diagnostics.overall === 'healthy' ? 'Saudável' :
                   diagnostics.overall === 'degraded' ? 'Degradado' : 'Crítico'}
                </Badge>
              </div>
              <Progress value={diagnostics.score} className="h-3" />
              <p className="text-sm text-muted-foreground mt-1">
                Score: {Math.round(diagnostics.score)}/100
              </p>
            </div>

            {/* Diagnostic Results */}
            <div className="space-y-4">
              <h3 className="font-semibold">Resultados do Diagnóstico</h3>
              {diagnostics.results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {getCategoryIcon(result.category)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{result.category}</span>
                        <Badge variant={getStatusColor(result.status) as any}>
                          {getStatusIcon(result.status)}
                          <span className="ml-1">
                            {result.status === 'pass' ? 'OK' :
                             result.status === 'warning' ? 'Aviso' : 'Crítico'}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm mb-1">{result.message}</p>
                      {result.details && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {result.details}
                        </p>
                      )}
                      {result.action && (
                        <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                          <strong>Ação recomendada:</strong> {result.action}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {diagnostics.recommendations.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Recomendações</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {diagnostics.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        )}

        {!diagnostics && !isRunning && (
          <CardContent>
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Execute o diagnóstico para verificar a saúde do sistema
              </p>
            </div>
          </CardContent>
        )}

        {isRunning && (
          <CardContent>
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 mx-auto animate-spin text-blue-500 mb-4" />
              <p className="text-muted-foreground">
                Executando diagnóstico completo do sistema...
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default SystemDiagnosticsDashboard;
