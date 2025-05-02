
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface MealPlanAssemblyProps {
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  patientName?: string;
  patientData?: any;
}

interface MealItem {
  name: string;
  portion: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  selected?: boolean;
}

interface Meal {
  name: string;
  time: string;
  calories: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: MealItem[];
}

const MEAL_DISTRIBUTIONS = [
  { name: 'Café da manhã', time: '07:00', proteinPercent: 0.15, carbsPercent: 0.25, fatPercent: 0.20 },
  { name: 'Lanche da manhã', time: '10:00', proteinPercent: 0.15, carbsPercent: 0.15, fatPercent: 0.10 },
  { name: 'Almoço', time: '12:30', proteinPercent: 0.20, carbsPercent: 0.20, fatPercent: 0.20 },
  { name: 'Lanche da tarde', time: '15:30', proteinPercent: 0.15, carbsPercent: 0.10, fatPercent: 0.10 },
  { name: 'Jantar', time: '19:00', proteinPercent: 0.15, carbsPercent: 0.15, fatPercent: 0.20 },
  { name: 'Ceia', time: '22:00', proteinPercent: 0.20, carbsPercent: 0.15, fatPercent: 0.20 }
];

// Sample food database
const FOOD_DATABASE: MealItem[] = [
  { name: 'Arroz branco cozido', portion: '100g', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Feijão carioca', portion: '100g', calories: 76, protein: 5.1, carbs: 13.6, fat: 0.5 },
  { name: 'Peito de frango grelhado', portion: '100g', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Ovo cozido', portion: '1 unidade', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  { name: 'Pão integral', portion: '1 fatia', calories: 65, protein: 3.5, carbs: 12, fat: 1 },
  { name: 'Leite desnatado', portion: '200ml', calories: 68, protein: 6.8, carbs: 10, fat: 0 },
  { name: 'Banana', portion: '1 unidade média', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  { name: 'Maçã', portion: '1 unidade média', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: 'Aveia em flocos', portion: '30g', calories: 117, protein: 4, carbs: 20, fat: 2.3 },
  { name: 'Batata doce cozida', portion: '100g', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: 'Azeite de oliva', portion: '1 colher de sopa', calories: 119, protein: 0, carbs: 0, fat: 13.5 },
  { name: 'Queijo branco', portion: '30g', calories: 80, protein: 5, carbs: 2, fat: 5 },
  { name: 'Tapioca', portion: '1 unidade média', calories: 130, protein: 0.5, carbs: 32, fat: 0.3 },
  { name: 'Iogurte natural', portion: '200g', calories: 122, protein: 8, carbs: 12, fat: 4 },
  { name: 'Almôndegas ao sugo', portion: '100g', calories: 210, protein: 15, carbs: 10, fat: 12 },
  { name: 'Mix de castanhas', portion: '25g', calories: 160, protein: 5, carbs: 5, fat: 13 },
  { name: 'Atum em água', portion: '100g', calories: 116, protein: 26, carbs: 0, fat: 0.8 },
  { name: 'Quinoa cozida', portion: '100g', calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
  { name: 'Abacate', portion: '1/2 unidade', calories: 160, protein: 2, carbs: 8, fat: 15 },
  { name: 'Brócolis cozido', portion: '100g', calories: 35, protein: 2.4, carbs: 7, fat: 0.4 }
];

const filterFoodsByMeal = (mealName: string): MealItem[] => {
  const lowerMealName = mealName.toLowerCase();
  
  if (lowerMealName.includes('café') || lowerMealName.includes('manha')) {
    return FOOD_DATABASE.filter(food => 
      ['pão', 'leite', 'iogurte', 'banana', 'maçã', 'aveia', 'tapioca', 'ovo'].some(
        item => food.name.toLowerCase().includes(item)
      )
    );
  }
  
  if (lowerMealName.includes('almoço')) {
    return FOOD_DATABASE.filter(food => 
      ['arroz', 'feijão', 'frango', 'batata', 'almôndega', 'atum', 'quinoa', 'brócolis'].some(
        item => food.name.toLowerCase().includes(item)
      )
    );
  }
  
  if (lowerMealName.includes('jantar')) {
    return FOOD_DATABASE.filter(food => 
      ['frango', 'batata', 'arroz', 'quinoa', 'atum', 'brócolis'].some(
        item => food.name.toLowerCase().includes(item)
      )
    );
  }
  
  // Lanches e ceia
  return FOOD_DATABASE.filter(food => 
    ['iogurte', 'banana', 'maçã', 'mix de castanhas', 'abacate', 'queijo'].some(
      item => food.name.toLowerCase().includes(item)
    )
  );
};

const MealPlanAssembly: React.FC<MealPlanAssemblyProps> = ({ 
  totalCalories,
  macros,
  patientName = "Paciente",
  patientData
}) => {
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  
  useEffect(() => {
    // Initialize meals with distribution
    const initialMeals = MEAL_DISTRIBUTIONS.map(dist => {
      const protein = Math.round(macros.protein * dist.proteinPercent);
      const carbs = Math.round(macros.carbs * dist.carbsPercent);
      const fat = Math.round(macros.fat * dist.fatPercent);
      const calories = Math.round(protein * 4 + carbs * 4 + fat * 9);
      
      return {
        name: dist.name,
        time: dist.time,
        proteinPercent: dist.proteinPercent,
        carbsPercent: dist.carbsPercent,
        fatPercent: dist.fatPercent,
        protein,
        carbs,
        fat,
        calories,
        foods: [] as MealItem[]
      };
    });
    
    setMeals(initialMeals);
    setLoading(false);
  }, [totalCalories, macros]);
  
  const handleAddFood = (mealIndex: number, food: MealItem) => {
    setMeals(prev => {
      const updatedMeals = [...prev];
      updatedMeals[mealIndex].foods = [...updatedMeals[mealIndex].foods, { ...food, selected: true }];
      return updatedMeals;
    });
    
    toast({
      title: "Alimento adicionado",
      description: `${food.name} adicionado à ${meals[mealIndex].name}`
    });
  };
  
  const handleRemoveFood = (mealIndex: number, foodIndex: number) => {
    setMeals(prev => {
      const updatedMeals = [...prev];
      updatedMeals[mealIndex].foods = updatedMeals[mealIndex].foods.filter((_, idx) => idx !== foodIndex);
      return updatedMeals;
    });
  };
  
  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text("Plano Alimentar", 105, 20, { align: "center" });
      
      // Add patient info
      doc.setFontSize(12);
      doc.text(`Paciente: ${patientName}`, 20, 40);
      if (patientData) {
        doc.text(`Idade: ${patientData.age || '-'}`, 20, 50);
        doc.text(`Peso: ${patientData.weight || '-'} kg`, 20, 60);
        doc.text(`Altura: ${patientData.height || '-'} cm`, 20, 70);
      }
      
      // Add nutrition summary
      doc.setFontSize(14);
      doc.text("Resumo Nutricional", 105, 90, { align: "center" });
      doc.setFontSize(11);
      doc.text(`Calorias totais: ${totalCalories} kcal`, 20, 100);
      doc.text(`Proteínas: ${macros.protein}g (${Math.round(macros.protein * 4 / totalCalories * 100)}%)`, 20, 110);
      doc.text(`Carboidratos: ${macros.carbs}g (${Math.round(macros.carbs * 4 / totalCalories * 100)}%)`, 20, 120);
      doc.text(`Gorduras: ${macros.fat}g (${Math.round(macros.fat * 9 / totalCalories * 100)}%)`, 20, 130);
      
      // Add meals table
      let yPosition = 150;
      
      for (const meal of meals) {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(13);
        doc.text(`${meal.name} - ${meal.time}`, 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.text(`Calorias: ${meal.calories} kcal | Proteínas: ${meal.protein}g | Carboidratos: ${meal.carbs}g | Gorduras: ${meal.fat}g`, 25, yPosition);
        yPosition += 10;
        
        if (meal.foods.length > 0) {
          const tableColumn = ["Alimento", "Porção", "Calorias", "P", "C", "G"];
          const tableRows = meal.foods.map(food => [
            food.name,
            food.portion,
            `${food.calories} kcal`,
            `${food.protein || "-"}g`,
            `${food.carbs || "-"}g`,
            `${food.fat || "-"}g`
          ]);
          
          (doc as any).autoTable({
            startY: yPosition,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [0, 123, 255] },
            margin: { left: 25 }
          });
          
          // Update yPosition to after the table
          yPosition = (doc as any).lastAutoTable.finalY + 15;
        } else {
          yPosition += 5;
          doc.text("Nenhum alimento selecionado", 25, yPosition);
          yPosition += 15;
        }
      }
      
      // Add footer
      const date = new Date().toLocaleDateString('pt-BR');
      doc.setFontSize(10);
      doc.text(`Gerado em: ${date}`, 20, doc.internal.pageSize.height - 10);
      doc.text("NutriFlow Pro", doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: "right" });
      
      // Save the PDF
      doc.save(`plano_alimentar_${patientName.replace(/\s+/g, '_').toLowerCase()}.pdf`);
      
      toast({
        title: "PDF gerado com sucesso",
        description: "O plano alimentar foi exportado em PDF"
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao tentar gerar o PDF",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-nutri-blue" />
        <span className="ml-2">Carregando plano alimentar...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Montagem do Plano Alimentar</h2>
        <Button 
          onClick={generatePDF} 
          disabled={generating}
          className="bg-blue-500 text-white hover:bg-white hover:text-blue-500 border border-blue-500 transition-all duration-200"
        >
          {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
          Exportar PDF
        </Button>
      </div>
      
      <div className="bg-nutri-gray-light p-4 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Proteínas</p>
            <p className="text-xl font-bold text-nutri-blue">{macros.protein}g</p>
            <p className="text-sm">{Math.round(macros.protein * 4 / totalCalories * 100)}% / {macros.protein * 4} kcal</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Carboidratos</p>
            <p className="text-xl font-bold text-nutri-green">{macros.carbs}g</p>
            <p className="text-sm">{Math.round(macros.carbs * 4 / totalCalories * 100)}% / {macros.carbs * 4} kcal</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Gorduras</p>
            <p className="text-xl font-bold text-nutri-teal">{macros.fat}g</p>
            <p className="text-sm">{Math.round(macros.fat * 9 / totalCalories * 100)}% / {macros.fat * 9} kcal</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {meals.map((meal, mealIndex) => (
          <Card key={mealIndex} className="overflow-hidden">
            <CardHeader className="bg-nutri-gray-light pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>{meal.name} <span className="text-sm font-normal text-gray-500">({meal.time})</span></CardTitle>
                <div className="text-right">
                  <p className="font-medium">{meal.calories} kcal</p>
                  <p className="text-xs text-gray-600">
                    P: {meal.protein}g ({Math.round(meal.proteinPercent * 100)}%) | 
                    C: {meal.carbs}g ({Math.round(meal.carbsPercent * 100)}%) | 
                    G: {meal.fat}g ({Math.round(meal.fatPercent * 100)}%)
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {meal.foods.length > 0 ? (
                <div className="space-y-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Alimento</th>
                        <th className="text-left py-2">Porção</th>
                        <th className="text-left py-2">Calorias</th>
                        <th className="text-right py-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meal.foods.map((food, foodIndex) => (
                        <tr key={foodIndex} className="border-b">
                          <td className="py-2">{food.name}</td>
                          <td className="py-2">{food.portion}</td>
                          <td className="py-2">{food.calories} kcal</td>
                          <td className="py-2 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveFood(mealIndex, foodIndex)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              Remover
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum alimento adicionado</p>
              )}
              
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Adicionar Alimentos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {filterFoodsByMeal(meal.name).slice(0, 6).map((food, idx) => (
                    <Button 
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddFood(mealIndex, food)}
                      className="justify-start overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                      {food.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MealPlanAssembly;
