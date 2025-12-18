import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MealGenerationRequest {
  mealType: string; // 'cafe_manha' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar' | 'ceia'
  targetKcal: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  objective: string; // 'emagrecimento' | 'hipertrofia' | 'manutencao'
  restrictions: string[];
  patientGender?: string;
  existingFoods?: string[]; // Foods already in other meals to avoid repetition
}

// Brazilian meal cultural context
const mealContext: Record<string, { typical: string[]; avoid: string[] }> = {
  cafe_manha: {
    typical: ['Pães', 'Frutas', 'Leite e derivados', 'Ovos', 'Cereais', 'Café', 'Sucos'],
    avoid: ['Peixes', 'Carnes vermelhas', 'Feijão', 'Arroz', 'Legumes cozidos']
  },
  lanche_manha: {
    typical: ['Frutas', 'Iogurte', 'Castanhas', 'Biscoitos integrais', 'Sucos'],
    avoid: ['Carnes', 'Arroz', 'Feijão', 'Massas']
  },
  almoco: {
    typical: ['Arroz', 'Feijão', 'Carnes', 'Frango', 'Peixe', 'Saladas', 'Legumes', 'Verduras'],
    avoid: ['Pães', 'Cereais matinais', 'Leite']
  },
  lanche_tarde: {
    typical: ['Frutas', 'Iogurte', 'Sanduíches leves', 'Castanhas', 'Chás'],
    avoid: ['Carnes pesadas', 'Feijão', 'Arroz']
  },
  jantar: {
    typical: ['Sopas', 'Saladas', 'Carnes magras', 'Legumes', 'Omeletes'],
    avoid: ['Café', 'Alimentos muito pesados']
  },
  ceia: {
    typical: ['Leite', 'Chás', 'Frutas leves', 'Iogurte'],
    avoid: ['Carnes', 'Alimentos pesados', 'Café']
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
      existingFoods = []
    } = requestData;

    console.log(`Generating AI meal plan for ${mealType}:`, { targetKcal, targetProtein, targetCarbs, targetFat, objective });

    // Fetch available foods from database (prioritizing by meal type and popularity)
    const { data: availableFoods, error: foodsError } = await supabase
      .from('alimentos_v2')
      .select('id, nome, categoria, medida_padrao_referencia, peso_referencia_g, kcal_por_referencia, ptn_g_por_referencia, cho_g_por_referencia, lip_g_por_referencia, tipo_refeicao_sugerida, popularidade')
      .eq('ativo', true)
      .order('popularidade', { ascending: false, nullsFirst: false })
      .limit(200);

    if (foodsError) {
      console.error('Error fetching foods:', foodsError);
      throw new Error('Failed to fetch available foods');
    }

    // Filter foods appropriate for the meal type
    const context = mealContext[mealType] || mealContext.almoco;
    const mealLabel = mealTypeLabels[mealType] || 'Refeição';

    // Prepare foods list for AI (simplified)
    const foodsList = availableFoods
      .filter((f: any) => !existingFoods.includes(f.nome.toLowerCase()))
      .slice(0, 80) // Limit for context size
      .map((f: any) => ({
        id: f.id,
        nome: f.nome,
        categoria: f.categoria,
        medida: f.medida_padrao_referencia,
        peso_g: f.peso_referencia_g,
        kcal: f.kcal_por_referencia,
        ptn: f.ptn_g_por_referencia,
        cho: f.cho_g_por_referencia,
        lip: f.lip_g_por_referencia
      }));

    const systemPrompt = `Você é um nutricionista brasileiro experiente. Sua tarefa é selecionar alimentos para uma refeição equilibrada.

REGRAS IMPORTANTES:
1. Selecione alimentos APENAS da lista fornecida - não invente alimentos
2. Respeite as metas calóricas e de macronutrientes (±10% de tolerância)
3. Considere o contexto cultural brasileiro para ${mealLabel}
4. Alimentos típicos para ${mealLabel}: ${context.typical.join(', ')}
5. Evite para ${mealLabel}: ${context.avoid.join(', ')}
6. Objetivo do paciente: ${objective === 'emagrecimento' ? 'perder peso' : objective === 'hipertrofia' ? 'ganhar massa muscular' : 'manter peso'}
${restrictions.length > 0 ? `7. Restrições alimentares: ${restrictions.join(', ')}` : ''}

METAS NUTRICIONAIS:
- Calorias: ${targetKcal} kcal
- Proteína: ${targetProtein}g
- Carboidratos: ${targetCarbs}g
- Gordura: ${targetFat}g

Selecione entre 2-5 alimentos que, combinados, atinjam as metas nutricionais.`;

    const userPrompt = `Lista de alimentos disponíveis:
${JSON.stringify(foodsList, null, 2)}

Selecione os melhores alimentos para ${mealLabel} que atinjam as metas nutricionais.`;

    // Call Lovable AI with tool calling for structured output
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
              description: "Seleciona alimentos para a refeição com quantidades apropriadas",
              parameters: {
                type: "object",
                properties: {
                  foods: {
                    type: "array",
                    description: "Lista de alimentos selecionados",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", description: "ID do alimento (UUID)" },
                        nome: { type: "string", description: "Nome do alimento" },
                        quantidade: { type: "number", description: "Quantidade em porções (ex: 1.5 para 1 porção e meia)" },
                        justificativa: { type: "string", description: "Por que este alimento foi escolhido" }
                      },
                      required: ["id", "nome", "quantidade"],
                      additionalProperties: false
                    }
                  },
                  totals: {
                    type: "object",
                    description: "Totais nutricionais calculados",
                    properties: {
                      kcal: { type: "number" },
                      protein: { type: "number" },
                      carbs: { type: "number" },
                      fat: { type: "number" }
                    },
                    required: ["kcal", "protein", "carbs", "fat"],
                    additionalProperties: false
                  },
                  reasoning: { type: "string", description: "Explicação das escolhas" }
                },
                required: ["foods", "totals", "reasoning"],
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
          error: "Rate limit exceeded. Please try again later.",
          code: "RATE_LIMIT"
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI credits exhausted. Please add credits to continue.",
          code: "CREDITS_EXHAUSTED"
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI request failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI Response:', JSON.stringify(aiResponse, null, 2));

    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'select_meal_foods') {
      throw new Error('Invalid AI response format');
    }

    const selectedFoods = JSON.parse(toolCall.function.arguments);
    
    // Validate and enrich selected foods with full data
    const enrichedFoods = selectedFoods.foods.map((selected: any) => {
      const foodData = availableFoods.find((f: any) => f.id === selected.id);
      if (!foodData) {
        console.warn(`Food not found: ${selected.id} - ${selected.nome}`);
        return null;
      }
      
      const quantity = selected.quantidade || 1;
      return {
        id: crypto.randomUUID(),
        alimento_id: foodData.id,
        nome: foodData.nome,
        quantidade: quantity,
        medida_utilizada: foodData.medida_padrao_referencia,
        peso_total_g: Math.round(foodData.peso_referencia_g * quantity),
        kcal_calculado: Math.round(foodData.kcal_por_referencia * quantity * 10) / 10,
        ptn_g_calculado: Math.round(foodData.ptn_g_por_referencia * quantity * 10) / 10,
        cho_g_calculado: Math.round(foodData.cho_g_por_referencia * quantity * 10) / 10,
        lip_g_calculado: Math.round(foodData.lip_g_por_referencia * quantity * 10) / 10,
      };
    }).filter(Boolean);

    // Calculate actual totals
    const actualTotals = enrichedFoods.reduce((acc: any, food: any) => ({
      kcal: acc.kcal + food.kcal_calculado,
      protein: acc.protein + food.ptn_g_calculado,
      carbs: acc.carbs + food.cho_g_calculado,
      fat: acc.fat + food.lip_g_calculado,
    }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });

    return new Response(JSON.stringify({
      success: true,
      mealType,
      foods: enrichedFoods,
      totals: actualTotals,
      aiTotals: selectedFoods.totals,
      reasoning: selectedFoods.reasoning
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in generate-meal-plan-ai:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      code: "INTERNAL_ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
