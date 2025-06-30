
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { useClinicalFlowAudit } from '@/hooks/clinical/useClinicalFlowAudit';

interface ClinicalFlowAuditPanelProps {
  patientId?: string;
  appointmentId?: string;
}

const ClinicalFlowAuditPanel: React.FC<ClinicalFlowAuditPanelProps> = ({
  patientId,
  appointmentId
}) => {
  const { auditResults, isAuditing, runAudit } = useClinicalFlowAudit(patientId, appointmentId);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  if (!auditResults && !isAuditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Auditoria Técnica - Clinical Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runAudit} disabled={isAuditing}>
            {isAuditing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Auditando...
              </>
            ) : (
              'Executar Auditoria'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isAuditing) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin mr-4" />
          <span>Executando auditoria técnica...</span>
        </CardContent>
      </Card>
    );
  }

  const allIssues = auditResults ? Object.entries(auditResults)
    .filter(([key]) => key !== 'recommendations')
    .flatMap(([_, issues]) => issues as any[])
    .filter(issue => typeof issue === 'object') : [];

  const criticalCount = allIssues.filter(issue => issue.severity === 'critical').length;
  const warningCount = allIssues.filter(issue => issue.severity === 'warning').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Auditoria Técnica - Clinical Flow
            </span>
            <Button variant="outline" size="sm" onClick={runAudit}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Badge variant="destructive">
              {criticalCount} Críticos
            </Badge>
            <Badge variant="secondary">
              {warningCount} Avisos
            </Badge>
            <Badge variant="default">
              {allIssues.length - criticalCount - warningCount} Informações
            </Badge>
          </div>

          {auditResults && Object.entries(auditResults).map(([category, issues]) => {
            if (category === 'recommendations' || !Array.isArray(issues)) return null;
            
            return (
              <div key={category} className="mb-6">
                <h3 className="font-semibold mb-3 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div className="space-y-2">
                  {issues.map((issue, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{issue.issue}</span>
                            <Badge variant={getSeverityColor(issue.severity) as any}>
                              {issue.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {issue.details}
                          </p>
                          {issue.fix && (
                            <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                              <strong>Solução:</strong> {issue.fix}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {auditResults?.recommendations && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">📋 Recomendações</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {auditResults.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicalFlowAuditPanel;
