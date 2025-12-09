import { supabase } from "@/integrations/supabase/client";

export const calculationService = {
  async saveCalculation(data: any) {
    console.log("💾 [SERVICE] Saving calculation:", data);

    try {
      // 1. Validação básica
      if (!data.patientId) {
        throw new Error("ID do paciente é obrigatório para salvar o cálculo.");
      }

      // 2. Extração e Tratamento de Dados (A CORREÇÃO ESTÁ AQUI)
      // O banco espera um número, mas o cálculo pode retornar um objeto { value, formula }
      const tmbValue = typeof data.results?.tmb === 'object' 
        ? data.results.tmb.value 
        : data.results?.tmb;

      // Mesma coisa para o GET, se necessário
      const getValue = typeof data.results?.get === 'object'
        ? data.results.get.value // caso venha como objeto
        : data.results?.get;

      // Prepara o objeto limpo para o Supabase
      const payload = {
        patient_id: data.patientId,
        date: new Date().toISOString(),
        weight: data.inputs.weight,
        height: data.inputs.height,
        age: data.inputs.age, // Certifique-se de que isso é um número
        gender: data.inputs.gender,
        activity_level: data.inputs.activityLevel,
        goal: data.inputs.objective,
        
        // Valores extraídos corretamente
        basal_metabolic_rate: parseFloat(tmbValue || 0), 
        total_energy_expenditure: parseFloat(getValue || 0),
        
        // Calorias finais (VET)
        caloric_intake_goal: parseFloat(data.results?.vet || 0),
        
        // Macros (Garantindo que são números)
        protein_grams: parseFloat(data.results?.macros?.protein?.grams || 0),
        carbs_grams: parseFloat(data.results?.macros?.carbs?.grams || 0),
        fats_grams: parseFloat(data.results?.macros?.fat?.grams || 0),
        
        // Metadados adicionais (opcional, mas bom para debug)
        notes: `Fórmula TMB: ${typeof data.results?.tmb === 'object' ? data.results.tmb.formula : 'Auto'} | Fator Ativ: ${data.inputs.manualActivityFactor || 'Auto'}`
      };

      console.log("📤 [SERVICE] Payload preparado para Supabase:", payload);

      // 3. Envio para o Supabase
      const { data: savedData, error } = await supabase
        .from('calculations')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("❌ [SERVICE] Erro Supabase:", error);
        throw error;
      }

      console.log("✅ [SERVICE] Salvo com sucesso:", savedData);
      return savedData;

    } catch (error: any) {
      console.error("❌ [SERVICE] Falha ao salvar:", error.message);
      throw error;
    }
  },

  // ... (mantenha outras funções como getHistory se existirem)
};
