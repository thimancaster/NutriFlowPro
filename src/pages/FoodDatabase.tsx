import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import FoodCategoryFilter from '@/components/food-database/FoodCategoryFilter';
import FoodList from '@/components/food-database/FoodList';
import FoodDetails from '@/components/food-database/FoodDetails';
import FoodForm from '@/components/food-database/FoodForm';
import { usePremiumGuard } from '@/hooks/usePremiumGuard';

const FoodDatabase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('browse');
  const { toast } = useToast();
  // Fix: The first parameter should be a boolean (isPremiumFeature)
  const { hasAccess } = usePremiumGuard(true);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFoodSelect = (foodId: string) => {
    setSelectedFoodId(foodId);
    setActiveTab('details');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset selected food when changing tabs
    if (value !== 'details') {
      setSelectedFoodId(null);
    }
  };

  const handleAddFood = () => {
    if (!hasAccess) {
      toast({
        title: 'Recurso Premium',
        description: 'Para adicionar alimentos personalizados, você precisa ter uma conta premium.',
      });
      return;
    }
    setActiveTab('add');
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Base de Dados Alimentar</h1>
            <p className="text-muted-foreground">
              Explore a base de dados alimentar completa com valores nutricionais
            </p>
          </div>
          <Button 
            variant="default" 
            className="bg-nutri-green hover:bg-nutri-green-dark" 
            onClick={handleAddFood}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span>Adicionar Alimento</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="browse">Explorar Alimentos</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedFoodId}>
              Detalhes do Alimento
            </TabsTrigger>
            <TabsTrigger value="add">Adicionar Alimento</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Explorar Alimentos</CardTitle>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar alimentos..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="pl-8"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                  {showFilters && <FoodCategoryFilter onCategorySelect={setSelectedCategory} selectedCategory={selectedCategory} />}
                  {selectedCategory && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="px-3 py-1">
                        {selectedCategory}
                        <button 
                          className="ml-2 hover:text-destructive" 
                          onClick={() => setSelectedCategory(null)}
                        >
                          ×
                        </button>
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <FoodList 
                  searchTerm={searchTerm} 
                  categoryId={selectedCategory} 
                  onFoodSelect={handleFoodSelect}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="details">
            {selectedFoodId && <FoodDetails foodId={selectedFoodId} />}
          </TabsContent>
          
          <TabsContent value="add">
            <FoodForm />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default FoodDatabase;
