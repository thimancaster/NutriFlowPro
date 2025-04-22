
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Heart } from 'lucide-react';

const DashboardTestimonials: React.FC = () => (
  <Card className="nutri-card shadow-lg border-none bg-gradient-to-br from-green-50 to-blue-50">
    <CardHeader>
      <CardTitle className="flex items-center">
        <Heart className="h-5 w-5 text-red-500 mr-2" /> Depoimentos de Usuários
      </CardTitle>
      <CardDescription>O que os nutricionistas estão dizendo sobre o NutriFlow Pro</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="italic text-gray-600">"O NutriFlow Pro transformou minha clínica! Consigo gerenciar meus pacientes e criar planos alimentares em uma fração do tempo que costumava gastar."</p>
          <p className="mt-2 font-medium">Dra. Camila Mendes</p>
          <p className="text-sm text-gray-500">Nutricionista Clínica</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="italic text-gray-600">"Meus pacientes adoram os planos alimentares detalhados e personalizados. O sistema é intuitivo e economiza muito do meu tempo."</p>
          <p className="mt-2 font-medium">Dr. Roberto Almeida</p>
          <p className="text-sm text-gray-500">Nutricionista Esportivo</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default DashboardTestimonials;
