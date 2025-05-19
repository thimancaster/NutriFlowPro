
import { useState } from 'react';
import { Profile } from '@/types/consultation';
import { useToast } from '@/components/ui/use-toast';
import { 
  calculateTMB, 
  calculateGET, 
  calculateVET,
  calculateCalorieSummary
} from '@/utils/nutritionCalculations';
import { calculateMacrosByProfile } from '@/utils/macronutrientCalculations';
import { stringToProfile } from '@/components/calculator/utils/profileUtils';

export const useCalculatorState = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('tmb');
  
  // Input states
  const [weight, setWeight] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [sex, setSex] = useState<'M' | 'F'>('F');
  const [activityLevel, setActivityLevel] = useState('moderado');
  const [objective, setObjective] = useState('manutenção');
  const [profile, setProfile] = useState<Profile>('eutrofico');
  
  // Result states
  const [tmbValue, setTmbValue] = useState<number | null>(null);
  const [teeObject, setTeeObject] = useState<{
    get: number;
    adjustment: number;
    vet: number;
  } | null>(null);
  const [macros, setMacros] = useState<any>(null);
  const [calorieSummary, setCalorieSummary] = useState<any>(null);
  
  // UI states
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Validation function
  const validateCalculatorInputs = (weight: number, height: number, age: number): boolean => {
    if (weight <= 0 || weight > 300) return false;
    if (height <= 0 || height > 250) return false;
    if (age <= 0 || age > 120) return false;
    return true;
  };

  // Create a type-safe wrapper for setProfile that accepts strings
  const handleProfileChange = (value: string) => {
    setProfile(stringToProfile(value));
  };

  // Handle input changes
  const handleInputChange = (name: string, value: number | '') => {
    switch (name) {
      case 'weight':
        setWeight(value);
        break;
      case 'height':
        setHeight(value);
        break;
      case 'age':
        setAge(value);
        break;
      default:
        break;
    }
  };

  // Handle calculation
  const handleCalculate = () => {
    if (!weight || !height || !age) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateCalculatorInputs(Number(weight), Number(height), Number(age))) {
      toast({
        title: "Valores inválidos",
        description: "Por favor, verifique se os valores estão dentro de limites razoáveis.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCalculating(true);
    
    // Simulate calculation delay for UX
    setTimeout(() => {
      try {
        // Calculate TMB
        const tmb = calculateTMB(Number(weight), Number(height), Number(age), sex);
        setTmbValue(tmb);
        
        if (activeTab === 'tmb') {
          setActiveTab('activity');
          setIsCalculating(false);
          return;
        }
        
        // Calculate GET (Total Energy Expenditure)
        const get = calculateGET(tmb, activityLevel);
        
        // Calculate VET (adjusted calories based on objective)
        const vet = calculateVET(get, objective);
        
        setTeeObject({
          get,
          adjustment: vet / get,
          vet
        });
        
        // Calculate macronutrients
        const macrosResult = calculateMacrosByProfile(profile, Number(weight), vet);
        setMacros(macrosResult);
        
        // Calculate calorie summary
        const summary = calculateCalorieSummary(vet, {
          protein: { kcal: macrosResult.protein.kcal },
          fats: { kcal: macrosResult.fat.kcal },
          carbs: { kcal: macrosResult.carbs.kcal }
        });
        setCalorieSummary(summary);
        
        setShowResults(true);
        setActiveTab('results');
      } catch (error) {
        console.error("Calculation error:", error);
        toast({
          title: "Erro no cálculo",
          description: "Ocorreu um erro ao calcular os valores. Por favor, tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsCalculating(false);
      }
    }, 800);
  };
  
  // Reset form
  const handleReset = () => {
    setWeight('');
    setHeight('');
    setAge('');
    setSex('F');
    setActivityLevel('moderado');
    setObjective('manutenção');
    setProfile('eutrofico');
    setTmbValue(null);
    setTeeObject(null);
    setMacros(null);
    setCalorieSummary(null);
    setShowResults(false);
    setActiveTab('tmb');
  };

  return {
    // State
    activeTab,
    weight,
    height,
    age,
    sex,
    activityLevel,
    objective,
    profile,
    tmbValue,
    teeObject,
    macros,
    calorieSummary,
    showResults,
    isCalculating,
    
    // Setters
    setActiveTab,
    setSex,
    setActivityLevel,
    setObjective,
    
    // Handlers
    handleProfileChange,
    handleInputChange,
    handleCalculate,
    handleReset
  };
};

export default useCalculatorState;
