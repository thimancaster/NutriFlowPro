
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  to?: string;
  label?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export const BackButton = ({ 
  to, 
  label = "Voltar", 
  variant = "outline" 
}: BackButtonProps) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };
  
  return (
    <Button 
      onClick={handleBack}
      variant={variant}
      size="sm"
      className="flex items-center gap-1"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
};
