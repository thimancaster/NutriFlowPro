import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Save, FileDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface MealSummaryProps {
  meals: {
    kcal_total: number;
    ptn_g: number;
    cho_g: number;
    lip_g: number;
  }[];
  targets?: {
    kcal: number;
    ptn_g: number;
    cho_g: number;
    lip_g: number;
  };
  onSave?: () => void;
  onExportPDF?: () => void;
  isSaving?: boolean;
}

interface MacroMiniBarProps {
  label: string;
  value: number;
  target: number;
  colorClass: string;
}

const MacroMiniBar: React.FC<MacroMiniBarProps> = ({ label, value, target, colorClass }) => {
  const percent = target > 0 ? (value / target) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{Math.round(value)}g</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

export const FloatingMealSummary: React.FC<MealSummaryProps> = ({
  meals,
  targets,
  onSave,
  onExportPDF,
  isSaving = false,
}) => {
  const totals = useMemo(() => {
    return meals.reduce(
      (acc, meal) => ({
        kcal: acc.kcal + meal.kcal_total,
        ptn: acc.ptn + meal.ptn_g,
        cho: acc.cho + meal.cho_g,
        lip: acc.lip + meal.lip_g,
      }),
      { kcal: 0, ptn: 0, cho: 0, lip: 0 }
    );
  }, [meals]);

  const caloriePercent = targets ? (totals.kcal / targets.kcal) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-20 right-4 z-40 w-80 max-w-[calc(100vw-2rem)] shadow-2xl"
    >
      <Card className="border-2 border-primary/20 bg-card/95 backdrop-blur-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-base">Resumo do Dia</h4>
            <div className="text-xs text-muted-foreground">
              Total
            </div>
          </div>

          {/* Calorie Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Calorias</span>
              <span className="font-semibold">
                {Math.round(totals.kcal)} / {targets ? Math.round(targets.kcal) : 0}
              </span>
            </div>
            <Progress 
              value={Math.min(caloriePercent, 100)} 
              className="h-2"
            />
          </div>

          {/* Macros Mini Bars */}
          {targets && (
            <div className="grid grid-cols-1 gap-3">
              <MacroMiniBar
                label="Proteína"
                value={totals.ptn}
                target={targets.ptn_g}
                colorClass="bg-blue-500"
              />
              <MacroMiniBar
                label="Carboidratos"
                value={totals.cho}
                target={targets.cho_g}
                colorClass="bg-amber-500"
              />
              <MacroMiniBar
                label="Gorduras"
                value={totals.lip}
                target={targets.lip_g}
                colorClass="bg-rose-500"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {onSave && (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={onSave}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            )}
            {onExportPDF && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={onExportPDF}
              >
                <FileDown className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
