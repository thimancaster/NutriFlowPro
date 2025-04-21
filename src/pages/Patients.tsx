
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import PatientForm from '@/components/PatientForm';
import PatientHistory from '@/components/PatientHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, User, FileText, Clock } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-nutri-blue">Pacientes</h1>
            <p className="text-gray-600">Gerencie seus pacientes e histórico de consultas</p>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
            alt="Atendimento nutricional" 
            className="w-full md:w-1/4 rounded-xl shadow-lg mt-4 md:mt-0 hidden md:block"
          />
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="bg-white rounded-xl shadow-lg p-6">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 p-1">
            <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:text-nutri-blue">Lista de Pacientes</TabsTrigger>
            <TabsTrigger value="new" className="data-[state=active]:bg-white data-[state=active]:text-nutri-green">Novo Paciente</TabsTrigger>
            <TabsTrigger value="history" disabled={selectedPatient === null} className="data-[state=active]:bg-white data-[state=active]:text-nutri-teal">
              Histórico
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  className="pl-10 border-gray-300 focus:border-nutri-blue focus:ring-nutri-blue" 
                  placeholder="Buscar paciente por nome..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="bg-gradient-to-r from-nutri-green to-nutri-green-dark hover:opacity-90" onClick={() => setSelectedTab("new")}>
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
                      <tr key={patient.id} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-2 rounded-full mr-3">
                              <User className="h-4 w-4 text-nutri-blue" />
                            </div>
                            {patient.name}
                          </div>
                        </td>
                        <td className="py-4">{patient.age} anos</td>
                        <td className="py-4">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-gray-500" />
                            {patient.lastConsultation}
                          </div>
                        </td>
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
                            className="h-8 px-2 text-nutri-blue hover:text-nutri-blue-dark hover:bg-blue-50"
                            onClick={() => handlePatientSelect(patient.id)}
                          >
                            <FileText className="h-3 w-3 mr-1" /> Ver histórico
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
                    className="mb-4 border-nutri-blue text-nutri-blue hover:bg-blue-50"
                    onClick={() => setSelectedTab("list")}
                  >
                    Voltar para lista
                  </Button>
                  <h2 className="text-xl font-medium flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-nutri-blue" />
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
