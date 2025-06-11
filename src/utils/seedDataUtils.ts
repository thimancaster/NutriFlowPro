
import { supabase } from '@/integrations/supabase/client';
import { seedTestimonials as seedTestimonialsData } from './seedTestimonials';
import { syncBrazilianFoodData } from './foodSyncUtils';
import { logger } from './logger';

// Flag to track if testimonials have been initialized in the current session
let testimonialsInitialized = false;

/**
 * Check if testimonials already exist in the database
 */
const checkTestimonialsExist = async (): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from('testimonials')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    return (count || 0) > 0;
  } catch (error) {
    logger.error('Error checking testimonials:', error);
    return false;
  }
}

/**
 * Initialize testimonials in development mode if they don't exist
 */
export const initializeTestimonials = async (): Promise<void> => {
  if (process.env.NODE_ENV !== 'development' || testimonialsInitialized) {
    return;
  }
  
  try {
    testimonialsInitialized = true;
    const testimonialsExist = await checkTestimonialsExist();
    
    if (testimonialsExist) {
      logger.info('Testimonials already exist, skipping initialization');
      return;
    }
    
    logger.info('No testimonials found, seeding initial data');
    await seedTestimonialsData();
    logger.info('Testimonials seeded successfully');
  } catch (error) {
    logger.error('Error initializing testimonials:', error);
  }
};

/**
 * Reset testimonials (for development/testing use only)
 */
export const resetTestimonials = async (): Promise<void> => {
  if (process.env.NODE_ENV !== 'development') {
    logger.warn('resetTestimonials called in production - operation not allowed');
    return;
  }
  
  try {
    const { error: deleteError } = await supabase
      .from('testimonials')
      .delete()
      .not('id', 'is', null);
      
    if (deleteError) {
      throw deleteError;
    }
    
    testimonialsInitialized = false;
    await seedTestimonialsData();
    logger.info('Testimonials reset successfully');
  } catch (error) {
    logger.error('Error resetting testimonials:', error);
  }
};

/**
 * Initialize food database with Brazilian data and sync with standardized foods
 */
export const initializeFoodDatabase = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    logger.info('Iniciando inicialização do banco de alimentos...');
    
    const { count, error: countError } = await supabase
      .from('foods')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      throw new Error(`Erro ao verificar alimentos existentes: ${countError.message}`);
    }
    
    const foodCount = count || 0;
    logger.info(`Alimentos existentes no banco: ${foodCount}`);
    
    if (foodCount > 50) {
      logger.info('Banco de alimentos já inicializado, pulando sincronização');
      return {
        success: true,
        message: `Banco de alimentos já inicializado com ${foodCount} alimentos`,
      };
    }
    
    logger.info('Executando sincronização com dados brasileiros...');
    const syncResult = await syncBrazilianFoodData();
    
    if (syncResult.success) {
      logger.info(`Sincronização bem-sucedida: ${syncResult.synced} alimentos adicionados`);
      return {
        success: true,
        message: `Banco de alimentos inicializado com sucesso. ${syncResult.synced} alimentos sincronizados.`,
        details: syncResult
      };
    } else {
      logger.warn(`Sincronização parcial: ${syncResult.synced} alimentos adicionados, ${syncResult.errors.length} erros`);
      return {
        success: false,
        message: `Sincronização parcial: ${syncResult.synced} alimentos adicionados, mas com ${syncResult.errors.length} erros.`,
        details: syncResult
      };
    }
    
  } catch (error: any) {
    logger.error('Erro na inicialização do banco de alimentos:', error);
    return {
      success: false,
      message: `Erro na inicialização: ${error.message}`,
      details: { error: error.message }
    };
  }
};

/**
 * Get food statistics from the database
 */
export const getFoodDatabaseStats = async () => {
  try {
    // Total de alimentos
    const { count: totalFoods } = await supabase
      .from('foods')
      .select('*', { count: 'exact', head: true });

    // Alimentos por categoria - buscar dados reais
    const { data: foodsData } = await supabase
      .from('foods')
      .select('food_group');

    // Processar dados para criar estatísticas por categoria
    const categoryStats: Record<string, number> = {};
    if (foodsData) {
      foodsData.forEach(food => {
        if (food.food_group) {
          categoryStats[food.food_group] = (categoryStats[food.food_group] || 0) + 1;
        }
      });
    }

    // Alimentos orgânicos
    const { count: organicFoods } = await supabase
      .from('foods')
      .select('*', { count: 'exact', head: true })
      .eq('is_organic', true);

    return {
      total: totalFoods || 0,
      organic: organicFoods || 0,
      byCategory: categoryStats,
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    logger.error('Erro ao obter estatísticas do banco de alimentos:', error);
    return {
      total: 0,
      organic: 0,
      byCategory: {} as Record<string, number>,
      lastUpdated: new Date().toISOString(),
      error: error
    };
  }
};

/**
 * Função para popular dados de alimentos aprimorados (mantida para compatibilidade)
 */
export const seedEnhancedFoodData = async () => {
  logger.info('seedEnhancedFoodData chamada - redirecionando para initializeFoodDatabase');
  return await initializeFoodDatabase();
};
