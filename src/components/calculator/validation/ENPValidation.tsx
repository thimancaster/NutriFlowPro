import React from "react";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {CheckCircle, AlertTriangle, XCircle} from "lucide-react";

interface ENPValidationProps {
	errors: string[];
	warnings: string[];
}

export const ENPValidation: React.FC<ENPValidationProps> = ({errors, warnings}) => {
	if (errors.length === 0 && warnings.length === 0) {
		return (
			<Alert className="border-green-500/20 bg-green-500/5">
				<CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
				<AlertDescription className="text-green-700 dark:text-green-300">
					✅ Todos os dados necessários para o cálculo foram informados corretamente.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-2">
			{errors.length > 0 && (
				<Alert variant="destructive">
					<XCircle className="h-4 w-4" />
					<AlertDescription>
						<strong>Dados obrigatórios faltando ou inválidos:</strong>
						<ul className="mt-1 ml-4 list-disc pl-5">
							{errors.map((error, index) => (
								<li key={index}>{error}</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			)}

			{warnings.length > 0 && (
				<Alert className="border-amber-500/20 bg-amber-500/5">
					<AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
					<AlertDescription className="text-amber-700 dark:text-amber-300">
						<strong>Atenção:</strong>
						<ul className="mt-1 ml-4 list-disc pl-5">
							{warnings.map((warning, index) => (
								<li key={index}>{warning}</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
};
