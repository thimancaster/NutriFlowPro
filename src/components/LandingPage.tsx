
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { ArrowRight, CheckCircle, Star, Users, Calculator, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardTestimonials from './DashboardTestimonials';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-blue-50 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="text-nutri-green">Nutri</span>
                <span className="text-nutri-blue">Flow Pro</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-medium text-gray-700 mb-6">
                Sistema completo de gestão para nutricionistas
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Transforme sua prática nutricional com nossa plataforma completa. Gerencie pacientes, crie planos alimentares personalizados e acompanhe resultados em tempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button 
                    className="bg-gradient-to-r from-nutri-green to-nutri-green-dark hover:opacity-90 text-white font-medium px-8 py-6 text-lg w-full sm:w-auto"
                  >
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    className="border-nutri-blue text-nutri-blue hover:bg-nutri-blue hover:text-white px-8 py-6 text-lg w-full sm:w-auto"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80"
                alt="Nutricionista trabalhando"
                className="rounded-xl shadow-2xl w-full"
                fallbackSrc="/placeholder.svg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Transforme sua prática nutricional</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Com ferramentas poderosas projetadas especificamente para profissionais de nutrição
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 shadow-lg border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="bg-nutri-green/10 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-nutri-green" />
              </div>
              <h3 className="text-xl font-bold mb-4">Gerenciamento de Pacientes</h3>
              <p className="text-gray-600 mb-6">
                Cadastre pacientes, acompanhe seu progresso e mantenha todos os registros organizados em um só lugar.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Fichas completas de pacientes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Histórico de atendimentos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Acompanhamento antropométrico</span>
                </li>
              </ul>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 shadow-lg border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-nutri-blue/10 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Calculator className="h-8 w-8 text-nutri-blue" />
              </div>
              <h3 className="text-xl font-bold mb-4">Calculadora Nutricional</h3>
              <p className="text-gray-600 mb-6">
                Calcule com precisão as necessidades nutricionais dos seus pacientes com nossa calculadora avançada.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">IMC, TMB, necessidade calórica</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Distribuição de macronutrientes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Cálculos personalizados</span>
                </li>
              </ul>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 shadow-lg border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Planos Alimentares</h3>
              <p className="text-gray-600 mb-6">
                Crie planos alimentares personalizados de forma rápida e eficiente para cada paciente.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Modelos personalizáveis</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Gerador por IA (Premium)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-nutri-green mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Exportação em PDF</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-blue-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos para cada necessidade</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Escolha o plano ideal para o seu perfil profissional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Plano Básico</h3>
                <p className="text-nutri-blue text-lg font-medium">Gratuito</p>
                <p className="text-gray-500 mt-2">Ideal para começar</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                  <span className="text-gray-600">Calculadora nutricional básica</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                  <span className="text-gray-600">Controle de 10 pacientes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                  <span className="text-gray-600">Criação de planos alimentares simples</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-nutri-green mr-2" />
                  <span className="text-gray-600">Histórico básico de consultas</span>
                </li>
              </ul>
              
              <Link to="/signup">
                <Button 
                  className="w-full bg-nutri-blue text-white hover:bg-nutri-blue-dark transition-colors"
                >
                  Começar Gratuitamente
                </Button>
              </Link>
            </motion.div>
            
            {/* Premium Plan */}
            <motion.div 
              className="bg-gradient-to-br from-nutri-blue to-nutri-blue-dark rounded-xl shadow-lg p-8 border border-blue-400 transform hover:scale-105 transition-transform"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-6">
                <div className="flex justify-center items-center mb-2">
                  <Star className="h-6 w-6 text-yellow-300 fill-yellow-300" />
                  <h3 className="text-2xl font-bold text-white ml-2">Plano Premium</h3>
                </div>
                <p className="text-white text-lg font-medium">R$ 97,00 <span className="text-sm font-normal">/mês</span></p>
                <p className="text-blue-100 mt-2">Recursos completos</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-yellow-300 mr-2" />
                  <span className="text-white">Calculadora nutricional avançada</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-yellow-300 mr-2" />
                  <span className="text-white">Controle ilimitado de pacientes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-yellow-300 mr-2" />
                  <span className="text-white">IA para criação de planos alimentares</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-yellow-300 mr-2" />
                  <span className="text-white">Histórico completo de consultas</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-yellow-300 mr-2" />
                  <span className="text-white">Exportação de relatórios em PDF</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-yellow-300 mr-2" />
                  <span className="text-white">Suporte premium 24/7</span>
                </li>
              </ul>
              
              <Link to="/signup?plan=premium">
                <Button 
                  className="w-full bg-white text-nutri-blue hover:bg-nutri-gray-light transition-colors"
                >
                  Assinar Premium
                </Button>
              </Link>
              
              <p className="text-center text-blue-100 text-sm mt-4">
                7 dias de garantia de devolução do dinheiro
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">O que dizem nossos usuários</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Nutricionistas que transformaram sua prática com o NutriFlow Pro
            </p>
          </div>
          
          <DashboardTestimonials />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-nutri-green/10 to-nutri-blue/10">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para transformar sua prática?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Junte-se a milhares de nutricionistas que já estão usando o NutriFlow Pro para otimizar seu trabalho e melhorar os resultados dos pacientes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button 
                  className="bg-gradient-to-r from-nutri-green to-nutri-green-dark hover:opacity-90 text-white font-medium px-8 py-6 text-lg"
                >
                  Criar Conta Gratuita
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  variant="outline" 
                  className="border-nutri-blue text-nutri-blue hover:bg-nutri-blue hover:text-white px-8 py-6 text-lg"
                >
                  Fazer Login
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
