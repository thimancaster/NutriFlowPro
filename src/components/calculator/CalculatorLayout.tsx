
import React from 'react';
import { useCalculator } from '@/contexts/calculator/CalculatorContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Activity, Target } from 'lucide-react';

const CalculatorLayout: React.FC = () => {
  const { 
    state, 
    setWeight, 
    setHeight, 
    setAge, 
    setSex, 
    setActivityLevel, 
    setObjective, 
    setProfile,
    calculateNutrition,
    resetCalculator,
    setActiveTab 
  } = useCalculator();

  const handleCalculate = () => {
    calculateNutrition();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Calculadora Nutricional</h1>
          <p className="text-muted-foreground">
            Calcule TMB, GET e distribuição de macronutrientes
          </p>
        </div>

        <Tabs value={state.activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
            <TabsTrigger value="advanced">Configurações</TabsTrigger>
            <TabsTrigger value="results" disabled={!state.calculated}>Resultados</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Dados Antropométricos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={state.weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      placeholder="70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={state.height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      placeholder="170"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Idade (anos)</Label>
                    <Input
                      id="age"
                      type="number"
                      value={state.age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      placeholder="30"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex">Sexo</Label>
                  <Select value={state.sex} onValueChange={setSex}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Configurações Avançadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="activity">Nível de Atividade</Label>
                  <Select value={state.activityLevel} onValueChange={setActivityLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentario">Sedentário</SelectItem>
                      <SelectItem value="leve">Levemente ativo</SelectItem>
                      <SelectItem value="moderado">Moderadamente ativo</SelectItem>
                      <SelectItem value="intenso">Muito ativo</SelectItem>
                      <SelectItem value="extremo">Extremamente ativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="objective">Objetivo</Label>
                  <Select value={state.objective} onValueChange={setObjective}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                      <SelectItem value="manutenção">Manutenção</SelectItem>
                      <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile">Perfil</Label>
                  <Select value={state.profile} onValueChange={setProfile}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eutrofico">Eutrófico</SelectItem>
                      <SelectItem value="sobrepeso">Sobrepeso</SelectItem>
                      <SelectItem value="obeso">Obeso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {state.calculated && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Resultados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Taxa Metabólica Basal (TMB)</Label>
                      <div className="text-2xl font-bold text-nutri-green">
                        {state.bmr} kcal/dia
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Gasto Energético Total (GET)</Label>
                      <div className="text-2xl font-bold text-nutri-blue">
                        {state.tdee} kcal/dia
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Proteínas</Label>
                      <div className="text-xl font-semibold">
                        {state.protein}g
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Carboidratos</Label>
                      <div className="text-xl font-semibold">
                        {state.carbs}g
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Gorduras</Label>
                      <div className="text-xl font-semibold">
                        {state.fats}g
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={resetCalculator}>
            Resetar
          </Button>
          <Button 
            onClick={handleCalculate} 
            disabled={state.loading}
            className="bg-nutri-green hover:bg-nutri-green-dark"
          >
            {state.loading ? 'Calculando...' : 'Calcular'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalculatorLayout;
