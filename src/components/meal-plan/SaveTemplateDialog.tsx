/**
 * SAVE TEMPLATE DIALOG
 * Dialog para salvar uma refeição como template reutilizável
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Save, X, Tag, Loader2 } from 'lucide-react';
import { useMealPlanTemplates, MealTemplateItem } from '@/hooks/meal-plan/useMealPlanTemplates';

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealType: string;
  mealName: string;
  items: MealTemplateItem[];
  onSaved?: () => void;
}

const SUGGESTED_TAGS = [
  'low-carb', 'high-protein', 'vegetariano', 'vegano',
  'rápido', 'econômico', 'pré-treino', 'pós-treino',
  'café-da-manhã', 'almoço', 'jantar', 'lanche'
];

export const SaveTemplateDialog: React.FC<SaveTemplateDialogProps> = ({
  open,
  onOpenChange,
  mealType,
  mealName,
  items,
  onSaved,
}) => {
  const { saveAsTemplate, isCreating } = useMealPlanTemplates();
  
  const [name, setName] = useState(mealName || '');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      await saveAsTemplate(
        name.trim(),
        mealType,
        items,
        description.trim() || undefined,
        selectedTags.length > 0 ? selectedTags : undefined
      );
      
      onOpenChange(false);
      onSaved?.();
      
      // Reset form
      setName('');
      setDescription('');
      setSelectedTags([]);
      setIsPublic(false);
    } catch (error) {
      console.error('Erro ao salvar template:', error);
    }
  };

  // Calcular totais
  const totals = items.reduce(
    (acc, item) => ({
      kcal: acc.kcal + (item.kcal || 0),
      ptn: acc.ptn + (item.ptn_g || 0),
      cho: acc.cho + (item.cho_g || 0),
      lip: acc.lip + (item.lip_g || 0),
    }),
    { kcal: 0, ptn: 0, cho: 0, lip: 0 }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Salvar como Template
          </DialogTitle>
          <DialogDescription>
            Salve esta refeição como template para reutilizar em outros pacientes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome do template */}
          <div className="space-y-2">
            <Label htmlFor="template-name">Nome do Template *</Label>
            <Input
              id="template-name"
              placeholder="Ex: Café da Manhã Low Carb"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="template-description">Descrição (opcional)</Label>
            <Textarea
              id="template-description"
              placeholder="Descreva o template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Resumo nutricional */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Resumo Nutricional:</p>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div className="text-center">
                <p className="font-semibold text-primary">{Math.round(totals.kcal)}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-blue-600">{Math.round(totals.ptn)}g</p>
                <p className="text-xs text-muted-foreground">PTN</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-amber-600">{Math.round(totals.cho)}g</p>
                <p className="text-xs text-muted-foreground">CHO</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-red-600">{Math.round(totals.lip)}g</p>
                <p className="text-xs text-muted-foreground">LIP</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {items.length} alimento{items.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags (opcional)
            </Label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleToggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            
            {/* Tags selecionadas */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedTags.filter(t => !SUGGESTED_TAGS.includes(t)).map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleToggleTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Adicionar tag customizada */}
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Tag customizada..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleAddCustomTag}
                disabled={!customTag.trim()}
              >
                Adicionar
              </Button>
            </div>
          </div>

          {/* Template público */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label htmlFor="is-public" className="font-medium">Template Público</Label>
              <p className="text-xs text-muted-foreground">
                Permitir que outros nutricionistas usem este template
              </p>
            </div>
            <Switch
              id="is-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveTemplateDialog;
