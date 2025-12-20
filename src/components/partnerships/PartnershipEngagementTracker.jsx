import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Calendar, FileText, CheckCircle, Clock } from 'lucide-react';

export default function PartnershipEngagementTracker({ partnership }) {
  const { language, t } = useLanguage();

  const stages = [
    { name: 'Prospect', status: 'completed', date: partnership.created_date },
    { name: 'Initial Contact', status: partnership.status !== 'prospect' ? 'completed' : 'pending', date: null },
    { name: 'Negotiation', status: ['negotiation', 'active', 'completed'].includes(partnership.status) ? 'completed' : 'pending', date: null },
    { name: 'Agreement', status: ['active', 'completed'].includes(partnership.status) ? 'completed' : 'pending', date: partnership.start_date },
    { name: 'Active', status: partnership.status === 'active' || partnership.status === 'completed' ? 'completed' : 'pending', date: partnership.start_date },
    { name: 'Completed', status: partnership.status === 'completed' ? 'completed' : 'pending', date: partnership.end_date }
  ];

  const currentStageIndex = stages.findLastIndex(s => s.status === 'completed');
  const engagementEvents = partnership.engagement_history?.length || 0;

  const daysSinceLastEvent = partnership.engagement_history?.length > 0
    ? Math.floor((new Date() - new Date(partnership.engagement_history[partnership.engagement_history.length - 1].date)) / (1000 * 60 * 60 * 24))
    : 999;

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          {t({ en: 'Engagement Timeline', ar: 'الجدول الزمني للتواصل' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="relative">
          {stages.map((stage, i) => (
            <div key={i} className="flex gap-4 mb-6 last:mb-0">
              <div className="relative flex flex-col items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  stage.status === 'completed' ? 'bg-green-500' : 'bg-slate-300'
                }`}>
                  {stage.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-white" />
                  ) : (
                    <Clock className="h-5 w-5 text-white" />
                  )}
                </div>
                {i < stages.length - 1 && (
                  <div className={`w-0.5 flex-1 ${stage.status === 'completed' ? 'bg-green-500' : 'bg-slate-300'}`} style={{ height: '50px' }} />
                )}
              </div>

              <div className="flex-1 pb-6">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm text-slate-900">{stage.name}</h4>
                  {stage.status === 'completed' && stage.date && (
                    <span className="text-xs text-slate-500">
                      {new Date(stage.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  )}
                </div>
                <Badge className={stage.status === 'completed' ? 'bg-green-600' : 'bg-slate-400'}>
                  {stage.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t">
          <div className="p-3 bg-white rounded border text-center">
            <FileText className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-600">{engagementEvents}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Events', ar: 'أحداث' })}</p>
          </div>
          <div className="p-3 bg-white rounded border text-center">
            <Clock className="h-6 w-6 text-purple-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-600">{daysSinceLastEvent}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Days Since Contact', ar: 'أيام منذ الاتصال' })}</p>
          </div>
        </div>

        {daysSinceLastEvent > 30 && partnership.status === 'active' && (
          <div className="p-3 bg-amber-50 rounded border border-amber-300 text-xs">
            {t({ 
              en: '⚠️ No activity in 30+ days. Consider follow-up.', 
              ar: '⚠️ لا نشاط في 30+ يوم. ضع في الاعتبار المتابعة.' 
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}