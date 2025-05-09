
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MealGeneratorSettings as MealGeneratorSettingsType } from '@/hooks/useMealGeneratorState';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, MinusCircle } from 'lucide-react';

interface MealGeneratorSettingsProps {
  settings: MealGeneratorSettingsType;
  onSettingsChange: (settings: Partial<MealGeneratorSettingsType>) => void;
}

const MealGeneratorSettings = ({ settings, onSettingsChange }: MealGeneratorSettingsProps) => {
  const [customMeals, setCustomMeals] = useState(false);
  const [customMealCount, setCustomMealCount] = useState(settings.numMeals);
  
  const restrictionOptions = [
    { id: 'gluten', label: 'Sem Glúten' },
    { id: 'dairy', label: 'Sem Laticínios' },
    { id: 'vegetarian', label: 'Vegetariano' },
    { id: 'vegan', label: 'Vegano' },
    { id: 'nut-free', label: 'Sem Nozes' },
    { id: 'low-sodium', label: 'Baixo Sódio' },
  ];

  const handleRestrictionChange = (id: string) => {
    const newRestrictions = settings.restrictions.includes(id)
      ? settings.restrictions.filter(item => item !== id)
      : [...settings.restrictions, id];
    
    onSettingsChange({ restrictions: newRestrictions });
  };
  
  const handleMealCountChange = (value: string) => {
    if (customMeals) {
      setCustomMealCount(value);
      onSettingsChange({ numMeals: value });
    } else {
      onSettingsChange({ numMeals: value });
    }
  };
  
  const incrementCustomMeals = () => {
    const currentCount = parseInt(customMealCount);
    if (currentCount < 8) {
      const newCount = (currentCount + 1).toString();
      setCustomMealCount(newCount);
      onSettingsChange({ numMeals: newCount });
    }
  };
  
  const decrementCustomMeals = () => {
    const currentCount = parseInt(customMealCount);
    if (currentCount > 3) {
      const newCount = (currentCount - 1).toString();
      setCustomMealCount(newCount);
      onSettingsChange({ numMeals: newCount });
    }
  };
  
  const toggleCustomMeals = (value: string) => {
    if (value === "custom") {
      setCustomMeals(true);
      onSettingsChange({ numMeals: customMealCount });
    } else {
      setCustomMeals(false);
      onSettingsChange({ numMeals: value });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="calories">Calorias Totais</Label>
          <Input 
            id="calories" 
            type="number" 
            value={settings.totalCalories} 
            onChange={(e) => onSettingsChange({ totalCalories: e.target.value })} 
          />
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="meals">Número de Refeições</Label>
          <Tabs defaultValue="preset" onValueChange={toggleCustomMeals} className="w-full">
            <TabsList className="grid grid-cols-2 mb-2">
              <TabsTrigger value="preset">Predefinido</TabsTrigger>
              <TabsTrigger value="custom">Personalizado</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preset" className="space-y-4">
              <Select 
                value={settings.numMeals} 
                onValueChange={handleMealCountChange}
              >
                <SelectTrigger id="meals">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Refeições</SelectItem>
                  <SelectItem value="4">4 Refeições</SelectItem>
                  <SelectItem value="5">5 Refeições</SelectItem>
                  <SelectItem value="6">6 Refeições</SelectItem>
                </SelectContent>
              </Select>
            </TabsContent>
            
            <TabsContent value="custom">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={decrementCustomMeals} 
                  disabled={parseInt(customMealCount) <= 3}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    type="number"
                    min="3"
                    max="8"
                    value={customMealCount}
                    onChange={(e) => handleMealCountChange(e.target.value)}
                    className="text-center"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={incrementCustomMeals}
                  disabled={parseInt(customMealCount) >= 8}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="diet-type">Tipo de Dieta</Label>
          <Select 
            value={settings.dietType} 
            onValueChange={(value) => onSettingsChange({ dietType: value })}
          >
            <SelectTrigger id="diet-type">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balanced">Balanceada</SelectItem>
              <SelectItem value="low-carb">Baixo Carboidrato</SelectItem>
              <SelectItem value="high-protein">Rica em Proteínas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        <Label>Restrições Alimentares</Label>
        <div className="grid grid-cols-2 gap-2">
          {restrictionOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox 
                id={option.id} 
                checked={settings.restrictions.includes(option.id)}
                onCheckedChange={() => handleRestrictionChange(option.id)} 
              />
              <Label htmlFor={option.id} className="cursor-pointer">{option.label}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MealGeneratorSettings;
