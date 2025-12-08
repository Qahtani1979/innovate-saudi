import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { toast } from 'sonner';
import { GitBranch, Loader2, Sparkles } from 'lucide-react';

export default function PolicyAmendmentWizard({ policy, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [amendmentData, setAmendmentData] = useState({
    summary_ar: '',
    changes: {}
  });

  const createAmendmentMutation = useMutation({
    mutationFn: async () => {
      // Translate summary to English
      const translationResponse = await base44.functions.invoke('translatePolicy', {
        arabic_fields: {
          title_ar: `Amendment Summary: ${amendmentData.summary_ar}`,
          recommendation_text_ar: amendmentData.summary_ar,
          implementation_steps: [],
          success_metrics: [],
          stakeholder_involvement_ar: ''
        }
      });

      const summary_en = translationResponse.data.recommendation_text_en;

      // Create new policy version
      const newVersion = await base44.entities.PolicyRecommendation.create({
        ...policy,
        id: undefined, // Let system generate new ID
        policy_version: (policy.policy_version || 1) + 1,
        amendment_history: [
          ...(policy.amendment_history || []),
          {
            version: policy.policy_version || 1,
            amendment_date: new Date().toISOString(),
            amended_by: (await base44.auth.me())?.email,
            summary_en: summary_en,
            summary_ar: amendmentData.summary_ar,
            previous_policy_id: policy.id
          }
        ],
        workflow_stage: 'draft',
        created_date: new Date().toISOString()
      });

      // Archive old version
      await base44.entities.PolicyRecommendation.update(policy.id, {
        workflow_stage: 'archived',
        is_archived: true
      });

      return newVersion;
    },
    onSuccess: (newPolicy) => {
      toast.success(t({ en: 'Amendment created', ar: 'تم إنشاء التعديل' }));
      navigate(createPageUrl(`PolicyEdit?id=${newPolicy.id}`));
    }
  });

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-purple-600" />
          <span>{t({ en: 'Create Policy Amendment', ar: 'إنشاء تعديل للسياسة' })}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm font-medium text-purple-900 mb-1">
            {t({ en: 'Current Version:', ar: 'الإصدار الحالي:' })} {policy.policy_version || 1}
          </p>
          <p className="text-xs text-slate-600">
            {t({ 
              en: 'This will create a new version and archive the current one', 
              ar: 'سيتم إنشاء إصدار جديد وأرشفة الحالي' 
            })}
          </p>
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Amendment Summary (Arabic)', ar: 'ملخص التعديل' })}</Label>
          <p className="text-xs text-slate-600 mb-2">
            {t({ en: 'English will be auto-translated', ar: 'الإنجليزية ستترجم تلقائياً' })}
          </p>
          <Textarea
            value={amendmentData.summary_ar}
            onChange={(e) => setAmendmentData({ ...amendmentData, summary_ar: e.target.value })}
            rows={6}
            placeholder="صف ما تغير ولماذا..."
            dir="rtl"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => createAmendmentMutation.mutate()}
            disabled={!amendmentData.summary_ar || createAmendmentMutation.isPending}
            className="flex-1 gap-2 bg-purple-600"
          >
            {createAmendmentMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t({ en: 'Translating...', ar: 'جاري الترجمة...' })}
              </>
            ) : (
              <GitBranch className="h-4 w-4" />
            )}
            {t({ en: 'Create Amendment', ar: 'إنشاء التعديل' })}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}