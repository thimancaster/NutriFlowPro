import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { seedAllFoods } from './seedData.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SeedStats {
  total: number;
  inserted: number;
  duplicates: number;
  errors: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[SEED TACO] Starting seed process...');

    // Create Supabase client with service role (admin privileges)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('[SEED TACO] Auth error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[SEED TACO] User authenticated: ${user.email}`);

    // Check if user is admin (optional - você pode adicionar verificação de role aqui)
    // Para agora, permitimos qualquer usuário autenticado executar o seed

    // Get all foods to seed
    const foodsToSeed = seedAllFoods();
    console.log(`[SEED TACO] Preparing to seed ${foodsToSeed.length} foods...`);

    const stats: SeedStats = {
      total: foodsToSeed.length,
      inserted: 0,
      duplicates: 0,
      errors: 0
    };

    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < foodsToSeed.length; i += batchSize) {
      batches.push(foodsToSeed.slice(i, i + batchSize));
    }

    console.log(`[SEED TACO] Processing ${batches.length} batches of ${batchSize} foods each...`);

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`[SEED TACO] Processing batch ${i + 1}/${batches.length}...`);

      try {
        // Try to insert batch
        const { data, error } = await supabase
          .from('alimentos_v2')
          .upsert(batch, { 
            onConflict: 'nome',
            ignoreDuplicates: true 
          })
          .select('id');

        if (error) {
          console.error(`[SEED TACO] Batch ${i + 1} error:`, error);
          stats.errors += batch.length;
        } else {
          const insertedCount = data?.length || 0;
          stats.inserted += insertedCount;
          stats.duplicates += (batch.length - insertedCount);
          console.log(`[SEED TACO] Batch ${i + 1} completed: ${insertedCount} inserted, ${batch.length - insertedCount} duplicates`);
        }
      } catch (batchError) {
        console.error(`[SEED TACO] Batch ${i + 1} exception:`, batchError);
        stats.errors += batch.length;
      }

      // Small delay between batches to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('[SEED TACO] Seed process completed!', stats);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seed concluído! ${stats.inserted} alimentos inseridos, ${stats.duplicates} já existiam, ${stats.errors} erros.`,
        stats
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[SEED TACO] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
