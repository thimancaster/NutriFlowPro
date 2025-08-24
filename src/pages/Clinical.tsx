import React from "react";
import {useNavigate} from "react-router-dom";
import {RotateCcw, User} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {usePatient} from "@/contexts/patient/PatientContext";
import ClinicalWorkflow from "@/components/clinical/ClinicalWorkflow";

const Clinical = () => {
	const navigate = useNavigate();
	const {activePatient, endPatientSession} = usePatient();

	const handleChangePatient = () => {
		endPatientSession();
	};

	return (
		<div className="space-y-6">
			{/* Patient Status Bar */}
			{activePatient && (
				<Card className="bg-nutri-light border-nutri-green">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-nutri-green rounded-full flex items-center justify-center">
									<User className="h-5 w-5 text-white" />
								</div>
								<div>
									<h3 className="font-semibold text-lg">{activePatient.name}</h3>
									<p className="text-sm text-muted-foreground">
										{activePatient.age ? `${activePatient.age} anos` : ""} •{" "}
										{activePatient.gender === "male"
											? "Masculino"
											: activePatient.gender === "female"
											? "Feminino"
											: "Outro"}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={handleChangePatient}
									className="flex items-center gap-2">
									<RotateCcw className="h-4 w-4" />
									Trocar Paciente
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			<ClinicalWorkflow />
		</div>
	);
};

export default Clinical;
