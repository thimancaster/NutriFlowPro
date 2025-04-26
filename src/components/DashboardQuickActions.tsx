
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DashboardQuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleUpgrade = () => {
    navigate('/subscription');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="nutri-card shadow-lg border-none">
        <CardHeader>
          <CardTitle>Ferramentas Rápidas</CardTitle>
          <CardDescription>Acesso rápido às ferramentas mais utilizadas</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Link to="/calculator" className="w-full">
            <Button className="bg-gradient-to-r from-nutri-blue-light to-nutri-blue hover:opacity-90 h-auto py-4 w-full flex flex-col items-center">
              <span className="text-sm mb-1">Calcular</span>
              <span className="text-xs">TMB & GET</span>
            </Button>
          </Link>
          <Button 
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:opacity-90 h-auto py-4 flex flex-col items-center"
            onClick={() => navigate('/calculator')}
          >
            <span className="text-sm mb-1">Distribuir</span>
            <span className="text-xs">Macronutrientes</span>
          </Button>
          <Link to="/meal-plans" className="w-full">
            <Button className="bg-gradient-to-r from-nutri-green to-nutri-green-dark hover:opacity-90 h-auto py-4 w-full flex flex-col items-center">
              <span className="text-sm mb-1">Plano</span>
              <span className="text-xs">Alimentar</span>
            </Button>
          </Link>
          <Button 
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:opacity-90 h-auto py-4 flex flex-col items-center"
            onClick={() => navigate('/patients')}
          >
            <span className="text-sm mb-1">Relatório</span>
            <span className="text-xs">Nutricional</span>
          </Button>
        </CardContent>
      </Card>

      <Card className="nutri-card shadow-lg border-none relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-green-500/10 z-0"></div>
        <CardHeader className="relative z-10">
          <CardTitle>Status da Versão</CardTitle>
          <CardDescription>Versão atual e recursos disponíveis</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Versão:</span>
              <span className="font-medium">NutriFlow Pro 1.0</span>
            </div>
            <div className="flex justify-between">
              <span>Plano:</span>
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 px-2 py-0.5 rounded-full text-sm text-white">Freemium</span>
            </div>
            <div className="flex justify-between">
              <span>Pacientes Permitidos:</span>
              <span className="font-medium">10/10</span>
            </div>
            <Button 
              className="w-full mt-3 bg-gradient-to-r from-nutri-blue to-nutri-blue-dark hover:opacity-90"
              onClick={handleUpgrade}
            >
              <Star className="h-4 w-4 mr-2" /> Atualizar para Pro
            </Button>
          </div>
        </CardContent>
        <div className="absolute bottom-0 right-0 -mb-4 -mr-4 text-blue-100 opacity-20">
          <Star className="h-32 w-32" />
        </div>
      </Card>
    </div>
  );
};

export default DashboardQuickActions;
