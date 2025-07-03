import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from '@/hooks/use-toast';

// Define a more specific type for the Patient to optimize data fetching
interface Patient {
  id: string;
  name: string;
  created_at: string;
  goals: {
    objective?: string;
  } | null;
}

const DashboardRecentPatients: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use React Query with optimized data fetching and better caching
  const { data: recentPatients, isLoading } = useQuery({
    queryKey: ['recentPatients', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Only select fields we actually need instead of fetching all data
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, created_at, goals')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
          
      if (error) {
        toast({
          title: "Erro ao carregar pacientes",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
        
      // Transform the data to ensure type compatibility
      const typedPatients: Patient[] = data?.map(patient => ({
        id: patient.id,
        name: patient.name,
        created_at: patient.created_at,
        goals: patient.goals as Patient['goals'] 
      })) || [];
      
      console.log("Loaded recent patients:", typedPatients.map(p => ({id: p.id, name: p.name})));
        
      return typedPatients;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to reduce unnecessary API calls
    retry: 1, // Only retry once to prevent excessive API calls on failure
  });

  // Format date with error handling
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return '-';
    }
  };
  
  // Get patient status based on creation date and goals
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

  // Handle clicking on "Ver detalhes" - correctly handle patient details by ID
  const handleViewPatientDetails = (patientId: string) => {
    navigate(`/patients/${patientId}`);
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
                <tr className="text-left border-b border-border">
                  <th className="pb-2 pt-4 px-4 text-muted-foreground font-medium">Nome</th>
                  <th className="pb-2 pt-4 px-4 text-muted-foreground font-medium">Data</th>
                  <th className="pb-2 pt-4 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="pb-2 pt-4 px-4 text-muted-foreground font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-border last:border-b-0 group hover:bg-muted/30 transition-colors duration-200">
                    <td className="py-3 px-4 text-foreground group-hover:text-primary transition-colors duration-200">
                      <Link to={`/patients/${patient.id}`} className="hover:underline">
                        {patient.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{formatDate(patient.created_at)}</td>
                    <td className="py-3 px-4">
                      <span 
                        className={`px-2 py-1 text-xs rounded-full ${
                          getPatientStatus(patient) === 'Novo' ? 'bg-nutri-blue-light text-white' : 
                          getPatientStatus(patient) === 'Em andamento' ? 'bg-nutri-green-light text-white' : 
                          'bg-muted text-muted-foreground'
                        }`}
                      >
                        {getPatientStatus(patient)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button 
                        variant="ghost" 
                        className="h-8 px-2 text-nutri-blue hover:text-nutri-blue-dark hover:bg-muted"
                        onClick={() => handleViewPatientDetails(patient.id)}
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
