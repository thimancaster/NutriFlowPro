
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Phone, Globe, DollarSign, Clock, X } from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';
import LoadingSpinner from '@/components/ui/loading-spinner';

const BusinessSettings: React.FC = () => {
  const { settings, isLoading, isSaving, updateBusinessSettings } = useUserSettings();
  const [formData, setFormData] = useState({
    clinic_address: '',
    clinic_phone: '',
    clinic_website: '',
    consultation_fee: 0,
    payment_methods: [] as string[],
    cancellation_policy: '24h',
    auto_confirm_appointments: false
  });

  React.useEffect(() => {
    if (settings?.business_settings) {
      setFormData({
        clinic_address: settings.business_settings.clinic_address || '',
        clinic_phone: settings.business_settings.clinic_phone || '',
        clinic_website: settings.business_settings.clinic_website || '',
        consultation_fee: settings.business_settings.consultation_fee || 0,
        payment_methods: settings.business_settings.payment_methods || [],
        cancellation_policy: settings.business_settings.cancellation_policy || '24h',
        auto_confirm_appointments: settings.business_settings.auto_confirm_appointments || false
      });
    }
  }, [settings]);

  if (isLoading) {
    return <LoadingSpinner text="Carregando configurações..." />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePaymentMethod = (method: string) => {
    setFormData(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(method)
        ? prev.payment_methods.filter(m => m !== method)
        : [...prev.payment_methods, method]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBusinessSettings(formData);
  };

  const paymentMethodOptions = [
    { value: 'cash', label: 'Dinheiro' },
    { value: 'card', label: 'Cartão' },
    { value: 'pix', label: 'PIX' },
    { value: 'transfer', label: 'Transferência' },
    { value: 'check', label: 'Cheque' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Configurações da Clínica
        </CardTitle>
        <CardDescription>
          Configure as informações do seu consultório ou clínica
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinic_phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone da Clínica
              </Label>
              <Input
                id="clinic_phone"
                name="clinic_phone"
                value={formData.clinic_phone}
                onChange={handleInputChange}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic_website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </Label>
              <Input
                id="clinic_website"
                name="clinic_website"
                value={formData.clinic_website}
                onChange={handleInputChange}
                placeholder="https://www.minhaClinica.com.br"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinic_address">Endereço da Clínica</Label>
            <Textarea
              id="clinic_address"
              name="clinic_address"
              value={formData.clinic_address}
              onChange={handleInputChange}
              placeholder="Endereço completo da clínica"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consultation_fee" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valor da Consulta (R$)
              </Label>
              <Input
                id="consultation_fee"
                name="consultation_fee"
                type="number"
                step="0.01"
                value={formData.consultation_fee}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancellation_policy" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Política de Cancelamento
              </Label>
              <Select
                value={formData.cancellation_policy}
                onValueChange={(value) => handleSelectChange('cancellation_policy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2h">2 horas antes</SelectItem>
                  <SelectItem value="24h">24 horas antes</SelectItem>
                  <SelectItem value="48h">48 horas antes</SelectItem>
                  <SelectItem value="72h">72 horas antes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Formas de Pagamento Aceitas</Label>
            <div className="flex flex-wrap gap-2">
              {paymentMethodOptions.map((method) => (
                <Badge
                  key={method.value}
                  variant={formData.payment_methods.includes(method.value) ? "default" : "outline"}
                  className="cursor-pointer flex items-center gap-1"
                  onClick={() => togglePaymentMethod(method.value)}
                >
                  {method.label}
                  {formData.payment_methods.includes(method.value) && (
                    <X className="h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BusinessSettings;
