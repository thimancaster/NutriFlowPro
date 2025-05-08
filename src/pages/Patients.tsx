import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Patient } from '@/types';
import PatientListActions from '@/components/PatientListActions';
import PatientDetailModal from '@/components/patient/PatientDetailModal';
import { usePatientDetail } from '@/hooks/usePatientDetail';
import { useNavigate } from 'react-router-dom';

interface PatientsProps {}

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { isModalOpen, patientId, patient, isLoading: isLoadingPatient, openPatientDetail, closePatientDetail } = usePatientDetail();
  const navigate = useNavigate();
  
  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
        
      if (error) {
        throw error;
      }
        
      return data as Patient[];
    },
    enabled: !!user,
    staleTime: 60000, // Cache for 1 minute
  });
  
  const filteredPatients = patients?.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-nutri-blue mb-2">Pacientes</h1>
            <p className="text-gray-600">Gerencie seus pacientes e acessar consultas anteriores</p>
          </div>
          <Button 
            className="bg-nutri-green hover:bg-nutri-green-dark mt-4 md:mt-0"
            onClick={() => navigate('/patients/new')}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Paciente
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Pesquisar Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar por nome, email ou telefone" 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Lista de Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-nutri-blue"></div>
                <p className="mt-2 text-gray-600">Carregando pacientes...</p>
              </div>
            ) : filteredPatients && filteredPatients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left">Nome</th>
                      <th className="py-3 px-4 text-left hidden md:table-cell">Email</th>
                      <th className="py-3 px-4 text-left hidden md:table-cell">Telefone</th>
                      <th className="py-3 px-4 text-left hidden lg:table-cell">Objetivo</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{patient.name}</td>
                        <td className="py-3 px-4 hidden md:table-cell">{patient.email || '-'}</td>
                        <td className="py-3 px-4 hidden md:table-cell">{patient.phone || '-'}</td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          {patient.goals?.objective 
                            ? patient.goals.objective.charAt(0).toUpperCase() + patient.goals.objective.slice(1)
                            : '-'
                          }
                        </td>
                        <td className="py-3 px-4 text-right">
                          <PatientListActions 
                            patient={patient} 
                            onViewDetail={openPatientDetail}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchTerm ? 'Nenhum paciente encontrado com os termos de busca.' : 'Você ainda não tem pacientes cadastrados.'}
                </p>
                {!searchTerm && (
                  <Button 
                    className="mt-4 bg-nutri-green hover:bg-nutri-green-dark"
                    onClick={() => navigate('/patients/new')}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Paciente
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Patient Detail Modal */}
        <PatientDetailModal
          isOpen={isModalOpen}
          onClose={closePatientDetail}
          patientId={patientId || ''}
          patient={patient}
          isLoading={isLoadingPatient}
        />
      </div>
    </div>
  );
};

export default Patients;
