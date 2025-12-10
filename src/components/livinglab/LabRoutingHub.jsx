import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { ArrowRight, Beaker, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function LabRoutingHub({ entity, entityType }) {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedLab, setSelectedLab] = useState('');
  const [routing, setRouting] = useState(false);
  const { user } = useAuth();

  const { data: livingLabs = [] } = useQuery({
    queryKey: ['living-labs-routing'],
    queryFn: async () => {
      const { data } = await supabase.from('living_labs').select('*');
      return data || [];
    }
  });

  const routeToLabMutation = useMutation({
    mutationFn: async () => {
      // Create RDProject from source entity
      const { data: rdProject, error } = await supabase.from('rd_projects').insert({
        code: `RD-LAB-${Date.now()}`,
        title_en: `Lab Research: ${entity.title_en || entity.name_en}`,
        title_ar: entity.title_ar || entity.name_ar,
        abstract_en: entity.description_en || entity.problem_statement_en,
        living_lab_id: selectedLab,
        research_area_en: entity.sector || 'Municipal Innovation',
        institution_en: 'Municipal Living Lab',
        institution_type: 'government_lab',
        status: 'proposal',
        trl_start: entityType === 'solution' ? entity.trl : 3,
        trl_target: 6
      }).select().single();
      if (error) throw error;

      // Link back to source
      if (entityType === 'challenge') {
        await supabase.from('challenges').update({
          linked_rd_ids: [...(entity.linked_rd_ids || []), rdProject.id]
        }).eq('id', entity.id);
      } else if (entityType === 'pilot') {
        await supabase.from('pilots').update({
          linked_rd_ids: [...(entity.linked_rd_ids || []), rdProject.id]
        }).eq('id', entity.id);
      }

      return rdProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success(t({ en: 'Routed to Living Lab', ar: 'تم التوجيه للمختبر الحي' }));
      setRouting(false);
    }
  });

  const relevantLabs = livingLabs.filter(lab => 
    !entity.sector || 
    lab.sector_id === entity.sector_id ||
    lab.service_focus_ids?.includes(entity.service_id)
  );

  return (
    <Card className="border-2 border-teal-300 bg-gradient-to-r from-teal-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-teal-900">
          <Beaker className="h-5 w-5" />
          {t({ en: 'Route to Living Lab', ar: 'توجيه للمختبر الحي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          {t({ en: 'Convert to research project for citizen co-creation and testing', ar: 'تحويل إلى مشروع بحثي للمشاركة المواطنية والاختبار' })}
        </p>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Select Living Lab', ar: 'اختر المختبر الحي' })}
          </label>
          <Select value={selectedLab} onValueChange={setSelectedLab}>
            <SelectTrigger>
              <SelectValue placeholder={t({ en: 'Choose lab...', ar: 'اختر مختبر...' })} />
            </SelectTrigger>
            <SelectContent>
              {relevantLabs.map(lab => (
                <SelectItem key={lab.id} value={lab.id}>
                  {language === 'ar' && lab.name_ar ? lab.name_ar : lab.name_en}
                  {lab.capacity_current < lab.capacity_max && (
                    <Badge className="ml-2 bg-green-600 text-xs">Available</Badge>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => routeToLabMutation.mutate()}
          disabled={!selectedLab || routeToLabMutation.isPending}
          className="w-full bg-teal-600"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          {t({ en: 'Create Lab Research Project', ar: 'إنشاء مشروع بحثي' })}
        </Button>
      </CardContent>
    </Card>
  );
}