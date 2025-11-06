import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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
  const { toast } = useToast();

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
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel de Administração</h1>
        <p className="text-muted-foreground">
          Gerencie os dados do sistema e execute operações administrativas
        </p>
      </div>

      <div className="space-y-6">
        {/* Seed Database Card */}
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
            {/* Progress bar */}
            {isSeeding && progress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Processando...</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Seed button */}
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

            {/* Results */}
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

            {/* Info */}
            <div className="text-sm text-muted-foreground space-y-1 mt-4">
              <p className="font-medium">ℹ️ Informações importantes:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>São inseridos 200+ alimentos da Tabela TACO brasileira</li>
                <li>Inclui cereais, leguminosas, vegetais, frutas, proteínas, laticínios e oleaginosas</li>
                <li>Alimentos duplicados (mesmo nome) são automaticamente ignorados</li>
                <li>O processo é seguro e pode ser executado múltiplas vezes</li>
                <li>Todos os alimentos têm informações nutricionais completas</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Future admin features card */}
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Outras Operações
            </CardTitle>
            <CardDescription>
              Funcionalidades administrativas adicionais (em breve)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>Funcionalidades futuras:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Backup e restauração de dados</li>
                <li>Gerenciamento de usuários</li>
                <li>Relatórios e estatísticas</li>
                <li>Configurações do sistema</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
