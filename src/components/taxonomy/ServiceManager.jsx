import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Plus, Save, X, Edit2, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function ServiceManager({ subsector, services, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const [newService, setNewService] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const queryClient = useQueryClient();

  const createServiceMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      setNewService(null);
      toast.success(t({ en: 'Service created', ar: 'تم إنشاء الخدمة' }));
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      setEditingService(null);
      toast.success(t({ en: 'Service updated', ar: 'تم تحديث الخدمة' }));
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      toast.success(t({ en: 'Service deleted', ar: 'تم حذف الخدمة' }));
    }
  });

  const subsectorServices = services.filter(s => s.subsector_id === subsector.id);

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {t({ en: 'Services under', ar: 'الخدمات تحت' })} {language === 'ar' ? subsector.name_ar : subsector.name_en}
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">{subsectorServices.length} services</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setNewService({
              subsector_id: subsector.id,
              name_en: '',
              name_ar: '',
              service_code: '',
              description_en: '',
              description_ar: '',
              service_type: 'administrative',
              is_digital: false
            })}>
              <Plus className="h-4 w-4 mr-1" />
              {t({ en: 'Add Service', ar: 'إضافة خدمة' })}
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* New Service Form */}
        {newService && (
          <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={newService.name_en}
                onChange={(e) => setNewService({ ...newService, name_en: e.target.value })}
                placeholder="Service name (English)"
              />
              <Input
                value={newService.name_ar}
                onChange={(e) => setNewService({ ...newService, name_ar: e.target.value })}
                placeholder="اسم الخدمة (عربي)"
                dir="rtl"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input
                value={newService.service_code}
                onChange={(e) => setNewService({ ...newService, service_code: e.target.value })}
                placeholder="Code (e.g., UD-PUB-001)"
              />
              <Select value={newService.service_type} onValueChange={(v) => setNewService({ ...newService, service_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="economic">Economic</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newService.is_digital}
                  onChange={(e) => setNewService({ ...newService, is_digital: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm">{t({ en: 'Digital Service', ar: 'خدمة رقمية' })}</label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Textarea
                value={newService.description_en}
                onChange={(e) => setNewService({ ...newService, description_en: e.target.value })}
                placeholder="Description (English)"
                rows={2}
              />
              <Textarea
                value={newService.description_ar}
                onChange={(e) => setNewService({ ...newService, description_ar: e.target.value })}
                placeholder="الوصف (عربي)"
                rows={2}
                dir="rtl"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => createServiceMutation.mutate(newService)} disabled={!newService.name_en || !newService.service_code}>
                <Save className="h-3 w-3 mr-1" />
                {t({ en: 'Create', ar: 'إنشاء' })}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setNewService(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Services List */}
        {subsectorServices.map(service => (
          <div key={service.id} className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono text-xs">{service.service_code}</Badge>
                  <p className="font-medium text-slate-900">
                    {language === 'ar' ? service.name_ar : service.name_en}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="text-xs">{service.service_type}</Badge>
                  {service.is_digital && <Badge className="bg-green-100 text-green-700 text-xs">Digital</Badge>}
                  {service.quality_benchmark && (
                    <Badge variant="outline" className="text-xs">
                      Quality: {service.quality_benchmark}/100
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditingService(service)}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteServiceMutation.mutate(service.id)}>
                  <Trash2 className="h-3 w-3 text-red-600" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {subsectorServices.length === 0 && !newService && (
          <p className="text-sm text-slate-500 text-center py-8">
            {t({ en: 'No services yet. Add your first service above.', ar: 'لا توجد خدمات بعد. أضف خدمتك الأولى أعلاه.' })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}