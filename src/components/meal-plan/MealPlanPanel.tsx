import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Copy, FileDown } from 'lucide-react';
import { MealItemCard, type MealItemData } from './MealItemCard';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Meal {
  id: string;
  nome_refeicao: string;
  tipo: string;
  horario_sugerido?: string;
  items: MealItemData[];
  kcal_total: number;
  ptn_g: number;
  cho_g: number;
  lip_g: number;
}

interface MealPlanPanelProps {
  meals: Meal[];
  targets?: {
    kcal: number;
    ptn_g: number;
    cho_g: number;
    lip_g: number;
  };
  onRemoveItem: (mealIndex: number, itemIndex: number) => void;
  onEditItem: (mealIndex: number, itemIndex: number, newQuantity: number) => void;
  onMealActivate: (mealIndex: number) => void;
  activeMealIndex: number;
  onSave?: () => void;
  onExportPDF?: () => void;
  isSaving?: boolean;
}

export const MealPlanPanel: React.FC<MealPlanPanelProps> = ({
  meals,
  targets,
  onRemoveItem,
  onEditItem,
  onMealActivate,
  activeMealIndex,
  onSave,
  onExportPDF,
  isSaving = false,
}) => {
  // Calculate totals
  const totals = meals.reduce(
    (acc, meal) => ({
      kcal: acc.kcal + meal.kcal_total,
      ptn: acc.ptn + meal.ptn_g,
      cho: acc.cho + meal.cho_g,
      lip: acc.lip + meal.lip_g,
    }),
    { kcal: 0, ptn: 0, cho: 0, lip: 0 }
  );

  const progressPercent = targets ? (totals.kcal / targets.kcal) * 100 : 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Plano Alimentar do Dia</CardTitle>
          <div className="flex items-center gap-2">
            {onExportPDF && (
              <Button variant="outline" size="sm" onClick={onExportPDF}>
                <FileDown className="h-4 w-4 mr-2" />
                PDF
              </Button>
            )}
            {onSave && (
              <Button size="sm" onClick={onSave} disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            )}
          </div>
        </div>

        {/* Daily Progress */}
        {targets && (
          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso Diário</span>
              <span className="font-semibold">
                {Math.round(totals.kcal)} / {Math.round(targets.kcal)} kcal
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full transition-colors',
                  progressPercent > 110
                    ? 'bg-destructive'
                    : progressPercent > 90
                    ? 'bg-primary'
                    : 'bg-primary/60'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Macros Summary */}
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">P: </span>
                <span className="font-semibold">{totals.ptn.toFixed(1)}g</span>
              </div>
              <div>
                <span className="text-muted-foreground">C: </span>
                <span className="font-semibold">{totals.cho.toFixed(1)}g</span>
              </div>
              <div>
                <span className="text-muted-foreground">G: </span>
                <span className="font-semibold">{totals.lip.toFixed(1)}g</span>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {meals.map((meal, mealIndex) => {
              const isActive = mealIndex === activeMealIndex;
              const hasItems = meal.items.length > 0;

              return (
                <motion.div
                  key={meal.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: mealIndex * 0.05 }}
                >
                  <Card
                    className={cn(
                      'border-2 transition-colors cursor-pointer',
                      isActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => onMealActivate(mealIndex)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-semibold text-sm">
                              {meal.nome_refeicao}
                            </h4>
                            {meal.horario_sugerido && (
                              <p className="text-xs text-muted-foreground">
                                {meal.horario_sugerido}
                              </p>
                            )}
                          </div>
                          {isActive && (
                            <Badge variant="default" className="text-xs">
                              Ativa
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">
                            {Math.round(meal.kcal_total)} kcal
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {hasItems ? `${meal.items.length} itens` : 'Vazio'}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    {hasItems && (
                      <CardContent className="pt-0 space-y-2">
                        <AnimatePresence>
                          {meal.items.map((item, itemIndex) => (
                            <MealItemCard
                              key={item.id}
                              item={item}
                              onRemove={() => onRemoveItem(mealIndex, itemIndex)}
                              onEdit={(newQuantity) =>
                                onEditItem(mealIndex, itemIndex, newQuantity)
                              }
                            />
                          ))}
                        </AnimatePresence>
                      </CardContent>
                    )}

                    {!hasItems && (
                      <CardContent className="pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMealActivate(mealIndex);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar alimentos
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
