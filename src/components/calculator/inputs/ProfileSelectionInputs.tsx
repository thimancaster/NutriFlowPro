
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROFILE_OPTIONS } from '../utils/profileUtils';

interface ProfileSelectionInputsProps {
  profile?: string;
  setProfile?: (profile: string) => void;
  activityLevel: string;
  setActivityLevel: (level: string) => void;
  objective: string;
  setObjective: (objective: string) => void;
  consultationType: string;
  setConsultationType: (type: string) => void;
}

const ProfileSelectionInputs: React.FC<ProfileSelectionInputsProps> = ({
  profile,
  setProfile,
  activityLevel,
  setActivityLevel,
  objective,
  setObjective,
  consultationType,
  setConsultationType
}) => {
  console.log('ProfileSelectionInputs - Current profile:', profile);

  return (
    <>
      {/* Profile and Activity Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Patient Profile - Valores padronizados */}
        {setProfile && (
          <div className="space-y-2">
            <Label htmlFor="profile">Perfil Corporal</Label>
            <Select 
              value={profile} 
              onValueChange={(value) => {
                console.log('Profile selection changed:', value);
                setProfile(value);
              }}
            >
              <SelectTrigger id="profile" className="bg-background border-border">
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border shadow-lg z-50">
                <SelectGroup>
                  {PROFILE_OPTIONS.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="hover:bg-accent hover:text-accent-foreground"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Activity Level */}
        <div className="space-y-2">
          <Label htmlFor="activityLevel">Nível de Atividade</Label>
          <Select value={activityLevel} onValueChange={setActivityLevel}>
            <SelectTrigger id="activityLevel" className="bg-background border-border">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground border-border shadow-lg z-50">
              <SelectGroup>
                <SelectItem value="sedentario" className="hover:bg-accent hover:text-accent-foreground">Sedentário (1.2)</SelectItem>
                <SelectItem value="leve" className="hover:bg-accent hover:text-accent-foreground">Levemente Ativo (1.375)</SelectItem>
                <SelectItem value="moderado" className="hover:bg-accent hover:text-accent-foreground">Moderadamente Ativo (1.55)</SelectItem>
                <SelectItem value="intenso" className="hover:bg-accent hover:text-accent-foreground">Muito Ativo (1.725)</SelectItem>
                <SelectItem value="muito_intenso" className="hover:bg-accent hover:text-accent-foreground">Extremamente Ativo (1.9)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        {/* Objective */}
        <div className="space-y-2">
          <Label htmlFor="objective">Objetivo</Label>
          <Select value={objective} onValueChange={setObjective}>
            <SelectTrigger id="objective" className="bg-background border-border">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground border-border shadow-lg z-50">
              <SelectGroup>
                <SelectItem value="emagrecimento" className="hover:bg-accent hover:text-accent-foreground">Emagrecimento</SelectItem>
                <SelectItem value="manutenção" className="hover:bg-accent hover:text-accent-foreground">Manutenção</SelectItem>
                <SelectItem value="hipertrofia" className="hover:bg-accent hover:text-accent-foreground">Hipertrofia</SelectItem>
                <SelectItem value="saúde" className="hover:bg-accent hover:text-accent-foreground">Saúde</SelectItem>
                <SelectItem value="desempenho" className="hover:bg-accent hover:text-accent-foreground">Desempenho</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Consultation Type */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="consultationType">Tipo de Consulta</Label>
          <Select value={consultationType} onValueChange={setConsultationType}>
            <SelectTrigger id="consultationType" className="bg-background border-border">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground border-border shadow-lg z-50">
              <SelectGroup>
                <SelectItem value="primeira_consulta" className="hover:bg-accent hover:text-accent-foreground">Primeira Consulta</SelectItem>
                <SelectItem value="retorno" className="hover:bg-accent hover:text-accent-foreground">Retorno</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default ProfileSelectionInputs;
