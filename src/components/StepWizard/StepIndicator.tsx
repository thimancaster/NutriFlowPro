
import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const StepIndicator = ({ steps, currentStep, onStepClick }: StepIndicatorProps) => {
  return (
    <div className="w-full py-4 mb-6">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step Circle */}
            <div 
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all relative",
                index < currentStep 
                  ? "bg-nutri-green border-nutri-green text-white" 
                  : index === currentStep 
                    ? "border-nutri-blue bg-white text-nutri-blue"
                    : "border-border bg-white text-muted-foreground"
              )}
              onClick={() => onStepClick && index < currentStep && onStepClick(index)}
              style={{ cursor: onStepClick && index < currentStep ? 'pointer' : 'default' }}
            >
              {index < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
              
              {/* Step Label */}
              <span 
                className={cn(
                  "absolute -bottom-7 whitespace-nowrap text-xs font-medium",
                  index === currentStep ? "text-nutri-blue" : "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  "w-12 h-0.5 mx-1", 
                  index < currentStep ? "bg-nutri-green" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
