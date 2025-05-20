
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
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Agendar',
      description: 'Gerenciar compromissos',
      icon: <CalendarCheck className="h-5 w-5 mr-2" />,
      link: '/appointments',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Novo Paciente',
      description: 'Cadastrar novo paciente',
      icon: <UserPlus className="h-5 w-5 mr-2" />,
      link: '/patients/new',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Calculadora',
      description: 'Avaliação nutricional',
      icon: <Calculator className="h-5 w-5 mr-2" />,
      link: '/calculator',
      color: 'bg-amber-100 text-amber-800'
    },
    {
      title: 'Pacientes',
      description: 'Gerenciar pacientes',
      icon: <User className="h-5 w-5 mr-2" />,
      link: '/patients',
      color: 'bg-rose-100 text-rose-800'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
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
                className: 'h-full flex justify-between hover:bg-gray-50 border-gray-200 transition-all'
              })}
            >
              <div className="flex items-center">
                <div className={`rounded-full p-2 mr-3 ${action.color}`}>
                  {action.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-sm">{action.title}</h3>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardQuickActions;
