import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/components/LanguageContext';
import { Sparkles, Handshake, Loader2, CheckCircle2, Plus, Building2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { usePartnershipMutations } from '@/hooks/usePartnershipMutations';

export default function StrategyToPartnershipGenerator({ strategicPlanId, strategicPlan, onPartnershipCreated }) {
  const { t, isRTL } = useLanguage();
  const [capabilityNeeds, setCapabilityNeeds] = useState('');
  const [partnershipTypes, setPartnershipTypes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const { createPartnership, generateRecommendations } = usePartnershipMutations();

  // Use the passed strategicPlanId from context
  const selectedPlanId = strategicPlanId;

  const partnershipTypeOptions = [
    { value: 'research', label: { en: 'Research Partnership', ar: 'شراكة بحثية' } },
    { value: 'technology', label: { en: 'Technology Transfer', ar: 'نقل التكنولوجيا' } },
    { value: 'implementation', label: { en: 'Implementation Partner', ar: 'شريك تنفيذ' } },
    { value: 'funding', label: { en: 'Funding/Investment', ar: 'تمويل/استثمار' } },
    { value: 'knowledge', label: { en: 'Knowledge Exchange', ar: 'تبادل المعرفة' } }
  ];

  const handleTypeToggle = (type) => {
    setPartnershipTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleGenerate = () => {
    if (!selectedPlanId) {
      toast.error(t({ en: 'Please select a strategic plan', ar: 'الرجاء اختيار خطة استراتيجية' }));
      return;
    }

    generateRecommendations.mutate({
      strategicPlanId: selectedPlanId,
      capabilityNeeds: capabilityNeeds.split(',').map(s => s.trim()).filter(Boolean),
      partnershipTypes
    }, {
      onSuccess: (data) => {
        setRecommendations(data);
        toast.success(t({ en: 'Partner recommendations generated', ar: 'تم إنشاء توصيات الشركاء' }));
      }
    });
  };

  const handleCreatePartnership = (rec, index) => {
    createPartnership.mutate({
      data: {
        title_en: `Partnership with ${rec.organization_name}`,
        title_ar: `شراكة مع ${rec.organization_name}`,
        description_en: rec.strategic_alignment,
        organization_id: rec.organization_id,
        partnership_type: rec.recommended_partnership_type,
        strategic_plan_ids: [selectedPlanId],
        is_strategy_derived: true,
        strategy_derivation_date: new Date().toISOString()
      }
    }, {
      onSuccess: (newPartnership) => {
        const updated = [...recommendations];
        updated[index] = { ...updated[index], saved: true, savedId: newPartnership.id };
        setRecommendations(updated);

        if (onPartnershipCreated) {
          onPartnershipCreated(newPartnership);
        }
      }
    });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-primary" />
            {t({ en: 'Partnership Matcher', ar: 'مُطابق الشراكات' })}
          </CardTitle>
          <CardDescription>
            {t({
              en: 'Find strategic partners aligned with your objectives',
              ar: 'ابحث عن شركاء استراتيجيين متوافقين مع أهدافك'
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Active strategic plan comes from global context */}

          <div className="space-y-3">
            <label className="text-sm font-medium">
              {t({ en: 'Partnership Types Needed', ar: 'أنواع الشراكات المطلوبة' })}
            </label>
            <div className="flex flex-wrap gap-2">
              {partnershipTypeOptions.map(option => (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`type-${option.value}`}
                    checked={partnershipTypes.includes(option.value)}
                    onCheckedChange={() => handleTypeToggle(option.value)}
                  />
                  <label htmlFor={`type-${option.value}`} className="text-sm cursor-pointer">
                    {isRTL ? option.label.ar : option.label.en}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t({ en: 'Capability Needs (comma-separated)', ar: 'القدرات المطلوبة (مفصولة بفواصل)' })}
            </label>
            <Textarea
              value={capabilityNeeds}
              onChange={(e) => setCapabilityNeeds(e.target.value)}
              placeholder={t({
                en: 'e.g., AI/ML expertise, IoT infrastructure, Data analytics, Research capacity...',
                ar: 'مثال: خبرة الذكاء الاصطناعي، بنية إنترنت الأشياء، تحليل البيانات، القدرة البحثية...'
              })}
              rows={2}
            />
          </div>

          <Button onClick={handleGenerate} disabled={generateRecommendations.isPending || !selectedPlanId} className="w-full">
            {generateRecommendations.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t({ en: 'Finding Partners...', ar: 'جاري البحث عن شركاء...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Find Strategic Partners', ar: 'البحث عن شركاء استراتيجيين' })}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t({ en: 'Partner Recommendations', ar: 'توصيات الشركاء' })}
            <Badge variant="secondary">{recommendations.length}</Badge>
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {recommendations.map((rec, idx) => (
              <Card key={idx} className={rec.saved ? 'border-green-500/50 bg-green-50/50' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">
                          {rec.organization_name}
                        </CardTitle>
                        <Badge variant="outline">
                          {rec.recommended_partnership_type}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        {rec.strategic_alignment}
                      </CardDescription>
                    </div>
                    {rec.saved ? (
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t({ en: 'Created', ar: 'تم الإنشاء' })}
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleCreatePartnership(rec, idx)} disabled={createPartnership.isPending}>
                        <Plus className="h-3 w-3 mr-1" />
                        {t({ en: 'Create', ar: 'إنشاء' })}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {t({ en: 'Match Score', ar: 'درجة التطابق' })}
                      </span>
                      <span className="text-sm font-bold">{rec.match_score}%</span>
                    </div>
                    <Progress value={rec.match_score} className="h-2" />
                  </div>
                  {rec.capability_match?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rec.capability_match.map((cap, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
