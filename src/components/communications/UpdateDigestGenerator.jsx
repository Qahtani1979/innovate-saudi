import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Mail, Sparkles, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function UpdateDigestGenerator() {
  const { language, t } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [period, setPeriod] = useState('weekly');
  const [digest, setDigest] = useState(null);

  const { data: recentActivities = [] } = useQuery({
    queryKey: ['recent-activities', period],
    queryFn: async () => {
      const days = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const all = await base44.entities.SystemActivity.list('-created_date', 100);
      return all.filter(a => new Date(a.created_date) > cutoff);
    }
  });

  const generateDigest = async () => {
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create executive update digest:

PERIOD: ${period}
ACTIVITIES: ${recentActivities.length} events
Sample: ${recentActivities.slice(0, 20).map(a => 
  `${a.activity_type}: ${a.description}`
).join('\n')}

Generate digest:
1. Executive summary (2-3 sentences)
2. Key highlights (5-7 bullet points)
3. Metrics snapshot (challenges, pilots, completions)
4. Notable developments
5. Action items requiring attention

Professional tone, suitable for email distribution.`,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            executive_summary: { type: "string" },
            highlights: { type: "array", items: { type: "string" } },
            metrics: {
              type: "object",
              properties: {
                new_challenges: { type: "number" },
                active_pilots: { type: "number" },
                completed_milestones: { type: "number" }
              }
            },
            developments: { type: "array", items: { type: "string" } },
            action_items: { type: "array", items: { type: "string" } }
          }
        }
      });

      setDigest(response);
      toast.success(t({ en: 'Digest generated', ar: 'الملخص أُنشئ' }));
    } catch (error) {
      toast.error(t({ en: 'Generation failed', ar: 'فشل الإنشاء' }));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            {t({ en: 'Update Digest Generator', ar: 'مولد الملخصات' })}
          </CardTitle>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{t({ en: 'Daily', ar: 'يومي' })}</SelectItem>
                <SelectItem value="weekly">{t({ en: 'Weekly', ar: 'أسبوعي' })}</SelectItem>
                <SelectItem value="monthly">{t({ en: 'Monthly', ar: 'شهري' })}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generateDigest} disabled={generating} size="sm" className="bg-blue-600">
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Generate', ar: 'إنشاء' })}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!digest && !generating && (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-blue-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI generates professional update digests from platform activity', ar: 'الذكاء ينشئ ملخصات احترافية من نشاط المنصة' })}
            </p>
          </div>
        )}

        {digest && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-300">
              <h3 className="font-bold text-blue-900 mb-2">{digest.subject}</h3>
              <p className="text-sm text-slate-700">{digest.executive_summary}</p>
            </div>

            {digest.metrics && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-green-50 rounded text-center">
                  <p className="text-2xl font-bold text-green-600">{digest.metrics.new_challenges || 0}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'New Challenges', ar: 'تحديات جديدة' })}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded text-center">
                  <p className="text-2xl font-bold text-blue-600">{digest.metrics.active_pilots || 0}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Active Pilots', ar: 'تجارب نشطة' })}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded text-center">
                  <p className="text-2xl font-bold text-purple-600">{digest.metrics.completed_milestones || 0}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Milestones', ar: 'إنجازات' })}</p>
                </div>
              </div>
            )}

            {digest.highlights?.length > 0 && (
              <div className="p-4 bg-white rounded border">
                <h4 className="font-semibold text-sm text-slate-900 mb-2">
                  {t({ en: '🌟 Key Highlights', ar: '🌟 أبرز النقاط' })}
                </h4>
                <ul className="space-y-1">
                  {digest.highlights.map((h, i) => (
                    <li key={i} className="text-sm text-slate-700">• {h}</li>
                  ))}
                </ul>
              </div>
            )}

            {digest.action_items?.length > 0 && (
              <div className="p-4 bg-amber-50 rounded border-2 border-amber-300">
                <h4 className="font-semibold text-sm text-amber-900 mb-2">
                  {t({ en: '⚡ Action Items', ar: '⚡ إجراءات مطلوبة' })}
                </h4>
                <ul className="space-y-1">
                  {digest.action_items.map((a, i) => (
                    <li key={i} className="text-sm text-slate-700">→ {a}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button variant="outline" className="w-full">
              <Download className="h-3 w-3 mr-1" />
              {t({ en: 'Export Digest', ar: 'تصدير الملخص' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}