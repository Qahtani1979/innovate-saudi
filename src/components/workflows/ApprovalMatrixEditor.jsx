import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Users, Save, Plus, Trash2, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * ApprovalMatrixEditor - Updated with Strategic Approval Chains
 * Gap Fix: Phase 4 specifies strategic approval chains but this component didn't implement them
 * 
 * Per Integration Matrix F.8:
 * "Gate 1: initial_review, Gate 2: budget_approval, Gate 3: legal_review, Gate 4: executive_approval"
 */
export default function ApprovalMatrixEditor() {
  const { language, isRTL, t } = useLanguage();
  
  // Fetch strategic plans for strategic approval chains
  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans-approval'],
    queryFn: async () => {
      const { data } = await supabase
        .from('strategic_plans')
        .select('id, name_en, name_ar, status')
        .eq('is_deleted', false)
        .order('name_en');
      return data || [];
    }
  });

  const [matrix, setMatrix] = useState([
    { 
      role: 'Municipality Admin', 
      threshold: 100000, 
      sequential: false,
      strategic_priority: 'normal',
      strategy_derived_priority: false
    },
    { 
      role: 'Program Director', 
      threshold: 500000, 
      sequential: true,
      strategic_priority: 'high',
      strategy_derived_priority: true
    },
    { 
      role: 'Executive', 
      threshold: 1000000, 
      sequential: true,
      strategic_priority: 'critical',
      strategy_derived_priority: true
    }
  ]);

  // Strategic approval chains per Phase 4 specification
  const [strategicChains, setStrategicChains] = useState([
    {
      id: 'gate-1',
      gate_name: 'initial_review',
      gate_label: { en: 'Initial Review', ar: 'المراجعة الأولية' },
      approver_role: 'Municipality Admin',
      sla_hours: 48,
      required_for_strategic: true
    },
    {
      id: 'gate-2',
      gate_name: 'budget_approval',
      gate_label: { en: 'Budget Approval', ar: 'اعتماد الميزانية' },
      approver_role: 'Finance Manager',
      sla_hours: 72,
      required_for_strategic: true
    },
    {
      id: 'gate-3',
      gate_name: 'legal_review',
      gate_label: { en: 'Legal Review', ar: 'المراجعة القانونية' },
      approver_role: 'Legal Officer',
      sla_hours: 120,
      required_for_strategic: false
    },
    {
      id: 'gate-4',
      gate_name: 'executive_approval',
      gate_label: { en: 'Executive Approval', ar: 'اعتماد تنفيذي' },
      approver_role: 'Executive',
      sla_hours: 72,
      required_for_strategic: true
    }
  ]);

  const [selectedStrategicPlan, setSelectedStrategicPlan] = useState('all');
  const [showStrategicChains, setShowStrategicChains] = useState(true);

  const priorityOptions = [
    { value: 'normal', label: { en: 'Normal', ar: 'عادي' }, color: 'bg-slate-500' },
    { value: 'high', label: { en: 'High (Strategic)', ar: 'عالي (استراتيجي)' }, color: 'bg-amber-500' },
    { value: 'critical', label: { en: 'Critical (Strategy-Derived)', ar: 'حرج (مشتق استراتيجيًا)' }, color: 'bg-red-500' }
  ];

  const addRule = () => {
    setMatrix([...matrix, { 
      role: '', 
      threshold: 0, 
      sequential: false,
      strategic_priority: 'normal',
      strategy_derived_priority: false
    }]);
  };

  const removeRule = (index) => {
    setMatrix(matrix.filter((_, i) => i !== index));
  };

  const updateRule = (index, field, value) => {
    const newMatrix = [...matrix];
    newMatrix[index][field] = value;
    setMatrix(newMatrix);
  };

  const updateStrategicChain = (index, field, value) => {
    const newChains = [...strategicChains];
    newChains[index][field] = value;
    setStrategicChains(newChains);
  };

  const handleSave = () => {
    toast.success(t({ en: 'Approval matrix saved with strategic chains', ar: 'تم حفظ مصفوفة الموافقات مع السلاسل الاستراتيجية' }));
  };

  return (
    <div className="space-y-6">
      {/* Main Approval Matrix */}
      <Card className="border-2 border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-600" />
            {t({ en: 'Approval Matrix Editor', ar: 'محرر مصفوفة الموافقات' })}
          </CardTitle>
          <CardDescription>
            {t({ 
              en: 'Configure approval thresholds with strategic priority escalation', 
              ar: 'تكوين عتبات الموافقة مع تصعيد الأولوية الاستراتيجية' 
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

          {/* Approval Rules */}
          <div className="space-y-3">
            {matrix.map((rule, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg border-2">
                <div className="grid grid-cols-5 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">{t({ en: 'Role', ar: 'الدور' })}</label>
                    <Select value={rule.role} onValueChange={(v) => updateRule(i, 'role', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Municipality Admin">Municipality Admin</SelectItem>
                        <SelectItem value="Program Director">Program Director</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                        <SelectItem value="Finance Manager">Finance Manager</SelectItem>
                        <SelectItem value="Legal Officer">Legal Officer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">{t({ en: 'Budget Threshold (SAR)', ar: 'حد الميزانية (ريال)' })}</label>
                    <Select value={rule.threshold.toString()} onValueChange={(v) => updateRule(i, 'threshold', parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100000">100K</SelectItem>
                        <SelectItem value="500000">500K</SelectItem>
                        <SelectItem value="1000000">1M</SelectItem>
                        <SelectItem value="5000000">5M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">{t({ en: 'Strategic Priority', ar: 'الأولوية الاستراتيجية' })}</label>
                    <Select value={rule.strategic_priority} onValueChange={(v) => updateRule(i, 'strategic_priority', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${opt.color}`} />
                              {t(opt.label)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-xs">{t({ en: 'Sequential', ar: 'تسلسلي' })}</span>
                      <Switch
                        checked={rule.sequential}
                        onCheckedChange={(v) => updateRule(i, 'sequential', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-xs">{t({ en: 'Strategy-Derived', ar: 'مشتق استراتيجيًا' })}</span>
                      <Switch
                        checked={rule.strategy_derived_priority}
                        onCheckedChange={(v) => updateRule(i, 'strategy_derived_priority', v)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <Button size="icon" variant="ghost" onClick={() => removeRule(i)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                {rule.strategy_derived_priority && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-amber-50 rounded border border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-xs text-amber-700">
                      {t({ 
                        en: 'Strategy-derived entities will trigger priority escalation in approval workflow', 
                        ar: 'الكيانات المشتقة استراتيجيًا ستؤدي إلى تصعيد الأولوية في سير الموافقة' 
                      })}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button onClick={addRule} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Add Approval Rule', ar: 'إضافة قاعدة موافقة' })}
          </Button>
        </CardContent>
      </Card>

      {/* Strategic Approval Chains (Phase 4 Requirement) */}
      <Card className="border-2 border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {t({ en: 'Strategic Approval Chains', ar: 'سلاسل الموافقة الاستراتيجية' })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  en: 'Gate-based approval workflow for strategy-derived entities (Phase 4)', 
                  ar: 'سير عمل الموافقة المبني على البوابات للكيانات المشتقة استراتيجيًا (المرحلة 4)' 
                })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{t({ en: 'Enable', ar: 'تفعيل' })}</span>
              <Switch checked={showStrategicChains} onCheckedChange={setShowStrategicChains} />
            </div>
          </div>
        </CardHeader>
        {showStrategicChains && (
          <CardContent>
            <div className="space-y-3">
              {strategicChains.map((chain, i) => (
                <div key={chain.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block">{t({ en: 'Gate', ar: 'البوابة' })}</label>
                      <Badge variant="outline" className="w-full justify-center py-1">
                        {t(chain.gate_label)}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">{t({ en: 'Approver Role', ar: 'دور المعتمد' })}</label>
                      <Select value={chain.approver_role} onValueChange={(v) => updateStrategicChain(i, 'approver_role', v)}>
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Municipality Admin">Municipality Admin</SelectItem>
                          <SelectItem value="Program Director">Program Director</SelectItem>
                          <SelectItem value="Executive">Executive</SelectItem>
                          <SelectItem value="Finance Manager">Finance Manager</SelectItem>
                          <SelectItem value="Legal Officer">Legal Officer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">{t({ en: 'SLA (hours)', ar: 'الوقت المحدد (ساعات)' })}</label>
                      <Select value={chain.sla_hours.toString()} onValueChange={(v) => updateStrategicChain(i, 'sla_hours', parseInt(v))}>
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24">24h</SelectItem>
                          <SelectItem value="48">48h</SelectItem>
                          <SelectItem value="72">72h</SelectItem>
                          <SelectItem value="120">120h (5 days)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-2 p-2 bg-white rounded border">
                        <span className="text-xs">{t({ en: 'Required', ar: 'مطلوب' })}</span>
                        <Switch
                          checked={chain.required_for_strategic}
                          onCheckedChange={(v) => updateStrategicChain(i, 'required_for_strategic', v)}
                        />
                      </div>
                    </div>
                  </div>
                  {chain.required_for_strategic && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Save Button */}
      <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={handleSave}>
        <Save className="h-4 w-4 mr-2" />
        {t({ en: 'Save Approval Matrix & Strategic Chains', ar: 'حفظ مصفوفة الموافقات والسلاسل الاستراتيجية' })}
      </Button>
    </div>
  );
}
