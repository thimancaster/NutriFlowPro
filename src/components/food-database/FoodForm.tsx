
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

// Define form schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres' }),
  brand: z.string().optional(),
  category_id: z.string({ required_error: 'Selecione uma categoria' }),
  subcategory_id: z.string().optional(),
  description: z.string().optional(),
  caloric_density: z.string().optional(),
  glycemic_index: z.string().optional(),
  source: z.string().optional(),
  portion_size: z.coerce.number().positive({ message: 'Insira um valor positivo' }),
  portion_unit: z.string({ required_error: 'Selecione uma unidade' }),
  calories: z.coerce.number().min(0, { message: 'Insira um valor não negativo' }),
  protein: z.coerce.number().min(0, { message: 'Insira um valor não negativo' }),
  carbs: z.coerce.number().min(0, { message: 'Insira um valor não negativo' }),
  fats: z.coerce.number().min(0, { message: 'Insira um valor não negativo' }),
  fiber: z.coerce.number().min(0, { message: 'Insira um valor não negativo' }).optional(),
  sugar: z.coerce.number().min(0, { message: 'Insira um valor não negativo' }).optional(),
  sodium: z.coerce.number().min(0, { message: 'Insira um valor não negativo' }).optional(),
  potassium: z.coerce.number().min(0, { message: 'Insira um valor não negativo' }).optional(),
  calcium: z.coerce.number().min(0, { message: 'Insira um valor não negativo' }).optional(),
  iron: z.coerce.number().min(0, { message: 'Insira um valor não negativo' }).optional()
});

type FormValues = z.infer<typeof formSchema>;

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
}

const FoodForm: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      brand: '',
      description: '',
      caloric_density: '',
      glycemic_index: '',
      source: '',
      portion_size: 100,
      portion_unit: 'g',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      potassium: 0,
      calcium: 0,
      iron: 0
    }
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.rpc('get_food_categories');

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as categorias de alimentos.',
          variant: 'destructive'
        });
      }
    };

    fetchCategories();
  }, [toast]);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory) {
        setSubcategories([]);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_food_subcategories', {
          category_id: selectedCategory
        });

        if (error) throw error;
        setSubcategories(data || []);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    };

    fetchSubcategories();
  }, [selectedCategory]);

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    form.setValue('category_id', value);
    form.setValue('subcategory_id', ''); // Reset subcategory
  };

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      // Insert food
      const { data: foodData, error: foodError } = await supabase
        .from('foods')
        .insert({
          name: values.name,
          brand: values.brand,
          category_id: values.category_id,
          subcategory_id: values.subcategory_id || null,
          description: values.description,
          caloric_density: values.caloric_density,
          glycemic_index: values.glycemic_index,
          source: values.source,
          calories: values.calories,
          protein: values.protein,
          carbs: values.carbs,
          fats: values.fats,
          portion_size: values.portion_size,
          portion_unit: values.portion_unit
        })
        .select();

      if (foodError) throw foodError;

      toast({
        title: 'Alimento adicionado',
        description: `${values.name} foi adicionado com sucesso à base de dados.`,
      });

      // Reset form
      form.reset();

    } catch (error) {
      console.error('Error saving food:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o alimento. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Units for portion size
  const units = [
    { value: 'g', label: 'gramas (g)' },
    { value: 'ml', label: 'mililitros (ml)' },
    { value: 'kg', label: 'quilogramas (kg)' },
    { value: 'l', label: 'litros (l)' },
    { value: 'unidade', label: 'unidade' },
    { value: 'colher_sopa', label: 'colher de sopa' },
    { value: 'colher_cha', label: 'colher de chá' },
    { value: 'fatia', label: 'fatia' },
    { value: 'copo', label: 'copo' },
    { value: 'porcao', label: 'porção' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Adicionar Novo Alimento</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrição</TabsTrigger>
                <TabsTrigger value="details">Detalhes Extras</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Alimento*</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Arroz Branco Cozido" {...field} />
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
                      <FormLabel>Marca</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Tio João" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria*</FormLabel>
                        <Select 
                          onValueChange={handleCategoryChange}
                          value={field.value}
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
                        <FormLabel>Subcategoria</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedCategory || subcategories.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma subcategoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subcategories.map((subcategory) => (
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="portion_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tamanho da Porção*</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Quantidade por porção padrão
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="portion_unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidade*</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma unidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
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
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva o alimento brevemente..." 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="nutrition" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calorias (kcal)*</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="protein"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proteínas (g)*</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="carbs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carboidratos (g)*</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gorduras (g)*</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fiber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fibras (g)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sugar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Açúcares (g)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sodium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sódio (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="potassium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Potássio (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="calcium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cálcio (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="iron"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ferro (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <FormField
                  control={form.control}
                  name="caloric_density"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Densidade Calórica</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Baixa, Média, Alta" {...field} />
                      </FormControl>
                      <FormDescription>
                        Classificação da densidade calórica
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="glycemic_index"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Índice Glicêmico</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Baixo, Médio, Alto" {...field} />
                      </FormControl>
                      <FormDescription>
                        Classificação do índice glicêmico
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fonte</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: TACO, USDA" {...field} />
                      </FormControl>
                      <FormDescription>
                        Fonte da informação nutricional
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-nutri-green hover:bg-nutri-green-dark"
                disabled={isLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar Alimento
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FoodForm;
