import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Loader2,
  Clock,
  CheckCircle2,
  FileText,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function PolicyRecommendationManager({ challengeId, policies = [], challenge = null }) {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('policy_recommendations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenge-policies']);
      toast.success(t({ en: 'Policy deleted', ar: 'تم حذف السياسة' }));
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to={createPageUrl(`PolicyCreate?challenge_id=${challengeId}&entity_type=challenge`)}>
          <Button className="gap-2 bg-blue-600">
            <Plus className="h-4 w-4" />
            {t({ en: 'Add Policy Recommendation', ar: 'إضافة توصية سياسية' })}
          </Button>
        </Link>
      </div>

      {policies.length > 0 ? (
        <div className="space-y-3">
          {policies.map((policy) => (
            <Card key={policy.id} className="border-2 hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                   <Link 
                     to={createPageUrl(`PolicyDetail?id=${policy.id}`)}
                     className="font-semibold text-slate-900 hover:text-blue-600 hover:underline"
                     dir={language === 'ar' ? 'rtl' : 'ltr'}
                   >
                     {language === 'ar' && policy.title_ar ? policy.title_ar : policy.title_en}
                   </Link>
                    <p className="text-xs text-slate-500 mt-1">
                      {policy.submitted_by} • {new Date(policy.submission_date || policy.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={
                      policy.status === 'implemented' ? 'bg-green-100 text-green-700' :
                      policy.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      policy.status === 'under_review' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }>
                      {policy.status?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-slate-700 mb-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {language === 'ar' && policy.recommendation_text_ar 
                    ? policy.recommendation_text_ar 
                    : policy.recommendation_text_en || policy.recommendation_text}
                </p>

                {policy.regulatory_change_needed && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                    <p className="text-xs font-semibold text-amber-900 mb-1">
                      {t({ en: '⚠️ Regulatory Change Required', ar: '⚠️ تغيير تنظيمي مطلوب' })}
                    </p>
                    <p className="text-xs text-slate-700">{policy.regulatory_framework}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-600 mb-3">
                  {policy.timeline_months && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{policy.timeline_months} months</span>
                    </div>
                  )}
                  {policy.priority_level && (
                    <Badge variant="outline" className="text-xs">
                      {policy.priority_level} priority
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link to={createPageUrl(`PolicyDetail?id=${policy.id}`)}>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {t({ en: 'View', ar: 'عرض' })}
                    </Button>
                  </Link>
                  <Link to={createPageUrl(`PolicyEdit?id=${policy.id}`)}>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3 mr-1" />
                      {t({ en: 'Edit', ar: 'تعديل' })}
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      if (confirm(t({ en: 'Delete this policy?', ar: 'حذف هذه السياسة؟' }))) {
                        deleteMutation.mutate(policy.id);
                      }
                    }}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    {t({ en: 'Delete', ar: 'حذف' })}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">{t({ en: 'No policy recommendations yet', ar: 'لا توجد توصيات سياسية بعد' })}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}