
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Loader2 } from 'lucide-react';
import { FoodService } from '@/services/foodService';
import { useToast } from '@/hooks/use-toast';

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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (searchTerm.length >= 2) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const handleSearch = async () => {
    if (searchTerm.length < 2) return;

    setIsSearching(true);
    try {
      const results = await FoodService.searchFoods(searchTerm);
      setSearchResults(results.slice(0, 20)); // Limitar a 20 resultados
    } catch (error) {
      console.error('Erro na busca:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar alimentos",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFood = (food: any) => {
    onFoodSelect(food);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buscar Alimento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campo de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Digite o nome do alimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Resultados da busca */}
          <div className="space-y-2">
            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Buscando alimentos...</span>
              </div>
            )}

            {!isSearching && searchTerm.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum alimento encontrado para "{searchTerm}"</p>
              </div>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((food, index) => (
                  <div
                    key={food.id || index}
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelectFood(food)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{food.name}</h4>
                        <p className="text-sm text-gray-600">
                          {food.portion_size} {food.portion_unit}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(food.calories)} kcal
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            P: {Math.round(food.protein)}g
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            C: {Math.round(food.carbs)}g
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            G: {Math.round(food.fats)}g
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchTerm.length < 2 && (
              <div className="text-center py-8 text-gray-500">
                <p>Digite pelo menos 2 caracteres para buscar</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodSearchDialog;
