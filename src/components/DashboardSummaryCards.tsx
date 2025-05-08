
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarDays, ClipboardList, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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
      icon: <Users className="h-8 w-8 text-blue-500" />,
      description: 'Total de pacientes cadastrados',
      linkTo: '/patients',
      linkText: 'Ver pacientes'
    },
    {
      title: 'Agendamentos Hoje',
      value: appointmentsToday,
      icon: <CalendarDays className="h-8 w-8 text-green-500" />,
      description: 'Consultas agendadas para hoje',
      linkTo: '/appointments',
      linkText: 'Ver agenda'
    },
    {
      title: 'Planos Alimentares',
      value: activePlans,
      icon: <ClipboardList className="h-8 w-8 text-purple-500" />,
      description: 'Planos alimentares ativos',
      linkTo: '/meal-plans',
      linkText: 'Ver planos'
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {summaryCards.map((card, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            {card.icon}
            <CardTitle className="text-lg font-medium">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-1/2" />
            ) : (
              <p className="text-3xl font-bold">{card.value}</p>
            )}
            <CardDescription>{card.description}</CardDescription>
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" className="text-sm w-full justify-between">
              <Link to={card.linkTo}>
                {card.linkText}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default DashboardSummaryCards;
