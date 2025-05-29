
/**
 * Validação de dados de entrada
 */
export const validateNutritionInputs = (
  weight: number,
  height: number,
  age: number
): string | null => {
  if (weight <= 0 || weight > 500) {
    return 'Peso deve estar entre 1 e 500 kg';
  }
  
  if (height <= 0 || height > 250) {
    return 'Altura deve estar entre 1 e 250 cm';
  }
  
  if (age <= 0 || age > 120) {
    return 'Idade deve estar entre 1 e 120 anos';
  }
  
  return null;
};
