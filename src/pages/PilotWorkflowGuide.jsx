import React from 'react';
import PilotFlowDiagram from '../components/PilotFlowDiagram';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import {
  FileText, Clock, CheckCircle2, Activity, Rocket, TestTube, TrendingUp, AlertTriangle, ArrowRight,
  Users, Shield, Target, Sparkles, Settings
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function PilotWorkflowGuide() {
  const { language, isRTL, t } = useLanguage();

  const stages = [
    {
      stage: 'design',
      label: { en: 'Design', ar: 'التصميم' },
      icon: FileText,
      color: 'slate',
      description: {
        en: 'Initial pilot concept and planning',
        ar: 'المفهوم الأولي للتجربة والتخطيط'
      },
      initiatedBy: {
        en: 'Municipality staff, GDISB team, or auto-generated from challenges',
        ar: 'موظفو البلدية، فريق المنصة، أو يتم إنشاؤها تلقائياً من التحديات'
      },
      page: 'PilotCreate',
      actions: {
        en: '1. Fill 7-step wizard\n2. Link to challenge & solution\n3. Define KPIs, timeline, budget\n4. AI generates design suggestions\n5. Submit for approval',
        ar: '1. ملء معالج 7 خطوات\n2. الربط بالتحدي والحل\n3. تحديد المؤشرات والجدول الزمني والميزانية\n4. يقترح الذكاء الاصطناعي التصميم\n5. التقديم للموافقة'
      },
      next: 'approval_pending'
    },
    {
      stage: 'approval_pending',
      label: { en: 'Approval Pending', ar: 'قيد الموافقة' },
      icon: Clock,
      color: 'yellow',
      description: {
        en: 'Multi-step approval workflow in progress',
        ar: 'سير عمل الموافقة متعدد الخطوات قيد التنفيذ'
      },
      approvers: {
        en: 'Step 1: Technical Lead (technical_lead role)\nStep 2: Budget Officer (budget_officer role)\nStep 3: Municipality Director (municipality_director role)\nStep 4: GDISB Admin (gdisb_admin role)',
        ar: 'الخطوة 1: القائد التقني\nالخطوة 2: مسؤول الميزانية\nالخطوة 3: مدير البلدية\nالخطوة 4: مسؤول المنصة'
      },
      page: 'Approvals',
      assignedBy: {
        en: 'User roles determine approval authority. Each user is assigned a role (technical_lead, budget_officer, etc.) in User entity.',
        ar: 'أدوار المستخدم تحدد صلاحيات الموافقة. يتم تعيين دور لكل مستخدم في كيان المستخدم.'
      },
      actions: {
        en: 'Approvers review pilot in Approvals page → Approve/Reject → System moves to next approver → Final approval = stage becomes "approved"',
        ar: 'المراجعون يفحصون التجربة في صفحة الموافقات → موافقة/رفض → النظام ينتقل للمراجع التالي → الموافقة النهائية = المرحلة تصبح "موافق عليها"'
      },
      next: 'approved'
    },
    {
      stage: 'approved',
      label: { en: 'Approved', ar: 'موافق عليه' },
      icon: CheckCircle2,
      color: 'blue',
      description: {
        en: 'Ready to start preparation activities',
        ar: 'جاهز لبدء أنشطة الإعداد'
      },
      page: 'PilotDetail + PilotLaunchWizard',
      actions: {
        en: 'Click "Begin Preparation" button in PilotLaunchWizard',
        ar: 'انقر على زر "بدء الإعداد" في معالج الإطلاق'
      },
      next: 'preparation'
    },
    {
      stage: 'preparation',
      label: { en: 'Preparation', ar: 'الإعداد' },
      icon: Activity,
      color: 'purple',
      description: {
        en: 'Pre-launch setup and checklist completion',
        ar: 'الإعداد قبل الإطلاق وإكمال القائمة'
      },
      page: 'PilotLaunchWizard',
      actions: {
        en: 'Complete 8 checklist items:\n- Team onboarded\n- Stakeholders aligned\n- Equipment procured\n- Data systems ready\n- Safety verified\n- Regulatory approved\n- Communication plan\n- Budget allocated\n\nSet launch date → Click "Launch Pilot"',
        ar: 'إكمال 8 عناصر القائمة:\n- تأهيل الفريق\n- توافق الأطراف\n- شراء المعدات\n- جاهزية أنظمة البيانات\n- التحقق من السلامة\n- الموافقة التنظيمية\n- خطة التواصل\n- تخصيص الميزانية\n\nتعيين تاريخ الإطلاق ← انقر "إطلاق التجربة"'
      },
      next: 'active'
    },
    {
      stage: 'active',
      label: { en: 'Active', ar: 'نشط' },
      icon: Rocket,
      color: 'green',
      description: {
        en: 'Pilot is running - data collection in progress',
        ar: 'التجربة قيد التشغيل - جمع البيانات جارٍ'
      },
      page: 'PilotMonitoringDashboard',
      actions: {
        en: 'Monitor KPIs in real-time\nReceive alerts for anomalies\nUpdate milestone progress\nAdd comments/issues\nCan pause if needed',
        ar: 'مراقبة المؤشرات في الوقت الفعلي\nتلقي تنبيهات للمشاكل\nتحديث تقدم المعالم\nإضافة تعليقات/قضايا\nيمكن الإيقاف المؤقت'
      },
      next: 'monitoring → evaluation (auto when end date reached)'
    },
    {
      stage: 'evaluation',
      label: { en: 'Evaluation', ar: 'التقييم' },
      icon: Target,
      color: 'amber',
      description: {
        en: 'Post-pilot assessment and recommendation generation',
        ar: 'التقييم بعد التجربة وإنشاء التوصيات'
      },
      page: 'PilotEvaluations',
      actions: {
        en: 'AI analyzes:\n- KPI achievement vs targets\n- Budget utilization\n- Stakeholder feedback\n- Risk events\n\nGenerates recommendation: scale / iterate / terminate',
        ar: 'الذكاء الاصطناعي يحلل:\n- تحقيق المؤشرات مقابل الأهداف\n- استخدام الميزانية\n- ملاحظات الأطراف\n- أحداث المخاطر\n\nيولد التوصية: توسيع / تحسين / إنهاء'
      },
      next: 'completed (with recommendation)'
    },
    {
      stage: 'completed',
      label: { en: 'Completed', ar: 'مكتمل' },
      icon: CheckCircle2,
      color: 'green',
      description: {
        en: 'Pilot finished - awaiting decision',
        ar: 'التجربة انتهت - في انتظار القرار'
      },
      decisions: {
        en: 'If recommendation = "scale" → ScalingWorkflow\nIf recommendation = "iterate" → IterationWorkflow\nIf recommendation = "terminate" → Archive',
        ar: 'إذا التوصية = "توسيع" ← سير عمل التوسع\nإذا التوصية = "تحسين" ← سير عمل التحسين\nإذا التوصية = "إنهاء" ← أرشفة'
      }
    },
    {
      stage: 'scaled',
      label: { en: 'Scaled', ar: 'موسع' },
      icon: TrendingUp,
      color: 'teal',
      description: {
        en: 'Approved for national rollout',
        ar: 'تمت الموافقة على الطرح الوطني'
      },
      page: 'ScalingWorkflow',
      actions: {
        en: 'Define target municipalities\nCreate scaling timeline\nAllocate national budget\nTrack rollout progress',
        ar: 'تحديد البلديات المستهدفة\nإنشاء جدول زمني للتوسع\nتخصيص الميزانية الوطنية\nتتبع تقدم الطرح'
      }
    }
  ];

  const approvalRoles = [
    {
      role: 'technical_lead',
      label: { en: 'Technical Lead', ar: 'القائد التقني' },
      responsibility: {
        en: 'Reviews technical feasibility, methodology, technology stack',
        ar: 'مراجعة الجدوى التقنية والمنهجية والمكدس التقني'
      },
      assignment: {
        en: 'Assigned in User entity by admin. User.role must include "technical_lead"',
        ar: 'يتم التعيين في كيان المستخدم من قبل المسؤول. يجب أن يتضمن User.role "technical_lead"'
      }
    },
    {
      role: 'budget_officer',
      label: { en: 'Budget Officer', ar: 'مسؤول الميزانية' },
      responsibility: {
        en: 'Reviews budget breakdown, funding sources, cost justification',
        ar: 'مراجعة تفصيل الميزانية ومصادر التمويل وتبرير التكلفة'
      },
      assignment: {
        en: 'Assigned in User entity. User.role = "budget_officer"',
        ar: 'يتم التعيين في كيان المستخدم. User.role = "budget_officer"'
      }
    },
    {
      role: 'municipality_director',
      label: { en: 'Municipality Director', ar: 'مدير البلدية' },
      responsibility: {
        en: 'Final local approval - strategic alignment, resource commitment',
        ar: 'الموافقة المحلية النهائية - التوافق الاستراتيجي والتزام الموارد'
      },
      assignment: {
        en: 'Assigned in User entity. User.role = "municipality_director"',
        ar: 'يتم التعيين في كيان المستخدم. User.role = "municipality_director"'
      }
    },
    {
      role: 'gdisb_admin',
      label: { en: 'GDISB Admin', ar: 'مسؤول المنصة' },
      responsibility: {
        en: 'Platform-level approval - national alignment, compliance',
        ar: 'الموافقة على مستوى المنصة - التوافق الوطني والامتثال'
      },
      assignment: {
        en: 'Assigned in User entity. User.role = "gdisb_admin" or "admin"',
        ar: 'يتم التعيين في كيان المستخدم. User.role = "gdisb_admin" أو "admin"'
      }
    }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: 'Pilot Workflow Guide', ar: 'دليل سير عمل التجارب' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Complete guide to pilot lifecycle, roles, and decision gates', ar: 'دليل شامل لدورة حياة التجارب والأدوار وبوابات القرار' })}
        </p>
      </div>

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Quick Navigation', ar: 'التنقل السريع' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to={createPageUrl('PilotManagementPanel')}>
              <Button variant="outline" className="w-full">
                <Target className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Control Center', ar: 'مركز التحكم' })}
              </Button>
            </Link>
            <Link to={createPageUrl('PilotCreate')}>
              <Button variant="outline" className="w-full">
                <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Create Pilot', ar: 'إنشاء تجربة' })}
              </Button>
            </Link>
            <Link to={createPageUrl('Approvals')}>
              <Button variant="outline" className="w-full">
                <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Approvals', ar: 'الموافقات' })}
              </Button>
            </Link>
            <Link to={createPageUrl('Pilots')}>
              <Button variant="outline" className="w-full">
                <TestTube className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'All Pilots', ar: 'كل التجارب' })}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Pilot Lifecycle Stages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            {t({ en: 'Pilot Lifecycle - 11 Stages', ar: 'دورة حياة التجربة - 11 مرحلة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div key={stage.stage} className="relative">
                  <div className={`p-6 border-${isRTL ? 'r' : 'l'}-4 border-${isRTL ? 'r' : 'l'}-${stage.color}-500 bg-${stage.color}-50 rounded-lg`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 bg-${stage.color}-600 text-white rounded-lg`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">
                            {idx + 1}. {stage.label[language]}
                          </h3>
                          <Badge variant="outline" className="font-mono text-xs">
                            {stage.stage}
                          </Badge>
                          {stage.page && (
                            <Link to={createPageUrl(stage.page.split(' ')[0])}>
                              <Badge className={`bg-${stage.color}-600 text-white hover:bg-${stage.color}-700 cursor-pointer`}>
                                {stage.page}
                              </Badge>
                            </Link>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 mb-3">{stage.description[language]}</p>

                        {stage.initiatedBy && (
                          <div className="mb-3 p-3 bg-white rounded border">
                            <p className="text-xs font-semibold text-slate-600 mb-1">
                              {t({ en: '🔹 Initiated By:', ar: '🔹 بدأ من قبل:' })}
                            </p>
                            <p className="text-sm text-slate-700">{stage.initiatedBy[language]}</p>
                          </div>
                        )}

                        {stage.approvers && (
                          <div className="mb-3 p-3 bg-white rounded border">
                            <p className="text-xs font-semibold text-slate-600 mb-1">
                              {t({ en: '👥 Approval Chain:', ar: '👥 سلسلة الموافقة:' })}
                            </p>
                            <p className="text-sm text-slate-700 whitespace-pre-line">{stage.approvers[language]}</p>
                          </div>
                        )}

                        {stage.assignedBy && (
                          <div className="mb-3 p-3 bg-amber-50 rounded border border-amber-200">
                            <p className="text-xs font-semibold text-amber-800 mb-1">
                              {t({ en: '⚙️ Role Assignment:', ar: '⚙️ تعيين الدور:' })}
                            </p>
                            <p className="text-sm text-amber-900">{stage.assignedBy[language]}</p>
                          </div>
                        )}

                        {stage.actions && (
                          <div className="p-3 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs font-semibold text-blue-800 mb-1">
                              {t({ en: '✅ Actions:', ar: '✅ الإجراءات:' })}
                            </p>
                            <p className="text-sm text-blue-900 whitespace-pre-line">{stage.actions[language]}</p>
                          </div>
                        )}

                        {stage.decisions && (
                          <div className="mt-3 p-3 bg-purple-50 rounded border border-purple-200">
                            <p className="text-xs font-semibold text-purple-800 mb-1">
                              {t({ en: '🎯 Decision Paths:', ar: '🎯 مسارات القرار:' })}
                            </p>
                            <p className="text-sm text-purple-900 whitespace-pre-line">{stage.decisions[language]}</p>
                          </div>
                        )}

                        {stage.next && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                            <ArrowRight className="h-4 w-4" />
                            <span className="font-medium">{t({ en: 'Next Stage:', ar: 'المرحلة التالية:' })} {stage.next}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {idx < stages.length - 1 && (
                    <div className={`flex justify-center py-2`}>
                      <ArrowRight className="h-6 w-6 text-slate-300 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Approval Roles Detail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            {t({ en: 'Approval Roles & Assignment', ar: 'أدوار الموافقة والتعيين' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approvalRoles.map((role, idx) => (
              <div key={role.role} className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded-r-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-purple-600 text-white">Step {idx + 1}</Badge>
                  <h4 className="font-semibold text-slate-900">{role.label[language]}</h4>
                  <Badge variant="outline" className="font-mono text-xs">{role.role}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-600 font-medium">
                      {t({ en: 'Responsibility:', ar: 'المسؤولية:' })}
                    </span>
                    <p className="text-slate-700 mt-1">{role.responsibility[language]}</p>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <span className="text-slate-600 font-medium">
                      {t({ en: 'How to Assign:', ar: 'كيفية التعيين:' })}
                    </span>
                    <p className="text-slate-700 mt-1">{role.assignment[language]}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 mb-1">
                    {t({ en: 'Important: Role Assignment', ar: 'مهم: تعيين الدور' })}
                  </p>
                  <p className="text-sm text-amber-800">
                    {t({ 
                      en: 'Currently, user roles are stored in the User entity "role" field. Admins need to manually update user records to assign approval roles. Future enhancement: Add dedicated UserManagement page for role assignment.',
                      ar: 'حالياً، يتم تخزين أدوار المستخدم في حقل "role" في كيان المستخدم. يحتاج المسؤولون إلى تحديث سجلات المستخدم يدوياً لتعيين أدوار الموافقة. تحسين مستقبلي: إضافة صفحة إدارة المستخدمين لتعيين الأدوار.'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Stage Entry Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            {t({ en: 'How Pilots Enter DESIGN Stage', ar: 'كيف تدخل التجارب مرحلة التصميم' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                1. {t({ en: 'Manual Creation via PilotCreate Wizard', ar: '1. الإنشاء اليدوي عبر معالج إنشاء التجربة' })}
              </h4>
              <p className="text-sm text-blue-800 mb-2">
                {t({ 
                  en: 'Municipality staff or GDISB team navigate to PilotCreate page and fill 7-step form. Default stage is "design".',
                  ar: 'موظفو البلدية أو فريق المنصة ينتقلون إلى صفحة إنشاء التجربة ويملؤون نموذج 7 خطوات. المرحلة الافتراضية هي "التصميم".'
                })}
              </p>
              <Link to={createPageUrl('PilotCreate')}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  {t({ en: 'Go to PilotCreate', ar: 'انتقل لإنشاء تجربة' })}
                </Button>
              </Link>
            </div>

            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
              <h4 className="font-semibold text-green-900 mb-2">
                2. {t({ en: 'From Challenge Detail - "Convert to Pilot"', ar: '2. من تفاصيل التحدي - "تحويل لتجربة"' })}
              </h4>
              <p className="text-sm text-green-800 mb-2">
                {t({ 
                  en: 'In ChallengeDetail page, if challenge.track = "pilot", user can click "Launch Pilot" which navigates to PilotCreate with challenge pre-filled.',
                  ar: 'في صفحة تفاصيل التحدي، إذا كان challenge.track = "pilot"، يمكن للمستخدم النقر على "إطلاق تجربة" والذي ينتقل إلى إنشاء التجربة مع التحدي مملوء مسبقاً.'
                })}
              </p>
              <Link to={createPageUrl('Challenges')}>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  {t({ en: 'View Challenges', ar: 'عرض التحديات' })}
                </Button>
              </Link>
            </div>

            <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
              <h4 className="font-semibold text-purple-900 mb-2">
                3. {t({ en: 'From ChallengeSolutionMatching - AI Match', ar: '3. من مطابقة التحدي-الحل - مطابقة ذكية' })}
              </h4>
              <p className="text-sm text-purple-800 mb-2">
                {t({ 
                  en: 'AI matches challenges with solutions. User reviews matches and clicks "Create Pilot" to auto-populate PilotCreate form.',
                  ar: 'الذكاء الاصطناعي يطابق التحديات مع الحلول. المستخدم يراجع المطابقات وينقر "إنشاء تجربة" لملء النموذج تلقائياً.'
                })}
              </p>
              <Link to={createPageUrl('ChallengeSolutionMatching')}>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  {t({ en: 'AI Matching', ar: 'المطابقة الذكية' })}
                </Button>
              </Link>
            </div>

            <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg">
              <h4 className="font-semibold text-orange-900 mb-2">
                4. {t({ en: 'From IterationWorkflow - Failed Pilot Redesign', ar: '4. من سير عمل التحسين - إعادة تصميم التجربة الفاشلة' })}
              </h4>
              <p className="text-sm text-orange-800 mb-2">
                {t({ 
                  en: 'If pilot recommendation = "iterate", IterationWorkflow page allows "Start Iteration" which updates pilot.stage back to "design" for redesign.',
                  ar: 'إذا كانت التوصية = "تحسين"، صفحة سير عمل التحسين تسمح "بدء التحسين" والذي يحدث pilot.stage للعودة إلى "التصميم" لإعادة التصميم.'
                })}
              </p>
              <Link to={createPageUrl('IterationWorkflow')}>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  {t({ en: 'Iteration Workflow', ar: 'سير عمل التحسين' })}
                </Button>
              </Link>
            </div>

            <div className="p-4 bg-teal-50 border-l-4 border-teal-500 rounded-r-lg">
              <h4 className="font-semibold text-teal-900 mb-2">
                5. {t({ en: 'From Program Applications - Cohort Graduates', ar: '5. من طلبات البرنامج - خريجو الدفعة' })}
              </h4>
              <p className="text-sm text-teal-800">
                {t({ 
                  en: 'Accelerator/incubator programs can "graduate" solutions to pilots. Feature pending implementation.',
                  ar: 'برامج التسريع/الاحتضان يمكنها "تخريج" الحلول إلى تجارب. الميزة قيد التطبيق.'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Flow Detail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-600" />
            {t({ en: 'Approval Workflow - Step by Step', ar: 'سير عمل الموافقة - خطوة بخطوة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Visual Flow */}
            <div className="flex items-center justify-between bg-slate-50 p-6 rounded-lg overflow-x-auto">
              {approvalRoles.map((role, idx) => (
                <React.Fragment key={role.role}>
                  <div className="flex flex-col items-center min-w-[120px]">
                    <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-xs font-medium text-slate-900 mt-2 text-center">
                      {role.label[language]}
                    </p>
                  </div>
                  {idx < approvalRoles.length - 1 && (
                    <ArrowRight className="h-6 w-6 text-slate-400 mx-2" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* How it works */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">
                {t({ en: 'How Approval Works:', ar: 'كيف تعمل الموافقة:' })}
              </h4>
              <ol className="space-y-2 text-sm text-blue-800" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <li>
                  {t({ 
                    en: '1. Pilot creator submits pilot from PilotCreate → pilot.stage = "approval_pending"',
                    ar: '1. منشئ التجربة يقدم التجربة من صفحة الإنشاء ← pilot.stage = "approval_pending"'
                  })}
                </li>
                <li>
                  {t({ 
                    en: '2. System notifies first approver (Technical Lead) → They see it in Approvals page',
                    ar: '2. النظام يُشعر المراجع الأول (القائد التقني) ← يرونها في صفحة الموافقات'
                  })}
                </li>
                <li>
                  {t({ 
                    en: '3. Approver clicks "Approve" or "Reject" in MultiStepApproval component (shown in PilotDetail or Approvals page)',
                    ar: '3. المراجع ينقر "موافقة" أو "رفض" في مكون الموافقة متعدد الخطوات (يظهر في تفاصيل التجربة أو صفحة الموافقات)'
                  })}
                </li>
                <li>
                  {t({ 
                    en: '4. If approved → System moves to next approver (Budget Officer) and sends notification',
                    ar: '4. إذا تمت الموافقة ← النظام ينتقل للمراجع التالي (مسؤول الميزانية) ويرسل إشعار'
                  })}
                </li>
                <li>
                  {t({ 
                    en: '5. If rejected → pilot.status = "rejected", workflow stops',
                    ar: '5. إذا تم الرفض ← pilot.status = "rejected"، يتوقف سير العمل'
                  })}
                </li>
                <li>
                  {t({ 
                    en: '6. After all 4 approvals → pilot.stage = "approved" automatically',
                    ar: '6. بعد الموافقات الأربع ← pilot.stage = "approved" تلقائياً'
                  })}
                </li>
              </ol>
            </div>

            {/* Role Assignment Instructions */}
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg">
              <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t({ en: 'Setting Up Approvers (Admin Task)', ar: 'إعداد المراجعين (مهمة المسؤول)' })}
              </h4>
              <div className="space-y-2 text-sm text-amber-800">
                <p>
                  {t({ 
                    en: '⚙️ Currently: Go to User entity records → Edit user → Set role field to one of: technical_lead, budget_officer, municipality_director, gdisb_admin',
                    ar: '⚙️ حالياً: انتقل إلى سجلات كيان المستخدم ← تعديل المستخدم ← تعيين حقل الدور إلى أحد: technical_lead, budget_officer, municipality_director, gdisb_admin'
                  })}
                </p>
                <p className="font-medium">
                  {t({ 
                    en: '🔜 Recommended: Create UserManagement page with UI for role assignment',
                    ar: '🔜 موصى به: إنشاء صفحة إدارة المستخدمين مع واجهة لتعيين الأدوار'
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Visual Flow Diagram', ar: 'مخطط التدفق البصري' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <PilotFlowDiagram />
        </CardContent>
      </Card>

      {/* Page Reference */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Page Reference', ar: 'مرجع الصفحات' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { page: 'PilotManagementPanel', desc: { en: 'Central control hub', ar: 'مركز التحكم المركزي' } },
              { page: 'PilotCreate', desc: { en: 'Create new pilot (7 steps)', ar: 'إنشاء تجربة جديدة (7 خطوات)' } },
              { page: 'Approvals', desc: { en: 'Manage all approvals', ar: 'إدارة جميع الموافقات' } },
              { page: 'PilotLaunchWizard', desc: { en: 'Pre-launch checklist', ar: 'قائمة ما قبل الإطلاق' } },
              { page: 'PilotMonitoringDashboard', desc: { en: 'Real-time KPI tracking', ar: 'تتبع المؤشرات المباشر' } },
              { page: 'PilotEvaluations', desc: { en: 'Post-pilot assessment', ar: 'التقييم بعد التجربة' } },
              { page: 'IterationWorkflow', desc: { en: 'Refine failed pilots', ar: 'تحسين التجارب الفاشلة' } },
              { page: 'ScalingWorkflow', desc: { en: 'National expansion', ar: 'التوسع الوطني' } },
              { page: 'Pilots', desc: { en: 'List all pilots', ar: 'قائمة كل التجارب' } },
              { page: 'MyPilots', desc: { en: 'My assigned pilots', ar: 'تجاربي المعينة' } },
              { page: 'PilotDetail', desc: { en: 'Full pilot view', ar: 'عرض التجربة الكامل' } },
              { page: 'PilotEdit', desc: { en: 'Edit pilot details', ar: 'تعديل تفاصيل التجربة' } }
            ].map(item => (
              <Link key={item.page} to={createPageUrl(item.page)}>
                <div className="p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <p className="font-medium text-sm text-slate-900">{item.page}</p>
                  <p className="text-xs text-slate-600">{item.desc[language]}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(PilotWorkflowGuide, { requiredPermissions: [] });