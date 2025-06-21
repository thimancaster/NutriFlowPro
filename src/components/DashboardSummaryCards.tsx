
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
      icon: <Users className="h-8 w-8 text-blue-500 dark:text-primary transition-colors duration-300" />,
      description: 'Total de pacientes cadastrados',
      linkTo: '/patients',
      linkText: 'Ver pacientes',
      gradient: 'from-blue-500/10 to-blue-600/20 dark:from-primary/10 dark:to-primary/20'
    },
    {
      title: 'Agendamentos Hoje',
      value: appointmentsToday,
      icon: <CalendarDays className="h-8 w-8 text-green-500 dark:text-nutri-green transition-colors duration-300" />,
      description: 'Consultas agendadas para hoje',
      linkTo: '/appointments',
      linkText: 'Ver agenda',
      gradient: 'from-green-500/10 to-green-600/20 dark:from-nutri-green/10 dark:to-nutri-green/20'
    },
    {
      title: 'Planos Alimentares',
      value: activePlans,
      icon: <ClipboardList className="h-8 w-8 text-purple-500 dark:text-accent-foreground transition-colors duration-300" />,
      description: 'Planos alimentares ativos',
      linkTo: '/meal-plans',
      linkText: 'Ver planos',
      gradient: 'from-purple-500/10 to-purple-600/20 dark:from-accent/10 dark:to-accent/20'
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {summaryCards.map((card, index) => (
        <Card key={index} className="slide-card-hover glass-card group border-0 relative overflow-hidden">
          {/* Background Gradient harmonizado */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-40 dark:opacity-30 transition-opacity duration-300 group-hover:opacity-60 dark:group-hover:opacity-50`} />
          
          {/* Content */}
          <div className="relative z-10">
            <CardHeader className="slide-top flex flex-row items-center justify-between pb-2">
              <div className="p-3 rounded-full bg-white/20 dark:bg-background/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                {card.icon}
              </div>
              <CardTitle className="text-lg font-medium text-glow-hover dark:text-foreground">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="slide-top">
              {isLoading ? (
                <Skeleton className="h-12 w-1/2 bg-gray-200 dark:bg-muted" />
              ) : (
                <p className="text-3xl font-bold transition-all duration-300 group-hover:scale-110 text-glow-hover dark:text-foreground">
                  {card.value}
                </p>
              )}
              <CardDescription className="mt-2 text-sm opacity-80 dark:text-muted-foreground">{card.description}</CardDescription>
            </CardContent>
            
            {/* Slide Bottom Content */}
            <div className="slide-bottom p-6 bg-gradient-to-t from-black/20 dark:from-background/20 to-transparent backdrop-blur-sm">
              <CardFooter className="p-0">
                <Button asChild variant="ghost" className="text-sm w-full justify-between side-expand text-glow-hover dark:text-foreground dark:hover:bg-accent/10">
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
