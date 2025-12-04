
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useSystemDiagnostics } from '@/hooks/clinical/useSystemDiagnostics';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useAuth } from '@/contexts/auth/AuthContext';

const SystemHealthMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { diagnostics, isRunning, runFullDiagnostics } = useSystemDiagnostics();
  const { patients, activePatient, isLoading } = usePatient();
  const { user } = useAuth();

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(runFullDiagnostics, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, runFullDiagnostics]);

  // Show dev mode only in development environment
  // Note: This is a dev-only tool, not an admin feature requiring server-side checks
  const isDevelopment = import.meta.env.DEV;
  const shouldShow = isDevelopment;

  if (!shouldShow) return null;

  const getHealthColor = (overall: string) => {
    switch (overall) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="bg-white shadow-lg hover:shadow-xl"
        >
          <Activity className="h-4 w-4 mr-2" />
          System Health
          {diagnostics && (
            <Badge 
              variant={diagnostics.overall === 'healthy' ? 'default' : 'destructive'}
              className="ml-2"
            >
              {Math.round(diagnostics.score)}%
            </Badge>
          )}
        </Button>
      ) : (
        <Card className="w-80 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                System Monitor
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsVisible(false)}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Real-time Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>User:</span>
                <Badge variant={user ? 'default' : 'destructive'}>
                  {user ? '✓' : '✗'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Patients Loaded:</span>
                <Badge variant={patients.length > 0 ? 'default' : 'secondary'}>
                  {patients.length}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Active Patient:</span>
                <Badge variant={activePatient ? 'default' : 'secondary'}>
                  {activePatient ? '✓' : '✗'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Loading:</span>
                <Badge variant={isLoading ? 'secondary' : 'default'}>
                  {isLoading ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>

            {/* Diagnostics Results */}
            {diagnostics && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">System Health</span>
                  <span className={`text-sm font-bold ${getHealthColor(diagnostics.overall)}`}>
                    {diagnostics.overall.toUpperCase()}
                  </span>
                </div>
                
                <Progress value={diagnostics.score} className="h-2" />
                
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <div className="text-center">
                    <CheckCircle className="h-3 w-3 mx-auto text-green-500" />
                    <div>{diagnostics.results.filter(r => r.status === 'pass').length}</div>
                  </div>
                  <div className="text-center">
                    <AlertTriangle className="h-3 w-3 mx-auto text-yellow-500" />
                    <div>{diagnostics.results.filter(r => r.status === 'warning').length}</div>
                  </div>
                  <div className="text-center">
                    <XCircle className="h-3 w-3 mx-auto text-red-500" />
                    <div>{diagnostics.results.filter(r => r.status === 'critical').length}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={runFullDiagnostics}
                disabled={isRunning}
                className="flex-1"
              >
                {isRunning ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  'Run Check'
                )}
              </Button>
              
              <Button
                size="sm"
                variant={autoRefresh ? 'default' : 'outline'}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* Debug Info */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>ENV: {process.env.NODE_ENV}</div>
              <div>Last Check: {diagnostics ? new Date().toLocaleTimeString() : 'Never'}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemHealthMonitor;
