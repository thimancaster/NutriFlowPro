
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Scale, TrendingUp, Calculator, Utensils, Calendar, FileText, BarChart3, Target, Bell, Download } from 'lucide-react';

const PatientTabNavigation = () => {
  return (
    <TabsList className="grid grid-cols-11 w-full">
      <TabsTrigger value="basic-info" className="text-xs">
        <User className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Info</span>
      </TabsTrigger>
      <TabsTrigger value="evaluations" className="text-xs">
        <Scale className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Avaliações</span>
      </TabsTrigger>
      <TabsTrigger value="evolution" className="text-xs">
        <TrendingUp className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Evolução</span>
      </TabsTrigger>
      <TabsTrigger value="calculation-history" className="text-xs">
        <Calculator className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Histórico</span>
      </TabsTrigger>
      <TabsTrigger value="comparison" className="text-xs">
        <BarChart3 className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Comparar</span>
      </TabsTrigger>
      <TabsTrigger value="goals" className="text-xs">
        <Target className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Metas</span>
      </TabsTrigger>
      <TabsTrigger value="alerts" className="text-xs">
        <Bell className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Alertas</span>
      </TabsTrigger>
      <TabsTrigger value="reports" className="text-xs">
        <Download className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Relatórios</span>
      </TabsTrigger>
      <TabsTrigger value="meal-plans" className="text-xs">
        <Utensils className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Cardápios</span>
      </TabsTrigger>
      <TabsTrigger value="appointments" className="text-xs">
        <Calendar className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Consultas</span>
      </TabsTrigger>
      <TabsTrigger value="notes" className="text-xs">
        <FileText className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Notas</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default PatientTabNavigation;
