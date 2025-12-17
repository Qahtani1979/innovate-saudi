import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, Building2, Plus, X, AlertTriangle, Users, LayoutDashboard, Grid3X3, 
  ChevronUp, ChevronDown, ArrowDown, UserCheck, Brain, Shield, Scale, Eye,
  GitBranch, Network, Target, CheckCircle2, AlertCircle, Clock, Briefcase,
  Crown, UserCog, Lightbulb, Database, Gavel, TrendingUp, ChevronRight,
  BarChart3, PieChart, Activity, Layers
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';

// Enhanced Committee Types with icons and descriptions
const COMMITTEE_TYPES = [
  { 
    value: 'steering', 
    label: { en: 'Steering Committee', ar: 'لجنة توجيهية' },
    icon: Crown,
    description: { en: 'Strategic direction and major decisions', ar: 'التوجيه الاستراتيجي والقرارات الرئيسية' },
    color: 'bg-purple-500'
  },
  { 
    value: 'executive', 
    label: { en: 'Executive Committee', ar: 'لجنة تنفيذية' },
    icon: Briefcase,
    description: { en: 'Day-to-day strategic execution', ar: 'التنفيذ الاستراتيجي اليومي' },
    color: 'bg-blue-500'
  },
  { 
    value: 'technical', 
    label: { en: 'Technical Committee', ar: 'لجنة فنية' },
    icon: Database,
    description: { en: 'Technical decisions and standards', ar: 'القرارات الفنية والمعايير' },
    color: 'bg-green-500'
  },
  { 
    value: 'advisory', 
    label: { en: 'Advisory Committee', ar: 'لجنة استشارية' },
    icon: Users,
    description: { en: 'Expert guidance and recommendations', ar: 'التوجيه الخبير والتوصيات' },
    color: 'bg-amber-500'
  },
  { 
    value: 'innovation', 
    label: { en: 'Innovation Committee', ar: 'لجنة الابتكار' },
    icon: Lightbulb,
    description: { en: 'R&D, pilots, and technology adoption', ar: 'البحث والتطوير والتجريب واعتماد التقنية' },
    color: 'bg-cyan-500'
  },
  { 
    value: 'risk', 
    label: { en: 'Risk & Compliance', ar: 'لجنة المخاطر والامتثال' },
    icon: Shield,
    description: { en: 'Risk management and regulatory compliance', ar: 'إدارة المخاطر والامتثال التنظيمي' },
    color: 'bg-red-500'
  },
  { 
    value: 'data_governance', 
    label: { en: 'Data Governance', ar: 'لجنة حوكمة البيانات' },
    icon: Database,
    description: { en: 'Data quality, privacy, and AI ethics', ar: 'جودة البيانات والخصوصية وأخلاقيات الذكاء الاصطناعي' },
    color: 'bg-indigo-500'
  },
  { 
    value: 'ethics', 
    label: { en: 'Ethics Committee', ar: 'لجنة الأخلاقيات' },
    icon: Scale,
    description: { en: 'Ethical oversight and policy compliance', ar: 'الرقابة الأخلاقية والامتثال للسياسات' },
    color: 'bg-pink-500'
  }
];

// Enhanced Role Types with seniority levels
const ROLE_TYPES = [
  { 
    value: 'executive', 
    label: { en: 'Executive', ar: 'تنفيذي' },
    icon: Crown,
    level: 1,
    description: { en: 'C-level and deputy minister positions', ar: 'مناصب المستوى التنفيذي ووكلاء الوزارة' }
  },
  { 
    value: 'senior_management', 
    label: { en: 'Senior Management', ar: 'إدارة عليا' },
    icon: Briefcase,
    level: 2,
    description: { en: 'Directors and general managers', ar: 'المديرون والمديرون العامون' }
  },
  { 
    value: 'management', 
    label: { en: 'Management', ar: 'إدارة' },
    icon: UserCog,
    level: 3,
    description: { en: 'Department and section heads', ar: 'رؤساء الإدارات والأقسام' }
  },
  { 
    value: 'specialist', 
    label: { en: 'Specialist', ar: 'متخصص' },
    icon: Target,
    level: 4,
    description: { en: 'Subject matter experts', ar: 'خبراء الموضوع' }
  },
  { 
    value: 'coordinator', 
    label: { en: 'Coordinator', ar: 'منسق' },
    icon: Network,
    level: 5,
    description: { en: 'Cross-functional coordinators', ar: 'منسقون عابرون للوظائف' }
  },
  { 
    value: 'analyst', 
    label: { en: 'Analyst', ar: 'محلل' },
    icon: BarChart3,
    level: 6,
    description: { en: 'Data and process analysts', ar: 'محللو البيانات والعمليات' }
  }
];

// Dashboard Types
const DASHBOARD_TYPES = [
  { value: 'executive', label: { en: 'Executive Dashboard', ar: 'لوحة تحكم تنفيذية' }, icon: Crown, color: 'bg-purple-500' },
  { value: 'operational', label: { en: 'Operational Dashboard', ar: 'لوحة تحكم تشغيلية' }, icon: Activity, color: 'bg-blue-500' },
  { value: 'innovation', label: { en: 'Innovation Dashboard', ar: 'لوحة تحكم الابتكار' }, icon: Lightbulb, color: 'bg-cyan-500' },
  { value: 'kpi', label: { en: 'KPI Dashboard', ar: 'لوحة مؤشرات الأداء' }, icon: TrendingUp, color: 'bg-green-500' },
  { value: 'risk', label: { en: 'Risk Dashboard', ar: 'لوحة المخاطر' }, icon: Shield, color: 'bg-red-500' },
  { value: 'stakeholder', label: { en: 'Stakeholder Dashboard', ar: 'لوحة أصحاب المصلحة' }, icon: Users, color: 'bg-amber-500' }
];

// RACI Decision Areas
const RACI_AREAS = [
  { value: 'strategic_decisions', label: { en: 'Strategic Decisions', ar: 'القرارات الاستراتيجية' }, icon: Target },
  { value: 'budget_allocation', label: { en: 'Budget Allocation', ar: 'تخصيص الميزانية' }, icon: PieChart },
  { value: 'technology_adoption', label: { en: 'Technology Adoption', ar: 'اعتماد التقنية' }, icon: Database },
  { value: 'pilot_approval', label: { en: 'Pilot Approval', ar: 'اعتماد المشاريع التجريبية' }, icon: Lightbulb },
  { value: 'vendor_selection', label: { en: 'Vendor Selection', ar: 'اختيار الموردين' }, icon: Users },
  { value: 'rd_partnerships', label: { en: 'R&D Partnerships', ar: 'شراكات البحث والتطوير' }, icon: Network },
  { value: 'hiring', label: { en: 'Hiring Decisions', ar: 'قرارات التوظيف' }, icon: UserCheck },
  { value: 'policy_changes', label: { en: 'Policy Changes', ar: 'تغييرات السياسات' }, icon: Gavel },
  { value: 'risk_management', label: { en: 'Risk Management', ar: 'إدارة المخاطر' }, icon: Shield },
  { value: 'data_governance', label: { en: 'Data Governance', ar: 'حوكمة البيانات' }, icon: Database }
];

const RACI_VALUES = [
  { value: 'R', label: { en: 'R - Responsible', ar: 'م - مسؤول' }, color: 'bg-blue-500', description: { en: 'Does the work', ar: 'ينفذ العمل' } },
  { value: 'A', label: { en: 'A - Accountable', ar: 'ح - محاسب' }, color: 'bg-green-500', description: { en: 'Final approver', ar: 'الموافق النهائي' } },
  { value: 'C', label: { en: 'C - Consulted', ar: 'ش - مستشار' }, color: 'bg-yellow-500', description: { en: 'Input required', ar: 'مدخلات مطلوبة' } },
  { value: 'I', label: { en: 'I - Informed', ar: 'ع - مطلع' }, color: 'bg-gray-400', description: { en: 'Kept updated', ar: 'يتم إبلاغه' } }
];

const FREQUENCY_OPTIONS = [
  { value: 'weekly', label: { en: 'Weekly', ar: 'أسبوعي' } },
  { value: 'biweekly', label: { en: 'Bi-weekly', ar: 'كل أسبوعين' } },
  { value: 'monthly', label: { en: 'Monthly', ar: 'شهري' } },
  { value: 'quarterly', label: { en: 'Quarterly', ar: 'ربع سنوي' } }
];

// Governance Dashboard Component
function GovernanceDashboard({ committees, roles, dashboards, raciMatrix, escalationPath, language, t }) {
  const stats = useMemo(() => {
    const hasInnovationCommittee = committees.some(c => c.type === 'innovation');
    const hasRiskCommittee = committees.some(c => c.type === 'risk');
    const hasDataGovernance = committees.some(c => c.type === 'data_governance');
    
    const executiveRoles = roles.filter(r => r.type === 'executive' || r.type === 'senior_management').length;
    const specialistRoles = roles.filter(r => r.type === 'specialist' || r.type === 'analyst').length;
    
    const innovationDecisions = raciMatrix.filter(r => 
      ['pilot_approval', 'technology_adoption', 'rd_partnerships'].includes(r.area)
    ).length;
    
    const coverageScore = Math.round(
      ((committees.length > 0 ? 20 : 0) +
      (roles.length > 0 ? 20 : 0) +
      (dashboards.length > 0 ? 15 : 0) +
      (raciMatrix.length > 0 ? 20 : 0) +
      (escalationPath.length > 0 ? 15 : 0) +
      (hasInnovationCommittee ? 10 : 0))
    );

    return {
      totalCommittees: committees.length,
      totalRoles: roles.length,
      totalDashboards: dashboards.length,
      totalRaciEntries: raciMatrix.length,
      escalationLevels: escalationPath.length,
      hasInnovationCommittee,
      hasRiskCommittee,
      hasDataGovernance,
      executiveRoles,
      specialistRoles,
      innovationDecisions,
      coverageScore
    };
  }, [committees, roles, dashboards, raciMatrix, escalationPath]);

  const getCoverageColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="w-5 h-5 text-primary" />
          {t({ en: 'Governance Dashboard', ar: 'لوحة الحوكمة' })}
        </CardTitle>
        <CardDescription>
          {t({ en: 'Overview of governance structure and coverage', ar: 'نظرة عامة على هيكل الحوكمة والتغطية' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="text-center p-3 bg-background/50 rounded-lg border">
            <Building2 className="w-6 h-6 mx-auto mb-1 text-purple-500" />
            <div className="text-2xl font-bold">{stats.totalCommittees}</div>
            <div className="text-xs text-muted-foreground">{t({ en: 'Committees', ar: 'اللجان' })}</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg border">
            <Users className="w-6 h-6 mx-auto mb-1 text-blue-500" />
            <div className="text-2xl font-bold">{stats.totalRoles}</div>
            <div className="text-xs text-muted-foreground">{t({ en: 'Roles', ar: 'الأدوار' })}</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg border">
            <LayoutDashboard className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <div className="text-2xl font-bold">{stats.totalDashboards}</div>
            <div className="text-xs text-muted-foreground">{t({ en: 'Dashboards', ar: 'لوحات التحكم' })}</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg border">
            <Grid3X3 className="w-6 h-6 mx-auto mb-1 text-amber-500" />
            <div className="text-2xl font-bold">{stats.totalRaciEntries}</div>
            <div className="text-xs text-muted-foreground">{t({ en: 'RACI Entries', ar: 'إدخالات RACI' })}</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg border">
            <GitBranch className="w-6 h-6 mx-auto mb-1 text-red-500" />
            <div className="text-2xl font-bold">{stats.escalationLevels}</div>
            <div className="text-xs text-muted-foreground">{t({ en: 'Escalation Levels', ar: 'مستويات التصعيد' })}</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg border">
            <Target className="w-6 h-6 mx-auto mb-1 text-primary" />
            <div className={`text-2xl font-bold ${getCoverageColor(stats.coverageScore)}`}>{stats.coverageScore}%</div>
            <div className="text-xs text-muted-foreground">{t({ en: 'Coverage', ar: 'التغطية' })}</div>
          </div>
        </div>

        {/* Coverage Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>{t({ en: 'Governance Coverage', ar: 'تغطية الحوكمة' })}</span>
            <span className={getCoverageColor(stats.coverageScore)}>{stats.coverageScore}%</span>
          </div>
          <Progress value={stats.coverageScore} className="h-2" />
        </div>

        {/* Health Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className={`flex items-center gap-2 p-2 rounded-lg text-sm ${stats.hasInnovationCommittee ? 'bg-green-500/10 text-green-700' : 'bg-amber-500/10 text-amber-700'}`}>
            {stats.hasInnovationCommittee ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{t({ en: 'Innovation Committee', ar: 'لجنة الابتكار' })}</span>
          </div>
          <div className={`flex items-center gap-2 p-2 rounded-lg text-sm ${stats.hasRiskCommittee ? 'bg-green-500/10 text-green-700' : 'bg-amber-500/10 text-amber-700'}`}>
            {stats.hasRiskCommittee ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{t({ en: 'Risk Committee', ar: 'لجنة المخاطر' })}</span>
          </div>
          <div className={`flex items-center gap-2 p-2 rounded-lg text-sm ${stats.hasDataGovernance ? 'bg-green-500/10 text-green-700' : 'bg-amber-500/10 text-amber-700'}`}>
            {stats.hasDataGovernance ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{t({ en: 'Data Governance', ar: 'حوكمة البيانات' })}</span>
          </div>
          <div className={`flex items-center gap-2 p-2 rounded-lg text-sm ${stats.escalationLevels >= 4 ? 'bg-green-500/10 text-green-700' : 'bg-amber-500/10 text-amber-700'}`}>
            {stats.escalationLevels >= 4 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{t({ en: 'Escalation Path', ar: 'مسار التصعيد' })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Committee Card Component
function CommitteeCard({ committee, index, onUpdate, onRemove, language, t }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const typeConfig = COMMITTEE_TYPES.find(ct => ct.value === committee.type) || COMMITTEE_TYPES[0];
  const TypeIcon = typeConfig.icon;
  
  const members = Array.isArray(committee.members)
    ? committee.members
    : (typeof committee.members === 'string'
      ? committee.members.split('\n').map(s => s.trim()).filter(Boolean)
      : []);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 bg-card hover:bg-accent/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${typeConfig.color}/10`}>
                <TypeIcon className={`w-5 h-5 ${typeConfig.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="text-left">
                <div className="font-medium">
                  {committee.name_en || committee.name || t({ en: 'Unnamed Committee', ar: 'لجنة بدون اسم' })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {typeConfig.label[language]} • {FREQUENCY_OPTIONS.find(f => f.value === committee.meeting_frequency)?.label[language] || 'Monthly'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {members.length} {t({ en: 'members', ar: 'أعضاء' })}
              </Badge>
              <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-4 border-t bg-muted/20 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Committee Name (EN)', ar: 'اسم اللجنة (إنجليزي)' })}</Label>
                <Input
                  placeholder="Committee Name"
                  value={committee.name_en || committee.name || ''}
                  onChange={(e) => onUpdate(index, 'name_en', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Committee Name (AR)', ar: 'اسم اللجنة (عربي)' })}</Label>
                <Input
                  dir="rtl"
                  placeholder="اسم اللجنة"
                  value={committee.name_ar || ''}
                  onChange={(e) => onUpdate(index, 'name_ar', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Type', ar: 'النوع' })}</Label>
                <Select value={committee.type || 'steering'} onValueChange={(v) => onUpdate(index, 'type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COMMITTEE_TYPES.map((ct) => (
                      <SelectItem key={ct.value} value={ct.value}>
                        <div className="flex items-center gap-2">
                          <ct.icon className="w-4 h-4" />
                          {ct.label[language]}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Chair Role (EN)', ar: 'رئيس اللجنة (إنجليزي)' })}</Label>
                <Input
                  placeholder="e.g., Deputy Minister"
                  value={committee.chair_role_en || ''}
                  onChange={(e) => onUpdate(index, 'chair_role_en', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Meeting Frequency', ar: 'تكرار الاجتماعات' })}</Label>
                <Select value={committee.meeting_frequency || 'monthly'} onValueChange={(v) => onUpdate(index, 'meeting_frequency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label[language]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm">{t({ en: 'Members (one per line)', ar: 'الأعضاء (كل عضو في سطر)' })}</Label>
              <Textarea
                value={members.join('\n')}
                onChange={(e) => onUpdate(index, 'members', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Responsibilities (EN)', ar: 'المسؤوليات (إنجليزي)' })}</Label>
                <Textarea
                  placeholder="Key responsibilities..."
                  value={committee.responsibilities_en || committee.responsibilities || ''}
                  onChange={(e) => onUpdate(index, 'responsibilities_en', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Responsibilities (AR)', ar: 'المسؤوليات (عربي)' })}</Label>
                <Textarea
                  dir="rtl"
                  placeholder="المسؤوليات الرئيسية..."
                  value={committee.responsibilities_ar || ''}
                  onChange={(e) => onUpdate(index, 'responsibilities_ar', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="destructive" size="sm" onClick={() => onRemove(index)}>
                <X className="w-4 h-4 mr-1" />{t({ en: 'Remove', ar: 'حذف' })}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// Role Card Component
function RoleCard({ role, index, onUpdate, onRemove, language, t }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const typeConfig = ROLE_TYPES.find(rt => rt.value === role.type) || ROLE_TYPES[2];
  const TypeIcon = typeConfig.icon;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 bg-card hover:bg-accent/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TypeIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium">
                  {role.title_en || t({ en: 'Unnamed Role', ar: 'دور بدون اسم' })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {typeConfig.label[language]} • {role.department_en || t({ en: 'No department', ar: 'بدون قسم' })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                L{typeConfig.level}
              </Badge>
              <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-4 border-t bg-muted/20 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Role Title (EN)', ar: 'عنوان الدور (إنجليزي)' })}</Label>
                <Input
                  placeholder="e.g., Chief Innovation Officer"
                  value={role.title_en || ''}
                  onChange={(e) => onUpdate(index, 'title_en', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Role Title (AR)', ar: 'عنوان الدور (عربي)' })}</Label>
                <Input
                  dir="rtl"
                  placeholder="مثال: رئيس قسم الابتكار"
                  value={role.title_ar || ''}
                  onChange={(e) => onUpdate(index, 'title_ar', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Type', ar: 'النوع' })}</Label>
                <Select value={role.type || 'management'} onValueChange={(v) => onUpdate(index, 'type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLE_TYPES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        <div className="flex items-center gap-2">
                          <r.icon className="w-4 h-4" />
                          {r.label[language]}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Department (EN)', ar: 'القسم (إنجليزي)' })}</Label>
                <Input
                  placeholder="Department/Unit"
                  value={role.department_en || ''}
                  onChange={(e) => onUpdate(index, 'department_en', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Reports To (EN)', ar: 'يقدم تقاريره إلى (إنجليزي)' })}</Label>
                <Input
                  placeholder="e.g., Deputy Minister"
                  value={role.reports_to_en || ''}
                  onChange={(e) => onUpdate(index, 'reports_to_en', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Key Responsibilities (EN)', ar: 'المسؤوليات الرئيسية (إنجليزي)' })}</Label>
                <Textarea
                  placeholder="Key responsibilities..."
                  value={role.key_responsibilities_en || ''}
                  onChange={(e) => onUpdate(index, 'key_responsibilities_en', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Key Responsibilities (AR)', ar: 'المسؤوليات الرئيسية (عربي)' })}</Label>
                <Textarea
                  dir="rtl"
                  placeholder="المسؤوليات الرئيسية..."
                  value={role.key_responsibilities_ar || ''}
                  onChange={(e) => onUpdate(index, 'key_responsibilities_ar', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="destructive" size="sm" onClick={() => onRemove(index)}>
                <X className="w-4 h-4 mr-1" />{t({ en: 'Remove', ar: 'حذف' })}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// Organization Chart View Component
function OrgChartView({ roles, language, t }) {
  const rolesByLevel = useMemo(() => {
    const levels = {};
    roles.forEach(role => {
      const typeConfig = ROLE_TYPES.find(rt => rt.value === role.type);
      const level = typeConfig?.level || 3;
      if (!levels[level]) levels[level] = [];
      levels[level].push(role);
    });
    return levels;
  }, [roles]);

  const sortedLevels = Object.keys(rolesByLevel).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-4">
      {sortedLevels.map((level, idx) => (
        <div key={level}>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{ROLE_TYPES.find(rt => rt.level === Number(level))?.label[language] || `Level ${level}`}</Badge>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {rolesByLevel[level].map((role, roleIdx) => {
              const typeConfig = ROLE_TYPES.find(rt => rt.value === role.type);
              const TypeIcon = typeConfig?.icon || Users;
              return (
                <div key={roleIdx} className="p-3 border rounded-lg bg-card flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TypeIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{role.title_en || role.title_ar}</div>
                    <div className="text-xs text-muted-foreground truncate">{role.department_en || role.department_ar}</div>
                    {role.reports_to_en && (
                      <div className="text-xs text-muted-foreground mt-1">
                        → {role.reports_to_en}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {idx < sortedLevels.length - 1 && (
            <div className="flex justify-center my-2">
              <ArrowDown className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
      ))}
      {roles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          {t({ en: 'No roles defined yet', ar: 'لم يتم تحديد أدوار بعد' })}
        </div>
      )}
    </div>
  );
}

// RACI Matrix Grid View
function RaciGridView({ raciMatrix, language, t }) {
  if (raciMatrix.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
        {t({ en: 'No RACI entries defined yet', ar: 'لم يتم تحديد إدخالات RACI بعد' })}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="border p-2 text-left text-sm font-medium">{t({ en: 'Decision Area', ar: 'مجال القرار' })}</th>
            {RACI_VALUES.map(v => (
              <th key={v.value} className="border p-2 text-center text-sm font-medium">
                <div className="flex items-center justify-center gap-1">
                  <span className={`w-3 h-3 rounded-full ${v.color}`} />
                  {v.value}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {raciMatrix.map((entry, idx) => {
            const areaConfig = RACI_AREAS.find(a => a.value === entry.area);
            const AreaIcon = areaConfig?.icon || Target;
            return (
              <tr key={idx} className="hover:bg-muted/20">
                <td className="border p-2">
                  <div className="flex items-center gap-2">
                    <AreaIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{areaConfig?.label[language] || entry.area}</span>
                  </div>
                </td>
                <td className="border p-2 text-center text-xs">{entry.responsible_en || entry.responsible_ar || '-'}</td>
                <td className="border p-2 text-center text-xs">{entry.accountable_en || entry.accountable_ar || '-'}</td>
                <td className="border p-2 text-center text-xs">{entry.consulted_en || entry.consulted_ar || '-'}</td>
                <td className="border p-2 text-center text-xs">{entry.informed_en || entry.informed_ar || '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Main Component
export default function Step15Governance({ data, onChange, onGenerateAI, isGenerating }) {
  const { language, t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('committees');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'structure' | 'matrix'

  const committees = data.governance?.committees || [];
  const roles = data.governance?.roles || [];
  const dashboards = data.governance?.dashboards || [];
  const raciMatrix = data.governance?.raci_matrix || [];
  
  // Handle escalation path - support both new structured format and legacy string array
  const getEscalationPath = () => {
    const path = data.governance?.escalation_path;
    if (!path || !Array.isArray(path) || path.length === 0) return [];
    if (typeof path[0] === 'object' && path[0] !== null) return path;
    return path.map((item, i) => ({
      id: `legacy-${i}`,
      level: i + 1,
      role_en: typeof item === 'string' ? item : '',
      role_ar: '',
      timeframe_en: '',
      timeframe_ar: '',
      description_en: '',
      description_ar: ''
    }));
  };
  
  const escalationPath = getEscalationPath();

  // Committee handlers
  const addCommittee = () => {
    const newCommittee = {
      id: Date.now().toString(),
      name_en: '',
      name_ar: '',
      type: 'steering',
      chair_role_en: '',
      chair_role_ar: '',
      members: [],
      meeting_frequency: 'monthly',
      responsibilities_en: '',
      responsibilities_ar: ''
    };
    onChange({ governance: { ...data.governance, committees: [...committees, newCommittee] } });
  };

  const updateCommittee = (index, field, value) => {
    const updated = committees.map((c, i) => (i === index ? { ...c, [field]: value } : c));
    onChange({ governance: { ...data.governance, committees: updated } });
  };

  const removeCommittee = (index) => {
    onChange({ governance: { ...data.governance, committees: committees.filter((_, i) => i !== index) } });
  };

  // Role handlers
  const addRole = () => {
    const newRole = {
      id: Date.now().toString(),
      title_en: '',
      title_ar: '',
      type: 'management',
      department_en: '',
      department_ar: '',
      key_responsibilities_en: '',
      key_responsibilities_ar: '',
      reports_to_en: '',
      reports_to_ar: ''
    };
    onChange({ governance: { ...data.governance, roles: [...roles, newRole] } });
  };

  const updateRole = (index, field, value) => {
    const updated = roles.map((r, i) => (i === index ? { ...r, [field]: value } : r));
    onChange({ governance: { ...data.governance, roles: updated } });
  };

  const removeRole = (index) => {
    onChange({ governance: { ...data.governance, roles: roles.filter((_, i) => i !== index) } });
  };

  // Dashboard handlers
  const addDashboard = () => {
    const newDashboard = {
      id: Date.now().toString(),
      name_en: '',
      name_ar: '',
      type: 'executive',
      description_en: '',
      description_ar: '',
      key_metrics_en: '',
      key_metrics_ar: '',
      update_frequency: 'weekly',
      audience_en: '',
      audience_ar: ''
    };
    onChange({ governance: { ...data.governance, dashboards: [...dashboards, newDashboard] } });
  };

  const updateDashboard = (index, field, value) => {
    const updated = dashboards.map((d, i) => (i === index ? { ...d, [field]: value } : d));
    onChange({ governance: { ...data.governance, dashboards: updated } });
  };

  const removeDashboard = (index) => {
    onChange({ governance: { ...data.governance, dashboards: dashboards.filter((_, i) => i !== index) } });
  };

  // RACI handlers
  const addRaciEntry = () => {
    const newEntry = {
      id: Date.now().toString(),
      area: 'strategic_decisions',
      responsible_en: '',
      responsible_ar: '',
      accountable_en: '',
      accountable_ar: '',
      consulted_en: '',
      consulted_ar: '',
      informed_en: '',
      informed_ar: ''
    };
    onChange({ governance: { ...data.governance, raci_matrix: [...raciMatrix, newEntry] } });
  };

  const updateRaciEntry = (index, field, value) => {
    const updated = raciMatrix.map((r, i) => (i === index ? { ...r, [field]: value } : r));
    onChange({ governance: { ...data.governance, raci_matrix: updated } });
  };

  const removeRaciEntry = (index) => {
    onChange({ governance: { ...data.governance, raci_matrix: raciMatrix.filter((_, i) => i !== index) } });
  };

  // Escalation Path handlers
  const addEscalationStep = () => {
    const newStep = {
      id: Date.now().toString(),
      level: escalationPath.length + 1,
      role_en: '',
      role_ar: '',
      timeframe_en: '',
      timeframe_ar: '',
      description_en: '',
      description_ar: ''
    };
    onChange({ governance: { ...data.governance, escalation_path: [...escalationPath, newStep] } });
  };

  const updateEscalationStep = (index, field, value) => {
    const updated = escalationPath.map((step, i) => (i === index ? { ...step, [field]: value } : step));
    onChange({ governance: { ...data.governance, escalation_path: updated } });
  };

  const removeEscalationStep = (index) => {
    const updated = escalationPath.filter((_, i) => i !== index).map((step, i) => ({ ...step, level: i + 1 }));
    onChange({ governance: { ...data.governance, escalation_path: updated } });
  };

  const moveEscalationStep = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === escalationPath.length - 1)) return;
    const newPath = [...escalationPath];
    const temp = newPath[index];
    newPath[index] = newPath[index + direction];
    newPath[index + direction] = temp;
    const updated = newPath.map((step, i) => ({ ...step, level: i + 1 }));
    onChange({ governance: { ...data.governance, escalation_path: updated } });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* AI Generate Button */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'cards' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setViewMode('cards')}
          >
            <Layers className="w-4 h-4 mr-1" />
            {t({ en: 'Cards', ar: 'بطاقات' })}
          </Button>
          <Button 
            variant={viewMode === 'structure' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setViewMode('structure')}
          >
            <GitBranch className="w-4 h-4 mr-1" />
            {t({ en: 'Structure', ar: 'الهيكل' })}
          </Button>
          <Button 
            variant={viewMode === 'matrix' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setViewMode('matrix')}
          >
            <Grid3X3 className="w-4 h-4 mr-1" />
            {t({ en: 'Matrix', ar: 'مصفوفة' })}
          </Button>
        </div>
        <Button variant="outline" onClick={onGenerateAI} disabled={isGenerating} className="gap-2">
          <Sparkles className="w-4 h-4" />
          {isGenerating ? t({ en: 'Generating...', ar: 'جاري الإنشاء...' }) : t({ en: 'Generate with AI', ar: 'إنشاء بالذكاء الاصطناعي' })}
        </Button>
      </div>

      {/* Dashboard */}
      <GovernanceDashboard 
        committees={committees}
        roles={roles}
        dashboards={dashboards}
        raciMatrix={raciMatrix}
        escalationPath={escalationPath}
        language={language}
        t={t}
      />

      {/* Structure View */}
      {viewMode === 'structure' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" />
              {t({ en: 'Organization Structure', ar: 'الهيكل التنظيمي' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrgChartView roles={roles} language={language} t={t} />
          </CardContent>
        </Card>
      )}

      {/* Matrix View */}
      {viewMode === 'matrix' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-primary" />
              {t({ en: 'RACI Decision Matrix', ar: 'مصفوفة قرارات RACI' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RaciGridView raciMatrix={raciMatrix} language={language} t={t} />
          </CardContent>
        </Card>
      )}

      {/* Cards View - Tabs */}
      {viewMode === 'cards' && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="committees" className="gap-1 text-xs md:text-sm">
              <Building2 className="w-4 h-4" />
              <span className="hidden md:inline">{t({ en: 'Committees', ar: 'اللجان' })}</span>
              <Badge variant="secondary" className="ml-1 text-xs">{committees.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-1 text-xs md:text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">{t({ en: 'Roles', ar: 'الأدوار' })}</span>
              <Badge variant="secondary" className="ml-1 text-xs">{roles.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="escalation" className="gap-1 text-xs md:text-sm">
              <GitBranch className="w-4 h-4" />
              <span className="hidden md:inline">{t({ en: 'Escalation', ar: 'التصعيد' })}</span>
              <Badge variant="secondary" className="ml-1 text-xs">{escalationPath.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="dashboards" className="gap-1 text-xs md:text-sm">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden md:inline">{t({ en: 'Dashboards', ar: 'لوحات' })}</span>
              <Badge variant="secondary" className="ml-1 text-xs">{dashboards.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="raci" className="gap-1 text-xs md:text-sm">
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden md:inline">{t({ en: 'RACI', ar: 'RACI' })}</span>
              <Badge variant="secondary" className="ml-1 text-xs">{raciMatrix.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Committees Tab */}
          <TabsContent value="committees" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {t({ en: 'Define governance committees with roles and responsibilities', ar: 'تحديد لجان الحوكمة مع الأدوار والمسؤوليات' })}
              </div>
              <Button variant="outline" size="sm" onClick={addCommittee}>
                <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Committee', ar: 'إضافة لجنة' })}
              </Button>
            </div>

            {committees.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t({ en: 'No committees defined', ar: 'لم يتم تحديد لجان' })}</p>
                <p className="text-xs mt-1">{t({ en: 'Click "Add Committee" or use AI to generate', ar: 'انقر على "إضافة لجنة" أو استخدم الذكاء الاصطناعي للإنشاء' })}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {committees.map((committee, idx) => (
                  <CommitteeCard
                    key={committee.id || idx}
                    committee={committee}
                    index={idx}
                    onUpdate={updateCommittee}
                    onRemove={removeCommittee}
                    language={language}
                    t={t}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {t({ en: 'Define key governance roles and reporting lines', ar: 'تحديد أدوار الحوكمة الرئيسية وخطوط التقارير' })}
              </div>
              <Button variant="outline" size="sm" onClick={addRole}>
                <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Role', ar: 'إضافة دور' })}
              </Button>
            </div>

            {roles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t({ en: 'No roles defined', ar: 'لم يتم تحديد أدوار' })}</p>
                <p className="text-xs mt-1">{t({ en: 'Click "Add Role" or use AI to generate', ar: 'انقر على "إضافة دور" أو استخدم الذكاء الاصطناعي للإنشاء' })}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {roles.map((role, idx) => (
                  <RoleCard
                    key={role.id || idx}
                    role={role}
                    index={idx}
                    onUpdate={updateRole}
                    onRemove={removeRole}
                    language={language}
                    t={t}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Escalation Tab */}
          <TabsContent value="escalation" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {t({ en: 'Define escalation path for issues and decisions', ar: 'تحديد مسار التصعيد للمشاكل والقرارات' })}
              </div>
              <Button variant="outline" size="sm" onClick={addEscalationStep}>
                <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Step', ar: 'إضافة خطوة' })}
              </Button>
            </div>

            {escalationPath.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t({ en: 'No escalation steps defined', ar: 'لم يتم تحديد خطوات التصعيد' })}</p>
                <p className="text-xs mt-1">{t({ en: 'Click "Add Step" or use AI to generate', ar: 'انقر على "إضافة خطوة" أو استخدم الذكاء الاصطناعي للإنشاء' })}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {escalationPath.map((step, idx) => (
                  <div key={step.id || idx} className="relative">
                    {idx < escalationPath.length - 1 && (
                      <div className="absolute left-6 top-full w-0.5 h-4 bg-primary/30 z-0" />
                    )}
                    
                    <div className="p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                          <span className="text-lg font-bold text-primary">{step.level || idx + 1}</span>
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">{t({ en: 'Role/Position (EN)', ar: 'الدور/المنصب (إنجليزي)' })}</Label>
                              <Input
                                placeholder="e.g., Project Manager"
                                value={step.role_en || ''}
                                onChange={(e) => updateEscalationStep(idx, 'role_en', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">{t({ en: 'Timeframe (EN)', ar: 'الإطار الزمني (إنجليزي)' })}</Label>
                              <Input
                                placeholder="e.g., Within 24 hours"
                                value={step.timeframe_en || ''}
                                onChange={(e) => updateEscalationStep(idx, 'timeframe_en', e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs">{t({ en: 'Description (EN)', ar: 'الوصف (إنجليزي)' })}</Label>
                            <Input
                              placeholder="When to escalate to this level"
                              value={step.description_en || ''}
                              onChange={(e) => updateEscalationStep(idx, 'description_en', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => moveEscalationStep(idx, -1)}
                            disabled={idx === 0}
                            className="h-8 w-8"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => moveEscalationStep(idx, 1)}
                            disabled={idx === escalationPath.length - 1}
                            className="h-8 w-8"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeEscalationStep(idx)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {idx < escalationPath.length - 1 && (
                      <div className="flex justify-center py-1">
                        <ArrowDown className="w-5 h-5 text-primary/50" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Dashboards Tab */}
          <TabsContent value="dashboards" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {t({ en: 'Configure monitoring dashboards for different audiences', ar: 'تكوين لوحات المراقبة لمختلف الجماهير' })}
              </div>
              <Button variant="outline" size="sm" onClick={addDashboard}>
                <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Dashboard', ar: 'إضافة لوحة' })}
              </Button>
            </div>

            {dashboards.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <LayoutDashboard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t({ en: 'No dashboards defined', ar: 'لم يتم تحديد لوحات تحكم' })}</p>
                <p className="text-xs mt-1">{t({ en: 'Click "Add Dashboard" or use AI to generate', ar: 'انقر على "إضافة لوحة" أو استخدم الذكاء الاصطناعي للإنشاء' })}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboards.map((dashboard, idx) => {
                  const typeConfig = DASHBOARD_TYPES.find(d => d.value === dashboard.type) || DASHBOARD_TYPES[0];
                  const TypeIcon = typeConfig.icon;
                  return (
                    <Card key={dashboard.id || idx} className="relative">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeDashboard(idx)}
                        className="absolute top-2 right-2 h-6 w-6"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${typeConfig.color}/10`}>
                            <TypeIcon className={`w-4 h-4 ${typeConfig.color.replace('bg-', 'text-')}`} />
                          </div>
                          <div className="flex-1">
                            <Input
                              placeholder={t({ en: 'Dashboard Name', ar: 'اسم اللوحة' })}
                              value={dashboard.name_en || ''}
                              onChange={(e) => updateDashboard(idx, 'name_en', e.target.value)}
                              className="h-8 font-medium"
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <Select value={dashboard.type || 'executive'} onValueChange={(v) => updateDashboard(idx, 'type', v)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {DASHBOARD_TYPES.map((d) => (
                                <SelectItem key={d.value} value={d.value}>{d.label[language]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={dashboard.update_frequency || 'weekly'} onValueChange={(v) => updateDashboard(idx, 'update_frequency', v)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="realtime">{t({ en: 'Real-time', ar: 'فوري' })}</SelectItem>
                              <SelectItem value="daily">{t({ en: 'Daily', ar: 'يومي' })}</SelectItem>
                              <SelectItem value="weekly">{t({ en: 'Weekly', ar: 'أسبوعي' })}</SelectItem>
                              <SelectItem value="monthly">{t({ en: 'Monthly', ar: 'شهري' })}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Textarea
                          placeholder={t({ en: 'Key metrics (one per line)', ar: 'المقاييس الرئيسية' })}
                          value={dashboard.key_metrics_en || ''}
                          onChange={(e) => updateDashboard(idx, 'key_metrics_en', e.target.value)}
                          rows={2}
                          className="text-xs"
                        />
                        <Input
                          placeholder={t({ en: 'Target Audience', ar: 'الجمهور المستهدف' })}
                          value={dashboard.audience_en || ''}
                          onChange={(e) => updateDashboard(idx, 'audience_en', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* RACI Tab */}
          <TabsContent value="raci" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {t({ en: 'Define decision rights using RACI matrix', ar: 'تحديد حقوق القرار باستخدام مصفوفة RACI' })}
              </div>
              <Button variant="outline" size="sm" onClick={addRaciEntry}>
                <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Entry', ar: 'إضافة إدخال' })}
              </Button>
            </div>

            {/* RACI Legend */}
            <div className="flex flex-wrap gap-2">
              {RACI_VALUES.map((v) => (
                <Badge key={v.value} variant="outline" className="gap-1">
                  <span className={`w-3 h-3 rounded-full ${v.color}`} />
                  {v.label[language]}
                </Badge>
              ))}
            </div>

            {raciMatrix.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Grid3X3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t({ en: 'No RACI entries defined', ar: 'لم يتم تحديد إدخالات RACI' })}</p>
                <p className="text-xs mt-1">{t({ en: 'Click "Add Entry" or use AI to generate', ar: 'انقر على "إضافة إدخال" أو استخدم الذكاء الاصطناعي للإنشاء' })}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {raciMatrix.map((entry, idx) => {
                  const areaConfig = RACI_AREAS.find(a => a.value === entry.area);
                  const AreaIcon = areaConfig?.icon || Target;
                  return (
                    <div key={entry.id || idx} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <AreaIcon className="w-4 h-4 text-primary" />
                          <Select value={entry.area || 'strategic_decisions'} onValueChange={(v) => updateRaciEntry(idx, 'area', v)}>
                            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {RACI_AREAS.map((a) => (
                                <SelectItem key={a.value} value={a.value}>
                                  <div className="flex items-center gap-2">
                                    <a.icon className="w-4 h-4" />
                                    {a.label[language]}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeRaciEntry(idx)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            {t({ en: 'Responsible', ar: 'مسؤول' })}
                          </Label>
                          <Input
                            placeholder={t({ en: 'Who does the work', ar: 'من ينفذ العمل' })}
                            value={entry.responsible_en || ''}
                            onChange={(e) => updateRaciEntry(idx, 'responsible_en', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            {t({ en: 'Accountable', ar: 'محاسب' })}
                          </Label>
                          <Input
                            placeholder={t({ en: 'Final approver', ar: 'الموافق النهائي' })}
                            value={entry.accountable_en || ''}
                            onChange={(e) => updateRaciEntry(idx, 'accountable_en', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-yellow-500" />
                            {t({ en: 'Consulted', ar: 'مستشار' })}
                          </Label>
                          <Input
                            placeholder={t({ en: 'Input required', ar: 'مدخلات مطلوبة' })}
                            value={entry.consulted_en || ''}
                            onChange={(e) => updateRaciEntry(idx, 'consulted_en', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-gray-400" />
                            {t({ en: 'Informed', ar: 'مطلع' })}
                          </Label>
                          <Input
                            placeholder={t({ en: 'Kept updated', ar: 'يتم إبلاغه' })}
                            value={entry.informed_en || ''}
                            onChange={(e) => updateRaciEntry(idx, 'informed_en', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
