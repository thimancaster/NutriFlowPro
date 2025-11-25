import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Edit2, Check, Plus, Minus } from 'lucide-react';
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
  const handleIncrement = () => {
    onEdit(item.quantidade + 0.5);
  };

  const handleDecrement = () => {
    if (item.quantidade > 0.5) {
      onEdit(item.quantidade - 0.5);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className="group flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
        {/* Info Principal */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{item.nome}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>{item.quantidade} {item.medida_utilizada}</span>
            <span>•</span>
            <span>{Math.round(item.kcal_calculado)} kcal</span>
            <span>•</span>
            <span>P: {item.ptn_g_calculado.toFixed(1)}g</span>
            <span>•</span>
            <span>C: {item.cho_g_calculado.toFixed(1)}g</span>
            <span>•</span>
            <span>G: {item.lip_g_calculado.toFixed(1)}g</span>
          </div>
        </div>

        {/* Controles de Quantidade Inline */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleDecrement}
            disabled={item.quantidade <= 0.5}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-10 text-center text-sm font-medium">
            {item.quantidade}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleIncrement}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Remover (aparece no hover) */}
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            'h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100',
            'text-muted-foreground hover:text-destructive transition-all'
          )}
          onClick={onRemove}
          title="Remover item"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};
