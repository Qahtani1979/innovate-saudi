import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../LanguageContext';
import { Webhook, Plus, AlertCircle, Target, Zap, CheckCircle2 } from 'lucide-react';

export default function WebhookBuilder() {
  const { t } = useLanguage();
  const [strategicTriggers, setStrategicTriggers] = useState({
    strategic_plan_created: false,
    strategic_plan_approved: false,
    strategic_objective_updated: false,
    strategy_derived_entity_created: false,
    strategic_kpi_threshold_breached: false,
    strategic_milestone_completed: false,
    strategy_review_scheduled: false
  });
  const [filterByPlan, setFilterByPlan] = useState('all');

  const toggleTrigger = (key) => {
    setStrategicTriggers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const strategicEventTriggers = [
    { key: 'strategic_plan_created', label: { en: 'Strategic Plan Created', ar: 'إنشاء خطة استراتيجية' }, icon: Target },
    { key: 'strategic_plan_approved', label: { en: 'Strategic Plan Approved', ar: 'اعتماد خطة استراتيجية' }, icon: CheckCircle2 },
    { key: 'strategic_objective_updated', label: { en: 'Strategic Objective Updated', ar: 'تحديث هدف استراتيجي' }, icon: Target },
    { key: 'strategy_derived_entity_created', label: { en: 'Strategy-Derived Entity Created', ar: 'إنشاء كيان مشتق من الاستراتيجية' }, icon: Zap },
    { key: 'strategic_kpi_threshold_breached', label: { en: 'Strategic KPI Threshold Breached', ar: 'تجاوز حد مؤشر أداء استراتيجي' }, icon: AlertCircle },
    { key: 'strategic_milestone_completed', label: { en: 'Strategic Milestone Completed', ar: 'اكتمال معلم استراتيجي' }, icon: CheckCircle2 },
    { key: 'strategy_review_scheduled', label: { en: 'Strategy Review Scheduled', ar: 'جدولة مراجعة استراتيجية' }, icon: Target }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5 text-purple-600" />
          {t({ en: 'Webhook Builder', ar: 'بناء Webhook' })}
          <Badge className="ml-auto bg-amber-500">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Input placeholder={t({ en: 'Webhook Name', ar: 'اسم Webhook' })} />
          <Input placeholder={t({ en: 'Target URL', ar: 'الرابط المستهدف' })} />
          
          {/* Standard Event Triggers */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Standard Event Triggers', ar: 'مشغلات الأحداث القياسية' })}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Challenge Created', 'Pilot Updated', 'Approval Required', 'Milestone Completed'].map(event => (
                <label key={event} className="flex items-center gap-2 text-sm p-2 border rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-slate-700">{event}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Strategic Event Triggers - NEW SECTION */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-indigo-600" />
              <label className="text-sm font-semibold text-indigo-900">
                {t({ en: 'Strategic Event Triggers', ar: 'مشغلات الأحداث الاستراتيجية' })}
              </label>
            </div>
            
            {/* Filter by Strategic Plan */}
            <div className="mb-3">
              <Label className="text-xs text-slate-600 mb-1 block">
                {t({ en: 'Filter by Strategic Plan (optional)', ar: 'تصفية حسب الخطة الاستراتيجية (اختياري)' })}
              </Label>
              <Select value={filterByPlan} onValueChange={setFilterByPlan}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t({ en: 'All Strategic Plans', ar: 'جميع الخطط الاستراتيجية' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t({ en: 'All Strategic Plans', ar: 'جميع الخطط الاستراتيجية' })}</SelectItem>
                  <SelectItem value="vision_2030">{t({ en: 'Vision 2030 Alignment', ar: 'توافق رؤية 2030' })}</SelectItem>
                  <SelectItem value="municipal_strategy">{t({ en: 'Municipal Development Strategy', ar: 'استراتيجية التنمية البلدية' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {strategicEventTriggers.map(trigger => {
                const Icon = trigger.icon;
                return (
                  <div 
                    key={trigger.key} 
                    className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer transition-colors ${
                      strategicTriggers[trigger.key] ? 'bg-indigo-50 border-indigo-300' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => toggleTrigger(trigger.key)}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${strategicTriggers[trigger.key] ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className={`text-sm ${strategicTriggers[trigger.key] ? 'text-indigo-900 font-medium' : 'text-slate-700'}`}>
                        {trigger.label[t.language] || trigger.label.en}
                      </span>
                    </div>
                    <Switch 
                      checked={strategicTriggers[trigger.key]} 
                      onCheckedChange={() => toggleTrigger(trigger.key)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          
          <Textarea 
            placeholder={t({ en: 'Payload Template (JSON)', ar: 'قالب الحمولة (JSON)' })} 
            rows={4} 
            className="font-mono text-xs"
            defaultValue={`{
  "event": "{{event_type}}",
  "strategic_plan_id": "{{strategic_plan_id}}",
  "entity_id": "{{entity_id}}",
  "entity_type": "{{entity_type}}",
  "is_strategy_derived": {{is_strategy_derived}},
  "timestamp": "{{timestamp}}"
}`}
          />
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" className="flex-1">
            {t({ en: 'Test Webhook', ar: 'اختبار Webhook' })}
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Save Webhook', ar: 'حفظ Webhook' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}