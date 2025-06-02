
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { validateSecureForm, rateLimiter } from '@/utils/securityValidation';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);

  const searchFoods = async (term: string) => {
    // Validate and sanitize search term
    const validation = validateSecureForm.foodSearch(term);
    
    if (!validation.isValid) {
      if (validation.error) {
        toast({
          title: "Termo de busca inválido",
          description: validation.error,
          variant: "destructive"
        });
      }
      setFoods([]);
      return;
    }

    // Rate limiting for search requests
    const rateCheck = rateLimiter.checkLimit('food_search', 10, 60000); // 10 searches per minute
    
    if (!rateCheck.allowed) {
      toast({
        title: "Muitas buscas",
        description: "Aguarde um momento antes de buscar novamente.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .ilike('name', `%${validation.sanitizedTerm}%`)
        .limit(20);

      if (error) {
        console.error('Error searching foods:', error);
        toast({
          title: "Erro na busca",
          description: "Não foi possível buscar alimentos no momento.",
          variant: "destructive"
        });
        return;
      }

      setFoods(data || []);
    } catch (error) {
      console.error('Error searching foods:', error);
      toast({
        title: "Erro na busca",
        description: "Erro inesperado durante a busca.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchFoods(searchTerm);
      } else {
        setFoods([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleFoodSelect = (food: Food) => {
    onFoodSelect(food);
    onClose();
    setSearchTerm('');
    setFoods([]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Basic client-side validation
    if (value.length > 100) {
      toast({
        title: "Termo muito longo",
        description: "O termo de busca deve ter no máximo 100 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setSearchTerm(value);
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
              onChange={handleSearchChange}
              className="pl-10"
              maxLength={100}
              autoComplete="off"
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
