import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mealPlan, targets, patientData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const systemPrompt = `Você é um nutricionista especializado em validação de planos alimentares.
Analise o plano alimentar considerando:
1. Adequação aos targets nutricionais
2. Distribuição balanceada entre refeições
3. Variedade de alimentos
4. Adequação cultural brasileira
5. Praticidade e exequibilidade

Seja crítico mas construtivo nas recomendações.`;

    const userPrompt = `Valide este plano alimentar:

TARGETS:
- Calorias: ${targets.calories} kcal
- Proteína: ${targets.protein}g
- Carboidratos: ${targets.carbs}g
- Gordura: ${targets.fats}g

PLANO ATUAL:
${JSON.stringify(mealPlan, null, 2)}

DADOS DO PACIENTE:
${JSON.stringify(patientData || {}, null, 2)}

Retorne validação estruturada.`;

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
            name: "validate_plan",
            description: "Retorna validação estruturada do plano alimentar",
            parameters: {
              type: "object",
              properties: {
                isValid: { type: "boolean" },
                score: { 
                  type: "number",
                  description: "Score de 0 a 100"
                },
                warnings: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { 
                        type: "string",
                        enum: ["caloria", "macro", "variedade", "distribuicao", "praticidade"]
                      },
                      severity: {
                        type: "string",
                        enum: ["baixa", "media", "alta"]
                      },
                      message: { type: "string" }
                    }
                  }
                },
                suggestions: {
                  type: "array",
                  items: { type: "string" }
                },
                strengths: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["isValid", "score", "suggestions"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "validate_plan" } }
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
      throw new Error("Erro ao validar plano");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices[0].message.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("IA não retornou validação estruturada");
    }

    const validation = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ validation }), {
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
