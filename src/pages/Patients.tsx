
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import PatientForm from '@/components/PatientForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, User, FileText, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Patients = () => {
  const [selectedTab, setSelectedTab] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
  
  const handleNewPatient = () => {
    const isFreeUser = true; // Mock: this would come from user data
    const patientCount = patients.length;
    
    if (isFreeUser && patientCount >= 2) {
      setShowUpgradeDialog(true);
    } else {
      setSelectedTab("new");
    }
  };
  
  const handlePatientSelect = (patientId: number) => {
    navigate(`/patient-history/${patientId}`);
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
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1">
            <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:text-nutri-blue">Lista de Pacientes</TabsTrigger>
            <TabsTrigger value="new" className="data-[state=active]:bg-white data-[state=active]:text-nutri-green">Novo Paciente</TabsTrigger>
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
              <Button className="bg-gradient-to-r from-nutri-green to-nutri-green-dark hover:opacity-90" onClick={handleNewPatient}>
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
        </Tabs>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Limite de Pacientes Atingido</DialogTitle>
            <DialogDescription className="text-center">
              Você já atingiu o limite de 2 pacientes no plano gratuito.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 items-center pt-4">
            <img 
              src="https://lovable.dev/opengraph-image-p98pqg.png" 
              alt="Upgrade" 
              className="h-32 mx-auto"
            />
            <div className="text-center">
              <p className="mb-2">Atualize para o plano premium para:</p>
              <ul className="text-sm text-gray-600 text-left space-y-1">
                <li>• Cadastrar pacientes ilimitados</li>
                <li>• Acessar recursos avançados</li>
                <li>• Gerar relatórios personalizados</li>
                <li>• Suporte prioritário</li>
              </ul>
            </div>
            <div className="flex gap-4 w-full">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowUpgradeDialog(false)}
              >
                Não agora
              </Button>
              <Button 
                className="flex-1 bg-nutri-blue hover:bg-nutri-blue-dark"
                onClick={() => {
                  setShowUpgradeDialog(false);
                  toast({
                    title: "Upgrade iniciado",
                    description: "Redirecionando para a página de pagamento...",
                  });
                }}
              >
                Fazer Upgrade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Patients;
