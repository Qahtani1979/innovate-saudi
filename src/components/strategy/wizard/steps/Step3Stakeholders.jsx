import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Users, Plus, X, Grid3X3 } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { STAKEHOLDER_TYPES } from '../StrategyWizardSteps';
import { cn } from '@/lib/utils';

export default function Step3Stakeholders({ data, onChange, onGenerateAI, isGenerating }) {
  const { language, t, isRTL } = useLanguage();

  const addStakeholder = () => {
    const newStakeholder = { 
      id: Date.now().toString(),
      name: '',
      type: 'GOVERNMENT',
      power: 'medium', // low, medium, high
      interest: 'medium', // low, medium, high
      influence_strategy: '',
      contact_person: '',
      contact_email: '',
      engagement_level: 'inform', // inform, consult, involve, collaborate, empower
      notes: ''
    };
    onChange({ stakeholders: [...(data.stakeholders || []), newStakeholder] });
  };

  const updateStakeholder = (index, field, value) => {
    const updated = [...(data.stakeholders || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ stakeholders: updated });
  };

  const removeStakeholder = (index) => {
    onChange({ stakeholders: data.stakeholders.filter((_, i) => i !== index) });
  };

  const getQuadrant = (power, interest) => {
    if (power === 'high' && interest === 'high') return { name: 'Manage Closely', color: 'bg-red-100 border-red-300 text-red-800' };
    if (power === 'high' && interest !== 'high') return { name: 'Keep Satisfied', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' };
    if (power !== 'high' && interest === 'high') return { name: 'Keep Informed', color: 'bg-blue-100 border-blue-300 text-blue-800' };
    return { name: 'Monitor', color: 'bg-gray-100 border-gray-300 text-gray-800' };
  };

  const engagementLevels = [
    { value: 'inform', label: { en: 'Inform', ar: 'إبلاغ' } },
    { value: 'consult', label: { en: 'Consult', ar: 'استشارة' } },
    { value: 'involve', label: { en: 'Involve', ar: 'إشراك' } },
    { value: 'collaborate', label: { en: 'Collaborate', ar: 'تعاون' } },
    { value: 'empower', label: { en: 'Empower', ar: 'تمكين' } }
  ];

  const powerInterestOptions = [
    { value: 'low', label: { en: 'Low', ar: 'منخفض' } },
    { value: 'medium', label: { en: 'Medium', ar: 'متوسط' } },
    { value: 'high', label: { en: 'High', ar: 'مرتفع' } }
  ];

  // Group stakeholders by quadrant for matrix view
  const groupedStakeholders = {
    'Manage Closely': data.stakeholders?.filter(s => s.power === 'high' && s.interest === 'high') || [],
    'Keep Satisfied': data.stakeholders?.filter(s => s.power === 'high' && s.interest !== 'high') || [],
    'Keep Informed': data.stakeholders?.filter(s => s.power !== 'high' && s.interest === 'high') || [],
    'Monitor': data.stakeholders?.filter(s => s.power !== 'high' && s.interest !== 'high') || []
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* AI Generate Button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={onGenerateAI} 
          disabled={isGenerating}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating 
            ? t({ en: 'Generating...', ar: 'جاري الإنشاء...' })
            : t({ en: 'Suggest Stakeholders', ar: 'اقتراح أصحاب المصلحة' })
          }
        </Button>
      </div>

      {/* Power/Interest Matrix Visual */}
      {(data.stakeholders || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Grid3X3 className="w-5 h-5 text-primary" />
              {t({ en: 'Power/Interest Matrix', ar: 'مصفوفة القوة/الاهتمام' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {/* High Power Row */}
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200">
                <div className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  {t({ en: 'Keep Satisfied', ar: 'إبقاء الرضا' })}
                  <span className="text-xs ml-1">({t({ en: 'High Power, Low Interest', ar: 'قوة عالية، اهتمام منخفض' })})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {groupedStakeholders['Keep Satisfied'].map(s => (
                    <Badge key={s.id} variant="outline" className="text-xs">{s.name || '?'}</Badge>
                  ))}
                  {groupedStakeholders['Keep Satisfied'].length === 0 && (
                    <span className="text-muted-foreground text-xs">{t({ en: 'None', ar: 'لا يوجد' })}</span>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200">
                <div className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  {t({ en: 'Manage Closely', ar: 'إدارة عن كثب' })}
                  <span className="text-xs ml-1">({t({ en: 'High Power, High Interest', ar: 'قوة عالية، اهتمام عالي' })})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {groupedStakeholders['Manage Closely'].map(s => (
                    <Badge key={s.id} variant="outline" className="text-xs">{s.name || '?'}</Badge>
                  ))}
                  {groupedStakeholders['Manage Closely'].length === 0 && (
                    <span className="text-muted-foreground text-xs">{t({ en: 'None', ar: 'لا يوجد' })}</span>
                  )}
                </div>
              </div>
              {/* Low Power Row */}
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200">
                <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {t({ en: 'Monitor', ar: 'مراقبة' })}
                  <span className="text-xs ml-1">({t({ en: 'Low Power, Low Interest', ar: 'قوة منخفضة، اهتمام منخفض' })})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {groupedStakeholders['Monitor'].map(s => (
                    <Badge key={s.id} variant="outline" className="text-xs">{s.name || '?'}</Badge>
                  ))}
                  {groupedStakeholders['Monitor'].length === 0 && (
                    <span className="text-muted-foreground text-xs">{t({ en: 'None', ar: 'لا يوجد' })}</span>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200">
                <div className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  {t({ en: 'Keep Informed', ar: 'إبقاء على اطلاع' })}
                  <span className="text-xs ml-1">({t({ en: 'Low Power, High Interest', ar: 'قوة منخفضة، اهتمام عالي' })})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {groupedStakeholders['Keep Informed'].map(s => (
                    <Badge key={s.id} variant="outline" className="text-xs">{s.name || '?'}</Badge>
                  ))}
                  {groupedStakeholders['Keep Informed'].length === 0 && (
                    <span className="text-muted-foreground text-xs">{t({ en: 'None', ar: 'لا يوجد' })}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stakeholders List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-primary" />
            {t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' })}
            <Badge variant="secondary">{(data.stakeholders || []).length}</Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addStakeholder}>
            <Plus className="w-4 h-4 mr-1" />
            {t({ en: 'Add Stakeholder', ar: 'إضافة صاحب مصلحة' })}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data.stakeholders || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              {t({ en: 'No stakeholders added yet. Click "Add Stakeholder" to begin.', ar: 'لم يتم إضافة أصحاب مصلحة بعد. انقر "إضافة صاحب مصلحة" للبدء.' })}
            </div>
          ) : (
            <div className="space-y-4">
              {data.stakeholders.map((stakeholder, index) => {
                const quadrant = getQuadrant(stakeholder.power, stakeholder.interest);
                return (
                  <div key={stakeholder.id} className={cn("p-4 border rounded-lg space-y-4", quadrant.color)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{quadrant.name}</Badge>
                        <Badge variant="secondary">
                          {STAKEHOLDER_TYPES.find(t => t.code === stakeholder.type)?.[`name_${language}`] || stakeholder.type}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeStakeholder(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label>{t({ en: 'Stakeholder Name', ar: 'اسم صاحب المصلحة' })} *</Label>
                        <Input
                          value={stakeholder.name}
                          onChange={(e) => updateStakeholder(index, 'name', e.target.value)}
                          placeholder={t({ en: 'e.g., Ministry of Finance', ar: 'مثال: وزارة المالية' })}
                        />
                      </div>
                      
                      <div>
                        <Label>{t({ en: 'Type', ar: 'النوع' })}</Label>
                        <Select
                          value={stakeholder.type}
                          onValueChange={(v) => updateStakeholder(index, 'type', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STAKEHOLDER_TYPES.map(type => (
                              <SelectItem key={type.code} value={type.code}>
                                {type[`name_${language}`]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>{t({ en: 'Engagement Level', ar: 'مستوى المشاركة' })}</Label>
                        <Select
                          value={stakeholder.engagement_level}
                          onValueChange={(v) => updateStakeholder(index, 'engagement_level', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {engagementLevels.map(level => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label[language]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>{t({ en: 'Power Level', ar: 'مستوى القوة' })}</Label>
                        <Select
                          value={stakeholder.power}
                          onValueChange={(v) => updateStakeholder(index, 'power', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {powerInterestOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label[language]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>{t({ en: 'Interest Level', ar: 'مستوى الاهتمام' })}</Label>
                        <Select
                          value={stakeholder.interest}
                          onValueChange={(v) => updateStakeholder(index, 'interest', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {powerInterestOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label[language]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>{t({ en: 'Contact Person', ar: 'جهة الاتصال' })}</Label>
                        <Input
                          value={stakeholder.contact_person}
                          onChange={(e) => updateStakeholder(index, 'contact_person', e.target.value)}
                          placeholder={t({ en: 'Name', ar: 'الاسم' })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>{t({ en: 'Influence Strategy', ar: 'استراتيجية التأثير' })}</Label>
                      <Textarea
                        value={stakeholder.influence_strategy}
                        onChange={(e) => updateStakeholder(index, 'influence_strategy', e.target.value)}
                        placeholder={t({ en: 'How will you engage and influence this stakeholder?', ar: 'كيف ستتعامل مع وتؤثر على صاحب المصلحة هذا؟' })}
                        rows={2}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Engagement Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t({ en: 'Stakeholder Engagement Plan', ar: 'خطة إشراك أصحاب المصلحة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.stakeholder_engagement_plan || ''}
            onChange={(e) => onChange({ stakeholder_engagement_plan: e.target.value })}
            placeholder={t({ 
              en: 'Describe the overall approach to stakeholder engagement throughout the strategy lifecycle...',
              ar: 'وصف النهج العام لإشراك أصحاب المصلحة طوال دورة حياة الاستراتيجية...'
            })}
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
}
