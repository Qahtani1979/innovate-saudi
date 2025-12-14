import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/components/LanguageContext';
import {
  Layers, Settings, Target, GitBranch, MessageSquare, BarChart3,
  CheckCircle2, ArrowRight, AlertTriangle, Zap
} from 'lucide-react';
import { toast } from 'sonner';

const PHASE_CONFIGS = [
  {
    phase: 2,
    name: { en: 'Strategy Creation', ar: 'إنشاء الاستراتيجية' },
    icon: Target,
    adjustments: [
      { id: 'revise_objectives', label: { en: 'Revise Objectives', ar: 'مراجعة الأهداف' } },
      { id: 'adjust_kpi_targets', label: { en: 'Adjust KPI Targets', ar: 'تعديل أهداف مؤشرات الأداء' } },
      { id: 'modify_timeline', label: { en: 'Modify Timeline', ar: 'تعديل الجدول الزمني' } },
      { id: 'reallocate_budget', label: { en: 'Reallocate Budget', ar: 'إعادة تخصيص الميزانية' } }
    ]
  },
  {
    phase: 3,
    name: { en: 'Cascade', ar: 'التوزيع' },
    icon: GitBranch,
    adjustments: [
      { id: 'pause_entity', label: { en: 'Pause Entity', ar: 'إيقاف الكيان مؤقتاً' } },
      { id: 'pivot_entity', label: { en: 'Pivot Entity Direction', ar: 'تغيير اتجاه الكيان' } },
      { id: 'resource_reallocation', label: { en: 'Resource Reallocation', ar: 'إعادة تخصيص الموارد' } },
      { id: 'vehicle_mix_change', label: { en: 'Change Vehicle Mix', ar: 'تغيير مزيج الأدوات' } }
    ]
  },
  {
    phase: 4,
    name: { en: 'Governance', ar: 'الحوكمة' },
    icon: Settings,
    adjustments: [
      { id: 'approval_threshold', label: { en: 'Change Approval Thresholds', ar: 'تغيير حدود الموافقة' } },
      { id: 'workflow_simplify', label: { en: 'Simplify Workflow', ar: 'تبسيط سير العمل' } },
      { id: 'committee_structure', label: { en: 'Modify Committee Structure', ar: 'تعديل هيكل اللجنة' } },
      { id: 'escalation_rules', label: { en: 'Update Escalation Rules', ar: 'تحديث قواعد التصعيد' } }
    ]
  },
  {
    phase: 5,
    name: { en: 'Communication', ar: 'التواصل' },
    icon: MessageSquare,
    adjustments: [
      { id: 'messaging_revision', label: { en: 'Revise Key Messages', ar: 'مراجعة الرسائل الرئيسية' } },
      { id: 'channel_optimization', label: { en: 'Optimize Channels', ar: 'تحسين القنوات' } },
      { id: 'frequency_adjustment', label: { en: 'Adjust Communication Frequency', ar: 'تعديل تكرار التواصل' } },
      { id: 'audience_targeting', label: { en: 'Refine Audience Targeting', ar: 'تحسين استهداف الجمهور' } }
    ]
  },
  {
    phase: 6,
    name: { en: 'Monitoring', ar: 'المراقبة' },
    icon: BarChart3,
    adjustments: [
      { id: 'threshold_recalibration', label: { en: 'Recalibrate Thresholds', ar: 'إعادة معايرة العتبات' } },
      { id: 'dashboard_enhancement', label: { en: 'Enhance Dashboards', ar: 'تحسين لوحات المعلومات' } },
      { id: 'reporting_frequency', label: { en: 'Change Reporting Frequency', ar: 'تغيير تكرار التقارير' } },
      { id: 'alert_rules', label: { en: 'Update Alert Rules', ar: 'تحديث قواعد التنبيه' } }
    ]
  }
];

export default function PhaseModificationExecutor({ planId, onExecute }) {
  const { t, language } = useLanguage();
  const [activePhase, setActivePhase] = useState('2');
  const [selectedAdjustments, setSelectedAdjustments] = useState({});
  const [justifications, setJustifications] = useState({});
  const [executionQueue, setExecutionQueue] = useState([]);

  const toggleAdjustment = (phaseNum, adjustmentId) => {
    const key = `${phaseNum}-${adjustmentId}`;
    setSelectedAdjustments(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateJustification = (phaseNum, text) => {
    setJustifications(prev => ({ ...prev, [phaseNum]: text }));
  };

  const queueModification = (phaseConfig) => {
    const phaseAdjustments = Object.entries(selectedAdjustments)
      .filter(([key, selected]) => selected && key.startsWith(`${phaseConfig.phase}-`))
      .map(([key]) => key.split('-')[1]);

    if (phaseAdjustments.length === 0) {
      toast.error(t({ en: 'Select at least one adjustment', ar: 'حدد تعديلاً واحداً على الأقل' }));
      return;
    }

    const modification = {
      id: Date.now(),
      phase: phaseConfig.phase,
      phaseName: phaseConfig.name,
      adjustments: phaseAdjustments,
      justification: justifications[phaseConfig.phase] || '',
      status: 'queued',
      timestamp: new Date().toISOString()
    };

    setExecutionQueue(prev => [...prev, modification]);
    toast.success(t({ en: `Phase ${phaseConfig.phase} modification queued`, ar: `تمت إضافة تعديل المرحلة ${phaseConfig.phase} للطابور` }));
  };

  const executeQueue = () => {
    if (executionQueue.length === 0) return;

    // Mark all as executing
    setExecutionQueue(prev => prev.map(m => ({ ...m, status: 'executing' })));

    // Simulate execution
    setTimeout(() => {
      setExecutionQueue(prev => prev.map(m => ({ ...m, status: 'completed' })));
      toast.success(t({ en: 'All modifications executed successfully', ar: 'تم تنفيذ جميع التعديلات بنجاح' }));
      
      if (onExecute) {
        onExecute(executionQueue);
      }
    }, 2000);
  };

  const clearQueue = () => {
    setExecutionQueue([]);
    setSelectedAdjustments({});
    setJustifications({});
  };

  const currentPhaseConfig = PHASE_CONFIGS.find(p => p.phase.toString() === activePhase);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          {t({ en: 'Phase Modification Executor', ar: 'منفذ تعديلات المراحل' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activePhase} onValueChange={setActivePhase}>
          <TabsList className="grid w-full grid-cols-5">
            {PHASE_CONFIGS.map(config => {
              const Icon = config.icon;
              return (
                <TabsTrigger key={config.phase} value={config.phase.toString()}>
                  <Icon className="h-4 w-4 mr-1" />
                  P{config.phase}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {PHASE_CONFIGS.map(config => {
            const Icon = config.icon;
            return (
              <TabsContent key={config.phase} value={config.phase.toString()} className="space-y-4 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">
                    {t({ en: `Phase ${config.phase}:`, ar: `المرحلة ${config.phase}:` })} {t(config.name)}
                  </h3>
                </div>

                {/* Adjustments */}
                <div className="space-y-2">
                  <Label>{t({ en: 'Select Adjustments', ar: 'حدد التعديلات' })}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {config.adjustments.map(adj => {
                      const key = `${config.phase}-${adj.id}`;
                      return (
                        <label
                          key={adj.id}
                          className={`flex items-center gap-2 p-3 border rounded cursor-pointer transition-colors ${
                            selectedAdjustments[key] ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                          }`}
                        >
                          <Checkbox
                            checked={selectedAdjustments[key] || false}
                            onCheckedChange={() => toggleAdjustment(config.phase, adj.id)}
                          />
                          <span className="text-sm">{t(adj.label)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Justification */}
                <div className="space-y-2">
                  <Label>{t({ en: 'Justification', ar: 'المبرر' })}</Label>
                  <Textarea
                    value={justifications[config.phase] || ''}
                    onChange={(e) => updateJustification(config.phase, e.target.value)}
                    placeholder={t({ en: 'Explain the reason for these modifications...', ar: 'اشرح سبب هذه التعديلات...' })}
                    rows={2}
                  />
                </div>

                <Button 
                  onClick={() => queueModification(config)}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {t({ en: 'Add to Execution Queue', ar: 'إضافة إلى طابور التنفيذ' })}
                </Button>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Execution Queue */}
        {executionQueue.length > 0 && (
          <div className="pt-4 border-t space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{t({ en: 'Execution Queue', ar: 'طابور التنفيذ' })}</h3>
              <Badge variant="outline">{executionQueue.length} {t({ en: 'modifications', ar: 'تعديلات' })}</Badge>
            </div>

            <div className="space-y-2">
              {executionQueue.map((mod) => (
                <div 
                  key={mod.id} 
                  className={`p-3 border rounded-lg flex items-center justify-between ${
                    mod.status === 'completed' ? 'bg-green-50 border-green-200' :
                    mod.status === 'executing' ? 'bg-amber-50 border-amber-200' :
                    'bg-muted/50'
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm">
                      Phase {mod.phase}: {t(mod.phaseName)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mod.adjustments.length} {t({ en: 'adjustments', ar: 'تعديلات' })}
                    </p>
                  </div>
                  {mod.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : mod.status === 'executing' ? (
                    <Zap className="h-5 w-5 text-amber-600 animate-pulse" />
                  ) : (
                    <Badge variant="secondary">{t({ en: 'Queued', ar: 'في الانتظار' })}</Badge>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={clearQueue} className="flex-1">
                {t({ en: 'Clear Queue', ar: 'مسح الطابور' })}
              </Button>
              <Button 
                onClick={executeQueue}
                disabled={executionQueue.some(m => m.status === 'executing')}
                className="flex-1"
              >
                <Zap className="h-4 w-4 mr-2" />
                {t({ en: 'Execute All', ar: 'تنفيذ الكل' })}
              </Button>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">{t({ en: 'Important', ar: 'مهم' })}</p>
            <p>
              {t({ 
                en: 'Phase modifications may affect multiple entities and require governance approval before taking effect.',
                ar: 'قد تؤثر تعديلات المراحل على كيانات متعددة وتتطلب موافقة الحوكمة قبل السريان.'
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
