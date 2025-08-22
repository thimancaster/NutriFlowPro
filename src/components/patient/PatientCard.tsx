import React from 'react';
import { Patient } from '@/types';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface PatientCardProps {
  patient: Patient;
  onClick?: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick }) => {
  const getLastAppointmentText = () => {
    if (!patient.last_appointment) {
      return 'Sem consultas';
    }
    
    const lastAppointment = new Date(patient.last_appointment);
    const daysSince = Math.floor(
      (new Date().getTime() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSince === 0) return 'Hoje';
    if (daysSince === 1) return 'Ontem';
    if (daysSince < 30) return `${daysSince} dias atrás`;
    if (daysSince < 365) return `${Math.floor(daysSince / 30)} meses atrás`;
    return `${Math.floor(daysSince / 365)} anos atrás`;
  };

  return (
    <Card className="bg-white shadow-md rounded-lg overflow-hidden">
      <CardHeader className="flex items-center space-x-4 p-4">
        <Avatar>
          <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${patient.name}`} />
          <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">{patient.name}</h4>
          <p className="text-xs text-gray-500">{patient.email || 'Sem email'}</p>
        </div>
      </CardHeader>
      <CardContent className="p-4 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <span className="font-semibold">Idade:</span> {patient.age || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Telefone:</span> {patient.phone || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Última consulta:</span> {getLastAppointmentText()}
          </div>
          <div>
            <span className="font-semibold">Status:</span> {patient.status}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-end">
        <Link to={`/patients/${patient.id}`}>
          <Button size="sm">Ver Detalhes</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PatientCard;
