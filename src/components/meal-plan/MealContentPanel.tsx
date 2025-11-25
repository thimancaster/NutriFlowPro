import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MealItemCard, type MealItemData } from './MealItemCard';
import { EmptyMealState } from './EmptyMealState';
import { AnimatePresence, motion } from 'framer-motion';
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

interface MealContentPanelProps {
  activeMeal: Meal;
  onRemoveItem: (itemIndex: number) => void;
  onEditItem: (itemIndex: number, newQuantity: number) => void;
}

export const MealContentPanel: React.FC<MealContentPanelProps> = ({
  activeMeal,
  onRemoveItem,
  onEditItem,
}) => {
  const hasItems = activeMeal.items.length > 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b space-y-0 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{activeMeal.nome_refeicao}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeMeal.horario_sugerido} • {activeMeal.items.length} {activeMeal.items.length === 1 ? 'item' : 'itens'}
            </p>
          </div>
          <Badge variant="secondary" className="text-base font-semibold">
            {Math.round(activeMeal.kcal_total)} kcal
          </Badge>
        </div>

        {/* Meal Macros */}
        {hasItems && (
          <div className="flex items-center gap-4 text-xs pt-3">
            <div>
              <span className="text-muted-foreground">Proteína: </span>
              <span className="font-semibold">{activeMeal.ptn_g.toFixed(1)}g</span>
            </div>
            <div>
              <span className="text-muted-foreground">Carboidratos: </span>
              <span className="font-semibold">{activeMeal.cho_g.toFixed(1)}g</span>
            </div>
            <div>
              <span className="text-muted-foreground">Gorduras: </span>
              <span className="font-semibold">{activeMeal.lip_g.toFixed(1)}g</span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full pr-2">
          {hasItems ? (
            <div className="space-y-2">
              <AnimatePresence>
                {activeMeal.items.map((item, idx) => (
                  <MealItemCard
                    key={item.id}
                    item={item}
                    onRemove={() => onRemoveItem(idx)}
                    onEdit={(newQuantity) => onEditItem(idx, newQuantity)}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <EmptyMealState mealName={activeMeal.nome_refeicao} />
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
