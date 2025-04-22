
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, FileText } from 'lucide-react';

const summaryCards = [
  { title: 'Total de Pacientes', value: '42', icon: User, color: 'bg-blue-500', image: 'https://images.unsplash.com/photo-1517093727143-a58c00fda25d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' },
  { title: 'Consultas Hoje', value: '3', icon: Calendar, color: 'bg-green-500', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' },
  { title: 'Planos Ativos', value: '28', icon: FileText, color: 'bg-teal-500', image: 'https://images.unsplash.com/photo-1576866209830-589e1bfbaa4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' },
];

const DashboardSummaryCards: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {summaryCards.map((card, index) => (
      <Card key={index} className="nutri-card overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="h-32 overflow-hidden relative">
          <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-3 left-4 text-white">
            <div className="flex items-center">
              <card.icon className="h-5 w-5 mr-2" />
              <p className="font-medium">{card.title}</p>
            </div>
          </div>
        </div>
        <CardContent className="pt-4">
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold">{card.value}</span>
            <div className={`${card.color} p-3 rounded-full`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default DashboardSummaryCards;
