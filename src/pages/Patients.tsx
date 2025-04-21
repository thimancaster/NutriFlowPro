
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import PatientForm from '@/components/PatientForm';
import PatientHistory from '@/components/PatientHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, User } from 'lucide-react';

const Patients = () => {
  const [selectedTab, setSelectedTab] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  
  // Mock patients data
  const patients = [
    { id: 1, name: 'Ana Silva', age: 34, lastConsultation: '15/04/2025', status: 'Em andamento' },
    { id: 2, name: 'Carlos Santos', age: 42, lastConsultation: '14/04/2025', status: 'Novo' },
    { id: 3, name: 'Maria Oliveira', age: 28, lastConsultation: '12/04/2025', status: 'Concluído' },
    { id: 4, name: 'João Pereira', age: 55, lastConsultation: '10/04/2025', status: 'Em andamento' },
    { id: 5, name: 'Lúcia Fernandes', age: 31, lastConsultation: '05/04/2025', status: 'Concluído' },
  ];
  
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handlePatientSelect = (patientId: number) => {
    setSelectedPatient(patientId);
    setSelectedTab("history");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Pacientes</h1>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="list">Lista de Pacientes</TabsTrigger>
            <TabsTrigger value="new">Novo Paciente</TabsTrigger>
            <TabsTrigger value="history" disabled={selectedPatient === null}>
              Histórico
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      className="pl-10" 
                      placeholder="Buscar paciente por nome..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button className="bg-nutri-green hover:bg-nutri-green-dark" onClick={() => setSelectedTab("new")}>
                    <Plus className="h-4 w-4 mr-2" /> Novo Paciente
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-3 font-medium">Nome</th>
                        <th className="pb-3 font-medium">Idade</th>
                        <th className="pb-3 font-medium">Última Consulta</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <tr key={patient.id} className="border-b last:border-b-0">
                            <td className="py-4">
                              <div className="flex items-center">
                                <div className="bg-nutri-gray-light p-2 rounded-full mr-3">
                                  <User className="h-4 w-4 text-nutri-gray-dark" />
                                </div>
                                {patient.name}
                              </div>
                            </td>
                            <td className="py-4">{patient.age} anos</td>
                            <td className="py-4">{patient.lastConsultation}</td>
                            <td className="py-4">
                              <span 
                                className={`px-2 py-1 text-xs rounded-full ${
                                  patient.status === 'Novo' ? 'bg-nutri-blue-light text-white' : 
                                  patient.status === 'Em andamento' ? 'bg-nutri-green-light text-white' : 
                                  'bg-nutri-gray-light text-nutri-gray-dark'
                                }`}
                              >
                                {patient.status}
                              </span>
                            </td>
                            <td className="py-4">
                              <Button 
                                variant="ghost" 
                                className="h-8 px-2 text-nutri-blue hover:text-nutri-blue-dark hover:bg-nutri-gray-light"
                                onClick={() => handlePatientSelect(patient.id)}
                              >
                                Ver histórico
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-gray-500">
                            Nenhum paciente encontrado com o termo "{searchQuery}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="new">
            <PatientForm />
          </TabsContent>
          
          <TabsContent value="history">
            {selectedPatient !== null && (
              <>
                <div className="mb-6">
                  <Button 
                    variant="outline" 
                    className="mb-4"
                    onClick={() => setSelectedTab("list")}
                  >
                    Voltar para lista
                  </Button>
                  <h2 className="text-xl font-medium">
                    Histórico de {patients.find(p => p.id === selectedPatient)?.name}
                  </h2>
                </div>
                <PatientHistory />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Patients;
