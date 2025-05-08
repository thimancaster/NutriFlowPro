
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }

    // Get the signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No stripe signature in request");
    }

    // Get the request body as text
    const body = await req.text();
    logStep("Request body received", { length: body.length });

    // Verify the signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Signature verified", { event: event.type });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("Webhook signature verification failed", { error: errorMessage });
      return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${errorMessage}` }), {
        status: 400
      });
    }

    // Set up Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables not set");
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Store the event in the database
    logStep("Storing event in database", { type: event.type });
    const { error: insertError } = await supabaseAdmin
      .from("stripe_events")
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        event_data: event,
      });
      
    if (insertError) {
      logStep("Error storing event in database", { error: insertError.message });
      // Continue execution even if storage fails
    }

    // Process different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        logStep("Processing checkout.session.completed", { 
          customer: session.customer, 
          subscription: session.subscription,
        });
        
        if (session.mode === 'subscription') {
          // Get user information
          let userId = session.metadata?.user_id;
          if (!userId) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            userId = subscription.metadata?.user_id;
          }
          
          const customerEmail = session.customer_details?.email;
          logStep("Subscription info", { userId, customerEmail });
          
          if (customerEmail) {
            // Find user by email in Supabase
            let dbUserId = userId;
            
            if (!dbUserId) {
              const { data: userData } = await supabaseAdmin
                .from("auth.users")
                .select("id")
                .eq("email", customerEmail)
                .maybeSingle();
                
              dbUserId = userData?.id;
            }
            
            if (dbUserId) {
              // Update subscriber information
              const { error: updateError } = await supabaseAdmin
                .from("subscribers")
                .upsert({
                  user_id: dbUserId,
                  email: customerEmail,
                  stripe_customer_id: session.customer,
                  stripe_subscription_id: session.subscription,
                  is_premium: true,
                  role: 'premium',
                  payment_status: 'active',
                  subscription_start: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }, 
                { onConflict: 'user_id' });
                
              if (updateError) {
                logStep("Error updating subscriber", { error: updateError.message });
              } else {
                logStep("Subscriber updated successfully");
              }
            } else {
              logStep("Could not find user in database for this checkout");
            }
          }
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        logStep("Processing subscription update", { 
          status: subscription.status,
          cancelAt: subscription.cancel_at,
        });
        
        // Get customer information
        const customerId = subscription.customer;
        const { data: subscribers } = await supabaseAdmin
          .from("subscribers")
          .select("user_id, email")
          .eq("stripe_customer_id", customerId);
          
        if (subscribers && subscribers.length > 0) {
          const subscriber = subscribers[0];
          
          // Check for cancellation or status changes
          if (subscription.status === 'canceled' || subscription.cancel_at) {
            const cancelDate = subscription.cancel_at 
              ? new Date(subscription.cancel_at * 1000).toISOString()
              : new Date().toISOString();
              
            await supabaseAdmin
              .from("subscribers")
              .update({
                is_premium: false,
                role: 'user',
                payment_status: 'canceled',
                subscription_end: cancelDate,
                updated_at: new Date().toISOString()
              })
              .eq("user_id", subscriber.user_id);
              
            logStep("Subscription marked as canceled", { userId: subscriber.user_id });
          } else if (subscription.status === 'active') {
            // Ensure subscription is marked active
            await supabaseAdmin
              .from("subscribers")
              .update({
                is_premium: true,
                role: 'premium',
                payment_status: 'active',
                subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq("user_id", subscriber.user_id);
              
            logStep("Subscription marked as active", { userId: subscriber.user_id });
          }
        } else {
          logStep("No subscriber found for this customer", { customerId });
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        logStep("Processing subscription deletion", { id: subscription.id });
        
        // Get customer information
        const customerId = subscription.customer;
        const { data: subscribers } = await supabaseAdmin
          .from("subscribers")
          .select("user_id, email")
          .eq("stripe_customer_id", customerId);
          
        if (subscribers && subscribers.length > 0) {
          const subscriber = subscribers[0];
          
          await supabaseAdmin
            .from("subscribers")
            .update({
              is_premium: false,
              role: 'user',
              payment_status: 'canceled',
              subscription_end: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq("user_id", subscriber.user_id);
            
          logStep("Subscription marked as deleted", { userId: subscriber.user_id });
        } else {
          logStep("No subscriber found for this customer", { customerId });
        }
        break;
      }
      
      default:
        logStep(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logStep("Webhook error", { error: errorMessage });
    return new Response(JSON.stringify({ error: `Webhook error: ${errorMessage}` }), {
      status: 500
    });
  }
});
