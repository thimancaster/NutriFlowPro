
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileDown, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { MealPlanSettings } from '@/utils/mealGeneratorUtils';

// Extend the jsPDF type definition to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface MealGeneratorResultsProps {
  mealPlan: any;
  settings: MealPlanSettings;
}

const MealGeneratorResults: React.FC<MealGeneratorResultsProps> = ({ mealPlan, settings }) => {
  
  const handleExportPDF = () => {
    // Create PDF document
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Plano Alimentar', 105, 15, { align: 'center' });
    
    // Add settings summary
    doc.setFontSize(12);
    doc.text(`Número de refeições: ${settings.numMeals}`, 20, 30);
    doc.text(`Calorias totais: ${settings.totalCalories}`, 20, 40);
    doc.text(`Tipo de dieta: ${settings.dietType}`, 20, 50);
    
    if (settings.restrictions.length > 0) {
      doc.text(`Restrições: ${settings.restrictions.join(', ')}`, 20, 60);
    }
    
    // Add macronutrient summary
    doc.setFontSize(16);
    doc.text('Macronutrientes Diários', 105, 75, { align: 'center' });
    
    doc.autoTable({
      head: [['Nutriente', 'Quantidade', 'Calorias', '% do Total']],
      body: [
        ['Proteínas', `${mealPlan.total_protein}g`, `${mealPlan.total_protein * 4} kcal`, `${Math.round((mealPlan.total_protein * 4 * 100) / mealPlan.total_calories)}%`],
        ['Carboidratos', `${mealPlan.total_carbs}g`, `${mealPlan.total_carbs * 4} kcal`, `${Math.round((mealPlan.total_carbs * 4 * 100) / mealPlan.total_calories)}%`],
        ['Gorduras', `${mealPlan.total_fats}g`, `${mealPlan.total_fats * 9} kcal`, `${Math.round((mealPlan.total_fats * 9 * 100) / mealPlan.total_calories)}%`],
        ['Total', '', `${mealPlan.total_calories} kcal`, '100%']
      ],
      startY: 80,
      headStyles: { fillColor: [0, 128, 0] }
    });
    
    // Add each meal
    let yPosition = doc.autoTable.previous.finalY + 20;
    
    mealPlan.meals.forEach((meal: any, index: number) => {
      // Add new page if needed
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text(`${meal.name} (${meal.calories} kcal)`, 20, yPosition);
      
      yPosition += 10;
      
      doc.autoTable({
        head: [['Nutriente', 'Quantidade']],
        body: [
          ['Proteínas', `${meal.protein}g`],
          ['Carboidratos', `${meal.carbs}g`],
          ['Gorduras', `${meal.fat}g`]
        ],
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
        margin: { left: 20 },
        tableWidth: 80
      });
      
      yPosition = doc.autoTable.previous.finalY + 10;
      
      if (meal.foodSuggestions && meal.foodSuggestions.length > 0) {
        doc.setFontSize(12);
        doc.text('Sugestões de alimentos:', 20, yPosition);
        
        yPosition += 5;
        
        meal.foodSuggestions.forEach((food: string) => {
          doc.setFontSize(10);
          doc.text(`• ${food}`, 25, yPosition);
          yPosition += 5;
        });
      }
      
      yPosition += 15;
    });
    
    // Add notes section
    doc.setFontSize(12);
    doc.text('Observações:', 20, yPosition);
    doc.setFontSize(10);
    doc.text('Este plano alimentar é apenas uma sugestão e deve ser adaptado às necessidades individuais.', 20, yPosition + 5);
    doc.text('Consulte sempre um nutricionista para orientações personalizadas.', 20, yPosition + 10);
    
    // Save PDF
    doc.save('plano_alimentar.pdf');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-nutri-blue">Resultados do Plano Alimentar</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPDF} 
            className="flex items-center gap-1"
          >
            <FileDown className="h-4 w-4" />
            <span>Exportar PDF</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.print()} 
            className="flex items-center gap-1 print:hidden"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir</span>
          </Button>
        </div>
      </div>
      
      <Card className="bg-white shadow-md">
        <CardHeader className="bg-nutri-green/5 border-b">
          <CardTitle className="text-nutri-green">Resumo do Plano</CardTitle>
          <CardDescription>Distribuição diária total de macronutrientes</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-500">Calorias</p>
              <p className="text-xl font-bold">{mealPlan.total_calories} kcal</p>
            </div>
            <div className="bg-nutri-blue/5 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-500">Proteínas</p>
              <p className="text-xl font-bold text-nutri-blue">{mealPlan.total_protein}g</p>
              <p className="text-xs text-gray-500">{Math.round((mealPlan.total_protein * 4 * 100) / mealPlan.total_calories)}% do total</p>
            </div>
            <div className="bg-nutri-green/5 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-500">Carboidratos</p>
              <p className="text-xl font-bold text-nutri-green">{mealPlan.total_carbs}g</p>
              <p className="text-xs text-gray-500">{Math.round((mealPlan.total_carbs * 4 * 100) / mealPlan.total_calories)}% do total</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-500">Gorduras</p>
              <p className="text-xl font-bold text-amber-500">{mealPlan.total_fats}g</p>
              <p className="text-xs text-gray-500">{Math.round((mealPlan.total_fats * 9 * 100) / mealPlan.total_calories)}% do total</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {mealPlan.meals.map((meal: any, index: number) => (
          <Card key={index} className="bg-white shadow-sm">
            <CardHeader className="bg-gray-50 border-b pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium">{meal.name}</CardTitle>
                <span className="text-sm font-medium bg-nutri-blue/10 text-nutri-blue px-2 py-1 rounded-full">
                  {meal.calories} kcal
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">Proteínas</p>
                  <p className="font-semibold text-nutri-blue">{meal.protein}g</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Carboidratos</p>
                  <p className="font-semibold text-nutri-green">{meal.carbs}g</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gorduras</p>
                  <p className="font-semibold text-amber-500">{meal.fat}g</p>
                </div>
              </div>
              
              {meal.foodSuggestions && meal.foodSuggestions.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Sugestões de alimentos:</p>
                  <div className="flex flex-wrap gap-2">
                    {meal.foodSuggestions.map((food: string, i: number) => (
                      <span 
                        key={i} 
                        className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700"
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 border-t py-2 px-4">
              <p className="text-xs text-gray-500">
                Distribuição: {Math.round(meal.percentage)}% do total diário
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MealGeneratorResults;
