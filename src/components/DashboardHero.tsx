import React from "react";
import {useNavigate} from "react-router-dom";
import {ArrowRight, Calculator} from "lucide-react";

interface DashboardHeroProps {}

const DashboardHero: React.FC<DashboardHeroProps> = () => {
	const navigate = useNavigate();

	return (
		<div className="hero-card bg-gradient-to-br from-nutri-green to-nutri-blue rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
			{/* Background decorative elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl animate-float"></div>
				<div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2 blur-xl float-animation"></div>
				<div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
			</div>

			<div className="relative z-10">
				<h2 className="text-2xl md:text-3xl font-bold mb-4 animate-fade-in">
					Bem-vindo ao NutriFlow Pro
				</h2>
				<p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
					O sistema completo para nutricionistas que desejam otimizar seus processos e
					entregar resultados excepcionais para seus pacientes.
				</p>

				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<button
						className="hero-button px-6 py-3 rounded-md text-white font-medium flex items-center justify-center gap-2"
						onClick={() => navigate("/calculator")}>
						<Calculator className="h-4 w-4" />
						Iniciar Agora
					</button>
					<button
						className="hero-button px-6 py-3 rounded-md text-white font-medium flex items-center justify-center gap-2"
						onClick={() => navigate("/recursos")}>
						<ArrowRight className="h-4 w-4" />
						Conhecer Recursos
					</button>
				</div>
			</div>
		</div>
	);
};

export default DashboardHero;
