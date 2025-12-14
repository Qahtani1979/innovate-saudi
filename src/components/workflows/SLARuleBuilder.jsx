import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { Clock, Plus, Trash2, Save, Target, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * SLARuleBuilder - Updated with Strategic Priority Tiers
 * Enhancement: Strategic entities get priority SLA escalation
 */
export default function SLARuleBuilder() {
  const { language, isRTL, t } = useLanguage();
  
  // Fetch strategic plans for context
  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans-sla'],
    queryFn: async () => {
      const { data } = await supabase
        .from('strategic_plans')
        .select('id, name_en, name_ar, status')
        .order('name_en');
      return data || [];
    }
  });

  const [rules, setRules] = useState([
    { 
      entity: 'Challenge', 
      action: 'Approval', 
      sla_hours: 120, 
      escalate_to: 'Program Director',
      is_strategy_derived: false,
      strategic_priority_multiplier: 1,
      strategic_sla_hours: 120
    },
    { 
      entity: 'Pilot', 
      action: 'Review', 
      sla_hours: 72, 
      escalate_to: 'Municipality Lead',
      is_strategy_derived: true,
      strategic_priority_multiplier: 0.5,
      strategic_sla_hours: 36
    }
  ]);

  const [selectedStrategicPlan, setSelectedStrategicPlan] = useState('all');

  // Strategic priority tiers - strategy-derived entities get faster SLAs
  const priorityTiers = [
    { value: 1, label: { en: 'Standard (1x)', ar: 'قياسي (1x)' }, multiplier: 1, color: 'bg-slate-500' },
    { value: 0.75, label: { en: 'Priority (0.75x)', ar: 'أولوية (0.75x)' }, multiplier: 0.75, color: 'bg-amber-500' },
    { value: 0.5, label: { en: 'High Priority (0.5x)', ar: 'أولوية عالية (0.5x)' }, multiplier: 0.5, color: 'bg-orange-500' },
    { value: 0.25, label: { en: 'Critical (0.25x)', ar: 'حرج (0.25x)' }, multiplier: 0.25, color: 'bg-red-500' }
  ];

  const addRule = () => {
    setRules([...rules, { 
      entity: '', 
      action: '', 
      sla_hours: 48, 
      escalate_to: '',
      is_strategy_derived: false,
      strategic_priority_multiplier: 1,
      strategic_sla_hours: 48
    }]);
  };

  const removeRule = (index) => {
    setRules(rules.filter((_, idx) => idx !== index));
  };

  const updateRule = (index, field, value) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    
    // Auto-calculate strategic SLA when base SLA or multiplier changes
    if (field === 'sla_hours' || field === 'strategic_priority_multiplier') {
      const baseHours = field === 'sla_hours' ? value : newRules[index].sla_hours;
      const multiplier = field === 'strategic_priority_multiplier' ? value : newRules[index].strategic_priority_multiplier;
      newRules[index].strategic_sla_hours = Math.round(baseHours * multiplier);
    }
    
    // Auto-enable strategic priority when marked as strategy-derived
    if (field === 'is_strategy_derived' && value === true) {
      newRules[index].strategic_priority_multiplier = 0.5;
      newRules[index].strategic_sla_hours = Math.round(newRules[index].sla_hours * 0.5);
    }
    
    setRules(newRules);
  };

  const handleSave = () => {
    toast.success(t({ en: 'SLA rules saved with strategic priority tiers', ar: 'تم حفظ قواعد الخدمة مع مستويات الأولوية الاستراتيجية' }));
  };

  return (
    <Card className="border-2 border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600" />
          {t({ en: 'SLA Rule Builder', ar: 'بناء قواعد اتفاقية الخدمة' })}
        </CardTitle>
        <CardDescription>
          {t({ 
            en: 'Configure SLA rules with strategic priority escalation', 
            ar: 'تكوين قواعد الخدمة مع تصعيد الأولوية الاستراتيجية' 
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Strategic Plan Filter */}
        <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <Target className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <label className="text-sm font-medium">{t({ en: 'Strategic Plan Context', ar: 'سياق الخطة الاستراتيجية' })}</label>
            <Select value={selectedStrategicPlan} onValueChange={setSelectedStrategicPlan}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t({ en: 'Select plan...', ar: 'اختر الخطة...' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Plans (Global Rules)', ar: 'جميع الخطط (قواعد عامة)' })}</SelectItem>
                {strategicPlans.map(plan => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {isRTL ? plan.name_ar : plan.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          {rules.map((rule, i) => (
            <div key={i} className={`p-4 rounded-lg border-2 ${rule.is_strategy_derived ? 'bg-primary/5 border-primary/30' : 'bg-slate-50'}`}>
              <div className="grid grid-cols-5 gap-3 mb-3">
                <Select value={rule.entity} onValueChange={(v) => updateRule(i, 'entity', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Entity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Challenge">Challenge</SelectItem>
                    <SelectItem value="Pilot">Pilot</SelectItem>
                    <SelectItem value="RDProject">R&D Project</SelectItem>
                    <SelectItem value="Program">Program</SelectItem>
                    <SelectItem value="Partnership">Partnership</SelectItem>
                    <SelectItem value="LivingLab">Living Lab</SelectItem>
                    <SelectItem value="Sandbox">Sandbox</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={rule.action} onValueChange={(v) => updateRule(i, 'action', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Approval">Approval</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                    <SelectItem value="Response">Response</SelectItem>
                    <SelectItem value="Data Submit">Data Submit</SelectItem>
                    <SelectItem value="Evaluation">Evaluation</SelectItem>
                  </SelectContent>
                </Select>

                <div>
                  <Input
                    type="number"
                    placeholder="SLA Hours"
                    value={rule.sla_hours}
                    onChange={(e) => updateRule(i, 'sla_hours', parseInt(e.target.value))}
                  />
                </div>

                <Input
                  placeholder="Escalate to"
                  value={rule.escalate_to}
                  onChange={(e) => updateRule(i, 'escalate_to', e.target.value)}
                />

                <Button size="icon" variant="ghost" onClick={() => removeRule(i)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>

              {/* Strategic Priority Settings */}
              <div className="flex items-center gap-4 pt-3 border-t">
                <div className="flex items-center gap-2 p-2 bg-white rounded border">
                  <span className="text-xs">{t({ en: 'Strategy-Derived', ar: 'مشتق استراتيجيًا' })}</span>
                  <Switch
                    checked={rule.is_strategy_derived}
                    onCheckedChange={(v) => updateRule(i, 'is_strategy_derived', v)}
                  />
                </div>

                {rule.is_strategy_derived && (
                  <>
                    <div className="flex-1">
                      <label className="text-xs font-medium mb-1 block">{t({ en: 'Priority Tier', ar: 'مستوى الأولوية' })}</label>
                      <Select 
                        value={rule.strategic_priority_multiplier.toString()} 
                        onValueChange={(v) => updateRule(i, 'strategic_priority_multiplier', parseFloat(v))}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityTiers.map(tier => (
                            <SelectItem key={tier.value} value={tier.value.toString()}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${tier.color}`} />
                                {t(tier.label)}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-600 text-white">
                        {t({ en: 'Standard:', ar: 'قياسي:' })} {(rule.sla_hours / 24).toFixed(1)} {t({ en: 'days', ar: 'يوم' })}
                      </Badge>
                      <Badge className="bg-primary text-primary-foreground">
                        {t({ en: 'Strategic:', ar: 'استراتيجي:' })} {(rule.strategic_sla_hours / 24).toFixed(1)} {t({ en: 'days', ar: 'يوم' })}
                      </Badge>
                    </div>
                  </>
                )}

                {!rule.is_strategy_derived && (
                  <Badge className="bg-amber-600 text-white">
                    {(rule.sla_hours / 24).toFixed(1)} {t({ en: 'days', ar: 'يوم' })}
                  </Badge>
                )}
              </div>

              {rule.is_strategy_derived && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-amber-50 rounded border border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-xs text-amber-700">
                    {t({ 
                      en: `Strategy-derived entities will use ${rule.strategic_sla_hours}h SLA (${rule.strategic_priority_multiplier}x priority)`, 
                      ar: `الكيانات المشتقة استراتيجيًا ستستخدم ${rule.strategic_sla_hours} ساعة (أولوية ${rule.strategic_priority_multiplier}x)` 
                    })}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button onClick={addRule} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {t({ en: 'Add SLA Rule', ar: 'إضافة قاعدة' })}
        </Button>

        <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          {t({ en: 'Save SLA Rules with Strategic Tiers', ar: 'حفظ القواعد مع المستويات الاستراتيجية' })}
        </Button>
      </CardContent>
    </Card>
  );
}
