
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface FoodSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodSelect: (food: any) => void;
}

const FoodSearchDialog: React.FC<FoodSearchDialogProps> = ({
  isOpen,
  onClose,
  onFoodSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock food data for demonstration
  const mockFoods = [
    { id: '1', name: 'Arroz branco', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, portion_size: 100, portion_unit: 'g' },
    { id: '2', name: 'Feijão carioca', calories: 77, protein: 4.8, carbs: 14, fats: 0.5, portion_size: 100, portion_unit: 'g' },
    { id: '3', name: 'Frango grelhado', calories: 165, protein: 31, carbs: 0, fats: 3.6, portion_size: 100, portion_unit: 'g' },
  ];

  const filteredFoods = mockFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Buscar Alimento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Digite o nome do alimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredFoods.map(food => (
              <div
                key={food.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => onFoodSelect(food)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{food.name}</h4>
                    <p className="text-sm text-gray-600">
                      {food.calories} kcal por {food.portion_size}{food.portion_unit}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <div>P: {food.protein}g</div>
                    <div>C: {food.carbs}g</div>
                    <div>G: {food.fats}g</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredFoods.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              Nenhum alimento encontrado
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodSearchDialog;
