
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper for logging steps
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Create Supabase client using the anon key for auth verification
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Extract the access token from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    
    // Verify authentication and get user
    logStep("Verifying authentication");
    const { data, error } = await supabaseClient.auth.getUser(token);
    if (error) throw error;
    
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { id: user.id, email: user.email });

    // Parse request body
    const { priceId = "price_1OjYjCHzfnR3nJy6kL0pPqEy", returnUrl } = await req.json();
    logStep("Request params", { priceId, returnUrl });
    
    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer already exists
    logStep("Checking for existing Stripe customer");
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      logStep("Found existing customer", { id: customers.data[0].id });
      customerId = customers.data[0].id;
      
      // Check if user already has an active subscription
      logStep("Checking for active subscriptions");
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1
      });
      
      if (subscriptions.data.length > 0) {
        logStep("User already has active subscription", { id: subscriptions.data[0].id });
        
        // Create a customer portal session instead of checkout
        const session = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: returnUrl || new URL(req.url).origin,
        });
        
        logStep("Created billing portal session", { url: session.url });
        return new Response(JSON.stringify({ url: session.url }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    // Create Stripe checkout session for subscription
    logStep("Creating checkout session");
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId, // Use the provided price ID or default
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${returnUrl || new URL(req.url).origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl || new URL(req.url).origin}/subscription-canceled`,
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
      metadata: {
        user_id: user.id,
      },
    });
    
    logStep("Checkout session created", { id: session.id, url: session.url });

    // Create or update subscriber entry in Supabase
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseServiceKey) {
      logStep("Updating subscriber record");
      
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
      });
      
      // Upsert subscriber entry - this will create if not exists or update if exists
      const { error: upsertError } = await supabaseAdmin
        .from("subscribers")
        .upsert({
          user_id: user.id,
          email: user.email,
          is_premium: false, // Will be updated when payment is confirmed
          role: 'user',
          updated_at: new Date().toISOString()
        }, 
        { onConflict: 'user_id' });
      
      if (upsertError) {
        logStep("Error updating subscriber record", { error: upsertError.message });
      } else {
        logStep("Subscriber record updated successfully");
      }
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
