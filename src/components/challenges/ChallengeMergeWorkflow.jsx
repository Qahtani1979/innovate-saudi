import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { GitMerge, Loader2, AlertTriangle } from 'lucide-react';

import { useMergeChallenges } from '@/hooks/useChallengeMutations';

export default function ChallengeMergeWorkflow({ primaryChallenge, duplicateChallenges, onSuccess, onCancel }) {
  const { language, isRTL, t } = useLanguage();
  // queryClient removed
  const [selectedDuplicates, setSelectedDuplicates] = useState([]);
  const [mergeNotes, setMergeNotes] = useState('');

  const mergeMutation = useMergeChallenges();

  const handleMerge = () => {
    mergeMutation.mutate({
      primaryChallenge,
      duplicateChallenges: selectedDuplicates,
      mergeNotes
    }, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      }
    });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="border-2 border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="h-5 w-5" />
            {t({ en: 'Merge Duplicate Challenges', ar: 'دمج التحديات المكررة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-white rounded-lg border">
            <p className="text-xs text-slate-500 mb-1">{t({ en: 'Primary Challenge (Keep)', ar: 'التحدي الأساسي (الاحتفاظ)' })}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">{primaryChallenge.code}</Badge>
              <p className="font-semibold text-slate-900">{primaryChallenge.title_en}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              {t({ en: 'Select Duplicates to Merge (Archive)', ar: 'اختر التحديات المكررة للدمج (الأرشفة)' })}
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {duplicateChallenges.map((dup) => (
                <div key={dup.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50">
                  <Checkbox
                    checked={selectedDuplicates.includes(dup)}
                    onCheckedChange={(checked) => {
                      setSelectedDuplicates(prev =>
                        checked
                          ? [...prev, dup]
                          : prev.filter(d => d.id !== dup.id)
                      );
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="font-mono text-xs">{dup.code}</Badge>
                      <span className="text-xs text-slate-500">{dup.ai_similarity_score}% similar</span>
                    </div>
                    <p className="font-medium text-slate-900 text-sm">{dup.title_en}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              {t({ en: 'Merge Notes', ar: 'ملاحظات الدمج' })}
            </label>
            <Textarea
              value={mergeNotes}
              onChange={(e) => setMergeNotes(e.target.value)}
              placeholder={t({ en: 'Explain why these are duplicates...', ar: 'اشرح لماذا هذه مكررات...' })}
              rows={3}
            />
          </div>

          {selectedDuplicates.length > 0 && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                ✓ {selectedDuplicates.length} {t({ en: 'duplicate(s) selected', ar: 'مكررات محددة' })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>
          {t({ en: 'Cancel', ar: 'إلغاء' })}
        </Button>
        <Button
          onClick={() => handleMerge()}
          disabled={mergeMutation.isPending || selectedDuplicates.length === 0}
          className="bg-gradient-to-r from-amber-600 to-orange-600"
        >
          {mergeMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t({ en: 'Merging...', ar: 'جاري الدمج...' })}
            </>
          ) : (
            <>
              <GitMerge className="h-4 w-4 mr-2" />
              {t({ en: 'Merge Challenges', ar: 'دمج التحديات' })}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
