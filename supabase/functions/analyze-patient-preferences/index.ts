import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Buscar histórico de planos do paciente
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: mealPlans, error: plansError } = await supabase
      .from('meal_plans')
      .select(`
        id,
        date,
        total_calories,
        total_protein,
        total_carbs,
        total_fats,
        meals
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (plansError) {
      console.error('Erro ao buscar planos:', plansError);
      throw plansError;
    }

    // Se não há histórico suficiente
    if (!mealPlans || mealPlans.length === 0) {
      return new Response(JSON.stringify({
        preferences: {
          foodCategories: [],
          avoidedFoods: [],
          preferredMeals: [],
          averageMacros: null,
          insights: ["Paciente novo sem histórico. Iniciar com plano padrão."]
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Preparar dados para análise
    const historyData = mealPlans.map(plan => ({
      date: plan.date,
      calories: plan.total_calories,
      protein: plan.total_protein,
      carbs: plan.total_carbs,
      fats: plan.total_fats,
      meals: plan.meals
    }));

    // Chamar IA para análise
    const systemPrompt = `Você é um assistente de nutrição especializado em análise de preferências alimentares.
Analise o histórico de planos alimentares e identifique:
1. Categorias de alimentos mais consumidos
2. Alimentos evitados
3. Tipos de refeições preferidas
4. Padrões nutricionais (macros médios)
5. Insights sobre hábitos alimentares

Seja específico e prático nas recomendações.`;

    const userPrompt = `Analise o histórico de ${historyData.length} planos alimentares deste paciente:

${JSON.stringify(historyData, null, 2)}

Retorne um JSON com:
- foodCategories: array de categorias mais consumidas
- avoidedFoods: array de alimentos raramente usados
- preferredMeals: array de tipos de refeição preferidos
- averageMacros: {calories, protein, carbs, fats} médios
- insights: array de 3-5 insights práticos`;

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
        tools: [{
          type: "function",
          function: {
            name: "analyze_preferences",
            description: "Retorna análise estruturada das preferências alimentares",
            parameters: {
              type: "object",
              properties: {
                foodCategories: {
                  type: "array",
                  items: { type: "string" }
                },
                avoidedFoods: {
                  type: "array",
                  items: { type: "string" }
                },
                preferredMeals: {
                  type: "array",
                  items: { type: "string" }
                },
                averageMacros: {
                  type: "object",
                  properties: {
                    calories: { type: "number" },
                    protein: { type: "number" },
                    carbs: { type: "number" },
                    fats: { type: "number" }
                  }
                },
                insights: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["foodCategories", "insights"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "analyze_preferences" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente mais tarde." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes no Lovable AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      const errorText = await response.text();
      console.error("Erro da IA:", response.status, errorText);
      throw new Error("Erro ao analisar preferências");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices[0].message.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("IA não retornou análise estruturada");
    }

    const preferences = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ preferences }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erro desconhecido"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
