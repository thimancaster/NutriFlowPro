
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Save, Clock, Users } from 'lucide-react';
import { DetailedMealPlan } from '@/types/mealPlan';
import { useToast } from '@/hooks/use-toast';

export interface MealPlanEditorProps {
  mealPlan: DetailedMealPlan;
  onMealPlanUpdate?: (updatedMealPlan: DetailedMealPlan) => void;
}

const MealPlanEditor: React.FC<MealPlanEditorProps> = ({ 
  mealPlan, 
  onMealPlanUpdate 
}) => {
  const [editedPlan, setEditedPlan] = useState<DetailedMealPlan>(mealPlan);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (onMealPlanUpdate) {
      onMealPlanUpdate(editedPlan);
    }
    setIsEditing(false);
    toast({
      title: "Sucesso",
      description: "Plano alimentar salvo com sucesso!",
    });
  };

  const updateMealItem = (mealIndex: number, itemIndex: number, field: string, value: any) => {
    const updatedPlan = { ...editedPlan };
    if (updatedPlan.meals && updatedPlan.meals[mealIndex] && updatedPlan.meals[mealIndex].foods) {
      updatedPlan.meals[mealIndex].foods[itemIndex] = {
        ...updatedPlan.meals[mealIndex].foods[itemIndex],
        [field]: value
      };
      setEditedPlan(updatedPlan);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            {editedPlan.title || 'Plano Alimentar'}
          </CardTitle>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {editedPlan.duration || 7} dias
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {editedPlan.total_calories || 0} kcal/dia
              </span>
            </div>
            <Badge variant="outline">
              {editedPlan.type || 'Personalizado'}
            </Badge>
          </div>

          <Tabs defaultValue="meals" className="w-full">
            <TabsList>
              <TabsTrigger value="meals">Refeições</TabsTrigger>
              <TabsTrigger value="nutrition">Informação Nutricional</TabsTrigger>
              <TabsTrigger value="notes">Observações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="meals" className="space-y-4">
              {editedPlan.meals?.map((meal, mealIndex) => (
                <Card key={mealIndex}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {isEditing ? (
                        <Input
                          value={meal.name}
                          onChange={(e) => {
                            const updatedPlan = { ...editedPlan };
                            updatedPlan.meals[mealIndex].name = e.target.value;
                            setEditedPlan(updatedPlan);
                          }}
                        />
                      ) : (
                        meal.name
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {meal.foods?.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-4 p-2 border rounded">
                          <div className="flex-1">
                            {isEditing ? (
                              <Input
                                value={item.name}
                                onChange={(e) => updateMealItem(mealIndex, itemIndex, 'name', e.target.value)}
                                placeholder="Nome do alimento"
                              />
                            ) : (
                              <span className="font-medium">{item.name}</span>
                            )}
                          </div>
                          <div className="w-20">
                            {isEditing ? (
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateMealItem(mealIndex, itemIndex, 'quantity', parseFloat(e.target.value))}
                                placeholder="Qtd"
                              />
                            ) : (
                              <span>{item.quantity}</span>
                            )}
                          </div>
                          <div className="w-16">
                            <span className="text-sm text-gray-500">{item.unit || 'g'}</span>
                          </div>
                          <div className="w-20">
                            <span className="text-sm">{Math.round(item.calories || 0)} kcal</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="nutrition">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Nutricional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Calorias Totais</Label>
                      <div className="text-2xl font-bold">
                        {editedPlan.total_calories || 0} kcal
                      </div>
                    </div>
                    <div>
                      <Label>Proteínas</Label>
                      <div className="text-xl font-semibold text-blue-600">
                        {editedPlan.total_protein || 0}g
                      </div>
                    </div>
                    <div>
                      <Label>Carboidratos</Label>
                      <div className="text-xl font-semibold text-green-600">
                        {editedPlan.total_carbs || 0}g
                      </div>
                    </div>
                    <div>
                      <Label>Gorduras</Label>
                      <div className="text-xl font-semibold text-yellow-600">
                        {editedPlan.total_fats || 0}g
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editedPlan.notes || ''}
                      onChange={(e) => setEditedPlan({
                        ...editedPlan,
                        notes: e.target.value
                      })}
                      placeholder="Adicione observações sobre o plano alimentar..."
                      rows={5}
                    />
                  ) : (
                    <p className="text-gray-600">
                      {editedPlan.notes || 'Nenhuma observação adicionada.'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanEditor;
