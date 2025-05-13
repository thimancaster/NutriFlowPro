
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import { Star } from 'lucide-react';

const AddTestimonial = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    role: '',
    content: '',
    rating: 5
  });

  const handleRatingChange = (newRating: number) => {
    setFormData(prev => ({ ...prev, rating: newRating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para enviar um depoimento",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Validate form data
      if (!formData.name || !formData.role || !formData.content) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor preencha todos os campos",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Save testimonial to database
      const { error, data } = await supabase.from('testimonials').insert({
        name: formData.name,
        role: formData.role,
        content: formData.content,
        rating: formData.rating,
        user_id: session.session.user.id,
      });

      if (error) {
        console.error("Error saving testimonial:", error);
        throw new Error(error.message || "Erro ao salvar depoimento");
      }

      toast({
        title: "Sucesso!",
        description: "Seu depoimento foi enviado para aprovação",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error("Error in testimonial submission:", error);
      
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar seu depoimento",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Adicionar Depoimento</CardTitle>
            <CardDescription>
              Compartilhe sua experiência com o NutriFlow Pro. Seu depoimento será revisado antes de ser publicado.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Cargo/Especialidade</Label>
                <Input
                  id="role"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="Ex: Nutricionista Clínico"
                />
              </div>
              <div className="space-y-2">
                <Label>Sua Avaliação</Label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none"
                      onClick={() => handleRatingChange(star)}
                    >
                      <Star
                        size={28}
                        className={
                          star <= formData.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Seu Depoimento</Label>
                <Textarea
                  id="content"
                  required
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Conte-nos sua experiência com o NutriFlow Pro..."
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-nutri-green hover:bg-nutri-green-dark text-white"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Depoimento'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddTestimonial;
