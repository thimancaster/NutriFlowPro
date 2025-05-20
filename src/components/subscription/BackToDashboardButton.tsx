
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

/**
 * Button to navigate back to the dashboard
 */
const BackToDashboardButton: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center mt-8">
      <Button 
        variant="outline"
        onClick={() => navigate('/')}
        className="mx-auto"
      >
        Voltar para o Dashboard
      </Button>
    </div>
  );
};

export default BackToDashboardButton;
