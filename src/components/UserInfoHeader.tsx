
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const UserInfoHeader = () => {
  const { data: userData } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();
      return userProfile;
    }
  });

  // Note: You'll want to implement patient selection logic in a more comprehensive way
  const currentPatient = null; 

  return (
    <div className="bg-blue-50 p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        {userData && (
          <>
            <div>
              <span className="font-bold">Nutricionista:</span> {userData.name}
              {userData.crn && <Badge variant="secondary" className="ml-2">CRN: {userData.crn}</Badge>}
            </div>
            {currentPatient && (
              <div>
                <span className="font-bold">Paciente:</span> {currentPatient.name}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserInfoHeader;
