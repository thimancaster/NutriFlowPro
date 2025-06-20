
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Globe, Database, Zap, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';

interface APIIntegration {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  endpoint: string;
  lastSync: string | null;
  features: string[];
}

const ExternalAPIIntegration: React.FC = () => {
  const { toast } = useToast();
  const [cepInput, setCepInput] = useState('');

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['api-integrations'],
    queryFn: async (): Promise<APIIntegration[]> => {
      // Mock integrations data
      return [
        {
          id: 'taco',
          name: 'TACO - Tabela Brasileira de Composição de Alimentos',
          description: 'Base de dados oficial de alimentos brasileiros',
          status: 'connected',
          endpoint: 'https://api.taco.gov.br/v1',
          lastSync: new Date().toISOString(),
          features: ['Composição nutricional', 'Alimentos regionais', 'Dados oficiais']
        },
        {
          id: 'viacep',
          name: 'ViaCEP - Consulta de Endereços',
          description: 'API para consulta automática de endereços por CEP',
          status: 'connected',
          endpoint: 'https://viacep.com.br/ws',
          lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          features: ['Endereços completos', 'Validação de CEP', 'Dados atualizados']
        },
        {
          id: 'ibge',
          name: 'IBGE - Dados Demográficos',
          description: 'Informações demográficas e estatísticas do Brasil',
          status: 'disconnected',
          endpoint: 'https://servicodados.ibge.gov.br/api/v1',
          lastSync: null,
          features: ['Dados demográficos', 'Estatísticas populacionais', 'Índices nutricionais']
        },
        {
          id: 'anvisa',
          name: 'ANVISA - Produtos e Registros',
          description: 'Base de dados de produtos registrados na ANVISA',
          status: 'error',
          endpoint: 'https://api.anvisa.gov.br/v1',
          lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          features: ['Suplementos alimentares', 'Produtos dietéticos', 'Registros oficiais']
        }
      ];
    }
  });

  const testCepMutation = useMutation({
    mutationFn: async (cep: string) => {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) throw new Error('CEP não encontrado');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.erro) {
        throw new Error('CEP inválido');
      }
      toast({
        title: 'CEP encontrado!',
        description: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro na consulta',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    }
  });

  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ integrationId, enabled }: { integrationId: string; enabled: boolean }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { integrationId, enabled };
    },
    onSuccess: (data) => {
      toast({
        title: data.enabled ? 'Integração ativada' : 'Integração desativada',
        description: `A integração foi ${data.enabled ? 'conectada' : 'desconectada'} com sucesso.`
      });
    }
  });

  const getStatusIcon = (status: APIIntegration['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected': return <AlertCircle className="h-4 w-4 text-gray-400" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: APIIntegration['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: APIIntegration['status']) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'disconnected': return 'Desconectado';
      case 'error': return 'Erro';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg text-white">
          <Globe className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Integrações Externas</h2>
          <p className="text-gray-600">Conecte-se com APIs externas para enriquecer suas funcionalidades</p>
        </div>
      </div>

      {/* Quick Test Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Teste Rápido - Consulta CEP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Digite um CEP (ex: 01310-100)"
              value={cepInput}
              onChange={(e) => setCepInput(e.target.value.replace(/\D/g, '').substring(0, 8))}
              maxLength={8}
            />
            <Button
              onClick={() => testCepMutation.mutate(cepInput)}
              disabled={testCepMutation.isPending || cepInput.length !== 8}
            >
              {testCepMutation.isPending ? 'Consultando...' : 'Consultar'}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Teste a integração com ViaCEP consultando um endereço
          </p>
        </CardContent>
      </Card>

      {/* Integrations List */}
      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          integrations?.map((integration) => (
            <Card key={integration.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      {integration.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {integration.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(integration.status)}
                    <Badge className={getStatusColor(integration.status)}>
                      {getStatusLabel(integration.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Features */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Funcionalidades:</h4>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Last Sync */}
                  {integration.lastSync && (
                    <div className="text-xs text-gray-500">
                      Última sincronização: {new Date(integration.lastSync).toLocaleString('pt-BR')}
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      {integration.endpoint}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {integration.status === 'connected' ? 'Ativo' : 'Inativo'}
                      </span>
                      <Switch
                        checked={integration.status === 'connected'}
                        onCheckedChange={(checked) => 
                          toggleIntegrationMutation.mutate({ 
                            integrationId: integration.id, 
                            enabled: checked 
                          })
                        }
                        disabled={toggleIntegrationMutation.isPending}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Integrações Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {integrations?.filter(i => i.status === 'connected').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {integrations?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Com Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {integrations?.filter(i => i.status === 'error').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExternalAPIIntegration;
