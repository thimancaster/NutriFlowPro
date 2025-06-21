
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
      icon: <FileText className="h-5 w-5" />,
      link: '/clinical',
      color: 'text-nutri-green'
    },
    {
      title: 'Agendar',
      description: 'Gerenciar compromissos',
      icon: <CalendarCheck className="h-5 w-5" />,
      link: '/appointments',
      color: 'text-nutri-blue'
    },
    {
      title: 'Novo Paciente',
      description: 'Cadastrar novo paciente',
      icon: <UserPlus className="h-5 w-5" />,
      link: '/patients/new',
      color: 'text-primary'
    },
    {
      title: 'Calculadora',
      description: 'Avaliação nutricional',
      icon: <Calculator className="h-5 w-5" />,
      link: '/calculator',
      color: 'text-secondary-foreground'
    },
    {
      title: 'Pacientes',
      description: 'Gerenciar pacientes',
      icon: <User className="h-5 w-5" />,
      link: '/patients',
      color: 'text-muted-foreground'
    }
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Ações Rápidas</CardTitle>
        <CardDescription className="text-muted-foreground">
          Acesse rapidamente as funcionalidades principais do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className={buttonVariants({
                variant: 'outline',
                className: 'h-full flex justify-between transition-all duration-300 group hover:shadow-md'
              })}
            >
              <div className="flex items-center">
                <div className={`rounded-full p-2 mr-3 transition-all duration-300 group-hover:scale-110 ${action.color}`}>
                  {action.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-sm text-foreground">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardQuickActions;
