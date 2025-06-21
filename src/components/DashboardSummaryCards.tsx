
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
      icon: <Users className="h-8 w-8 text-blue-500 dark:text-blue-400 transition-colors duration-300" />,
      description: 'Total de pacientes cadastrados',
      linkTo: '/patients',
      linkText: 'Ver pacientes',
      gradient: 'from-blue-500/10 to-blue-600/20 dark:from-blue-400/10 dark:to-blue-500/20'
    },
    {
      title: 'Agendamentos Hoje',
      value: appointmentsToday,
      icon: <CalendarDays className="h-8 w-8 text-green-500 dark:text-green-400 transition-colors duration-300" />,
      description: 'Consultas agendadas para hoje',
      linkTo: '/appointments',
      linkText: 'Ver agenda',
      gradient: 'from-green-500/10 to-green-600/20 dark:from-emerald-400/10 dark:to-emerald-500/20'
    },
    {
      title: 'Planos Alimentares',
      value: activePlans,
      icon: <ClipboardList className="h-8 w-8 text-purple-500 dark:text-purple-400 transition-colors duration-300" />,
      description: 'Planos alimentares ativos',
      linkTo: '/meal-plans',
      linkText: 'Ver planos',
      gradient: 'from-purple-500/10 to-purple-600/20 dark:from-purple-400/10 dark:to-purple-500/20'
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {summaryCards.map((card, index) => (
        <Card key={index} className="slide-card-hover glass-card group border-0 relative overflow-hidden">
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50 transition-opacity duration-300 group-hover:opacity-70`} />
          
          {/* Content */}
          <div className="relative z-10">
            <CardHeader className="slide-top flex flex-row items-center justify-between pb-2">
              <div className="p-3 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                {card.icon}
              </div>
              <CardTitle className="text-lg font-medium text-glow-hover">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="slide-top">
              {isLoading ? (
                <Skeleton className="h-12 w-1/2" />
              ) : (
                <p className="text-3xl font-bold transition-all duration-300 group-hover:scale-110 text-glow-hover">
                  {card.value}
                </p>
              )}
              <CardDescription className="mt-2 text-sm opacity-80">{card.description}</CardDescription>
            </CardContent>
            
            {/* Slide Bottom Content */}
            <div className="slide-bottom p-6 bg-gradient-to-t from-black/20 to-transparent backdrop-blur-sm">
              <CardFooter className="p-0">
                <Button asChild variant="ghost" className="text-sm w-full justify-between side-expand text-glow-hover">
                  <Link to={card.linkTo}>
                    {card.linkText}
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DashboardSummaryCards;
