import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MealGenerationRequest {
  mealType: string;
  targetKcal: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  objective: string;
  restrictions: string[];
  patientGender?: string;
  patientId?: string;
  existingFoods?: string[];
}

interface PatientHistory {
  frequentFoods: string[];
  avoidedCategories: string[];
  lastMealPlanFoods: string[];
}

// Brazilian meal cultural context - expanded
const mealContext: Record<string, { typical: string[]; avoid: string[]; priorityCategories: string[] }> = {
  cafe_manha: {
    typical: ['Pães', 'Frutas', 'Leite e derivados', 'Ovos', 'Cereais', 'Café', 'Sucos', 'Tapioca', 'Queijos'],
    avoid: ['Peixes', 'Carnes vermelhas', 'Feijão', 'Arroz', 'Legumes cozidos', 'Sopas'],
    priorityCategories: ['Pães e Padaria', 'Frutas', 'Laticínios', 'Ovos', 'Cereais e Grãos', 'Bebidas']
  },
  lanche_manha: {
    typical: ['Frutas', 'Iogurte', 'Castanhas', 'Biscoitos integrais', 'Sucos', 'Barras de cereais'],
    avoid: ['Carnes', 'Arroz', 'Feijão', 'Massas', 'Frituras'],
    priorityCategories: ['Frutas', 'Laticínios', 'Castanhas e Sementes', 'Bebidas']
  },
  almoco: {
    typical: ['Arroz', 'Feijão', 'Carnes', 'Frango', 'Peixe', 'Saladas', 'Legumes', 'Verduras', 'Massas'],
    avoid: ['Pães', 'Cereais matinais', 'Leite', 'Frutas doces'],
    priorityCategories: ['Cereais e Grãos', 'Leguminosas', 'Carnes Bovinas', 'Aves', 'Peixes e Frutos do Mar', 'Verduras e Legumes']
  },
  lanche_tarde: {
    typical: ['Frutas', 'Iogurte', 'Sanduíches leves', 'Castanhas', 'Chás', 'Pães integrais'],
    avoid: ['Carnes pesadas', 'Feijão', 'Arroz', 'Frituras'],
    priorityCategories: ['Frutas', 'Laticínios', 'Pães e Padaria', 'Castanhas e Sementes']
  },
  jantar: {
    typical: ['Sopas', 'Saladas', 'Carnes magras', 'Legumes', 'Omeletes', 'Peixes', 'Grelhados'],
    avoid: ['Café', 'Alimentos muito pesados', 'Frituras', 'Doces'],
    priorityCategories: ['Verduras e Legumes', 'Aves', 'Peixes e Frutos do Mar', 'Ovos', 'Carnes Bovinas']
  },
  ceia: {
    typical: ['Leite', 'Chás', 'Frutas leves', 'Iogurte', 'Castanhas'],
    avoid: ['Carnes', 'Alimentos pesados', 'Café', 'Frituras'],
    priorityCategories: ['Laticínios', 'Frutas', 'Castanhas e Sementes', 'Bebidas']
  }
};

const mealTypeLabels: Record<string, string> = {
  cafe_manha: 'Café da Manhã',
  lanche_manha: 'Lanche da Manhã',
  almoco: 'Almoço',
  lanche_tarde: 'Lanche da Tarde',
  jantar: 'Jantar',
  ceia: 'Ceia'
};

// Nutritional validation thresholds
const VALIDATION_THRESHOLDS = {
  calorieTolerance: 0.15, // 15% tolerance
  macroTolerance: 0.20,   // 20% tolerance for macros
  minProteinPerKg: 0.8,   // Minimum protein per kg body weight
  maxFatPercentage: 0.35, // Max 35% of calories from fat
  minFiberPerMeal: 2,     // Minimum fiber per meal in grams
};

// Fetch patient history for personalization
async function getPatientHistory(supabase: any, patientId: string): Promise<PatientHistory> {
  const history: PatientHistory = {
    frequentFoods: [],
    avoidedCategories: [],
    lastMealPlanFoods: []
  };

  try {
    // Get frequently used foods from meal plan history
    const { data: recentPlans } = await supabase
      .from('meal_plans')
      .select('meals')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentPlans && recentPlans.length > 0) {
      const foodCounts: Record<string, number> = {};
      
      recentPlans.forEach((plan: any) => {
        if (plan.meals && Array.isArray(plan.meals)) {
          plan.meals.forEach((meal: any) => {
            if (meal.items && Array.isArray(meal.items)) {
              meal.items.forEach((item: any) => {
                const foodName = item.nome?.toLowerCase() || item.food_name?.toLowerCase();
                if (foodName) {
                  foodCounts[foodName] = (foodCounts[foodName] || 0) + 1;
                }
              });
            }
          });
        }
      });

      // Get top 10 most frequent foods
      history.frequentFoods = Object.entries(foodCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name]) => name);

      // Get foods from the most recent plan to avoid immediate repetition
      const lastPlan = recentPlans[0];
      if (lastPlan?.meals && Array.isArray(lastPlan.meals)) {
        lastPlan.meals.forEach((meal: any) => {
          if (meal.items && Array.isArray(meal.items)) {
            meal.items.forEach((item: any) => {
              const foodName = item.nome?.toLowerCase() || item.food_name?.toLowerCase();
              if (foodName) history.lastMealPlanFoods.push(foodName);
            });
          }
        });
      }
    }

    // Get patient restrictions/preferences
    const { data: patient } = await supabase
      .from('patients')
      .select('goals')
      .eq('id', patientId)
      .single();

    if (patient?.goals) {
      const goals = typeof patient.goals === 'string' ? JSON.parse(patient.goals) : patient.goals;
      if (goals.restrictions && Array.isArray(goals.restrictions)) {
        history.avoidedCategories = goals.restrictions;
      }
    }

  } catch (error) {
    console.warn('Error fetching patient history:', error);
  }

  return history;
}

// Validate nutritional output
function validateNutritionalOutput(
  foods: any[],
  targetKcal: number,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number
): { isValid: boolean; warnings: string[]; adjustments: string[] } {
  const warnings: string[] = [];
  const adjustments: string[] = [];

  const actualTotals = foods.reduce((acc, food) => ({
    kcal: acc.kcal + (food.kcal_calculado || 0),
    protein: acc.protein + (food.ptn_g_calculado || 0),
    carbs: acc.carbs + (food.cho_g_calculado || 0),
    fat: acc.fat + (food.lip_g_calculado || 0),
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });

  // Check calorie deviation
  const calorieDeviation = Math.abs(actualTotals.kcal - targetKcal) / targetKcal;
  if (calorieDeviation > VALIDATION_THRESHOLDS.calorieTolerance) {
    warnings.push(`Calorias fora da meta: ${Math.round(actualTotals.kcal)} kcal (meta: ${targetKcal} kcal)`);
    if (actualTotals.kcal < targetKcal) {
      adjustments.push('Considere adicionar uma porção extra de carboidrato ou proteína');
    } else {
      adjustments.push('Considere reduzir as porções ou substituir por opções menos calóricas');
    }
  }

  // Check protein deviation
  const proteinDeviation = Math.abs(actualTotals.protein - targetProtein) / targetProtein;
  if (proteinDeviation > VALIDATION_THRESHOLDS.macroTolerance) {
    warnings.push(`Proteína fora da meta: ${Math.round(actualTotals.protein)}g (meta: ${targetProtein}g)`);
  }

  // Check carbs deviation
  const carbsDeviation = Math.abs(actualTotals.carbs - targetCarbs) / targetCarbs;
  if (carbsDeviation > VALIDATION_THRESHOLDS.macroTolerance) {
    warnings.push(`Carboidratos fora da meta: ${Math.round(actualTotals.carbs)}g (meta: ${targetCarbs}g)`);
  }

  // Check fat percentage
  const fatCalories = actualTotals.fat * 9;
  const fatPercentage = fatCalories / actualTotals.kcal;
  if (fatPercentage > VALIDATION_THRESHOLDS.maxFatPercentage) {
    warnings.push(`Alto teor de gordura: ${Math.round(fatPercentage * 100)}% das calorias`);
    adjustments.push('Considere substituir alimentos gordurosos por opções mais magras');
  }

  // Check food variety
  if (foods.length < 2) {
    warnings.push('Baixa variedade de alimentos');
    adjustments.push('Adicione mais alimentos para uma refeição balanceada');
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    adjustments
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestData: MealGenerationRequest = await req.json();
    const {
      mealType,
      targetKcal,
      targetProtein,
      targetCarbs,
      targetFat,
      objective,
      restrictions = [],
      patientGender,
      patientId,
      existingFoods = []
    } = requestData;

    console.log(`Generating AI meal plan for ${mealType}:`, { 
      targetKcal, targetProtein, targetCarbs, targetFat, objective, patientId 
    });

    // Get patient history for personalization
    let patientHistory: PatientHistory = { frequentFoods: [], avoidedCategories: [], lastMealPlanFoods: [] };
    if (patientId) {
      patientHistory = await getPatientHistory(supabase, patientId);
      console.log('Patient history:', patientHistory);
    }

    // Combine restrictions
    const allRestrictions = [...new Set([...restrictions, ...patientHistory.avoidedCategories])];

    const context = mealContext[mealType] || mealContext.almoco;
    const mealLabel = mealTypeLabels[mealType] || 'Refeição';

    // IMPROVED: Fetch 150 foods with smart prioritization
    // First, get foods matching the meal type's priority categories
    const priorityCategories = context.priorityCategories;
    
    const { data: priorityFoods, error: priorityError } = await supabase
      .from('alimentos_v2')
      .select('id, nome, categoria, subcategoria, medida_padrao_referencia, peso_referencia_g, kcal_por_referencia, ptn_g_por_referencia, cho_g_por_referencia, lip_g_por_referencia, fibra_g_por_referencia, tipo_refeicao_sugerida, popularidade, keywords')
      .eq('ativo', true)
      .in('categoria', priorityCategories)
      .order('popularidade', { ascending: false, nullsFirst: false })
      .limit(100);

    // Then get additional foods from other categories
    const { data: additionalFoods, error: additionalError } = await supabase
      .from('alimentos_v2')
      .select('id, nome, categoria, subcategoria, medida_padrao_referencia, peso_referencia_g, kcal_por_referencia, ptn_g_por_referencia, cho_g_por_referencia, lip_g_por_referencia, fibra_g_por_referencia, tipo_refeicao_sugerida, popularidade, keywords')
      .eq('ativo', true)
      .not('categoria', 'in', `(${priorityCategories.map(c => `"${c}"`).join(',')})`)
      .order('popularidade', { ascending: false, nullsFirst: false })
      .limit(80);

    if (priorityError || additionalError) {
      console.error('Error fetching foods:', priorityError || additionalError);
      throw new Error('Failed to fetch available foods');
    }

    // Combine and deduplicate foods
    const allFoods = [...(priorityFoods || []), ...(additionalFoods || [])];
    const seenIds = new Set<string>();
    const uniqueFoods = allFoods.filter(f => {
      if (seenIds.has(f.id)) return false;
      seenIds.add(f.id);
      return true;
    });

    // Filter out existing foods and foods from last meal plan
    const excludedFoods = new Set([
      ...existingFoods.map(f => f.toLowerCase()),
      ...patientHistory.lastMealPlanFoods
    ]);

    const availableFoods = uniqueFoods.filter((f: any) => 
      !excludedFoods.has(f.nome.toLowerCase())
    );

    // Prepare foods list for AI - increased to 150
    const foodsList = availableFoods
      .slice(0, 150)
      .map((f: any) => ({
        id: f.id,
        nome: f.nome,
        categoria: f.categoria,
        subcategoria: f.subcategoria,
        medida: f.medida_padrao_referencia,
        peso_g: f.peso_referencia_g,
        kcal: f.kcal_por_referencia,
        ptn: f.ptn_g_por_referencia,
        cho: f.cho_g_por_referencia,
        lip: f.lip_g_por_referencia,
        fibra: f.fibra_g_por_referencia || 0
      }));

    console.log(`Prepared ${foodsList.length} foods for AI selection`);

    // Build enhanced system prompt
    const systemPrompt = `Você é um nutricionista brasileiro experiente. Sua tarefa é selecionar alimentos para uma refeição equilibrada e personalizada.

REGRAS CRÍTICAS:
1. Selecione alimentos APENAS da lista fornecida - use os IDs exatos
2. Respeite as metas calóricas e de macronutrientes (±15% de tolerância)
3. Considere o contexto cultural brasileiro para ${mealLabel}
4. Priorize variedade e equilíbrio nutricional
5. Considere a praticidade e combinações típicas brasileiras

CONTEXTO DA REFEIÇÃO - ${mealLabel.toUpperCase()}:
- Alimentos típicos: ${context.typical.join(', ')}
- Evitar: ${context.avoid.join(', ')}
- Categorias prioritárias: ${context.priorityCategories.join(', ')}

OBJETIVO DO PACIENTE: ${objective === 'emagrecimento' ? 'PERDER PESO - priorize proteínas magras e fibras, evite carboidratos simples' : objective === 'hipertrofia' ? 'GANHAR MASSA MUSCULAR - priorize proteínas de alto valor biológico e carboidratos complexos' : 'MANTER PESO - balance todos os macronutrientes'}

${patientGender ? `GÊNERO: ${patientGender === 'M' ? 'Masculino' : 'Feminino'}` : ''}

${allRestrictions.length > 0 ? `RESTRIÇÕES ALIMENTARES (OBRIGATÓRIO RESPEITAR): ${allRestrictions.join(', ')}` : ''}

${patientHistory.frequentFoods.length > 0 ? `ALIMENTOS PREFERIDOS DO PACIENTE (considere incluir alguns): ${patientHistory.frequentFoods.join(', ')}` : ''}

METAS NUTRICIONAIS PARA ESTA REFEIÇÃO:
- Calorias: ${targetKcal} kcal (±15%)
- Proteína: ${targetProtein}g (±20%)
- Carboidratos: ${targetCarbs}g (±20%)
- Gordura: ${targetFat}g (±20%)

INSTRUÇÕES DE SELEÇÃO:
1. Selecione entre 2-6 alimentos que combinados atinjam as metas
2. Use quantidades em porções (0.5, 1, 1.5, 2, etc.)
3. Faça o cálculo: nutriente_total = nutriente_por_referencia × quantidade
4. Verifique que a soma dos nutrientes atinge as metas
5. Priorize combinações típicas e práticas`;

    const userPrompt = `Lista de ${foodsList.length} alimentos disponíveis (ordenados por prioridade para ${mealLabel}):

${JSON.stringify(foodsList, null, 2)}

Com base nas metas e contexto, selecione os melhores alimentos para ${mealLabel}.
Calcule os totais com precisão usando: valor = valor_por_referencia × quantidade`;

    // Call Lovable AI with enhanced tool calling
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "select_meal_foods",
              description: "Seleciona alimentos para a refeição com quantidades calculadas para atingir as metas nutricionais",
              parameters: {
                type: "object",
                properties: {
                  foods: {
                    type: "array",
                    description: "Lista de alimentos selecionados com quantidades",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", description: "ID UUID do alimento da lista" },
                        nome: { type: "string", description: "Nome do alimento" },
                        quantidade: { type: "number", description: "Quantidade em porções (ex: 1.5)" },
                        justificativa: { type: "string", description: "Breve justificativa da escolha" }
                      },
                      required: ["id", "nome", "quantidade"],
                      additionalProperties: false
                    }
                  },
                  totals_calculados: {
                    type: "object",
                    description: "Totais nutricionais calculados (soma de todos os alimentos)",
                    properties: {
                      kcal: { type: "number", description: "Total de calorias" },
                      proteina_g: { type: "number", description: "Total de proteína em gramas" },
                      carboidrato_g: { type: "number", description: "Total de carboidratos em gramas" },
                      gordura_g: { type: "number", description: "Total de gordura em gramas" },
                      fibra_g: { type: "number", description: "Total de fibra em gramas" }
                    },
                    required: ["kcal", "proteina_g", "carboidrato_g", "gordura_g"],
                    additionalProperties: false
                  },
                  reasoning: { 
                    type: "string", 
                    description: "Explicação detalhada das escolhas e como atendem às metas do paciente" 
                  },
                  cultural_notes: {
                    type: "string",
                    description: "Observações sobre a adequação cultural brasileira da combinação"
                  }
                },
                required: ["foods", "totals_calculados", "reasoning"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "select_meal_foods" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Limite de requisições excedido. Tente novamente em alguns segundos.",
          code: "RATE_LIMIT"
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Créditos de IA esgotados. Contate o suporte.",
          code: "CREDITS_EXHAUSTED"
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI request failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI Response received');

    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'select_meal_foods') {
      console.error('Invalid AI response:', JSON.stringify(aiResponse, null, 2));
      throw new Error('Resposta da IA em formato inválido');
    }

    let selectedFoods;
    try {
      selectedFoods = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error('Failed to parse AI response:', toolCall.function.arguments);
      throw new Error('Erro ao processar resposta da IA');
    }
    
    // Create a map for quick food lookup
    const foodMap = new Map(availableFoods.map((f: any) => [f.id, f]));
    
    // Validate and enrich selected foods with full data
    const enrichedFoods = selectedFoods.foods.map((selected: any) => {
      const foodData = foodMap.get(selected.id);
      if (!foodData) {
        console.warn(`Food not found: ${selected.id} - ${selected.nome}`);
        // Try to find by name as fallback
        const byName = availableFoods.find((f: any) => 
          f.nome.toLowerCase() === selected.nome.toLowerCase()
        );
        if (!byName) return null;
        console.log(`Found food by name: ${byName.nome}`);
        return enrichFood(byName, selected.quantidade || 1);
      }
      
      return enrichFood(foodData, selected.quantidade || 1);
    }).filter(Boolean);

    function enrichFood(foodData: any, quantity: number) {
      return {
        id: crypto.randomUUID(),
        alimento_id: foodData.id,
        nome: foodData.nome,
        categoria: foodData.categoria,
        quantidade: quantity,
        medida_utilizada: foodData.medida_padrao_referencia,
        peso_total_g: Math.round(foodData.peso_referencia_g * quantity),
        kcal_calculado: Math.round(foodData.kcal_por_referencia * quantity * 10) / 10,
        ptn_g_calculado: Math.round(foodData.ptn_g_por_referencia * quantity * 10) / 10,
        cho_g_calculado: Math.round(foodData.cho_g_por_referencia * quantity * 10) / 10,
        lip_g_calculado: Math.round(foodData.lip_g_por_referencia * quantity * 10) / 10,
        fibra_g_calculado: Math.round((foodData.fibra_g_por_referencia || 0) * quantity * 10) / 10,
      };
    }

    // Calculate actual totals (server-side validation)
    const actualTotals = enrichedFoods.reduce((acc: any, food: any) => ({
      kcal: acc.kcal + food.kcal_calculado,
      protein: acc.protein + food.ptn_g_calculado,
      carbs: acc.carbs + food.cho_g_calculado,
      fat: acc.fat + food.lip_g_calculado,
      fiber: acc.fiber + food.fibra_g_calculado,
    }), { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    // Perform nutritional validation
    const validation = validateNutritionalOutput(
      enrichedFoods,
      targetKcal,
      targetProtein,
      targetCarbs,
      targetFat
    );

    console.log('Generated meal validation:', validation);

    return new Response(JSON.stringify({
      success: true,
      mealType,
      foods: enrichedFoods,
      totals: actualTotals,
      aiTotals: selectedFoods.totals_calculados,
      reasoning: selectedFoods.reasoning,
      culturalNotes: selectedFoods.cultural_notes,
      validation: {
        isValid: validation.isValid,
        warnings: validation.warnings,
        adjustments: validation.adjustments
      },
      metadata: {
        foodsConsidered: foodsList.length,
        patientHistoryUsed: !!patientId && patientHistory.frequentFoods.length > 0,
        restrictionsApplied: allRestrictions
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in generate-meal-plan-ai:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido na geração',
      code: "INTERNAL_ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
