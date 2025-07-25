
import React from 'react';
import { CheckCircle, Users, Calculator, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 text-glow-hover">Transforme sua prática nutricional</h2>
          <p className="text-lg text-gray-800 max-w-3xl mx-auto">
            Com ferramentas poderosas projetadas especificamente para profissionais de nutrição
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <motion.div 
            className="glass-card rounded-2xl p-8 backdrop-blur-sm border border-white/20 hover-lift transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mb-6 float-hover scale-bounce">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 text-glow-hover">Gerenciamento de Pacientes</h3>
            <p className="text-gray-800 mb-6">
              Cadastre pacientes, acompanhe seu progresso e mantenha todos os registros organizados em um só lugar.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5 float-hover" />
                <span className="text-gray-800">Fichas completas de pacientes</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5 float-hover" />
                <span className="text-gray-800">Histórico de atendimentos</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5 float-hover" />
                <span className="text-gray-800">Acompanhamento antropométrico</span>
              </li>
            </ul>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            className="glass-card rounded-2xl p-8 backdrop-blur-sm border border-white/20 hover-lift transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mb-6 float-hover scale-bounce">
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 text-glow-hover">Calculadora Nutricional</h3>
            <p className="text-gray-800 mb-6">
              Calcule com precisão as necessidades nutricionais dos seus pacientes com nossa calculadora avançada.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5 float-hover" />
                <span className="text-gray-800">IMC, TMB, necessidade calórica</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5 float-hover" />
                <span className="text-gray-800">Distribuição de macronutrientes</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5 float-hover" />
                <span className="text-gray-800">Cálculos personalizados</span>
              </li>
            </ul>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            className="glass-card rounded-2xl p-8 backdrop-blur-sm border border-white/20 hover-lift transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-amber-50 rounded-full w-16 h-16 flex items-center justify-center mb-6 float-hover scale-bounce">
              <FileText className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 text-glow-hover">Planos Alimentares</h3>
            <p className="text-gray-800 mb-6">
              Crie planos alimentares personalizados de forma rápida e eficiente para cada paciente.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5 float-hover" />
                <span className="text-gray-800">Modelos personalizáveis</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5 float-hover" />
                <span className="text-gray-800">Gerador por IA (Premium)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5 float-hover" />
                <span className="text-gray-800">Exportação em PDF</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
