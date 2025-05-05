
/**
 * Validate calculator inputs for basic requirements and reasonable values
 */
export function validateCalculatorInputs(
  age: string, 
  weight: string, 
  height: string,
  toast: any
): boolean {
  // Basic validation for required fields
  if (!age || !weight || !height) {
    toast({
      title: "Campos obrigatórios",
      description: "Por favor, preencha todos os campos necessários.",
      variant: "destructive"
    });
    return false;
  }
  
  // Validate reasonable values
  const ageVal = parseFloat(age);
  const weightVal = parseFloat(weight);
  const heightVal = parseFloat(height);
  
  if (ageVal <= 0 || ageVal > 120) {
    toast({
      title: "Valor inválido",
      description: "A idade deve estar entre 1 e 120 anos.",
      variant: "destructive"
    });
    return false;
  }
  
  if (weightVal <= 0 || weightVal > 300) {
    toast({
      title: "Valor inválido",
      description: "O peso deve estar entre 1 e 300 kg.",
      variant: "destructive"
    });
    return false;
  }
  
  if (heightVal <= 0 || heightVal > 250) {
    toast({
      title: "Valor inválido",
      description: "A altura deve estar entre 1 e 250 cm.",
      variant: "destructive"
    });
    return false;
  }
  
  return true;
}
