import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { Globe, Lock, CheckCircle2, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PublishingWorkflow({ challenge, onClose, isCreationMode = false }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [publishData, setPublishData] = useState({
    is_published: challenge?.is_published || false,
    is_confidential: challenge?.is_confidential || false,
    approval_notes: ''
  });

  // In creation mode, this should not be shown - challenges start as draft
  if (isCreationMode) {
    return (
      <div className="p-4 bg-slate-50 rounded-lg border">
        <p className="text-sm text-slate-700">
          {t({
            en: '📋 Challenge will be created as DRAFT and go through review workflow before publishing.',
            ar: '📋 سيتم إنشاء التحدي كمسودة وسيمر بسير عمل المراجعة قبل النشر.'
          })}
        </p>
      </div>
    );
  }

  const publishMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Challenge.update(challenge.id, {
        is_published: publishData.is_published,
        is_confidential: publishData.is_confidential,
        publishing_approved_by: (await base44.auth.me()).email,
        publishing_approved_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenge', challenge.id]);
      queryClient.invalidateQueries(['challenges']);
      toast.success(t({ en: 'Publishing status updated', ar: 'تم تحديث حالة النشر' }));
      if (onClose) onClose();
    }
  });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            {t({ en: 'Publishing Settings', ar: 'إعدادات النشر' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Public Publishing */}
          <div className="flex items-start justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-slate-900">
                  {t({ en: 'Publish to Challenge Bank', ar: 'نشر إلى بنك التحديات' })}
                </h4>
              </div>
              <p className="text-sm text-slate-600">
                {t({ 
                  en: 'Make this challenge visible in public portal and provider dashboards for solution discovery', 
                  ar: 'اجعل هذا التحدي مرئياً في البوابة العامة ولوحات مزودي الحلول' 
                })}
              </p>
            </div>
            <Switch
              checked={publishData.is_published}
              onCheckedChange={(checked) => setPublishData({ ...publishData, is_published: checked })}
            />
          </div>

          {/* Confidential Flag */}
          <div className="flex items-start justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-slate-900">
                  {t({ en: 'Mark as Confidential', ar: 'وضع علامة سري' })}
                </h4>
              </div>
              <p className="text-sm text-slate-600">
                {t({ 
                  en: 'Restrict access to authorized personnel only - hide from public/provider portals', 
                  ar: 'تقييد الوصول للمخولين فقط - إخفاء من البوابات العامة' 
                })}
              </p>
            </div>
            <Switch
              checked={publishData.is_confidential}
              onCheckedChange={(checked) => setPublishData({ ...publishData, is_confidential: checked })}
            />
          </div>

          {/* Conflict Warning */}
          {publishData.is_published && publishData.is_confidential && (
            <div className="p-3 bg-amber-100 border border-amber-300 rounded-lg">
              <p className="text-sm text-amber-900 font-medium">
                ⚠️ {t({ en: 'Cannot be both published and confidential. Confidential takes precedence.', ar: 'لا يمكن أن يكون منشوراً وسرياً في نفس الوقت. السرية لها الأولوية.' })}
              </p>
            </div>
          )}

          {/* Approval Notes */}
          <div className="space-y-2">
            <Label>{t({ en: 'Approval Notes (Optional)', ar: 'ملاحظات الموافقة (اختياري)' })}</Label>
            <Textarea
              value={publishData.approval_notes}
              onChange={(e) => setPublishData({ ...publishData, approval_notes: e.target.value })}
              placeholder={t({ en: 'Why are you approving/restricting this challenge...', ar: 'لماذا توافق/تقيد هذا التحدي...' })}
              rows={3}
            />
          </div>

          {/* Current Status */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-700 mb-2">
              {t({ en: 'Current Status:', ar: 'الحالة الحالية:' })}
            </p>
            <div className="flex gap-2">
              <Badge className={publishData.is_published ? 'bg-green-600' : 'bg-slate-400'}>
                {publishData.is_published 
                  ? t({ en: 'Published', ar: 'منشور' })
                  : t({ en: 'Draft', ar: 'مسودة' })
                }
              </Badge>
              {publishData.is_confidential && (
                <Badge className="bg-red-600">
                  <Lock className="h-3 w-3 mr-1" />
                  {t({ en: 'Confidential', ar: 'سري' })}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose}>
          {t({ en: 'Cancel', ar: 'إلغاء' })}
        </Button>
        <Button
          onClick={() => publishMutation.mutate()}
          disabled={publishMutation.isPending}
          className="bg-gradient-to-r from-blue-600 to-teal-600"
        >
          {publishMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t({ en: 'Saving...', ar: 'جاري الحفظ...' })}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t({ en: 'Update Publishing', ar: 'تحديث النشر' })}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}