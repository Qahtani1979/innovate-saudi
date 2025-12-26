import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { GitBranch, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { usePolicyMutations } from '@/hooks/usePolicyMutations';

export default function PolicyAmendmentWizard({ policy, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amendmentData, setAmendmentData] = useState({
    summary_ar: '',
    changes: {}
  });

  const { createAmendment, translatePolicy } = usePolicyMutations();

  const handleCreateAmendment = async () => {
    // Translate summary to English
    let summary_en = amendmentData.summary_ar;
    try {
      const translationResult = await translatePolicy.mutateAsync({
        title_ar: `Amendment Summary: ${amendmentData.summary_ar}`, // Context for AI
        recommendation_text_ar: amendmentData.summary_ar,
        // Fill required fields for schema if needed, or if invoke('translatePolicy') expects specific shape
        implementation_steps: [],
        success_metrics: [],
        stakeholder_involvement_ar: ''
      });
      if (translationResult?.recommendation_text_en) {
        summary_en = translationResult.recommendation_text_en;
      }
    } catch (e) {
      console.error("Translation failed, using Arabic original as fallback", e);
    }

    createAmendment.mutate({
      policy,
      amendmentData: {
        ...amendmentData,
        amended_by: user?.email
      },
      summary_en
    }, {
      onSuccess: (newPolicy) => {
        navigate(createPageUrl(`PolicyEdit?id=${newPolicy.id}`));
      }
    });
  };

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
            onClick={handleCreateAmendment}
            disabled={!amendmentData.summary_ar || createAmendment.isPending || translatePolicy.isPending}
            className="flex-1 gap-2 bg-purple-600"
          >
            {(createAmendment.isPending || translatePolicy.isPending) ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t({ en: 'Processing...', ar: 'جاري المعالجة...' })}
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