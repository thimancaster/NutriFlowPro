
import React from "react";
import {CheckCircle, Zap, BookOpen, FileText, Badge, Clock, Award} from "lucide-react";
import {Link} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {motion} from "framer-motion";
import {SUBSCRIPTION_PRICES} from "@/constants/subscriptionConstants";
import PricingHeader from "@/components/pricing/PricingHeader";
import PricingPlan from "@/components/pricing/PricingPlan";
import PricingFooter from "@/components/pricing/PricingFooter";
import HotmartButton from "@/components/pricing/HotmartButton";

const PricingSection = () => {
	return (
		<section className="py-16 md:py-24 bg-blue-50">
			<div className="container mx-auto px-4 md:px-8">
				<PricingHeader
					title="Planos para cada necessidade"
					subtitle="Escolha o plano ideal para o seu perfil profissional"
				/>

				<div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
					{/* Plano Free */}
					<motion.div
						className="w-full md:w-[calc(33%-1rem)]"
						initial={{opacity: 0, y: 20}}
						whileInView={{opacity: 1, y: 0}}
						transition={{duration: 0.5}}
						viewport={{once: true}}>
						<PricingPlan
							title="Plano Free"
							price="Gratuito"
							description="Acesso básico"
							features={[
								{icon: CheckCircle, text: "Cadastro de até 10 pacientes"},
								{icon: CheckCircle, text: "Calculadora nutricional básica"},
								{icon: CheckCircle, text: "Histórico básico de consultas"},
							]}
							ctaButton={
								<Button
									variant="subscription-green"
									animation="shimmer"
									className="w-full font-semibold magnetic-hover ripple-effect smooth-lift colored-shadow-lift"
									asChild>
									<Link to="/signup">Comece Agora</Link>
								</Button>
							}
						/>
					</motion.div>

					{/* Plano Mensal */}
					<motion.div
						className="w-full md:w-[calc(33%-1rem)]"
						initial={{opacity: 0, y: 20}}
						whileInView={{opacity: 1, y: 0}}
						transition={{duration: 0.5, delay: 0.1}}
						viewport={{once: true}}>
						<PricingPlan
							title="Plano Mensal"
							price={SUBSCRIPTION_PRICES.MONTHLY.formatted}
							priceDetail="/mês"
							features={[
								{icon: CheckCircle, text: "Controle ilimitado de pacientes"},
								{icon: CheckCircle, text: "IA para criação de planos alimentares"},
								{icon: Zap, text: "Economize até 10 horas por semana"},
								{icon: BookOpen, text: "Biblioteca ampliada (+5000 alimentos)"},
								{icon: FileText, text: "Exportação de relatórios premium"},
							]}
							ctaButton={
								<Button
									variant="nutri-blue"
									animation="shimmer"
									className="w-full font-semibold magnetic-hover ripple-effect smooth-lift colored-shadow-lift"
									onClick={() =>
										window.open(
											"https://pay.hotmart.com/C99693448A?checkoutMode=2&off=ebyhyh4d",
											"_blank"
										)
									}>
									Assinar Pro Mensal
								</Button>
							}
						/>
					</motion.div>

					{/* Plano Anual */}
					<motion.div
						className="w-full md:w-[calc(33%-1rem)]"
						initial={{opacity: 0, y: 20}}
						whileInView={{opacity: 1, y: 0}}
						transition={{duration: 0.5, delay: 0.2}}
						viewport={{once: true}}>
						<PricingPlan
							title="Plano Anual"
							price={SUBSCRIPTION_PRICES.ANNUAL.formatted}
							priceDetail="/ano"
							description={`(equivale a ${SUBSCRIPTION_PRICES.ANNUAL.monthlyEquivalent}/mês)`}
							badge="ECONOMIA DE 20%"
							highlighted={true}
							features={[
								{icon: CheckCircle, text: "Controle ilimitado de pacientes"},
								{icon: CheckCircle, text: "IA para criação de planos alimentares"},
								{icon: Zap, text: "Economize até 10 horas por semana"},
								{icon: BookOpen, text: "Biblioteca ampliada (+5000 alimentos)"},
								{icon: FileText, text: "Exportação de relatórios premium"},
								{icon: Badge, text: "Selo de nutricionista premium"},
								{icon: Clock, text: "Acesso antecipado a novas funcionalidades"},
							]}
							ctaButton={
								<Button
									variant="subscription-green"
									animation="shimmer"
									className="w-full font-semibold hover-lift"
									onClick={() =>
										window.open(
											"https://pay.hotmart.com/C99693448A?checkoutMode=2&off=1z0js5wf",
											"_blank"
										)
									}>
									<span className="flex flex-col items-center relative z-10">
										Assinar Pro Anual
										<span className="text-xs opacity-90 mt-0.5">
											(recomendado)
										</span>
									</span>
								</Button>
							}
						/>
					</motion.div>
				</div>

				<PricingFooter />
			</div>
		</section>
	);
};

export default PricingSection;
