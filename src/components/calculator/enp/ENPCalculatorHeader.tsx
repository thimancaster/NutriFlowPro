import React from "react";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Info} from "lucide-react";

export const ENPCalculatorHeader: React.FC = () => {
	return (
		<Alert className="border-primary/20 bg-primary/5">
			<Info className="h-4 w-4 text-primary" />
			<AlertDescription className="text-primary/90">
				<strong>Sistema ENP v2.0:</strong> Implementação oficial da Engenharia Nutricional
				Padrão. Harris-Benedict Revisada • Fatores Fixos • Macros Padronizados •
				Distribuição 6 Refeições.
			</AlertDescription>
		</Alert>
	);
};
