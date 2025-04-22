
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fetches subscription info for the current user
export const useUserSubscription = () => {
  return useQuery({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();
      if (userError || !user) throw userError || new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("subscribers")
        .select("is_premium, role, email")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      return {
        isPremium: !!data.is_premium,
        role: data.role,
        email: data.email
      };
    },
    staleTime: 5 * 60 * 1000
  });
};
