
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Download, Calendar } from 'lucide-react';
import { useMealPlanQuery } from '@/hooks/meal-plan/useMealPlanQuery';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const MealPlanView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: mealPlan, isLoading, error } = useMealPlanQuery(id);

  const handleBack = () => {
    navigate('/meal-plans');
  };

  const handleEdit = () => {
    if (mealPlan?.id) {
      navigate(`/meal-plans/${mealPlan.id}/edit`);
    }
  };

  const handleExportPDF = () => {
    toast({
      title: "Em breve",
      description: "Funcionalidade de exportação PDF será implementada em breve.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutri-blue mx-auto mb-4"></div>
            <p>Carregando plano alimentar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">
              {error || "Plano alimentar não encontrado"}
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Lista
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Plano Alimentar</h1>
            <p className="text-gray-600 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {format(new Date(mealPlan.date), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resumo Nutricional</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">
                {Math.round(mealPlan.total_calories)} kcal
              </Badge>
              <Badge variant="outline">
                P: {Math.round(mealPlan.total_protein)}g
              </Badge>
              <Badge variant="outline">
                C: {Math.round(mealPlan.total_carbs)}g
              </Badge>
              <Badge variant="outline">
                G: {Math.round(mealPlan.total_fats)}g
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Meals */}
      <div className="grid gap-4">
        {mealPlan.meals.map((meal) => (
          <Card key={meal.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {meal.name}
                  {meal.time && (
                    <Badge variant="secondary" className="text-xs">
                      {meal.time}
                    </Badge>
                  )}
                </CardTitle>
                <Badge variant="outline">
                  {Math.round(meal.total_calories)} kcal
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Macros Summary */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="font-medium text-red-600">
                      {Math.round(meal.total_protein)}g
                    </div>
                    <div className="text-gray-600">Proteína</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="font-medium text-yellow-600">
                      {Math.round(meal.total_carbs)}g
                    </div>
                    <div className="text-gray-600">Carboidratos</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-medium text-green-600">
                      {Math.round(meal.total_fats)}g
                    </div>
                    <div className="text-gray-600">Gorduras</div>
                  </div>
                </div>

                {/* Foods List */}
                <div className="space-y-2">
                  {meal.items && meal.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{item.food_name}</span>
                        <span className="text-gray-600 ml-2">
                          {item.quantity}{item.unit}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {Math.round(item.calories)} kcal
                      </div>
                    </div>
                  ))}
                  {(!meal.items || meal.items.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      Nenhum alimento cadastrado para esta refeição
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notes */}
      {mealPlan.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{mealPlan.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MealPlanView;
