
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

const PatientTabNavigation = () => {
  return (
    <TabsList className="grid grid-cols-6 mb-4">
      <TabsTrigger value="info">Dados Cadastrais</TabsTrigger>
      <TabsTrigger value="appointments">Consultas</TabsTrigger>
      <TabsTrigger value="meal-plans">Planos Alimentares</TabsTrigger>
      <TabsTrigger value="evaluations">Avaliações</TabsTrigger>
      <TabsTrigger value="evolution">Evolução</TabsTrigger>
      <TabsTrigger value="notes">Observações</TabsTrigger>
    </TabsList>
  );
};

export default PatientTabNavigation;
