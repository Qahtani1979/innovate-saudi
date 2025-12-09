import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../LanguageContext';
import { Calendar, FileText, Send, Loader2, Sparkles, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function MatchmakerEngagementHub({ application, onUpdate }) {
  const { language, isRTL, t } = useLanguage();
  const [newEngagement, setNewEngagement] = useState({
    type: 'meeting',
    date: '',
    participants: '',
    notes: ''
  });
  const { invokeAI, status, isLoading: generatingProposal, isAvailable, rateLimitInfo } = useAIWithFallback();

  const addEngagement = () => {
    const log = application.engagement_log || [];
    const entry = {
      ...newEngagement,
      participants: newEngagement.participants.split(',').map(p => p.trim())
    };
    
    onUpdate({
      engagement_log: [...log, entry]
    });

    setNewEngagement({ type: 'meeting', date: '', participants: '', notes: '' });
    toast.success(t({ en: 'Engagement logged', ar: 'تم تسجيل المشاركة' }));
  };

  const generateProposal = async () => {
    const result = await invokeAI({
      prompt: `Generate a partnership proposal template for this Matchmaker application:

Organization: ${application.organization_name_en}
Sectors: ${application.sectors?.join(', ')}
Collaboration Approach: ${application.collaboration_approach}

Generate professional proposal in both English and Arabic with:
1. Executive summary
2. Organization overview
3. Proposed collaboration model
4. Value proposition for municipalities
5. Implementation timeline
6. Success metrics
7. Next steps`,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary_en: { type: 'string' },
          executive_summary_ar: { type: 'string' },
          collaboration_model_en: { type: 'string' },
          collaboration_model_ar: { type: 'string' },
          timeline: { type: 'string' },
          success_metrics: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    if (result.success) {
      toast.success(t({ en: 'Proposal generated', ar: 'تم إنشاء المقترح' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Engagement Hub', ar: 'مركز المشاركة' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="log">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="log">{t({ en: 'Activity Log', ar: 'سجل النشاط' })}</TabsTrigger>
            <TabsTrigger value="schedule">{t({ en: 'Schedule', ar: 'الجدول' })}</TabsTrigger>
            <TabsTrigger value="materials">{t({ en: 'Materials', ar: 'المواد' })}</TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="space-y-4 mt-4">
            <div className="p-4 border-2 border-indigo-200 rounded-lg bg-indigo-50 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600">{t({ en: 'Type', ar: 'النوع' })}</label>
                  <select
                    value={newEngagement.type}
                    onChange={(e) => setNewEngagement({...newEngagement, type: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="meeting">{t({ en: 'Meeting', ar: 'اجتماع' })}</option>
                    <option value="call">{t({ en: 'Call', ar: 'مكالمة' })}</option>
                    <option value="email">{t({ en: 'Email', ar: 'بريد' })}</option>
                    <option value="site_visit">{t({ en: 'Site Visit', ar: 'زيارة ميدانية' })}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-600">{t({ en: 'Date', ar: 'التاريخ' })}</label>
                  <Input
                    type="date"
                    value={newEngagement.date}
                    onChange={(e) => setNewEngagement({...newEngagement, date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-600">{t({ en: 'Participants (comma-separated)', ar: 'المشاركون (مفصولة بفواصل)' })}</label>
                <Input
                  value={newEngagement.participants}
                  onChange={(e) => setNewEngagement({...newEngagement, participants: e.target.value})}
                  placeholder="name1@email.com, name2@email.com"
                />
              </div>
              <Textarea
                rows={3}
                value={newEngagement.notes}
                onChange={(e) => setNewEngagement({...newEngagement, notes: e.target.value})}
                placeholder={t({ en: 'Meeting notes...', ar: 'ملاحظات الاجتماع...' })}
              />
              <Button onClick={addEngagement} className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Send className="h-4 w-4 mr-2" />
                {t({ en: 'Log Engagement', ar: 'تسجيل المشاركة' })}
              </Button>
            </div>

            <div className="space-y-2">
              {(application.engagement_log || []).map((entry, i) => (
                <div key={i} className="p-3 border rounded-lg bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline">{entry.type}</Badge>
                    <span className="text-xs text-slate-500">{entry.date}</span>
                  </div>
                  <p className="text-sm text-slate-700">{entry.notes}</p>
                  {entry.participants?.length > 0 && (
                    <p className="text-xs text-slate-500 mt-2">👥 {entry.participants.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="mt-4">
            <div className="text-center py-8 text-slate-500">
              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm">{t({ en: 'Meeting scheduler integration coming soon', ar: 'تكامل جدولة الاجتماعات قريباً' })}</p>
            </div>
          </TabsContent>

          <TabsContent value="materials" className="mt-4 space-y-3">
            <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
            <Button
              onClick={generateProposal}
              disabled={generatingProposal || !isAvailable}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {generatingProposal ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />{t({ en: 'Generate Proposal (AI)', ar: 'إنشاء مقترح (ذكاء)' })}</>
              )}
            </Button>
            
            <div className="space-y-2">
              {application.portfolio_url && (
                <a href={application.portfolio_url} target="_blank" className="block">
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    {t({ en: 'Organization Portfolio', ar: 'ملف المنظمة' })}
                  </Button>
                </a>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}