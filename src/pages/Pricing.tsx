
import React from "react";
import {Helmet} from "react-helmet";
import Layout from "@/components/Layout";
import {Check, Zap, BookOpen, FileText, Badge, Clock} from "lucide-react";
import {Link} from "react-router-dom";
import {SUBSCRIPTION_PRICES} from "@/constants/subscriptionConstants";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import PricingHeader from "@/components/pricing/PricingHeader";
import PricingPlan from "@/components/pricing/PricingPlan";
import PricingFooter from "@/components/pricing/PricingFooter";
import HotmartButton from "@/components/pricing/HotmartButton";

const Pricing = () => {
	return (
		<Layout>
			<Helmet>
				<title>Planos e Preços - NutriFlow Pro</title>
			</Helmet>

			<div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
				<PricingHeader
					title="Planos para cada necessidade"
					subtitle="Escolha o plano ideal para impulsionar sua prática como nutricionista"
				/>

				<div className="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0 max-w-6xl mx-auto">
					{/* Plano Free */}
					<Card className="border-gray-200 hover:shadow-md transition-shadow flex flex-col">
						<PricingPlan
							title="Plano Free"
							price="Gratuito"
							description="Acesso básico às funcionalidades"
							features={[
								{icon: Check, text: "Até 5 pacientes"},
								{icon: Check, text: "Calculadora nutricional básica"},
								{icon: Check, text: "Histórico básico de consultas"},
							]}
							ctaButton={
								<Button
									variant="subscription-green"
									animation="shimmer"
									className="w-full font-semibold"
									asChild>
									<Link to="/signup">Comece Agora</Link>
								</Button>
							}
						/>
					</Card>

					{/* Plano Mensal */}
					<Card className="border-gray-200 hover:shadow-md transition-shadow flex flex-col">
						<PricingPlan
							title="Plano Mensal"
							price={SUBSCRIPTION_PRICES.MONTHLY.formatted}
							priceDetail="/mês"
							description="Acesso completo ao Nutriflow Pro para nutricionistas"
							features={[
								{icon: Check, text: "Pacientes ilimitados"},
								{icon: Check, text: "Ferramentas inteligentes para planos alimentares"},
								{icon: Zap, text: "Otimize seus atendimentos"},
								{icon: BookOpen, text: "Controle de pacientes e relatórios personalizados"},
							]}
							ctaButton={
								<HotmartButton
									url="https://pay.hotmart.com/C99693448A?checkoutMode=2&off=ebyhyh4d"
									variant="primary">
									Assinar Pro Mensal
								</HotmartButton>
							}
						/>
					</Card>

					{/* Plano Anual */}
					<Card className="border-nutri-blue border-2 relative hover:shadow-lg transition-shadow flex flex-col">
						<PricingPlan
							title="Plano Anual"
							price={SUBSCRIPTION_PRICES.ANNUAL.formatted}
							priceDetail="/ano"
							description={`ou ${SUBSCRIPTION_PRICES.ANNUAL.installments} no cartão`}
							badge="ECONOMIA DE 20%"
							highlighted={true}
							features={[
								{icon: Check, text: "Acesso completo ao Nutriflow Pro por 1 ano"},
								{icon: FileText, text: "Ferramentas profissionais para nutricionistas"},
								{icon: Badge, text: "Organize atendimentos e acompanhe pacientes"},
								{icon: Clock, text: "Crie planos alimentares e otimize resultados"},
								{icon: Check, text: "Desconto exclusivo de 20% no plano anual"},
							]}
							ctaButton={
								<HotmartButton
									url="https://pay.hotmart.com/C99693448A?checkoutMode=2&off=1z0js5wf"
									variant="gradient">
									<span className="flex flex-col items-center">
										Assinar Pro Anual
										<span className="text-xs opacity-90 mt-0.5">
											(recomendado)
										</span>
									</span>
								</HotmartButton>
							}
						/>
					</Card>
				</div>

				<PricingFooter />
			</div>
		</Layout>
	);
};

export default Pricing;
