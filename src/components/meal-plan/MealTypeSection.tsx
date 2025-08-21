
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConsolidatedMealItem } from '@/types/mealPlanTypes';
import { Edit, Trash2, Plus, Clock } from 'lucide-react';
import AddItemDialog from './AddItemDialog';
import EditItemDialog from './EditItemDialog';

interface MealTypeSectionProps {
  mealType: string;
  config: {
    name: string;
    time: string;
    color: string;
  };
  items: ConsolidatedMealItem[];
  mealPlanId: string;
  onItemUpdate: (item: ConsolidatedMealItem) => void;
  onItemRemove: (itemId: string) => void;
  onItemAdd: (item: ConsolidatedMealItem) => void;
  isLoading: boolean;
}

const MealTypeSection: React.FC<MealTypeSectionProps> = ({
  mealType,
  config,
  items,
  mealPlanId,
  onItemUpdate,
  onItemRemove,
  onItemAdd,
  isLoading
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ConsolidatedMealItem | null>(null);

  // Calculate totals for this meal type
  const totals = items.reduce(
    (acc, item) => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fats += item.fats;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const handleEdit = (item: ConsolidatedMealItem) => {
    setSelectedItem(item);
    setShowEditDialog(true);
  };

  const handleEditSave = (updatedItem: ConsolidatedMealItem) => {
    onItemUpdate(updatedItem);
    setShowEditDialog(false);
    setSelectedItem(null);
  };

  const handleAdd = (newItem: ConsolidatedMealItem) => {
    const itemWithMealType = {
      ...newItem,
      meal_type: mealType,
      id: crypto.randomUUID()
    };
    onItemAdd(itemWithMealType);
    setShowAddDialog(false);
  };

  const handleRemove = (itemId: string) => {
    if (confirm('Tem certeza que deseja remover este alimento?')) {
      onItemRemove(itemId);
    }
  };

  return (
    <>
      <Card className={`${config.color} border-l-4 border-l-blue-500`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-4 w-4" />
              {config.name}
              <span className="text-sm font-normal text-gray-600">({config.time})</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {totals.calories.toFixed(0)} kcal
              </Badge>
              <Button
                size="sm"
                onClick={() => setShowAddDialog(true)}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
          <div className="flex gap-2 text-sm">
            <Badge variant="outline">P: {totals.protein.toFixed(1)}g</Badge>
            <Badge variant="outline">C: {totals.carbs.toFixed(1)}g</Badge>
            <Badge variant="outline">G: {totals.fats.toFixed(1)}g</Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">Nenhum alimento adicionado ainda</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddDialog(true)}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Primeiro Alimento
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.food_name}</div>
                    <div className="text-sm text-gray-600">
                      {item.quantity}{item.unit}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {item.calories.toFixed(0)} kcal
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(item.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        mealType={mealType}
        mealPlanId={mealPlanId}
        onAdd={handleAdd}
      />

      <EditItemDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        item={selectedItem}
        onSave={handleEditSave}
      />
    </>
  );
};

export default MealTypeSection;
