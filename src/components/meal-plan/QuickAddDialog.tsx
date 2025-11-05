import React, { useState, useEffect, useRef } from 'react';
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
import type { AlimentoV2 } from '@/services/enhancedFoodSearchService';

interface QuickAddDialogProps {
  food: AlimentoV2 | null;
  open: boolean;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
}

export const QuickAddDialog: React.FC<QuickAddDialogProps> = ({
  food,
  open,
  onConfirm,
  onCancel,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input and reset quantity when dialog opens
  useEffect(() => {
    if (open && food) {
      setQuantity(1);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, food]);

  const handleConfirm = () => {
    if (quantity > 0) {
      onConfirm(quantity);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!food) return null;

  // Calculate nutritional values for the selected quantity
  const totalCalories = Math.round(food.kcal_por_referencia * quantity);
  const totalProtein = (food.ptn_g_por_referencia * quantity).toFixed(1);
  const totalCarbs = (food.cho_g_por_referencia * quantity).toFixed(1);
  const totalFats = (food.lip_g_por_referencia * quantity).toFixed(1);
  const totalWeight = Math.round(food.peso_referencia_g * quantity);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{food.nome}</DialogTitle>
          <DialogDescription>
            {food.categoria}
            {food.subcategoria && ` • ${food.subcategoria}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade de Porções</Label>
            <Input
              ref={inputRef}
              id="quantity"
              type="number"
              min="0.1"
              step="0.5"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              onKeyDown={handleKeyDown}
              className="text-lg font-semibold"
            />
            <p className="text-xs text-muted-foreground">
              1 porção = {food.peso_referencia_g}g ({food.medida_padrao_referencia})
            </p>
          </div>

          {/* Nutritional Preview */}
          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
            <h4 className="font-semibold text-sm text-foreground">
              Total: {totalWeight}g
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Calorias:</span>
                <span className="font-semibold text-foreground ml-2">
                  {totalCalories} kcal
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Proteínas:</span>
                <span className="font-semibold text-foreground ml-2">
                  {totalProtein}g
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Carboidratos:</span>
                <span className="font-semibold text-foreground ml-2">
                  {totalCarbs}g
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Gorduras:</span>
                <span className="font-semibold text-foreground ml-2">
                  {totalFats}g
                </span>
              </div>
            </div>
          </div>

          {/* Preparation suggestion */}
          {food.preparo_sugerido && (
            <div className="text-xs text-muted-foreground">
              <strong>Preparo:</strong> {food.preparo_sugerido}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={quantity <= 0}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
