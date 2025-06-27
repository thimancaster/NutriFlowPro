
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calculator } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
      y: 0
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
            ease: [0.42, 0, 0.58, 1]
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
            ease: [0.42, 0, 0.58, 1]
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
            ease: [0.42, 0, 0.58, 1]
          }}
        />
      </div>

      <div className="relative z-10">
        <motion.h2 
          className="text-2xl md:text-3xl font-bold mb-4"
          variants={itemVariants}
          transition={{
            duration: 0.5,
            ease: [0, 0, 0.58, 1]
          }}
        >
          Bem-vindo ao NutriFlow Pro
        </motion.h2>
        
        <motion.p 
          className="text-lg opacity-90 mb-6 max-w-2xl mx-auto"
          variants={itemVariants}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease: [0, 0, 0.58, 1]
          }}
        >
          O sistema completo para nutricionistas que desejam otimizar seus processos e
          entregar resultados excepcionais para seus pacientes.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={itemVariants}
          transition={{
            duration: 0.5,
            delay: 0.2,
            ease: [0, 0, 0.58, 1]
          }}
        >
          <Button
            variant="subscription-green"
            animation="shimmer"
            onClick={() => navigate("/calculator")}
            className="magnetic-hover ripple-effect smooth-lift px-8 py-6 text-lg font-semibold"
          >
            <Calculator className="h-5 w-5 mr-2" />
            Iniciar Agora
          </Button>
          
          <Button
            variant="nutri-blue"
            animation="shimmer"
            onClick={() => navigate("/recursos")}
            className="magnetic-hover ripple-effect smooth-lift px-8 py-6 text-lg font-semibold"
          >
            <ArrowRight className="h-5 w-5 mr-2" />
            Conhecer Recursos
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardHero;
