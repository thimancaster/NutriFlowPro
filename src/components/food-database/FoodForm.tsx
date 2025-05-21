
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Form schema
const formSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  category: z.string().optional(),
  calories: z.coerce.number().min(0, { message: "Valor não pode ser negativo" }),
  protein: z.coerce.number().min(0, { message: "Valor não pode ser negativo" }),
  carbs: z.coerce.number().min(0, { message: "Valor não pode ser negativo" }),
  fats: z.coerce.number().min(0, { message: "Valor não pode ser negativo" }),
  portion_size: z.coerce.number().min(0, { message: "Valor não pode ser negativo" }),
  portion_unit: z.string().min(1, { message: "Unidade é obrigatória" }),
});

type FormValues = z.infer<typeof formSchema>;

interface Category {
  id: string;
  name: string;
}

const FoodForm: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: undefined,
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      portion_size: 100,
      portion_unit: 'g',
    },
  });

  // Load categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Get distinct categories from foods table
        const { data, error } = await supabase
          .from('foods')
          .select('category_id, food_group')
          .not('category_id', 'is', null)
          .not('food_group', 'is', null);
        
        if (error) throw error;
        
        // Transform and deduplicate categories
        const uniqueCategories = Array.from(
          new Map(data.map(item => [item.category_id, {
            id: item.category_id,
            name: item.food_group
          }])).values()
        );
        
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      // Insert new food entry
      const { data: foodData, error: foodError } = await supabase
        .from('foods')
        .insert({
          name: data.name,
          food_group: data.category ? categories.find(c => c.id === data.category)?.name : null,
          category_id: data.category || null,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fats: data.fats,
          portion_size: data.portion_size,
          portion_unit: data.portion_unit
        })
        .select();

      if (foodError) throw foodError;

      toast({
        title: 'Sucesso',
        description: 'Alimento cadastrado com sucesso!',
      });

      // Reset form
      form.reset({
        name: '',
        category: undefined,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        portion_size: 100,
        portion_unit: 'g',
      });
    } catch (error) {
      console.error('Error saving food:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o alimento.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Alimento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Arroz Branco Cozido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
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
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calorias (kcal)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proteínas (g)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" {...field} />
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
                    <FormLabel>Carboidratos (g)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" {...field} />
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
                    <FormLabel>Gorduras (g)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" {...field} />
                    </FormControl>
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
                    <FormLabel>Tamanho da Porção</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="portion_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade de Medida</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="g">Gramas (g)</SelectItem>
                        <SelectItem value="ml">Mililitros (ml)</SelectItem>
                        <SelectItem value="unidade">Unidade</SelectItem>
                        <SelectItem value="colher de sopa">Colher de Sopa</SelectItem>
                        <SelectItem value="colher de chá">Colher de Chá</SelectItem>
                        <SelectItem value="xícara">Xícara</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alimento
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FoodForm;
