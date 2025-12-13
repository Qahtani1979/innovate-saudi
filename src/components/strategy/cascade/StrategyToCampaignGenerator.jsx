import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/LanguageContext';
import { Megaphone, Sparkles, Loader2, Target, Calendar, Users } from 'lucide-react';

export default function StrategyToCampaignGenerator() {
  const { t, language } = useLanguage();
  const [strategicContext, setStrategicContext] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!strategicContext.trim()) return;
    
    setIsGenerating(true);
    
    // Simulated AI generation
    setTimeout(() => {
      setCampaigns([
        {
          id: 1,
          name: language === 'ar' ? 'حملة التوعية الرقمية' : 'Digital Awareness Campaign',
          objective: language === 'ar' ? 'زيادة الوعي بالخدمات الرقمية' : 'Increase awareness of digital services',
          targetAudience: language === 'ar' ? 'المواطنون الشباب' : 'Young citizens',
          duration: '3 months',
          channels: ['Social Media', 'Email', 'Events'],
          kpis: ['Reach: 100K', 'Engagement: 10%', 'Conversions: 5K']
        },
        {
          id: 2,
          name: language === 'ar' ? 'حملة المشاركة المجتمعية' : 'Community Engagement Campaign',
          objective: language === 'ar' ? 'تعزيز المشاركة المجتمعية' : 'Enhance community participation',
          targetAudience: language === 'ar' ? 'قادة المجتمع' : 'Community leaders',
          duration: '6 months',
          channels: ['Workshops', 'PR', 'Partnerships'],
          kpis: ['Participants: 500', 'Events: 20', 'Partnerships: 10']
        }
      ]);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            {t({ en: 'Strategic Campaign Generator', ar: 'مولد الحملات الاستراتيجية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={t({ en: 'Enter strategic objectives and target outcomes...', ar: 'أدخل الأهداف الاستراتيجية والنتائج المستهدفة...' })}
            value={strategicContext}
            onChange={(e) => setStrategicContext(e.target.value)}
            rows={4}
          />
          <Button onClick={handleGenerate} disabled={isGenerating || !strategicContext.trim()}>
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Generate Campaigns', ar: 'توليد الحملات' })}
          </Button>
        </CardContent>
      </Card>

      {campaigns.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <CardTitle className="text-lg">{campaign.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 mt-1 text-muted-foreground" />
                  <span className="text-sm">{campaign.objective}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{campaign.targetAudience}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{campaign.duration}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {campaign.channels.map((channel) => (
                    <Badge key={channel} variant="secondary">{channel}</Badge>
                  ))}
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-1">{t({ en: 'KPIs', ar: 'مؤشرات الأداء' })}</p>
                  <div className="flex flex-wrap gap-1">
                    {campaign.kpis.map((kpi) => (
                      <Badge key={kpi} variant="outline" className="text-xs">{kpi}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
