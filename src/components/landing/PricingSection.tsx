
import React from "react";
import {CheckCircle, Zap, BookOpen, FileText, Badge, Clock} from "lucide-react";
import {Link} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {motion} from "framer-motion";
import {SUBSCRIPTION_PRICES} from "@/constants/subscriptionConstants";
import PricingHeader from "@/components/pricing/PricingHeader";
import PricingPlan from "@/components/pricing/PricingPlan";
import PricingFooter from "@/components/pricing/PricingFooter";

const PricingSection = () => {
	return (
		<section className="py-16 md:py-24 bg-white">
			<div className="container mx-auto px-4 md:px-8">
				<PricingHeader
					title="Planos para cada necessidade"
					subtitle="Escolha o plano ideal para o seu perfil profissional"
				/>

				<div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto pt-8">
					{/* Plano Free */}
					<motion.div
						className="w-full md:w-[calc(33%-1rem)]"
						initial={{opacity: 0, y: 20}}
						whileInView={{opacity: 1, y: 0}}
						transition={{duration: 0.5}}
						viewport={{once: true}}>
						<div className="glass-card rounded-2xl backdrop-blur-sm hover-lift transition-all duration-300">
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
										className="w-full font-semibold ripple-effect"
										asChild>
										<Link to="/signup">Comece Agora</Link>
									</Button>
								}
							/>
						</div>
					</motion.div>

					{/* Plano Mensal */}
					<motion.div
						className="w-full md:w-[calc(33%-1rem)]"
						initial={{opacity: 0, y: 20}}
						whileInView={{opacity: 1, y: 0}}
						transition={{duration: 0.5, delay: 0.1}}
						viewport={{once: true}}>
						<div className="glass-card rounded-2xl backdrop-blur-sm hover-lift transition-all duration-300">
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
										className="w-full font-semibold ripple-effect"
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
						</div>
					</motion.div>

					{/* Plano Anual */}
					<motion.div
						className="w-full md:w-[calc(33%-1rem)]"
						initial={{opacity: 0, y: 20}}
						whileInView={{opacity: 1, y: 0}}
						transition={{duration: 0.5, delay: 0.2}}
						viewport={{once: true}}>
						<div className="gradient-glass rounded-2xl backdrop-blur-sm smooth-lift transition-all duration-300 relative">
							{/* Badge corrigido - posição mais alta */}
							<div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
								<div className="bg-green-600 text-white px-6 py-2 font-bold text-sm rounded-full">
									ECONOMIA DE 20%
								</div>
							</div>
							
							<PricingPlan
								title="Plano Anual"
								price={SUBSCRIPTION_PRICES.ANNUAL.formatted}
								priceDetail="/ano"
								description={`(equivale a ${SUBSCRIPTION_PRICES.ANNUAL.monthlyEquivalent}/mês)`}
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
										className="w-full font-semibold ripple-effect shimmer-effect"
										onClick={() =>
											window.open(
												"https://pay.hotmart.com/C99693448A?checkoutMode=2&off=1z0js5wf",
												"_blank"
											)
										}>
										<span className="flex flex-col items-center">
											Assinar Pro Anual
											<span className="text-xs opacity-90 mt-0.5">
												(recomendado)
											</span>
										</span>
									</Button>
								}
							/>
						</div>
					</motion.div>
				</div>

				<PricingFooter />
			</div>
		</section>
	);
};

export default PricingSection;
