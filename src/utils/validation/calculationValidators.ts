// Encontre a função que valida a idade (provavelmente validateInputs ou similar)

export const validateCalculationInputs = (inputs: any) => {
  const errors = [];

  // CORREÇÃO: Verificação mais segura
  // Antes devia ser algo como: if (!inputs.age) ...
  
  if (inputs.age === undefined || inputs.age === null || Number(inputs.age) <= 0) {
    console.warn("[VALIDATION] Age is missing or invalid:", inputs.age);
    errors.push("Idade inválida. Por favor, forneça uma idade válida (maior que 0).");
  }

  // ... validação de peso, altura, etc.
  
  return errors;
};
