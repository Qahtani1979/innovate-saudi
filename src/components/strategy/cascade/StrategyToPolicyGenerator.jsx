import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/LanguageContext';
import { ScrollText, Sparkles, Loader2, Scale, FileText, AlertTriangle } from 'lucide-react';

export default function StrategyToPolicyGenerator() {
  const { t, language } = useLanguage();
  const [strategicContext, setStrategicContext] = useState('');
  const [policies, setPolicies] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!strategicContext.trim()) return;
    
    setIsGenerating(true);
    
    // Simulated AI generation
    setTimeout(() => {
      setPolicies([
        {
          id: 1,
          title: language === 'ar' ? 'سياسة الابتكار المفتوح' : 'Open Innovation Policy',
          type: 'Regulatory',
          scope: language === 'ar' ? 'على مستوى البلدية' : 'Municipality-wide',
          objectives: [
            language === 'ar' ? 'تعزيز التعاون مع القطاع الخاص' : 'Foster private sector collaboration',
            language === 'ar' ? 'تسريع تبني التقنيات' : 'Accelerate technology adoption'
          ],
          stakeholders: ['IT Department', 'Legal', 'Procurement'],
          riskLevel: 'Medium'
        },
        {
          id: 2,
          title: language === 'ar' ? 'سياسة حماية البيانات' : 'Data Protection Policy',
          type: 'Compliance',
          scope: language === 'ar' ? 'جميع الأقسام' : 'All departments',
          objectives: [
            language === 'ar' ? 'حماية بيانات المواطنين' : 'Protect citizen data',
            language === 'ar' ? 'الامتثال للوائح' : 'Ensure regulatory compliance'
          ],
          stakeholders: ['Legal', 'IT Security', 'All Departments'],
          riskLevel: 'High'
        }
      ]);
      setIsGenerating(false);
    }, 1500);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" />
            {t({ en: 'Strategic Policy Generator', ar: 'مولد السياسات الاستراتيجية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={t({ en: 'Enter strategic priorities and governance requirements...', ar: 'أدخل الأولويات الاستراتيجية ومتطلبات الحوكمة...' })}
            value={strategicContext}
            onChange={(e) => setStrategicContext(e.target.value)}
            rows={4}
          />
          <Button onClick={handleGenerate} disabled={isGenerating || !strategicContext.trim()}>
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Generate Policies', ar: 'توليد السياسات' })}
          </Button>
        </CardContent>
      </Card>

      {policies.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {policies.map((policy) => (
            <Card key={policy.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{policy.title}</CardTitle>
                  <Badge variant={getRiskColor(policy.riskLevel)}>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {policy.riskLevel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">{policy.type}</Badge>
                  <span className="text-sm text-muted-foreground">• {policy.scope}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t({ en: 'Objectives', ar: 'الأهداف' })}</p>
                  <ul className="text-sm space-y-1">
                    {policy.objectives.map((obj, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <FileText className="h-3 w-3 text-primary" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-1">{t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' })}</p>
                  <div className="flex flex-wrap gap-1">
                    {policy.stakeholders.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
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
