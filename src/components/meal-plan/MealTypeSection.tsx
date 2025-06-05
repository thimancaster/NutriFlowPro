
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { MealPlanItem } from '@/types/mealPlan';
import AddItemDialog from './AddItemDialog';
import FoodSearchDialog from './FoodSearchDialog';
import EditItemDialog from './EditItemDialog';

interface MealTypeSectionProps {
  mealType: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
  config: {
    name: string;
    time: string;
    color: string;
  };
  items: MealPlanItem[];
  mealPlanId: string;
  onItemUpdate: (item: MealPlanItem) => void;
  onItemRemove: (itemId: string) => void;
  onItemAdd: (item: MealPlanItem) => void;
}

// Sugestões mais específicas e variadas por refeição
const MEAL_FOOD_SUGGESTIONS: Record<string, string[]> = {
  breakfast: [
    'Pão integral com queijo minas',
    'Tapioca com queijo cottage',
    'Aveia com banana e canela',
    'Ovo mexido com torrada',
    'Iogurte grego com granola',
    'Vitamina de mamão com aveia',
    'Café com leite desnatado',
    'Pão francês com requeijão light'
  ],
  morning_snack: [
    'Banana com pasta de amendoim',
    'Iogurte natural com mel',
    'Mix de castanhas (3 unidades)',
    'Maçã com canela',
    'Água de coco gelada',
    'Pera com 2 castanhas',
    'Biscoito integral (2 unidades)',
    'Vitamina de frutas vermelhas'
  ],
  lunch: [
    'Arroz integral com feijão carioca',
    'Peito de frango grelhado',
    'Salada verde com tomate',
    'Brócolis refogado no alho',
    'Peixe tilápia com batata doce',
    'Carne magra com quinoa',
    'Cenoura refogada na manteiga',
    'Salada completa temperada'
  ],
  afternoon_snack: [
    'Sanduíche natural de peito de peru',
    'Vitamina de banana com aveia',
    'Biscoito integral com chá verde',
    'Iogurte com frutas picadas',
    'Castanhas do Pará (3 unidades)',
    'Batata doce cozida pequena',
    'Água de coco com biscoito',
    'Smoothie de frutas tropicais'
  ],
  dinner: [
    'Sopa de legumes variados',
    'Peixe grelhado com salada',
    'Omelete de legumes',
    'Peito de peru com quinoa',
    'Salada completa com proteína',
    'Caldo de legumes com torrada',
    'Salmão grelhado com brócolis',
    'Frango desfiado com purê de abóbora'
  ],
  evening_snack: [
    'Leite morno com canela',
    'Chá de camomila relaxante',
    'Torrada integral com geleia diet',
    'Iogurte natural pequeno',
    'Maçã assada com canela',
    'Biscoito integral simples',
    'Água com rodela de limão',
    'Chá de erva-doce morno'
  ]
};

const MealTypeSection: React.FC<MealTypeSectionProps> = ({
  mealType,
  config,
  items,
  mealPlanId,
  onItemUpdate,
  onItemRemove,
  onItemAdd
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MealPlanItem | null>(null);

  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = items.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = items.reduce((sum, item) => sum + item.carbs, 0);
  const totalFats = items.reduce((sum, item) => sum + item.fats, 0);

  const handleFoodSelect = (food: any) => {
    const newItem: MealPlanItem = {
      id: crypto.randomUUID(),
      meal_plan_id: mealPlanId,
      meal_type: mealType,
      food_id: food.id,
      food_name: food.name,
      quantity: food.portion_size,
      unit: food.portion_unit,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      order_index: items.length
    };

    onItemAdd(newItem);
  };

  const handleEditItem = (item: MealPlanItem) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleSaveEdit = (updatedItem: MealPlanItem) => {
    onItemUpdate(updatedItem);
    setShowEditDialog(false);
    setEditingItem(null);
  };

  const suggestions = MEAL_FOOD_SUGGESTIONS[mealType] || [];

  return (
    <Card>
      <CardHeader className={`${config.color} border-b`}>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">{config.name}</CardTitle>
            <p className="text-sm text-gray-600">{config.time}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowSearchDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Buscar Alimento
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Manual
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {items.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-4 text-gray-500">
              <p>Nenhum alimento adicionado ainda</p>
            </div>
            
            {/* Sugestões de alimentos para a refeição */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Sugestões para {config.name}:</h4>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 6).map((suggestion, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-white">
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.food_name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm">
                      <p className="font-medium">{Math.round(item.calories)} kcal</p>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">P: {Math.round(item.protein)}g</Badge>
                        <Badge variant="outline" className="text-xs">C: {Math.round(item.carbs)}g</Badge>
                        <Badge variant="outline" className="text-xs">G: {Math.round(item.fats)}g</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditItem(item)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onItemRemove(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {items.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total da Refeição:</span>
              <div className="flex gap-2">
                <Badge>{Math.round(totalCalories)} kcal</Badge>
                <Badge variant="outline">P: {Math.round(totalProtein)}g</Badge>
                <Badge variant="outline">C: {Math.round(totalCarbs)}g</Badge>
                <Badge variant="outline">G: {Math.round(totalFats)}g</Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <AddItemDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        mealType={mealType}
        mealPlanId={mealPlanId}
        onItemAdd={onItemAdd}
      />
      
      <FoodSearchDialog
        isOpen={showSearchDialog}
        onClose={() => setShowSearchDialog(false)}
        onFoodSelect={handleFoodSelect}
      />

      <EditItemDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        item={editingItem}
        onSave={handleSaveEdit}
      />
    </Card>
  );
};

export default MealTypeSection;
