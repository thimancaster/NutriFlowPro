
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

// Schema for food form validation
const foodFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  brand: z.string().optional(),
  category_id: z.string().min(1, { message: 'Selecione uma categoria' }),
  subcategory_id: z.string().min(1, { message: 'Selecione uma subcategoria' }),
  description: z.string().optional(),
  caloric_density: z.string().optional(),
  glycemic_index: z.string().optional(),
  source: z.string().optional(),
  measures: z.array(z.object({
    name: z.string().min(1, { message: 'Nome da medida é obrigatório' }),
    quantity: z.number().min(0, { message: 'A quantidade deve ser maior que 0' }),
    unit: z.string().min(1, { message: 'Unidade é obrigatória' }),
    type: z.string().min(1, { message: 'Tipo é obrigatório' }),
    is_default: z.boolean().default(false),
  })).min(1, { message: 'Adicione pelo menos uma medida' }),
  nutritional_values: z.object({
    calories: z.number().min(0, { message: 'Calorias não pode ser negativo' }),
    protein: z.number().min(0, { message: 'Proteína não pode ser negativo' }),
    fat: z.number().min(0, { message: 'Gordura não pode ser negativo' }),
    carbs: z.number().min(0, { message: 'Carboidrato não pode ser negativo' }),
    fiber: z.number().optional(),
    sugar: z.number().optional(),
    sodium: z.number().optional(),
    potassium: z.number().optional(),
    calcium: z.number().optional(),
    iron: z.number().optional(),
  }),
  restrictions: z.array(z.string()).default([]),
});

type FoodFormValues = z.infer<typeof foodFormSchema>;

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface RestrictionType {
  id: string;
  name: string;
}

const FoodForm: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [restrictionTypes, setRestrictionTypes] = useState<RestrictionType[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FoodFormValues>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: {
      name: '',
      brand: '',
      category_id: '',
      subcategory_id: '',
      description: '',
      caloric_density: '',
      glycemic_index: '',
      source: '',
      measures: [
        {
          name: '1 unidade',
          quantity: 100,
          unit: 'g',
          type: 'household',
          is_default: true,
        }
      ],
      nutritional_values: {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      },
      restrictions: [],
    },
  });

  // Watch for category changes to filter subcategories
  const selectedCategoryId = form.watch('category_id');

  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('food_categories')
        .select('id, name')
        .order('name');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as categorias de alimentos',
          variant: 'destructive',
        });
        return;
      }

      setCategories(categoriesData || []);

      // Fetch subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('food_subcategories')
        .select('id, name, category_id')
        .order('name');

      if (subcategoriesError) {
        console.error('Error fetching subcategories:', subcategoriesError);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as subcategorias de alimentos',
          variant: 'destructive',
        });
        return;
      }

      setSubcategories(subcategoriesData || []);

      // Fetch restriction types
      const { data: restrictionTypesData, error: restrictionTypesError } = await supabase
        .from('restriction_types')
        .select('id, name')
        .order('name');

      if (restrictionTypesError) {
        console.error('Error fetching restriction types:', restrictionTypesError);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os tipos de restrições alimentares',
          variant: 'destructive',
        });
        return;
      }

      setRestrictionTypes(restrictionTypesData || []);
    };

    fetchData();
  }, []);

  // Filter subcategories when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      const filtered = subcategories.filter(sub => sub.category_id === selectedCategoryId);
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [selectedCategoryId, subcategories]);

  // Handle adding new measure
  const addMeasure = () => {
    const currentMeasures = form.getValues('measures');
    form.setValue('measures', [
      ...currentMeasures,
      {
        name: '',
        quantity: 0,
        unit: 'g',
        type: 'household',
        is_default: false,
      }
    ]);
  };

  // Handle removing a measure
  const removeMeasure = (index: number) => {
    const currentMeasures = form.getValues('measures');
    const newMeasures = [...currentMeasures];
    newMeasures.splice(index, 1);
    form.setValue('measures', newMeasures);
  };

  // Handle default measure selection
  const handleDefaultMeasure = (index: number, isDefault: boolean) => {
    const currentMeasures = form.getValues('measures');
    
    // If setting as default, unset all others
    if (isDefault) {
      const updatedMeasures = currentMeasures.map((measure, i) => ({
        ...measure,
        is_default: i === index
      }));
      form.setValue('measures', updatedMeasures);
    } else {
      // If unsetting, check if it's the only measure, and don't allow unsetting if it is
      if (currentMeasures.filter(m => m.is_default).length === 1) {
        toast({
          title: 'Atenção',
          description: 'Pelo menos uma medida deve ser definida como padrão.',
        });
        return;
      }
      
      const updatedMeasures = [...currentMeasures];
      updatedMeasures[index].is_default = false;
      form.setValue('measures', updatedMeasures);
    }
  };

  const onSubmit = async (data: FoodFormValues) => {
    setIsSubmitting(true);
    
    try {
      // 1. Insert food
      const { data: foodData, error: foodError } = await supabase
        .from('foods')
        .insert({
          name: data.name,
          brand: data.brand || null,
          category_id: data.category_id,
          subcategory_id: data.subcategory_id,
          description: data.description || null,
          caloric_density: data.caloric_density || null,
          glycemic_index: data.glycemic_index || null,
          source: data.source || null
        })
        .select('id')
        .single();

      if (foodError) throw foodError;

      const foodId = foodData.id;
      
      // 2. Insert measures
      for (const measure of data.measures) {
        const { error: measureError } = await supabase
          .from('food_measures')
          .insert({
            food_id: foodId,
            name: measure.name,
            quantity: measure.quantity,
            unit: measure.unit,
            type: measure.type,
            is_default: measure.is_default
          });

        if (measureError) throw measureError;
      }
      
      // 3. Get the default measure to link nutritional values
      const { data: defaultMeasure, error: defaultMeasureError } = await supabase
        .from('food_measures')
        .select('id')
        .eq('food_id', foodId)
        .eq('is_default', true)
        .single();

      if (defaultMeasureError) throw defaultMeasureError;
      
      // 4. Insert nutritional values
      const { error: nutritionError } = await supabase
        .from('nutritional_values')
        .insert({
          food_id: foodId,
          measure_id: defaultMeasure.id,
          calories: data.nutritional_values.calories,
          protein: data.nutritional_values.protein,
          fat: data.nutritional_values.fat,
          carbs: data.nutritional_values.carbs,
          fiber: data.nutritional_values.fiber || null,
          sugar: data.nutritional_values.sugar || null,
          sodium: data.nutritional_values.sodium || null,
          potassium: data.nutritional_values.potassium || null,
          calcium: data.nutritional_values.calcium || null,
          iron: data.nutritional_values.iron || null
        });

      if (nutritionError) throw nutritionError;
      
      // 5. Insert restrictions
      if (data.restrictions.length > 0) {
        const restrictions = data.restrictions.map(restrictionId => ({
          food_id: foodId,
          restriction_id: restrictionId
        }));
        
        const { error: restrictionsError } = await supabase
          .from('food_restrictions')
          .insert(restrictions);

        if (restrictionsError) throw restrictionsError;
      }

      toast({
        title: 'Sucesso',
        description: 'Alimento adicionado com sucesso à base de dados.',
      });
      
      // Reset form
      form.reset();
      
    } catch (error) {
      console.error('Error saving food:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o alimento. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Novo Alimento</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Alimento*</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Arroz branco cozido" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Marca do produto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subcategory_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategoria*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!selectedCategoryId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedCategoryId ? "Selecione uma subcategoria" : "Selecione uma categoria primeiro"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredSubcategories.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição do alimento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="caloric_density"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Densidade Calórica (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Baixa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="glycemic_index"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Índice Glicêmico (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Alto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fonte (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: TACO" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Medidas*</h3>
                
                {form.watch('measures').map((measure, index) => (
                  <div key={index} className="bg-muted/30 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Medida {index + 1}</h4>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={measure.is_default}
                            onCheckedChange={(checked) => handleDefaultMeasure(index, checked)}
                          />
                          <Label>Padrão</Label>
                        </div>
                        {form.watch('measures').length > 1 && (
                          <Button 
                            variant="outline" 
                            size="icon"
                            type="button"
                            onClick={() => removeMeasure(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={`measures.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome*</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 1 colher de sopa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`measures.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade*</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="Ex: 15" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`measures.${index}.unit`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidade*</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="g">Gramas (g)</SelectItem>
                                <SelectItem value="ml">Mililitros (ml)</SelectItem>
                                <SelectItem value="unid">Unidade (unid)</SelectItem>
                                <SelectItem value="oz">Onça (oz)</SelectItem>
                                <SelectItem value="xic">Xícara (xic)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`measures.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo*</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="household">Caseira</SelectItem>
                                <SelectItem value="metric">Métrica</SelectItem>
                                <SelectItem value="imperial">Imperial</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addMeasure} 
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar medida
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Valores Nutricionais*</h3>
                <FormDescription className="mb-4">
                  Informe os valores nutricionais para a medida padrão selecionada
                </FormDescription>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name="nutritional_values.calories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calorias (kcal)*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nutritional_values.protein"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proteínas (g)*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nutritional_values.carbs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carboidratos (g)*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nutritional_values.fat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gorduras (g)*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <h4 className="font-medium mb-3">Dados Adicionais (Opcional)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="nutritional_values.fiber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fibras (g)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                field.onChange(value);
                              }} 
                              value={field.value === undefined ? '' : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nutritional_values.sugar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Açúcares (g)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                field.onChange(value);
                              }} 
                              value={field.value === undefined ? '' : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nutritional_values.sodium"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sódio (mg)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                field.onChange(value);
                              }} 
                              value={field.value === undefined ? '' : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nutritional_values.potassium"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Potássio (mg)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                field.onChange(value);
                              }} 
                              value={field.value === undefined ? '' : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nutritional_values.calcium"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cálcio (mg)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                field.onChange(value);
                              }} 
                              value={field.value === undefined ? '' : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nutritional_values.iron"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ferro (mg)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                field.onChange(value);
                              }} 
                              value={field.value === undefined ? '' : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Restrições Alimentares (Opcional)</h3>
                <FormField
                  control={form.control}
                  name="restrictions"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {restrictionTypes.map((restriction) => (
                          <div key={restriction.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`restriction-${restriction.id}`}
                              value={restriction.id}
                              checked={field.value?.includes(restriction.id)}
                              onChange={(e) => {
                                const value = e.target.value;
                                const currentValues = field.value || [];
                                const newValues = e.target.checked
                                  ? [...currentValues, value]
                                  : currentValues.filter((val) => val !== value);
                                field.onChange(newValues);
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor={`restriction-${restriction.id}`}>
                              {restriction.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Salvando...' : 'Salvar Alimento'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FoodForm;
