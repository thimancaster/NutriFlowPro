
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface PatientEvaluationsProps {
  patientId: string;
}

interface Calculation {
  id: string;
  created_at: string;
  weight: number;
  height: number;
  age: number;
  gender: string;
  bmr: number;
  tdee: number;
  goal: string;
  activity_level: string;
  protein: number;
  carbs: number;
  fats: number;
  status: string;
  tipo: string;
}

const PatientEvaluations = ({ patientId }: PatientEvaluationsProps) => {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchCalculations = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('calculations')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setCalculations(data || []);
      } catch (error) {
        console.error('Error fetching calculations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCalculations();
  }, [patientId]);
  
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy');
    } catch (e) {
      return dateStr;
    }
  };
  
  const handleNewCalculation = () => {
    navigate(`/consultation?patientId=${patientId}`);
  };
  
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutri-blue"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Avaliações Nutricionais</h3>
        <Button 
          onClick={handleNewCalculation}
          className="bg-nutri-blue hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Avaliação
        </Button>
      </div>
      
      {calculations.length > 0 ? (
        <div className="space-y-4">
          {calculations.map((calc) => (
            <div key={calc.id} className="border rounded-lg overflow-hidden">
              <div 
                className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer"
                onClick={() => toggleExpand(calc.id)}
              >
                <div>
                  <span className="font-medium">{formatDate(calc.created_at)}</span>
                  <span className="ml-4 text-gray-600">
                    {calc.tdee.toFixed(0)} kcal | {calc.goal}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs mr-3
                    ${calc.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'}`}>
                    {calc.status === 'em_andamento' ? 'Em andamento' : 'Completo'}
                  </span>
                  {expandedId === calc.id ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </div>
              </div>
              
              {expandedId === calc.id && (
                <div className="p-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Dados Básicos</h4>
                      <ul className="mt-2 space-y-1">
                        <li>Peso: {calc.weight} kg</li>
                        <li>Altura: {calc.height} cm</li>
                        <li>Idade: {calc.age} anos</li>
                        <li>Gênero: {calc.gender === 'male' ? 'Masculino' : 'Feminino'}</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Cálculos</h4>
                      <ul className="mt-2 space-y-1">
                        <li>TMB: {calc.bmr.toFixed(0)} kcal</li>
                        <li>GET: {calc.tdee.toFixed(0)} kcal</li>
                        <li>Objetivo: {calc.goal}</li>
                        <li>Nível de atividade: {calc.activity_level}</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Macronutrientes</h4>
                      <ul className="mt-2 space-y-1">
                        <li>Proteínas: {calc.protein.toFixed(0)}g ({(calc.protein * 4 / calc.tdee * 100).toFixed(0)}%)</li>
                        <li>Carboidratos: {calc.carbs.toFixed(0)}g ({(calc.carbs * 4 / calc.tdee * 100).toFixed(0)}%)</li>
                        <li>Gorduras: {calc.fats.toFixed(0)}g ({(calc.fats * 9 / calc.tdee * 100).toFixed(0)}%)</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/consultation`, {
                        state: { repeatConsultation: calc, patientData: { id: patientId } }
                      })}
                    >
                      Editar Avaliação
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">Nenhuma avaliação nutricional registrada.</p>
      )}
    </div>
  );
};

export default PatientEvaluations;
