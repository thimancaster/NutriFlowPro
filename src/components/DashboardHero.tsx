
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calculator } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

interface DashboardHeroProps {}

const DashboardHero: React.FC<DashboardHeroProps> = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className="hero-card bg-gradient-to-br from-nutri-green to-nutri-blue rounded-2xl p-8 text-white shadow-xl relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-xl"
          style={{ x: '-50%', y: '-50%' }}
          animate={{
            y: ['-50%', '-45%', '-50%'],
            x: ['-50%', '-45%', '-50%']
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-xl"
          style={{ x: '50%', y: '50%' }}
          animate={{
            y: ['50%', '45%', '50%'],
            x: ['50%', '45%', '50%']
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl"
          style={{ x: '-50%', y: '-50%' }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10">
        <motion.h2 
          className="text-2xl md:text-3xl font-bold mb-4"
          variants={itemVariants}
        >
          Bem-vindo ao NutriFlow Pro
        </motion.h2>
        
        <motion.p 
          className="text-lg opacity-90 mb-6 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          O sistema completo para nutricionistas que desejam otimizar seus processos e
          entregar resultados excepcionais para seus pacientes.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-3 justify-center"
          variants={itemVariants}
        >
          <AnimatedButton
            onClick={() => navigate("/calculator")}
            className="bg-white text-nutri-green hover:bg-gray-50 font-medium px-6 py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Iniciar Agora
          </AnimatedButton>
          
          <AnimatedButton
            onClick={() => navigate("/recursos")}
            variant="outline"
            className="border-white text-white hover:bg-white/10 font-medium px-6 py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Conhecer Recursos
          </AnimatedButton>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardHero;
