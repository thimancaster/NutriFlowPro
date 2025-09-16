
import * as React from "react";
import { format, subYears } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface BirthDatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
  error?: string;
  onBlur?: () => void;
  label?: string;
}

export function BirthDatePicker({ 
  value, 
  onChange, 
  className,
  placeholder = "Selecione a data de nascimento", 
  error,
  onBlur,
  label
}: BirthDatePickerProps) {
  const [inputValue, setInputValue] = React.useState<string>(
    value ? format(value, "dd/MM/yyyy") : ""
  );
  
  // Update input value when value prop changes
  React.useEffect(() => {
    if (value) {
      setInputValue(format(value, "dd/MM/yyyy"));
    } else {
      setInputValue("");
    }
  }, [value]);
  
  // Parse input date manually
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);
    
    // If input is cleared
    if (!rawValue) {
      onChange(undefined);
      return;
    }
    
    // Apply mask DD/MM/YYYY
    if (rawValue.length <= 10) {
      let formattedValue = rawValue.replace(/\D/g, "");
      
      if (formattedValue.length > 0) {
        formattedValue = formattedValue.substring(0, 8);
        
        // Format as DD/MM/YYYY
        if (formattedValue.length > 4) {
          formattedValue = `${formattedValue.substring(0, 2)}/${formattedValue.substring(2, 4)}/${formattedValue.substring(4)}`;
        } else if (formattedValue.length > 2) {
          formattedValue = `${formattedValue.substring(0, 2)}/${formattedValue.substring(2)}`;
        }
        
        // Only update if format changed
        if (formattedValue !== rawValue) {
          setInputValue(formattedValue);
        }
      }
    }
    
    // Try to parse the date
    if (rawValue.length === 10) {
      const parts = rawValue.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          const date = new Date(year, month, day);
          
          // Check if this is a valid date
          if (
            date.getDate() === day &&
            date.getMonth() === month &&
            date.getFullYear() === year &&
            date <= new Date() && 
            date >= new Date(1900, 0, 1)
          ) {
            onChange(date);
          }
        }
      }
    }
  };
  
  // Calculate years to display in the calendar
  const from = React.useMemo(() => subYears(new Date(), 100), []);
  const to = React.useMemo(() => new Date(), []);
  
  return (
    <div className="space-y-2">
      <Popover>
        <div className="relative">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={cn(
              "pr-10", 
              error && "border-red-500",
              className
            )}
            onBlur={onBlur}
          />
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
              type="button"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="sr-only">Abrir calendário</span>
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            initialFocus
            captionLayout="dropdown"
            fromYear={1920}
            toYear={new Date().getFullYear()}
            className="p-3 pointer-events-auto"
            defaultMonth={value || subYears(new Date(), 30)}
            footer={
              <div className="px-4 pb-3 pt-0 text-xs text-muted-foreground">
                Use os controles acima para navegar por diferentes anos e meses
              </div>
            }
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
