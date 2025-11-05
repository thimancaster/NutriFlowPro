import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Edit2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface MealItemData {
  id: string;
  alimento_id: string;
  nome: string;
  quantidade: number;
  medida_utilizada: string;
  peso_total_g: number;
  kcal_calculado: number;
  ptn_g_calculado: number;
  cho_g_calculado: number;
  lip_g_calculado: number;
}

interface MealItemCardProps {
  item: MealItemData;
  onRemove: () => void;
  onEdit: (newQuantity: number) => void;
}

export const MealItemCard: React.FC<MealItemCardProps> = ({
  item,
  onRemove,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState(item.quantidade);

  const handleSaveEdit = () => {
    if (editQuantity > 0 && editQuantity !== item.quantidade) {
      onEdit(editQuantity);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditQuantity(item.quantidade);
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-3 border-border/50 hover:border-primary/50 transition-colors">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Food Name */}
            <h4 className="font-medium text-sm text-foreground truncate">
              {item.nome}
            </h4>

            {/* Quantity */}
            <div className="flex items-center gap-2 mt-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(parseFloat(e.target.value) || 0)}
                    className="h-7 w-20 text-xs"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={handleSaveEdit}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-xs text-muted-foreground">
                    {item.quantidade} {item.medida_utilizada} ({item.peso_total_g}g)
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>

            {/* Nutritional Info */}
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {Math.round(item.kcal_calculado)}
                </span>{' '}
                kcal
              </span>
              <span className="text-muted-foreground">
                P:{' '}
                <span className="font-semibold text-foreground">
                  {item.ptn_g_calculado.toFixed(1)}
                </span>
                g
              </span>
              <span className="text-muted-foreground">
                C:{' '}
                <span className="font-semibold text-foreground">
                  {item.cho_g_calculado.toFixed(1)}
                </span>
                g
              </span>
              <span className="text-muted-foreground">
                G:{' '}
                <span className="font-semibold text-foreground">
                  {item.lip_g_calculado.toFixed(1)}
                </span>
                g
              </span>
            </div>
          </div>

          {/* Remove Button */}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive',
              'transition-colors'
            )}
            onClick={onRemove}
            title="Remover item"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
