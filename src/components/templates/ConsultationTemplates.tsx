
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Copy, FileText } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ConsultationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'primeira_consulta' | 'retorno' | 'especializada' | 'personalizada';
  fields: {
    anamnese: string;
    exame_fisico: string;
    orientacoes: string;
    observacoes: string;
  };
  created_at: string;
  usage_count: number;
}

const ConsultationTemplates: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<ConsultationTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'personalizada' as ConsultationTemplate['category'],
    fields: {
      anamnese: '',
      exame_fisico: '',
      orientacoes: '',
      observacoes: ''
    }
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ['consultation-templates'],
    queryFn: async (): Promise<ConsultationTemplate[]> => {
      // Simulate API call - in real app, fetch from Supabase
      const mockTemplates: ConsultationTemplate[] = [
        {
          id: '1',
          name: 'Primeira Consulta Completa',
          description: 'Template padrão para primeira consulta nutricional',
          category: 'primeira_consulta',
          fields: {
            anamnese: 'História clínica atual\nAntecedentes pessoais\nHábitos alimentares\nAntecedentes familiares',
            exame_fisico: 'Peso: ___ kg\nAltura: ___ cm\nIMC: ___ kg/m²\nCircunferências: ___',
            orientacoes: 'Orientações nutricionais gerais\nHidratação adequada\nFracionamento das refeições',
            observacoes: 'Observações específicas do paciente'
          },
          created_at: new Date().toISOString(),
          usage_count: 15
        },
        {
          id: '2',
          name: 'Consulta de Retorno',
          description: 'Template para consultas de acompanhamento',
          category: 'retorno',
          fields: {
            anamnese: 'Evolução desde a última consulta\nAderência ao plano\nDificuldades encontradas',
            exame_fisico: 'Variação de peso\nMedidas antropométricas\nComposição corporal',
            orientacoes: 'Ajustes no plano alimentar\nNovas orientações\nMetas para próxima consulta',
            observacoes: 'Progresso observado\nAjustes necessários'
          },
          created_at: new Date().toISOString(),
          usage_count: 23
        },
        {
          id: '3',
          name: 'Consulta Esportiva',
          description: 'Template especializado para atletas e praticantes de exercício',
          category: 'especializada',
          fields: {
            anamnese: 'Modalidade esportiva\nFrequência de treinos\nCompetições\nSuplementação atual',
            exame_fisico: 'Composição corporal\nPercentual de gordura\nMassa muscular\nHidratação',
            orientacoes: 'Estratégias de hidratação\nTiming de nutrientes\nSuplementação esportiva',
            observacoes: 'Performance atual\nObjetivos específicos'
          },
          created_at: new Date().toISOString(),
          usage_count: 8
        }
      ];

      return mockTemplates;
    }
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async (templateData: Partial<ConsultationTemplate>) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...templateData, id: Date.now().toString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation-templates'] });
      toast({
        title: 'Template salvo',
        description: 'O template foi salvo com sucesso.'
      });
      resetForm();
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return templateId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation-templates'] });
      toast({
        title: 'Template removido',
        description: 'O template foi removido com sucesso.'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'personalizada',
      fields: {
        anamnese: '',
        exame_fisico: '',
        orientacoes: '',
        observacoes: ''
      }
    });
    setSelectedTemplate(null);
    setIsEditing(false);
  };

  const handleEditTemplate = (template: ConsultationTemplate) => {
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      fields: template.fields
    });
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleSaveTemplate = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do template é obrigatório.',
        variant: 'destructive'
      });
      return;
    }

    saveTemplateMutation.mutate({
      ...formData,
      id: selectedTemplate?.id,
      created_at: selectedTemplate?.created_at || new Date().toISOString(),
      usage_count: selectedTemplate?.usage_count || 0
    });
  };

  const getCategoryLabel = (category: ConsultationTemplate['category']) => {
    switch (category) {
      case 'primeira_consulta': return 'Primeira Consulta';
      case 'retorno': return 'Retorno';
      case 'especializada': return 'Especializada';
      case 'personalizada': return 'Personalizada';
      default: return category;
    }
  };

  const getCategoryColor = (category: ConsultationTemplate['category']) => {
    switch (category) {
      case 'primeira_consulta': return 'bg-blue-100 text-blue-800';
      case 'retorno': return 'bg-green-100 text-green-800';
      case 'especializada': return 'bg-purple-100 text-purple-800';
      case 'personalizada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Templates de Consulta</h2>
          <p className="text-gray-600">Gerencie seus modelos de consulta para agilizar o atendimento</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Editar Template' : 'Novo Template'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do template"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ConsultationTemplate['category'] })}
                  >
                    <option value="primeira_consulta">Primeira Consulta</option>
                    <option value="retorno">Retorno</option>
                    <option value="especializada">Especializada</option>
                    <option value="personalizada">Personalizada</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do template"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Anamnese</label>
                  <Textarea
                    value={formData.fields.anamnese}
                    onChange={(e) => setFormData({
                      ...formData,
                      fields: { ...formData.fields, anamnese: e.target.value }
                    })}
                    placeholder="Campos da anamnese..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Exame Físico</label>
                  <Textarea
                    value={formData.fields.exame_fisico}
                    onChange={(e) => setFormData({
                      ...formData,
                      fields: { ...formData.fields, exame_fisico: e.target.value }
                    })}
                    placeholder="Campos do exame físico..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Orientações</label>
                  <Textarea
                    value={formData.fields.orientacoes}
                    onChange={(e) => setFormData({
                      ...formData,
                      fields: { ...formData.fields, orientacoes: e.target.value }
                    })}
                    placeholder="Orientações nutricionais..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Observações</label>
                  <Textarea
                    value={formData.fields.observacoes}
                    onChange={(e) => setFormData({
                      ...formData,
                      fields: { ...formData.fields, observacoes: e.target.value }
                    })}
                    placeholder="Observações gerais..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveTemplate} disabled={saveTemplateMutation.isPending}>
                  {saveTemplateMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates?.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>
                  <Badge className={getCategoryColor(template.category)}>
                    {getCategoryLabel(template.category)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <strong>Usado {template.usage_count} vezes</strong>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {template.fields.anamnese && (
                      <div>
                        <strong>Anamnese:</strong>
                        <p className="text-gray-600 truncate">{template.fields.anamnese}</p>
                      </div>
                    )}
                    {template.fields.orientacoes && (
                      <div>
                        <strong>Orientações:</strong>
                        <p className="text-gray-600 truncate">{template.fields.orientacoes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Copy template functionality
                        navigator.clipboard.writeText(JSON.stringify(template.fields, null, 2));
                        toast({
                          title: 'Template copiado',
                          description: 'O conteúdo foi copiado para a área de transferência.'
                        });
                      }}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTemplateMutation.mutate(template.id)}
                      disabled={deleteTemplateMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsultationTemplates;
