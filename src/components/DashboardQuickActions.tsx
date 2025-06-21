
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calculator, CalendarCheck, UserPlus, FileText, User, ChevronRight } from 'lucide-react';

const DashboardQuickActions = () => {
  const actions = [
    {
      title: 'Nova Consulta',
      description: 'Iniciar atendimento completo',
      icon: <FileText className="h-5 w-5 mr-2" />,
      link: '/clinical',
      color: 'bg-gradient-to-br from-green-100 to-green-200 text-green-800 dark:from-nutri-green/20 dark:to-nutri-green/30 dark:text-nutri-green'
    },
    {
      title: 'Agendar',
      description: 'Gerenciar compromissos',
      icon: <CalendarCheck className="h-5 w-5 mr-2" />,
      link: '/appointments',
      color: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 dark:from-primary/20 dark:to-primary/30 dark:text-primary'
    },
    {
      title: 'Novo Paciente',
      description: 'Cadastrar novo paciente',
      icon: <UserPlus className="h-5 w-5 mr-2" />,
      link: '/patients/new',
      color: 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-800 dark:from-accent/20 dark:to-accent/30 dark:text-accent-foreground'
    },
    {
      title: 'Calculadora',
      description: 'Avaliação nutricional',
      icon: <Calculator className="h-5 w-5 mr-2" />,
      link: '/calculator',
      color: 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 dark:from-yellow-500/20 dark:to-yellow-600/30 dark:text-yellow-400'
    },
    {
      title: 'Pacientes',
      description: 'Gerenciar pacientes',
      icon: <User className="h-5 w-5 mr-2" />,
      link: '/patients',
      color: 'bg-gradient-to-br from-rose-100 to-rose-200 text-rose-800 dark:from-pink-500/20 dark:to-pink-600/30 dark:text-pink-400'
    }
  ];

  return (
    <Card className="glass-card dark:bg-card dark:border-border">
      <CardHeader>
        <CardTitle className="text-glow-hover dark:text-foreground">Ações Rápidas</CardTitle>
        <CardDescription className="dark:text-muted-foreground">Acesse rapidamente as funcionalidades principais do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className={buttonVariants({
                variant: 'outline',
                className: 'h-full flex justify-between smooth-lift depth-3d glass-overlay magnetic-hover ripple-effect border-gray-200/50 dark:border-border transition-all duration-300 group dark:bg-card/50 dark:hover:bg-accent/10'
              })}
            >
              <div className="flex items-center">
                <div className={`rounded-full p-2 mr-3 transition-all duration-300 group-hover:scale-110 ${action.color}`}>
                  {action.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-sm text-glow-hover dark:text-foreground">{action.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground transition-colors duration-300">{action.description}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 dark:text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-nutri-green dark:group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardQuickActions;
