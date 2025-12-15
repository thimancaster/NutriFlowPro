/**
 * TEMPLATES PICKER
 * Componente para selecionar e aplicar templates de refeições
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bookmark, 
  Globe, 
  Sparkles, 
  Search, 
  Loader2, 
  ChevronRight,
  Clock,
  Trash2 
} from 'lucide-react';
import { useMealPlanTemplates, MealTemplate, MealTemplateItem } from '@/hooks/meal-plan/useMealPlanTemplates';
import { cn } from '@/lib/utils';

interface TemplatesPickerProps {
  mealType?: string;
  targets?: { kcal: number; ptn_g: number; cho_g: number; lip_g: number };
  onSelectTemplate: (items: MealTemplateItem[]) => void;
  className?: string;
}

export const TemplatesPicker: React.FC<TemplatesPickerProps> = ({
  mealType,
  targets,
  onSelectTemplate,
  className,
}) => {
  const {
    userTemplates,
    publicTemplates,
    isLoading,
    applyTemplate,
    deleteTemplate,
    isDeleting,
    getSuggestions,
  } = useMealPlanTemplates({ mealType, autoFetch: true });

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MealTemplate[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'mine' | 'public' | 'suggested'>('mine');

  // Carregar sugestões quando targets mudar
  useEffect(() => {
    const loadSuggestions = async () => {
      if (targets && targets.kcal > 0) {
        setLoadingSuggestions(true);
        try {
          const suggested = await getSuggestions(targets, mealType);
          setSuggestions(suggested);
        } catch (error) {
          console.error('Erro ao carregar sugestões:', error);
        } finally {
          setLoadingSuggestions(false);
        }
      }
    };

    loadSuggestions();
  }, [targets, mealType, getSuggestions]);

  const handleApplyTemplate = async (template: MealTemplate) => {
    const items = await applyTemplate(template);
    onSelectTemplate(items);
  };

  const handleDeleteTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este template?')) {
      deleteTemplate(templateId);
    }
  };

  // Filtrar templates pela busca
  const filterTemplates = (templates: MealTemplate[]) => {
    if (!searchQuery.trim()) return templates;
    
    const query = searchQuery.toLowerCase();
    return templates.filter(
      t => 
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  };

  const renderTemplateCard = (template: MealTemplate, showDelete = false) => (
    <div
      key={template.id}
      className="p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer group"
      onClick={() => handleApplyTemplate(template)}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm line-clamp-1">{template.name}</h4>
        <div className="flex items-center gap-1">
          {showDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => handleDeleteTemplate(template.id, e)}
              disabled={isDeleting}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
      
      {template.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {template.description}
        </p>
      )}
      
      {/* Macros */}
      <div className="grid grid-cols-4 gap-1 text-xs mb-2">
        <div className="text-center p-1 bg-muted rounded">
          <span className="font-medium">{Math.round(template.total_kcal)}</span>
          <span className="text-muted-foreground ml-0.5">kcal</span>
        </div>
        <div className="text-center p-1 bg-blue-50 rounded">
          <span className="font-medium text-blue-700">{Math.round(template.total_ptn_g)}g</span>
        </div>
        <div className="text-center p-1 bg-amber-50 rounded">
          <span className="font-medium text-amber-700">{Math.round(template.total_cho_g)}g</span>
        </div>
        <div className="text-center p-1 bg-red-50 rounded">
          <span className="font-medium text-red-700">{Math.round(template.total_lip_g)}g</span>
        </div>
      </div>
      
      {/* Tags e uso */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {template.tags?.slice(0, 2).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
              {tag}
            </Badge>
          ))}
          {(template.tags?.length || 0) > 2 && (
            <Badge variant="outline" className="text-xs px-1 py-0">
              +{(template.tags?.length || 0) - 2}
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {template.usage_count || 0}x
        </span>
      </div>
    </div>
  );

  const filteredUserTemplates = filterTemplates(userTemplates);
  const filteredPublicTemplates = filterTemplates(publicTemplates);

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bookmark className="h-4 w-4" />
          Templates de Refeição
        </CardTitle>
        
        {/* Busca */}
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="w-full grid grid-cols-3 mb-3">
            <TabsTrigger value="mine" className="text-xs">
              <Bookmark className="h-3 w-3 mr-1" />
              Meus ({userTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="public" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              Públicos
            </TabsTrigger>
            <TabsTrigger value="suggested" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Sugeridos
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[300px]">
            {/* Meus Templates */}
            <TabsContent value="mine" className="mt-0 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredUserTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum template salvo</p>
                  <p className="text-xs">Salve refeições como templates para reutilizar</p>
                </div>
              ) : (
                filteredUserTemplates.map(template => renderTemplateCard(template, true))
              )}
            </TabsContent>

            {/* Templates Públicos */}
            <TabsContent value="public" className="mt-0 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredPublicTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum template público</p>
                </div>
              ) : (
                filteredPublicTemplates.map(template => renderTemplateCard(template))
              )}
            </TabsContent>

            {/* Templates Sugeridos */}
            <TabsContent value="suggested" className="mt-0 space-y-2">
              {loadingSuggestions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Analisando compatibilidade...
                  </span>
                </div>
              ) : !targets || targets.kcal === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Defina os targets nutricionais</p>
                  <p className="text-xs">para ver sugestões personalizadas</p>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma sugestão encontrada</p>
                  <p className="text-xs">Crie mais templates para receber sugestões</p>
                </div>
              ) : (
                suggestions.map(template => renderTemplateCard(template))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TemplatesPicker;
