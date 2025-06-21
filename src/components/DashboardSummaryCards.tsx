
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarDays, ClipboardList, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';

export interface SummaryData {
  totalPatients: number;
  appointmentsToday: number;
  activePlans: number;
  isLoading: boolean;
}

const DashboardSummaryCards: React.FC<SummaryData> = ({
  totalPatients,
  appointmentsToday,
  activePlans,
  isLoading
}) => {
  const summaryCards = [
    {
      title: 'Pacientes',
      value: totalPatients,
      icon: <Users className="h-8 w-8 text-nutri-blue" />,
      description: 'Total de pacientes cadastrados',
      linkTo: '/patients',
      linkText: 'Ver pacientes',
      gradient: 'from-nutri-blue/10 to-nutri-blue/20'
    },
    {
      title: 'Agendamentos Hoje',
      value: appointmentsToday,
      icon: <CalendarDays className="h-8 w-8 text-nutri-green" />,
      description: 'Consultas agendadas para hoje',
      linkTo: '/appointments',
      linkText: 'Ver agenda',
      gradient: 'from-nutri-green/10 to-nutri-green/20'
    },
    {
      title: 'Planos Alimentares',
      value: activePlans,
      icon: <ClipboardList className="h-8 w-8 text-primary" />,
      description: 'Planos alimentares ativos',
      linkTo: '/meal-plans',
      linkText: 'Ver planos',
      gradient: 'from-primary/10 to-primary/20'
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {summaryCards.map((card, index) => (
        <Card key={index} className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-30 transition-opacity duration-300 group-hover:opacity-50`} />
          
          <div className="relative z-10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="p-3 rounded-full bg-background/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110">
                {card.icon}
              </div>
              <CardTitle className="text-lg font-medium text-foreground">
                {card.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-12 w-1/2 bg-muted/50" />
              ) : (
                <p className="text-3xl font-bold transition-all duration-300 group-hover:scale-110 text-foreground">
                  {card.value}
                </p>
              )}
              <CardDescription className="mt-2 text-sm text-muted-foreground">
                {card.description}
              </CardDescription>
            </CardContent>
            
            <CardFooter>
              <Button asChild variant="ghost" className="w-full justify-between text-foreground hover:bg-background/50">
                <Link to={card.linkTo}>
                  {card.linkText}
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardFooter>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DashboardSummaryCards;
