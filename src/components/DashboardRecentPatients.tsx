
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const recentPatients = [
  { id: 1, name: 'Ana Silva', date: '15/04/2025', status: 'Em andamento' },
  { id: 2, name: 'Carlos Santos', date: '14/04/2025', status: 'Novo' },
  { id: 3, name: 'Maria Oliveira', date: '12/04/2025', status: 'Concluído' },
];

const DashboardRecentPatients: React.FC = () => {
  const navigate = useNavigate();
  
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
                  <td className="py-3">{patient.date}</td>
                  <td className="py-3">
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
