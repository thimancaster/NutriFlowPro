import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, RefreshCw, BarChart3, Leaf } from 'lucide-react';
import { initializeFoodDatabase, getFoodDatabaseStats } from '@/utils/seedDataUtils';
import { useToast } from '@/hooks/use-toast';

interface DatabaseStats {
  total: number;
  organic: number;
  byCategory: Record<string, number>;
  lastUpdated: string;
  error?: any;
}

const FoodDatabaseManager: React.FC = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const databaseStats = await getFoodDatabaseStats();
      setStats(databaseStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar estatísticas do banco de alimentos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await initializeFoodDatabase();
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: result.message,
        });
        // Recarregar estatísticas após sincronização
        await loadStats();
      } else {
        toast({
          title: "Aviso",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Erro na sincronização:', error);
      toast({
        title: "Erro",
        description: `Erro na sincronização: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getCategoryDisplayName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      'frutas': 'Frutas',
      'proteinas': 'Proteínas',
      'cereais_e_graos': 'Cereais e Grãos',
      'vegetais': 'Vegetais',
      'gorduras': 'Gorduras',
      'tuberculos': 'Tubérculos',
      'leguminosas': 'Leguminosas',
      'bebidas': 'Bebidas',
      'fibras': 'Fibras',
      'outros': 'Outros'
    };
    
    return categoryNames[category] || category;
  };

  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, string> = {
      'frutas': 'bg-orange-100 text-orange-800',
      'proteinas': 'bg-red-100 text-red-800',
      'cereais_e_graos': 'bg-yellow-100 text-yellow-800',
      'vegetais': 'bg-green-100 text-green-800',
      'gorduras': 'bg-purple-100 text-purple-800',
      'tuberculos': 'bg-amber-100 text-amber-800',
      'leguminosas': 'bg-lime-100 text-lime-800',
      'bebidas': 'bg-blue-100 text-blue-800',
      'fibras': 'bg-teal-100 text-teal-800',
      'outros': 'bg-gray-100 text-gray-800'
    };
    
    return categoryColors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Carregando estatísticas...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gerenciador do Banco de Alimentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Gerencie e sincronize o banco de dados de alimentos do sistema
            </p>
            <Button 
              onClick={handleSync} 
              disabled={isSyncing}
              variant="outline"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar
                </>
              )}
            </Button>
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Total de Alimentos</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Alimentos Orgânicos</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{stats.organic}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Categorias</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {Object.keys(stats.byCategory).length}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {stats && Object.keys(stats.byCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(stats.byCategory)
                .sort(([,a], [,b]) => b - a)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <Badge 
                      variant="secondary" 
                      className="flex-1 justify-between bg-blue-100 text-blue-800"
                    >
                      <span className="text-xs">{category}</span>
                      <span className="font-bold">{count}</span>
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats?.lastUpdated && (
        <p className="text-xs text-gray-500 text-center">
          Última atualização: {new Date(stats.lastUpdated).toLocaleString('pt-BR')}
        </p>
      )}
    </div>
  );
};

export default FoodDatabaseManager;
