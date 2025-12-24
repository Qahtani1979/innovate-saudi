import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Shield,
  Send,
  CheckCircle2,
  Activity,
  Rocket,
  Award,
  TrendingUp,
  DollarSign,
  Flag,
  RotateCcw,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function PilotGatesOverview() {
  const { language, isRTL, t } = useLanguage();

  // Refactored to use usePilotsWithVisibility for consistent RBAC
  const { data: pilots = [] } = usePilotsWithVisibility({ limit: 1000 });

  const gates = [
    {
      id: 'submission',
      name: { en: 'Submission Gate', ar: 'بوابة التقديم' },
      icon: Send,
      color: 'bg-blue-600',
      from: 'design',
      to: 'approval_pending',
      description: { en: 'Submit pilot for approval', ar: 'تقديم التجربة للموافقة' }
    },
    {
      id: 'approval',
      name: { en: 'Approval Gate', ar: 'بوابة الموافقة' },
      icon: CheckCircle2,
      color: 'bg-green-600',
      from: 'approval_pending',
      to: 'approved',
      description: { en: 'Multi-stakeholder approval process', ar: 'عملية موافقة متعددة الأطراف' }
    },
    {
      id: 'preparation',
      name: { en: 'Preparation Gate', ar: 'بوابة التحضير' },
      icon: Activity,
      color: 'bg-purple-600',
      from: 'approved',
      to: 'preparation',
      description: { en: 'Complete preparation checklist', ar: 'إكمال قائمة التحضير' }
    },
    {
      id: 'compliance',
      name: { en: 'Compliance Gate', ar: 'بوابة الامتثال' },
      icon: Shield,
      color: 'bg-blue-600',
      from: 'preparation',
      to: 'active',
      description: { en: 'Regulatory and safety verification', ar: 'التحقق التنظيمي والسلامة' }
    },
    {
      id: 'launch',
      name: { en: 'Launch Gate', ar: 'بوابة الإطلاق' },
      icon: Rocket,
      color: 'bg-green-600',
      from: 'preparation',
      to: 'active',
      description: { en: 'Final readiness check and go-live', ar: 'الفحص النهائي للجاهزية والإطلاق' }
    },
    {
      id: 'evaluation',
      name: { en: 'Evaluation Gate', ar: 'بوابة التقييم' },
      icon: Award,
      color: 'bg-amber-600',
      from: ['active', 'monitoring'],
      to: 'evaluation',
      description: { en: 'Close pilot and begin assessment', ar: 'إغلاق التجربة وبدء التقييم' }
    },
    {
      id: 'scaling',
      name: { en: 'Scaling Gate', ar: 'بوابة التوسع' },
      icon: TrendingUp,
      color: 'bg-teal-600',
      from: 'completed',
      to: 'scaled',
      description: { en: 'Approve for national rollout', ar: 'الموافقة على النشر الوطني' }
    },
    {
      id: 'budget',
      name: { en: 'Budget Gates', ar: 'بوابات الميزانية' },
      icon: DollarSign,
      color: 'bg-green-600',
      from: ['preparation', 'active'],
      to: null,
      description: { en: 'Phased budget release approvals', ar: 'موافقات صرف الميزانية المرحلية' }
    },
    {
      id: 'milestone',
      name: { en: 'Milestone Gates', ar: 'بوابات المعالم' },
      icon: Flag,
      color: 'bg-indigo-600',
      from: ['active', 'monitoring'],
      to: null,
      description: { en: 'Critical milestone approvals', ar: 'موافقات المعالم الحرجة' }
    }
  ];

  const specialWorkflows = [
    {
      id: 'pivot',
      name: { en: 'Pivot Workflow', ar: 'سير تغيير المسار' },
      icon: RotateCcw,
      color: 'bg-amber-600',
      description: { en: 'Mid-flight scope or approach changes', ar: 'تغييرات النطاق أو المنهج أثناء التنفيذ' }
    },
    {
      id: 'hold',
      name: { en: 'Hold/Resume', ar: 'إيقاف/استئناف' },
      icon: AlertTriangle,
      color: 'bg-orange-600',
      description: { en: 'Pause and resume pilot execution', ar: 'إيقاف واستئناف تنفيذ التجربة' }
    },
    {
      id: 'termination',
      name: { en: 'Termination Workflow', ar: 'سير الإنهاء' },
      icon: XCircle,
      color: 'bg-red-600',
      description: { en: 'Early termination with post-mortem', ar: 'الإنهاء المبكر مع تحليل ما بعد الإنهاء' }
    }
  ];

  const getPilotCount = (stage) => {
    if (Array.isArray(stage)) {
      return pilots.filter(p => stage.includes(p.stage)).length;
    }
    return pilots.filter(p => p.stage === stage).length;
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
            {t({ en: 'Pilot Gates & Workflows', ar: 'بوابات وسير عمل التجارب' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Complete stage-gate process for pilot management', ar: 'عملية البوابات المرحلية الكاملة لإدارة التجارب' })}
          </p>
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
          <Shield className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Standard Gates */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {t({ en: 'Standard Stage Gates', ar: 'البوابات المرحلية القياسية' })}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gates.map(gate => {
            const Icon = gate.icon;
            const count = Array.isArray(gate.from)
              ? getPilotCount(gate.from)
              : getPilotCount(gate.from);

            return (
              <Card key={gate.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-2 ${gate.color} rounded-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    {count > 0 && (
                      <Badge className="bg-red-100 text-red-700">{count} pending</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-3">
                    {gate.name[language]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    {gate.description[language]}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Badge variant="outline">{Array.isArray(gate.from) ? gate.from.join('/') : gate.from}</Badge>
                    {gate.to && (
                      <>
                        <span>→</span>
                        <Badge variant="outline">{gate.to}</Badge>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Special Workflows */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {t({ en: 'Exception Workflows', ar: 'سير العمل الاستثنائي' })}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {specialWorkflows.map(workflow => {
            const Icon = workflow.icon;
            return (
              <Card key={workflow.id} className="hover:shadow-lg transition-all border-2">
                <CardHeader>
                  <div className={`p-2 ${workflow.color} rounded-lg w-fit`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg mt-3">
                    {workflow.name[language]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    {workflow.description[language]}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Stage Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Pilots by Stage', ar: 'التجارب حسب المرحلة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['design', 'approval_pending', 'approved', 'preparation', 'active', 'monitoring', 'evaluation', 'completed', 'scaled', 'on_hold', 'terminated'].map(stage => (
              <div key={stage} className="text-center p-4 bg-slate-50 rounded-lg border">
                <p className="text-3xl font-bold text-blue-600">{getPilotCount(stage)}</p>
                <p className="text-xs text-slate-600 mt-1 capitalize">{stage.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-blue-600" />
            {t({ en: 'Gate Process Documentation', ar: 'توثيق عملية البوابات' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-700">
            {t({
              en: 'Each gate represents a decision point in the pilot lifecycle. Gates ensure quality, compliance, and readiness before advancing to the next stage.',
              ar: 'تمثل كل بوابة نقطة قرار في دورة حياة التجربة. تضمن البوابات الجودة والامتثال والجاهزية قبل الانتقال للمرحلة التالية.'
            })}
          </p>
          <Link to={createPageUrl('PilotWorkflowGuide')}>
            <Button variant="outline" className="w-full">
              {t({ en: 'View Complete Workflow Guide', ar: 'عرض دليل سير العمل الكامل' })}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(PilotGatesOverview, { requiredPermissions: ['pilot_view'] });