
import React from 'react';
import { CheckCircle, Users, Calculator, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Transforme sua prática nutricional</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Com ferramentas poderosas projetadas especificamente para profissionais de nutrição
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <motion.div 
            className="bg-card rounded-xl p-8 shadow-lg border border-border hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="bg-nutri-green/10 rounded-full w-16 h-16 flex items-center justify-center mb-6 border border-nutri-green/20">
              <Users className="h-8 w-8 text-nutri-green" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-card-foreground">Gerenciamento de Pacientes</h3>
            <p className="text-muted-foreground mb-6">
              Cadastre pacientes, acompanhe seu progresso e mantenha todos os registros organizados em um só lugar.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Fichas completas de pacientes</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Histórico de atendimentos</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Acompanhamento antropométrico</span>
              </li>
            </ul>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            className="bg-card rounded-xl p-8 shadow-lg border border-border hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-nutri-blue/10 rounded-full w-16 h-16 flex items-center justify-center mb-6 border border-nutri-blue/20">
              <Calculator className="h-8 w-8 text-nutri-blue" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-card-foreground">Calculadora Nutricional</h3>
            <p className="text-muted-foreground mb-6">
              Calcule com precisão as necessidades nutricionais dos seus pacientes com nossa calculadora avançada.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">IMC, TMB, necessidade calórica</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Distribuição de macronutrientes</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Cálculos personalizados</span>
              </li>
            </ul>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            className="bg-card rounded-xl p-8 shadow-lg border border-border hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-amber-500/10 rounded-full w-16 h-16 flex items-center justify-center mb-6 border border-amber-500/20">
              <FileText className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-card-foreground">Planos Alimentares</h3>
            <p className="text-muted-foreground mb-6">
              Crie planos alimentares personalizados de forma rápida e eficiente para cada paciente.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Modelos personalizáveis</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Gerador por IA (Premium)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Exportação em PDF</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
