
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Upload, User } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  crn: z.string().min(4, 'CRN deve ter pelo menos 4 caracteres'),
  specialty: z.string().optional(),
  clinic_name: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileSettings = () => {
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileFormValues | null>(null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      crn: '',
      specialty: '',
      clinic_name: ''
    }
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("Nenhum usuário autenticado encontrado");
          toast({
            title: "Erro ao carregar perfil",
            description: "Usuário não autenticado.",
            variant: "destructive"
          });
          return;
        }
        
        console.log("Buscando perfil do usuário com ID:", user.id);
        
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Erro ao buscar perfil do usuário:', error);
          toast({
            title: "Erro ao carregar perfil",
            description: "Não foi possível obter seus dados de perfil.",
            variant: "destructive"
          });
          return;
        }
        
        if (profile) {
          console.log("Dados do perfil carregados:", profile);
          setProfileData({
            name: profile.name || '',
            crn: profile.crn || '',
            specialty: profile.specialty || '',
            clinic_name: profile.clinic_name || '',
          });
          
          form.reset({
            name: profile.name || '',
            crn: profile.crn || '',
            specialty: profile.specialty || '',
            clinic_name: profile.clinic_name || '',
          });
          
          if (profile.photo_url) {
            setAvatarUrl(profile.photo_url);
          }
        } else {
          console.warn("Nenhum perfil encontrado para o usuário");
        }
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Ocorreu um erro ao buscar seus dados.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [toast, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro ao atualizar suas informações.",
        variant: "destructive",
      });
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você precisa selecionar uma imagem para fazer upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}.${fileExt}`;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log("Arquivo enviado com sucesso, URL pública:", publicUrl);

      // Update the user's profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ photo_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro ao fazer upload",
        description: error.message || "Ocorreu um erro ao carregar sua foto.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-nutri-blue" />
        <p className="mt-4 text-sm text-gray-500">Carregando suas informações...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex flex-col items-center mb-8">
        <Avatar className="h-24 w-24 mb-4">
          {avatarUrl ? (
            <AvatarImage 
              src={avatarUrl} 
              alt="Foto de perfil" 
              onError={(e) => {
                console.error("Error loading avatar:", e);
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          ) : (
            <AvatarFallback>
              <User className="h-12 w-12 text-gray-400" />
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex items-center">
          <label 
            htmlFor="avatar-upload" 
            className="cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md flex items-center text-sm font-medium"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Alterar foto
              </>
            )}
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
            className="hidden"
          />
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="crn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CRN</FormLabel>
                <FormControl>
                  <Input placeholder="Seu número do CRN" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especialidade</FormLabel>
                <FormControl>
                  <Input placeholder="Sua especialidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clinic_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Clínica</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da sua clínica" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Salvar alterações
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ProfileSettings;
