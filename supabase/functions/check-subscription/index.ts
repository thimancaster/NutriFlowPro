
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Define developer and premium emails
const DEVELOPER_EMAILS = ['thimancaster@hotmail.com'];
const PREMIUM_EMAILS = ['thiago@nutriflowpro.com'];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes in Supabase
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase configuration" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
  
  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

    // Check for existing subscriber data
    const { data: existingSubscriber } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // If we have cached data from the last 5 minutes, use it
    if (existingSubscriber) {
      const updatedAtTime = new Date(existingSubscriber.updated_at).getTime();
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      
      if (updatedAtTime > fiveMinutesAgo) {
        logStep("Using recently cached subscription data", { 
          userId: user.id, 
          isPremium: existingSubscriber.is_premium 
        });
        
        return new Response(JSON.stringify({ 
          subscribed: existingSubscriber.is_premium,
          subscription_tier: existingSubscriber.role,
          subscription_end: existingSubscriber.subscription_end,
          cached: true
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    // Check for developer emails first - highest priority
    if (DEVELOPER_EMAILS.includes(user.email)) {
      logStep("Developer email detected", { email: user.email });
      
      // Update subscribers table with developer status
      await supabaseClient.from("subscribers").upsert({
        user_id: user.id,
        email: user.email,
        is_premium: true,
        role: 'developer', // Special role for developers
        subscription_start: new Date().toISOString(),
        subscription_end: null, // No end date for developers
        updated_at: new Date().toISOString(),
        payment_status: 'active'
      }, { onConflict: 'user_id' });
      
      logStep("Updated database for developer user");
      
      return new Response(JSON.stringify({ 
        subscribed: true,
        subscription_tier: "developer",
        subscription_end: null,
        is_developer: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Then check for premium emails
    if (PREMIUM_EMAILS.includes(user.email)) {
      logStep("Premium email detected", { email: user.email });
      
      // Update subscribers table with premium status for email-based premium users
      await supabaseClient.from("subscribers").upsert({
        user_id: user.id,
        email: user.email,
        is_premium: true,
        role: 'premium',
        subscription_start: new Date().toISOString(),
        subscription_end: null, // No end date for special emails
        updated_at: new Date().toISOString(),
        payment_status: 'active'
      }, { onConflict: 'user_id' });
      
      logStep("Updated database for premium email user");
      
      return new Response(JSON.stringify({ 
        subscribed: true,
        subscription_tier: "premium",
        subscription_end: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // For other users, check Stripe subscription
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        is_premium: false,
        role: 'user',
        payment_status: 'none',
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Determine subscription tier from price
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      if (amount <= 999) {
        subscriptionTier = "Basic";
      } else if (amount <= 1999) {
        subscriptionTier = "Premium";
      } else {
        subscriptionTier = "Enterprise";
      }
      logStep("Determined subscription tier", { priceId, amount, subscriptionTier });
    } else {
      logStep("No active subscription found");
    }

    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      is_premium: hasActiveSub,
      role: hasActiveSub ? 'premium' : 'user',
      payment_status: hasActiveSub ? 'active' : 'none',
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    logStep("Updated database with subscription info", { subscribed: hasActiveSub, subscriptionTier });
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
