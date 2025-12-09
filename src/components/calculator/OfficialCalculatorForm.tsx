// Dentro do seu componente OfficialCalculatorForm

// ... imports

export const OfficialCalculatorForm: React.FC<OfficialCalculatorFormProps> = ({
  onCalculationComplete,
  initialData,
}) => {
  // ... hooks existentes

  // CORREÇÃO: Função auxiliar para garantir que a idade seja válida
  const getSafeAge = () => {
    if (inputs.age && inputs.age > 0) return inputs.age;
    
    // Tenta calcular pela data de nascimento do paciente se a idade estiver vazia
    if (activePatient?.birth_date) {
      const birth = new Date(activePatient.birth_date);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    }
    
    return 0; // Retorna 0 em vez de undefined para não quebrar a validação
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Força a atualização da idade antes de calcular
    const safeAge = getSafeAge();
    
    if (safeAge === 0) {
      toast({
        title: "Idade Inválida",
        description: "Por favor, preencha a idade ou a data de nascimento do paciente.",
        variant: "destructive"
      });
      return;
    }

    // Se a idade no state estiver errada, atualiza agora
    if (inputs.age !== safeAge) {
        updateInputs({ age: safeAge });
    }

    await calculate();
  };

  // ... restante do código
