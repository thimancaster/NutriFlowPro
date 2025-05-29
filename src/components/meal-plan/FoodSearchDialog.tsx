
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portion_size: number;
  portion_unit: string;
}

interface FoodSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodSelect: (food: Food) => void;
}

const FoodSearchDialog: React.FC<FoodSearchDialogProps> = ({
  isOpen,
  onClose,
  onFoodSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);

  const searchFoods = async (term: string) => {
    if (!term.trim()) {
      setFoods([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .ilike('name', `%${term}%`)
        .limit(20);

      if (error) {
        console.error('Error searching foods:', error);
        return;
      }

      setFoods(data || []);
    } catch (error) {
      console.error('Error searching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchFoods(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleFoodSelect = (food: Food) => {
    onFoodSelect(food);
    onClose();
    setSearchTerm('');
    setFoods([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Buscar Alimentos</DialogTitle>
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
            {loading && (
              <div className="text-center py-4">
                <p className="text-gray-500">Buscando...</p>
              </div>
            )}
            
            {!loading && foods.length === 0 && searchTerm && (
              <div className="text-center py-4">
                <p className="text-gray-500">Nenhum alimento encontrado</p>
              </div>
            )}
            
            {foods.map((food) => (
              <div
                key={food.id}
                className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleFoodSelect(food)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{food.name}</h3>
                    <p className="text-sm text-gray-500">
                      {food.portion_size} {food.portion_unit}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">{food.calories} kcal</p>
                    <p className="text-gray-500">
                      P: {food.protein}g | C: {food.carbs}g | G: {food.fats}g
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodSearchDialog;
