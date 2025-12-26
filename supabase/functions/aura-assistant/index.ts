import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AURA_SYSTEM_PROMPT = `Você é Aura, a Assistente Nutricional Inteligente do NutriFlow Pro.

**Persona:** Profissional, empática, precisa e baseada em evidências. Sua linguagem é clara e motivacional, focada em resultados clínicos.

**Função Principal:**
1. **Análise Evolutiva:** Analisar dados históricos e gráficos de evolução do paciente (Peso, VET, %Gordura) para fornecer insights e sugestões de ajuste para o nutricionista.
2. **Geração de Planos:** Gerar sugestões de planos alimentares e dicas nutricionais baseadas nos dados fornecidos.
3. **Validação:** Justificar todas as sugestões com base nos dados do paciente e nos objetivos clínicos (Emagrecimento, Manutenção, Hipertrofia).

**Regras de Interação:**
- Sempre comece a interação se apresentando como "Aura".
- Mantenha o foco na nutrição clínica e nos dados fornecidos pelo sistema.
- Seja objetiva mas empática - lembre que o nutricionista está ajudando um paciente.
- Forneça insights acionáveis que o nutricionista pode usar imediatamente.
- Use emojis com moderação para tornar a leitura mais agradável.
- Estruture sua resposta com seções claras quando apropriado.

**Formato de Resposta:**
Quando analisar evolução, inclua:
1. 📊 Resumo da situação atual
2. 📈 Análise da tendência (positiva/negativa)
3. 💡 Insights e observações relevantes
4. ✅ Sugestões práticas de ajuste`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context } = await req.json();
    
    if (!context) {
      return new Response(
        JSON.stringify({ error: 'Context data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the user message with context
    const objectiveMap: Record<string, string> = {
      'weight_loss': 'Emagrecimento',
      'maintenance': 'Manutenção',
      'muscle_gain': 'Hipertrofia/Ganho de Massa',
      'hypertrophy': 'Hipertrofia/Ganho de Massa'
    };

    const objective = objectiveMap[context.objective] || context.objective || 'Manutenção';

    let userMessage = `Analise os dados do paciente e forneça insights para o nutricionista:

**Paciente:** ${context.patient?.name || 'Não informado'}
- Idade: ${context.patient?.age || 'Não informada'}
- Sexo: ${context.patient?.gender === 'male' ? 'Masculino' : context.patient?.gender === 'female' ? 'Feminino' : 'Não informado'}

**Objetivo Clínico:** ${objective}

**Dados Atuais:**
- Peso: ${context.currentData?.weight ? `${context.currentData.weight} kg` : 'Não informado'}
- Altura: ${context.currentData?.height ? `${context.currentData.height} cm` : 'Não informada'}
- Nível de Atividade: ${context.currentData?.activityLevel || 'Não informado'}
- TMB: ${context.currentData?.bmr ? `${context.currentData.bmr} kcal` : 'Não calculado'}
- GET: ${context.currentData?.tdee ? `${context.currentData.tdee} kcal` : 'Não calculado'}
`;

    if (context.evolution && context.evolution.length > 0) {
      userMessage += `\n**Histórico de Evolução (últimas ${context.evolution.length} medições):**\n`;
      context.evolution.forEach((data: any, index: number) => {
        userMessage += `${index + 1}. ${data.date}: `;
        const parts = [];
        if (data.weight) parts.push(`Peso: ${data.weight}kg`);
        if (data.vet) parts.push(`VET: ${data.vet}kcal`);
        if (data.bodyFatPct) parts.push(`%Gordura: ${data.bodyFatPct}%`);
        userMessage += parts.join(' | ') + '\n';
      });
    } else {
      userMessage += '\n**Histórico de Evolução:** Primeira consulta (sem histórico anterior)\n';
    }

    userMessage += '\nPor favor, analise esses dados e forneça insights úteis para o atendimento.';

    console.log('Calling Lovable AI Gateway for Aura analysis...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: AURA_SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Error in aura-assistant function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
