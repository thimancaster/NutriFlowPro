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
    const { userId, targets, patientPreferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Buscar histórico de planos bem-sucedidos
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: successfulPlans, error } = await supabase
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Erro ao buscar planos:', error);
      throw error;
    }

    const systemPrompt = `Você é um assistente de nutrição especializado em sugerir templates de planos alimentares.
Baseado no histórico de planos bem-sucedidos e nas preferências do paciente, sugira 3 templates de planos alimentares que:
1. Sejam adequados aos targets nutricionais
2. Reflitam preferências alimentares identificadas
3. Sejam práticos e variados
4. Sejam culturalmente apropriados

Cada template deve ter um nome descritivo e uma breve descrição.`;

    const userPrompt = `Sugira templates baseado em:

TARGETS:
- Calorias: ${targets.calories} kcal
- Proteína: ${targets.protein}g
- Carboidratos: ${targets.carbs}g
- Gordura: ${targets.fats}g

PREFERÊNCIAS:
${JSON.stringify(patientPreferences || {}, null, 2)}

HISTÓRICO (${successfulPlans?.length || 0} planos):
${JSON.stringify(successfulPlans || [], null, 2)}

Retorne 3 templates personalizados.`;

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
            name: "suggest_templates",
            description: "Retorna templates de planos alimentares personalizados",
            parameters: {
              type: "object",
              properties: {
                templates: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      suitability: { type: "string" },
                      estimatedCalories: { type: "number" },
                      highlightFeatures: {
                        type: "array",
                        items: { type: "string" }
                      }
                    },
                    required: ["name", "description", "suitability"]
                  }
                }
              },
              required: ["templates"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "suggest_templates" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      const errorText = await response.text();
      console.error("Erro da IA:", response.status, errorText);
      throw new Error("Erro ao sugerir templates");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices[0].message.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("IA não retornou templates estruturados");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
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
