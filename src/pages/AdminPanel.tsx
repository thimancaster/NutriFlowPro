import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database, Upload, CheckCircle, AlertCircle, Loader2, Bug, TestTube, UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TestE2E from './TestE2E';
import SystemDebug from './SystemDebug';

interface SeedStats {
  total: number;
  inserted: number;
  duplicates: number;
  errors: number;
}

interface SeedResponse {
  success: boolean;
  message?: string;
  stats?: SeedStats;
  error?: string;
}

export default function AdminPanel() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResponse | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('database');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSeedDatabase = async () => {
    try {
      setIsSeeding(true);
      setSeedResult(null);
      setProgress(10);

      toast({
        title: 'Iniciando seed...',
        description: 'Preparando para inserir alimentos TACO no banco de dados.',
      });

      setProgress(30);

      // Call edge function to seed database
      const { data, error } = await supabase.functions.invoke('seed-taco-foods', {
        body: {}
      });

      setProgress(90);

      if (error) {
        throw error;
      }

      setProgress(100);
      setSeedResult(data as SeedResponse);

      if (data?.success) {
        toast({
          title: 'Seed concluído com sucesso!',
          description: data.message || 'Alimentos TACO foram inseridos no banco de dados.',
        });
      } else {
        toast({
          title: 'Erro no seed',
          description: data?.error || 'Ocorreu um erro ao inserir os alimentos.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('[Admin] Seed error:', error);
      setSeedResult({
        success: false,
        error: error.message || 'Erro desconhecido ao executar seed'
      });
      toast({
        title: 'Erro ao executar seed',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel de Administração</h1>
        <p className="text-muted-foreground">
          Gerencie os dados do sistema e execute operações administrativas
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Banco de Dados
          </TabsTrigger>
          <TabsTrigger value="foods" className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Alimentos
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Diagnóstico
          </TabsTrigger>
          <TabsTrigger value="tests" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Testes E2E
          </TabsTrigger>
        </TabsList>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Seed de Alimentos TACO
              </CardTitle>
              <CardDescription>
                Insira 200+ alimentos brasileiros da Tabela TACO no banco de dados.
                <br />
                Alimentos duplicados serão ignorados automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSeeding && progress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Processando...</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <Button
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                size="lg"
                className="w-full"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executando seed...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Executar Seed de Alimentos TACO
                  </>
                )}
              </Button>

              {seedResult && (
                <Alert variant={seedResult.success ? 'default' : 'destructive'}>
                  {seedResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {seedResult.success ? (
                      <div className="space-y-2">
                        <p className="font-medium">{seedResult.message}</p>
                        {seedResult.stats && (
                          <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                            <div className="bg-background/50 p-2 rounded">
                              <div className="text-muted-foreground">Total</div>
                              <div className="text-lg font-bold">{seedResult.stats.total}</div>
                            </div>
                            <div className="bg-background/50 p-2 rounded">
                              <div className="text-muted-foreground">Inseridos</div>
                              <div className="text-lg font-bold text-green-600">
                                {seedResult.stats.inserted}
                              </div>
                            </div>
                            <div className="bg-background/50 p-2 rounded">
                              <div className="text-muted-foreground">Duplicados</div>
                              <div className="text-lg font-bold text-yellow-600">
                                {seedResult.stats.duplicates}
                              </div>
                            </div>
                            <div className="bg-background/50 p-2 rounded">
                              <div className="text-muted-foreground">Erros</div>
                              <div className="text-lg font-bold text-red-600">
                                {seedResult.stats.errors}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p>{seedResult.error}</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-muted-foreground space-y-1 mt-4">
                <p className="font-medium">Informações importantes:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>São inseridos 200+ alimentos da Tabela TACO brasileira</li>
                  <li>Inclui cereais, leguminosas, vegetais, frutas, proteínas, laticínios e oleaginosas</li>
                  <li>Alimentos duplicados são automaticamente ignorados</li>
                  <li>O processo é seguro e pode ser executado múltiplas vezes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Foods Tab */}
        <TabsContent value="foods">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                Gerenciamento de Alimentos
              </CardTitle>
              <CardDescription>
                Edite, adicione ou remova alimentos do banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/admin/foods')} className="w-full">
                Abrir Gerenciador de Alimentos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Debug Tab */}
        <TabsContent value="debug">
          <SystemDebug />
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests">
          <TestE2E />
        </TabsContent>
      </Tabs>
    </div>
  );
}
