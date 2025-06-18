
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  return (
    <>
      {/* Profile and Activity Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Patient Profile - Valores padronizados */}
        {setProfile && (
          <div className="space-y-2">
            <Label htmlFor="profile">Perfil</Label>
            <Select value={profile} onValueChange={setProfile}>
              <SelectTrigger id="profile">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="eutrofico">Eutrófico</SelectItem>
                  <SelectItem value="sobrepeso_obesidade">Sobrepeso/Obesidade</SelectItem>
                  <SelectItem value="atleta">Atleta</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Activity Level */}
        <div className="space-y-2">
          <Label htmlFor="activityLevel">Nível de Atividade</Label>
          <Select value={activityLevel} onValueChange={setActivityLevel}>
            <SelectTrigger id="activityLevel">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="sedentario">Sedentário (1.2)</SelectItem>
                <SelectItem value="leve">Levemente Ativo (1.375)</SelectItem>
                <SelectItem value="moderado">Moderadamente Ativo (1.55)</SelectItem>
                <SelectItem value="intenso">Muito Ativo (1.725)</SelectItem>
                <SelectItem value="muito_intenso">Extremamente Ativo (1.9)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        {/* Objective */}
        <div className="space-y-2">
          <Label htmlFor="objective">Objetivo</Label>
          <Select value={objective} onValueChange={setObjective}>
            <SelectTrigger id="objective">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                <SelectItem value="manutenção">Manutenção</SelectItem>
                <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                <SelectItem value="saúde">Saúde</SelectItem>
                <SelectItem value="desempenho">Desempenho</SelectItem>
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
            <SelectTrigger id="consultationType">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="primeira_consulta">Primeira Consulta</SelectItem>
                <SelectItem value="retorno">Retorno</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default ProfileSelectionInputs;
