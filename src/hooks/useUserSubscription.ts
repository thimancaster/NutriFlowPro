
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserSubscription = () => {
  return useQuery({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      try {
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw userError || new Error("Usuário não autenticado");
        }

        const { data, error } = await supabase
          .from("subscribers")
          .select("is_premium, role, email")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        return {
          isPremium: data ? !!data.is_premium : false,
          role: data ? data.role : 'user',
          email: data ? data.email : user.email
        };
      } catch (error) {
        console.error("Error fetching subscription status:", error);
        return {
          isPremium: false,
          role: 'user',
          email: null
        };
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1
  });
};
