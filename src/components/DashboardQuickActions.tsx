
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
      color: 'bg-gradient-to-br from-green-100 to-green-200 text-green-800 dark:from-emerald-900/30 dark:to-emerald-800/30 dark:text-emerald-300'
    },
    {
      title: 'Agendar',
      description: 'Gerenciar compromissos',
      icon: <CalendarCheck className="h-5 w-5 mr-2" />,
      link: '/appointments',
      color: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-300'
    },
    {
      title: 'Novo Paciente',
      description: 'Cadastrar novo paciente',
      icon: <UserPlus className="h-5 w-5 mr-2" />,
      link: '/patients/new',
      color: 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-800 dark:from-purple-900/30 dark:to-purple-800/30 dark:text-purple-300'
    },
    {
      title: 'Calculadora',
      description: 'Avaliação nutricional',
      icon: <Calculator className="h-5 w-5 mr-2" />,
      link: '/calculator',
      color: 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 dark:from-amber-900/30 dark:to-amber-800/30 dark:text-amber-300'
    },
    {
      title: 'Pacientes',
      description: 'Gerenciar pacientes',
      icon: <User className="h-5 w-5 mr-2" />,
      link: '/patients',
      color: 'bg-gradient-to-br from-rose-100 to-rose-200 text-rose-800 dark:from-rose-900/30 dark:to-rose-800/30 dark:text-rose-300'
    }
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-glow-hover">Ações Rápidas</CardTitle>
        <CardDescription>Acesse rapidamente as funcionalidades principais do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className={buttonVariants({
                variant: 'outline',
                className: 'h-full flex justify-between smooth-lift depth-3d glass-overlay magnetic-hover ripple-effect border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 group'
              })}
            >
              <div className="flex items-center">
                <div className={`rounded-full p-2 mr-3 transition-all duration-300 group-hover:scale-110 ${action.color}`}>
                  {action.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-sm text-glow-hover">{action.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{action.description}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-nutri-green dark:group-hover:text-dark-accent-green" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardQuickActions;
