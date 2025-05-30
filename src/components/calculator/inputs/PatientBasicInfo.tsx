
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PatientBasicInfoProps {
  patientName: string;
  setPatientName: (name: string) => void;
  gender: string;
  setGender: (gender: string) => void;
  age: string;
  setAge: (age: string) => void;
}

const PatientBasicInfo: React.FC<PatientBasicInfoProps> = ({
  patientName,
  setPatientName,
  gender,
  setGender,
  age,
  setAge
}) => {
  return (
    <>
      {/* Patient Name */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientName">Nome do Paciente</Label>
          <Input
            id="patientName"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Nome completo"
            className="w-full"
          />
        </div>
      </div>
      
      {/* Basic Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender">Sexo</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Feminino</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age">
            Idade <span className="text-red-500">*</span>
          </Label>
          <Input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Anos"
            className="w-full"
            min="1"
            max="120"
          />
        </div>
      </div>
    </>
  );
};

export default PatientBasicInfo;
