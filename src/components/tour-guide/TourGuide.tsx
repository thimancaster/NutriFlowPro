
import React, { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const tourSteps: Step[] = [
  {
    target: "body",
    content: "Bem-vindo ao NutriFlow Pro! Vamos fazer um tour rápido pelas principais funcionalidades.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: ".dashboard-section",
    content: "Este é seu Dashboard. Aqui você tem uma visão geral dos seus pacientes e agendamentos.",
    placement: "bottom",
  },
  {
    target: ".patients-link",
    content: "Aqui você acessa todos os seus pacientes cadastrados e pode adicionar novos.",
    placement: "right",
  },
  {
    target: ".calculator-link",
    content: "Use nossa calculadora nutricional para definir as necessidades calóricas e macronutrientes dos seus pacientes.",
    placement: "right",
  },
  {
    target: ".meal-plans-link",
    content: "Crie planos alimentares personalizados baseados nos resultados dos cálculos nutricionais.",
    placement: "right",
  },
  {
    target: ".appointments-link",
    content: "Gerencie seus agendamentos e consultas nesta seção.",
    placement: "right",
  },
];

interface TourGuideProps {
  showForFirstLogin?: boolean;
}

export const TourGuide: React.FC<TourGuideProps> = ({ showForFirstLogin = true }) => {
  const [run, setRun] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useLocalStorage("tour-completed", false);

  useEffect(() => {
    // Check if this is first login and tour hasn't been completed
    const shouldShowTour = showForFirstLogin && !tourCompleted;
    if (shouldShowTour) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        setRun(true);
        setHasSeenTour(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [showForFirstLogin, tourCompleted]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    // Fixed: Check if status is included in finishedStatuses array
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      setTourCompleted(true);
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={tourSteps}
      styles={{
        options: {
          zIndex: 10000,
        },
        buttonBack: {
          backgroundColor: "#f1f5f9",
          color: "#64748b",
        },
        buttonNext: {
          backgroundColor: "#16a34a",
        },
        buttonSkip: {
          color: "#64748b",
        },
      }}
    />
  );
};

export const TourTriggerButton: React.FC = () => {
  const [run, setRun] = useState(false);
  
  return (
    <>
      <button 
        className="text-sm text-muted-foreground hover:text-foreground"
        onClick={() => setRun(true)}
      >
        Iniciar tour guiado
      </button>
      {run && (
        <TourGuide showForFirstLogin={false} />
      )}
    </>
  );
};
