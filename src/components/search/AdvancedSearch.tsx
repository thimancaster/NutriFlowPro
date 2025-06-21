
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Calendar, User, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from 'lodash';

interface SearchFilters {
  query: string;
  type: 'all' | 'patients' | 'consultations' | 'meal_plans' | 'notes';
  dateRange: {
    start: string;
    end: string;
  };
  status: string;
  tags: string[];
}

interface SearchResult {
  id: string;
  type: 'patient' | 'consultation' | 'meal_plan' | 'note';
  title: string;
  description: string;
  relevance: number;
  date: string;
  metadata: Record<string, any>;
}

const AdvancedSearch: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    dateRange: {
      start: '',
      end: ''
    },
    status: '',
    tags: []
  });
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      setFilters(prev => ({ ...prev, query: searchQuery }));
    }, 300),
    []
  );

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['advanced-search', filters],
    queryFn: async (): Promise<SearchResult[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !filters.query.trim()) return [];

      // Simulate advanced search - in real app, use full-text search
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'patient',
          title: 'Maria Silva Santos',
          description: 'Paciente com objetivo de emagrecimento, última consulta em 15/12/2024',
          relevance: 0.95,
          date: '2024-12-15T10:00:00Z',
          metadata: {
            age: 32,
            goal: 'emagrecimento',
            status: 'active'
          }
        },
        {
          id: '2',
          type: 'consultation',
          title: 'Consulta - João Santos',
          description: 'Primeira consulta nutricional, TMB: 1800kcal, peso: 85kg',
          relevance: 0.87,
          date: '2024-12-10T14:30:00Z',
          metadata: {
            patient_name: 'João Santos',
            type: 'primeira_consulta',
            calories: 1800
          }
        },
        {
          id: '3',
          type: 'meal_plan',
          title: 'Plano Alimentar - Ana Costa',
          description: 'Plano de 1600kcal para emagrecimento, 6 refeições diárias',
          relevance: 0.76,
          date: '2024-12-08T09:15:00Z',
          metadata: {
            patient_name: 'Ana Costa',
            calories: 1600,
            meals: 6
          }
        },
        {
          id: '4',
          type: 'note',
          title: 'Anotação - Pedro Lima',
          description: 'Paciente relatou dificuldade em seguir o plano nos finais de semana',
          relevance: 0.65,
          date: '2024-12-05T16:45:00Z',
          metadata: {
            patient_name: 'Pedro Lima',
            category: 'observacao'
          }
        }
      ];

      // Filter results based on search query and filters
      return mockResults.filter(result => {
        const matchesQuery = result.title.toLowerCase().includes(filters.query.toLowerCase()) ||
                            result.description.toLowerCase().includes(filters.query.toLowerCase());
        
        const matchesType = filters.type === 'all' || 
                           (filters.type === 'patients' && result.type === 'patient') ||
                           (filters.type === 'consultations' && result.type === 'consultation') ||
                           (filters.type === 'meal_plans' && result.type === 'meal_plan') ||
                           (filters.type === 'notes' && result.type === 'note');

        return matchesQuery && matchesType;
      }).sort((a, b) => b.relevance - a.relevance);
    },
    enabled: !!filters.query.trim()
  });

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'patient': return <User className="h-4 w-4" />;
      case 'consultation': return <Calendar className="h-4 w-4" />;
      case 'meal_plan': return <FileText className="h-4 w-4" />;
      case 'note': return <FileText className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getResultColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'patient': return 'bg-blue-100 text-blue-800';
      case 'consultation': return 'bg-green-100 text-green-800';
      case 'meal_plan': return 'bg-purple-100 text-purple-800';
      case 'note': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'patient': return 'Paciente';
      case 'consultation': return 'Consulta';
      case 'meal_plan': return 'Plano';
      case 'note': return 'Anotação';
      default: return type;
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca Avançada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar pacientes, consultas, planos alimentares..."
                className="pl-10 pr-4"
                onChange={(e) => debouncedSearch(e.target.value)}
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.type === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ ...filters, type: 'all' })}
              >
                Tudo
              </Button>
              <Button
                variant={filters.type === 'patients' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ ...filters, type: 'patients' })}
              >
                Pacientes
              </Button>
              <Button
                variant={filters.type === 'consultations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ ...filters, type: 'consultations' })}
              >
                Consultas
              </Button>
              <Button
                variant={filters.type === 'meal_plans' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ ...filters, type: 'meal_plans' })}
              >
                Planos
              </Button>
              <Button
                variant={filters.type === 'notes' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ ...filters, type: 'notes' })}
              >
                Anotações
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filtros
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-2">Data inicial</label>
                  <Input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, start: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data final</label>
                  <Input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">Todos</option>
                    <option value="active">Ativo</option>
                    <option value="archived">Arquivado</option>
                    <option value="completed">Completo</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {filters.query.trim() && (
        <Card>
          <CardHeader>
            <CardTitle>
              Resultados da Busca
              {searchResults && (
                <Badge variant="outline" className="ml-2">
                  {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : searchResults?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum resultado encontrado</p>
                <p className="text-sm">Tente ajustar os termos da busca ou filtros</p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults?.map((result) => (
                  <div
                    key={result.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${getResultColor(result.type)}`}>
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">
                              {highlightText(result.title, filters.query)}
                            </h4>
                            <Badge variant="outline" className={getResultColor(result.type)}>
                              {getResultTypeLabel(result.type)}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(result.relevance * 100)}% relevante
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {highlightText(result.description, filters.query)}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              {new Date(result.date).toLocaleDateString('pt-BR')}
                            </span>
                            {result.metadata.patient_name && (
                              <span>Paciente: {result.metadata.patient_name}</span>
                            )}
                            {result.metadata.calories && (
                              <span>{result.metadata.calories} kcal</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearch;
