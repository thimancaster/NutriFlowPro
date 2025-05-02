
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define a more specific type for the goals property based on your data shape
interface Patient {
  id: string;
  name: string;
  created_at: string;
  goals: {
    objective?: string;
    profile?: string;
  } | null;
}

const DashboardRecentPatients: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use React Query for better caching and loading states
  const { data: recentPatients, isLoading } = useQuery({
    queryKey: ['recentPatients', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, created_at, goals')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
          
      if (error) {
        throw error;
      }
        
      // Transform the data to ensure type compatibility
      const typedPatients: Patient[] = data?.map(patient => ({
        id: patient.id,
        name: patient.name,
        created_at: patient.created_at,
        goals: patient.goals as Patient['goals'] // Cast the JSON to our expected type
      })) || [];
        
      return typedPatients;
    },
    enabled: !!user,
    staleTime: 60000, // Cache for 1 minute
  });

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return '-';
    }
  };
  
  // Get patient status
  const getPatientStatus = (patient: Patient) => {
    const createdDate = new Date(patient.created_at);
    const daysDiff = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff < 7) {
      return 'Novo';
    } else if (patient.goals?.objective === 'emagrecimento') {
      return 'Em andamento';
    } else {
      return 'Concluído';
    }
  };
  
  return (
    <Card className="nutri-card border-none shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Pacientes Recentes</CardTitle>
          <Link to="/patients">
            <Button className="bg-nutri-green hover:bg-white hover:text-nutri-green border border-nutri-green transition-colors duration-200">
              <Plus className="h-4 w-4 mr-2" /> Novo Paciente
            </Button>
          </Link>
        </div>
        <CardDescription>Gerencie seus pacientes recentes e consultados recentemente</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-nutri-blue" />
            <span className="ml-2 text-nutri-blue">Carregando pacientes...</span>
          </div>
        ) : recentPatients && recentPatients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2 font-medium">Nome</th>
                  <th className="pb-2 font-medium">Data</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map((patient) => (
                  <tr key={patient.id} className="border-b last:border-b-0">
                    <td className="py-3">{patient.name}</td>
                    <td className="py-3">{formatDate(patient.created_at)}</td>
                    <td className="py-3">
                      <span 
                        className={`px-2 py-1 text-xs rounded-full ${
                          getPatientStatus(patient) === 'Novo' ? 'bg-nutri-blue-light text-white' : 
                          getPatientStatus(patient) === 'Em andamento' ? 'bg-nutri-green-light text-white' : 
                          'bg-nutri-gray-light text-nutri-gray-dark'
                        }`}
                      >
                        {getPatientStatus(patient)}
                      </span>
                    </td>
                    <td className="py-3">
                      <Button 
                        variant="ghost" 
                        className="h-8 px-2 text-nutri-blue hover:text-nutri-blue-dark hover:bg-nutri-gray-light"
                        onClick={() => navigate(`/patient-history/${patient.id}`)}
                      >
                        Ver detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">
              Você ainda não tem pacientes cadastrados
            </p>
            <Button
              className="mt-3 bg-nutri-blue hover:bg-nutri-blue-dark"
              onClick={() => navigate('/patients')}
            >
              <Plus className="h-4 w-4 mr-2" /> Adicionar Paciente
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Link to="/patients" className="w-full">
          <Button variant="outline" className="w-full hover:bg-nutri-blue hover:text-white transition-colors duration-200">Ver todos os pacientes</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default DashboardRecentPatients;
