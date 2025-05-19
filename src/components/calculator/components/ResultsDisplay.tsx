
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flame, Utensils, Salad, Beef, Wheat, Droplets } from 'lucide-react';

interface ResultsDisplayProps {
  teeObject: {
    get: number;
    adjustment: number;
    vet: number;
  } | null;
  macros: any;
  calorieSummary: any;
  objective: string;
  weight: number | '';
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  teeObject,
  macros,
  calorieSummary,
  objective,
  weight
}) => {
  if (!teeObject || !macros || !calorieSummary) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-blue-50 p-4 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Gasto Energético Total</h3>
          </div>
          <p className="text-2xl font-bold">{teeObject.get} kcal</p>
          <p className="text-xs text-gray-500 mt-1">
            Calorias diárias com atividade física
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={cn(
            "p-4 rounded-lg",
            objective === 'emagrecimento' ? "bg-green-50" : 
            objective === 'hipertrofia' ? "bg-purple-50" : "bg-gray-50"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <Utensils className={cn(
              "h-5 w-5",
              objective === 'emagrecimento' ? "text-green-500" : 
              objective === 'hipertrofia' ? "text-purple-500" : "text-gray-500"
            )} />
            <h3 className="font-medium">Calorias Ajustadas</h3>
          </div>
          <p className="text-2xl font-bold">{teeObject.vet} kcal</p>
          <p className="text-xs text-gray-500 mt-1">
            {objective === 'emagrecimento' 
              ? `Déficit de ${Math.round((1 - teeObject.adjustment) * 100)}%` 
              : objective === 'hipertrofia'
                ? `Superávit de ${Math.round((teeObject.adjustment - 1) * 100)}%`
                : 'Manutenção do peso atual'}
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-amber-50 p-4 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Salad className="h-5 w-5 text-amber-500" />
            <h3 className="font-medium">Distribuição Calórica</h3>
          </div>
          <div className="flex justify-between text-sm">
            <span>Proteínas: {macros.protein.percentage}%</span>
            <span>Carbs: {macros.carbs.percentage}%</span>
            <span>Gorduras: {macros.fats.percentage}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden flex">
            <div 
              className="bg-red-400 h-full" 
              style={{ width: `${macros.protein.percentage}%` }}
            ></div>
            <div 
              className="bg-green-400 h-full" 
              style={{ width: `${macros.carbs.percentage}%` }}
            ></div>
            <div 
              className="bg-yellow-400 h-full" 
              style={{ width: `${macros.fats.percentage}%` }}
            ></div>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white border rounded-lg overflow-hidden"
      >
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-medium">Detalhamento de Macronutrientes</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-3 bg-red-50 rounded-lg">
              <Beef className="h-10 w-10 text-red-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Proteínas</p>
                <p className="text-xl font-bold">{macros.protein.grams}g</p>
                <p className="text-xs text-gray-500">{macros.protein.kcal} kcal</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <Wheat className="h-10 w-10 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Carboidratos</p>
                <p className="text-xl font-bold">{macros.carbs.grams}g</p>
                <p className="text-xs text-gray-500">{macros.carbs.kcal} kcal</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <Droplets className="h-10 w-10 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Gorduras</p>
                <p className="text-xl font-bold">{macros.fats.grams}g</p>
                <p className="text-xs text-gray-500">{macros.fats.kcal} kcal</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>
              • Proteínas: {Math.round(macros.protein.grams / Number(weight) * 10) / 10}g/kg de peso corporal
            </p>
            <p>
              • Carboidratos: {Math.round(macros.carbs.grams / Number(weight) * 10) / 10}g/kg de peso corporal
            </p>
            <p>
              • Gorduras: {Math.round(macros.fats.grams / Number(weight) * 10) / 10}g/kg de peso corporal
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsDisplay;
