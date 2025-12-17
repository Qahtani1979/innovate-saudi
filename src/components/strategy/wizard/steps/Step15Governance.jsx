import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Sparkles, Building2, Plus, X, AlertTriangle, Users, LayoutDashboard, Grid3X3, 
  ChevronUp, ChevronDown, ArrowDown, UserCheck, Brain, Shield, Scale,
  GitBranch, Network, Target, CheckCircle2, AlertCircle, Clock, Briefcase,
  Crown, UserCog, Lightbulb, Database, Gavel, TrendingUp, ChevronRight,
  BarChart3, PieChart, Activity, Layers, Loader2
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { cn } from '@/lib/utils';
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, MainAIGeneratorCard } from '../shared';

// Enhanced Committee Types
const COMMITTEE_TYPES = [
  { value: 'steering', label: { en: 'Steering Committee', ar: 'لجنة توجيهية' }, icon: Crown, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { value: 'executive', label: { en: 'Executive Committee', ar: 'لجنة تنفيذية' }, icon: Briefcase, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'technical', label: { en: 'Technical Committee', ar: 'لجنة فنية' }, icon: Database, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'advisory', label: { en: 'Advisory Committee', ar: 'لجنة استشارية' }, icon: Users, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { value: 'innovation', label: { en: 'Innovation Committee', ar: 'لجنة الابتكار' }, icon: Lightbulb, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
  { value: 'risk', label: { en: 'Risk & Compliance', ar: 'لجنة المخاطر والامتثال' }, icon: Shield, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  { value: 'data_governance', label: { en: 'Data Governance', ar: 'لجنة حوكمة البيانات' }, icon: Database, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  { value: 'ethics', label: { en: 'Ethics Committee', ar: 'لجنة الأخلاقيات' }, icon: Scale, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' }
];

// Role Types
const ROLE_TYPES = [
  { value: 'executive', label: { en: 'Executive', ar: 'تنفيذي' }, icon: Crown, level: 1 },
  { value: 'senior_management', label: { en: 'Senior Management', ar: 'إدارة عليا' }, icon: Briefcase, level: 2 },
  { value: 'management', label: { en: 'Management', ar: 'إدارة' }, icon: UserCog, level: 3 },
  { value: 'specialist', label: { en: 'Specialist', ar: 'متخصص' }, icon: Target, level: 4 },
  { value: 'coordinator', label: { en: 'Coordinator', ar: 'منسق' }, icon: Network, level: 5 },
  { value: 'analyst', label: { en: 'Analyst', ar: 'محلل' }, icon: BarChart3, level: 6 }
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
  { value: 'R', label: { en: 'Responsible', ar: 'مسؤول' }, color: 'bg-blue-500' },
  { value: 'A', label: { en: 'Accountable', ar: 'محاسب' }, color: 'bg-green-500' },
  { value: 'C', label: { en: 'Consulted', ar: 'مستشار' }, color: 'bg-yellow-500' },
  { value: 'I', label: { en: 'Informed', ar: 'مطلع' }, color: 'bg-gray-400' }
];

const FREQUENCY_OPTIONS = [
  { value: 'weekly', label: { en: 'Weekly', ar: 'أسبوعي' } },
  { value: 'biweekly', label: { en: 'Bi-weekly', ar: 'كل أسبوعين' } },
  { value: 'monthly', label: { en: 'Monthly', ar: 'شهري' } },
  { value: 'quarterly', label: { en: 'Quarterly', ar: 'ربع سنوي' } }
];

// Circular Progress Component
const CircularProgress = ({ value, size = 120, label }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-muted/20" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-primary transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{value}%</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color = "text-primary" }) => (
  <div className="text-center p-3 bg-background rounded-lg border hover:shadow-sm transition-shadow">
    <Icon className={cn("w-5 h-5 mx-auto mb-1", color)} />
    <div className={cn("text-2xl font-bold", color)}>{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

export default function Step15Governance({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating,
  isReadOnly = false 
}) {
  const { language, t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('committees');
  const [viewMode, setViewMode] = useState('cards');
  const [expandedItems, setExpandedItems] = useState({});

  const committees = data.governance?.committees || [];
  const roles = data.governance?.roles || [];
  const dashboards = data.governance?.dashboards || [];
  const raciMatrix = data.governance?.raci_matrix || [];
  
  // Handle escalation path
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
      description_en: ''
    }));
  };
  
  const escalationPath = getEscalationPath();

  // Calculate statistics
  const stats = useMemo(() => {
    const hasInnovationCommittee = committees.some(c => c.type === 'innovation');
    const hasRiskCommittee = committees.some(c => c.type === 'risk');
    const hasDataGovernance = committees.some(c => c.type === 'data_governance');
    const hasSteeringCommittee = committees.some(c => c.type === 'steering');
    
    const executiveRoles = roles.filter(r => r.type === 'executive' || r.type === 'senior_management').length;
    const committeesWithMembers = committees.filter(c => {
      const members = Array.isArray(c.members) ? c.members : 
                      (typeof c.members === 'string' ? c.members.split('\n').filter(Boolean) : []);
      return members.length > 0;
    }).length;

    return {
      totalCommittees: committees.length,
      totalRoles: roles.length,
      totalDashboards: dashboards.length,
      totalRaciEntries: raciMatrix.length,
      escalationLevels: escalationPath.length,
      hasInnovationCommittee,
      hasRiskCommittee,
      hasDataGovernance,
      hasSteeringCommittee,
      executiveRoles,
      committeesWithMembers,
      membersRate: committees.length > 0 ? Math.round((committeesWithMembers / committees.length) * 100) : 0
    };
  }, [committees, roles, dashboards, raciMatrix, escalationPath]);

  // Calculate completeness score
  const completenessScore = useMemo(() => {
    let score = 0;
    
    // 25% for committees (minimum 2)
    score += Math.min((stats.totalCommittees / 2) * 25, 25);
    
    // 20% for roles (minimum 3)
    score += Math.min((stats.totalRoles / 3) * 20, 20);
    
    // 20% for escalation path (minimum 3 levels)
    score += Math.min((stats.escalationLevels / 3) * 20, 20);
    
    // 15% for dashboards (minimum 2)
    score += Math.min((stats.totalDashboards / 2) * 15, 15);
    
    // 20% for RACI entries (minimum 4)
    score += Math.min((stats.totalRaciEntries / 4) * 20, 20);
    
    return Math.round(Math.min(score, 100));
  }, [stats]);

  // Generate alerts
  const alerts = useMemo(() => {
    const warnings = [];
    
    if (stats.totalCommittees === 0) {
      warnings.push({ type: 'error', message: t({ en: 'No governance committees defined', ar: 'لم يتم تحديد لجان حوكمة' }) });
    }
    
    if (!stats.hasSteeringCommittee && stats.totalCommittees > 0) {
      warnings.push({ type: 'warning', message: t({ en: 'Consider adding a Steering Committee for strategic oversight', ar: 'فكر في إضافة لجنة توجيهية للرقابة الاستراتيجية' }) });
    }
    
    if (stats.totalRoles === 0) {
      warnings.push({ type: 'warning', message: t({ en: 'No governance roles defined', ar: 'لم يتم تحديد أدوار حوكمة' }) });
    }
    
    if (stats.escalationLevels < 3 && stats.escalationLevels > 0) {
      warnings.push({ type: 'warning', message: t({ en: 'Escalation path should have at least 3 levels', ar: 'يجب أن يحتوي مسار التصعيد على 3 مستويات على الأقل' }) });
    }
    
    if (stats.totalRaciEntries === 0) {
      warnings.push({ type: 'warning', message: t({ en: 'Define RACI matrix for clear decision rights', ar: 'حدد مصفوفة RACI لوضوح حقوق القرار' }) });
    }
    
    return warnings;
  }, [stats, t]);

  const toggleExpanded = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Committee handlers
  const addCommittee = () => {
    if (isReadOnly) return;
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
    setExpandedItems(prev => ({ ...prev, [newCommittee.id]: true }));
  };

  const updateCommittee = (id, field, value) => {
    if (isReadOnly) return;
    const updated = committees.map(c => c.id === id ? { ...c, [field]: value } : c);
    onChange({ governance: { ...data.governance, committees: updated } });
  };

  const removeCommittee = (id) => {
    if (isReadOnly) return;
    onChange({ governance: { ...data.governance, committees: committees.filter(c => c.id !== id) } });
  };

  // Role handlers
  const addRole = () => {
    if (isReadOnly) return;
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
    setExpandedItems(prev => ({ ...prev, [newRole.id]: true }));
  };

  const updateRole = (id, field, value) => {
    if (isReadOnly) return;
    const updated = roles.map(r => r.id === id ? { ...r, [field]: value } : r);
    onChange({ governance: { ...data.governance, roles: updated } });
  };

  const removeRole = (id) => {
    if (isReadOnly) return;
    onChange({ governance: { ...data.governance, roles: roles.filter(r => r.id !== id) } });
  };

  // Dashboard handlers
  const addDashboard = () => {
    if (isReadOnly) return;
    const newDashboard = {
      id: Date.now().toString(),
      name_en: '',
      name_ar: '',
      type: 'executive',
      description_en: '',
      key_metrics_en: '',
      update_frequency: 'weekly',
      audience_en: ''
    };
    onChange({ governance: { ...data.governance, dashboards: [...dashboards, newDashboard] } });
  };

  const updateDashboard = (id, field, value) => {
    if (isReadOnly) return;
    const updated = dashboards.map(d => d.id === id ? { ...d, [field]: value } : d);
    onChange({ governance: { ...data.governance, dashboards: updated } });
  };

  const removeDashboard = (id) => {
    if (isReadOnly) return;
    onChange({ governance: { ...data.governance, dashboards: dashboards.filter(d => d.id !== id) } });
  };

  // RACI handlers
  const addRaciEntry = () => {
    if (isReadOnly) return;
    const newEntry = {
      id: Date.now().toString(),
      area: 'strategic_decisions',
      responsible_en: '',
      accountable_en: '',
      consulted_en: '',
      informed_en: ''
    };
    onChange({ governance: { ...data.governance, raci_matrix: [...raciMatrix, newEntry] } });
  };

  const updateRaciEntry = (id, field, value) => {
    if (isReadOnly) return;
    const updated = raciMatrix.map(r => r.id === id ? { ...r, [field]: value } : r);
    onChange({ governance: { ...data.governance, raci_matrix: updated } });
  };

  const removeRaciEntry = (id) => {
    if (isReadOnly) return;
    onChange({ governance: { ...data.governance, raci_matrix: raciMatrix.filter(r => r.id !== id) } });
  };

  // Escalation Path handlers
  const addEscalationStep = () => {
    if (isReadOnly) return;
    const newStep = {
      id: Date.now().toString(),
      level: escalationPath.length + 1,
      role_en: '',
      role_ar: '',
      timeframe_en: '',
      description_en: ''
    };
    onChange({ governance: { ...data.governance, escalation_path: [...escalationPath, newStep] } });
  };

  const updateEscalationStep = (id, field, value) => {
    if (isReadOnly) return;
    const updated = escalationPath.map(step => step.id === id ? { ...step, [field]: value } : step);
    onChange({ governance: { ...data.governance, escalation_path: updated } });
  };

  const removeEscalationStep = (id) => {
    if (isReadOnly) return;
    const updated = escalationPath.filter(step => step.id !== id).map((step, i) => ({ ...step, level: i + 1 }));
    onChange({ governance: { ...data.governance, escalation_path: updated } });
  };

  const moveEscalationStep = (id, direction) => {
    if (isReadOnly) return;
    const index = escalationPath.findIndex(s => s.id === id);
    if ((direction === -1 && index === 0) || (direction === 1 && index === escalationPath.length - 1)) return;
    const newPath = [...escalationPath];
    const temp = newPath[index];
    newPath[index] = newPath[index + direction];
    newPath[index + direction] = temp;
    const updated = newPath.map((step, i) => ({ ...step, level: i + 1 }));
    onChange({ governance: { ...data.governance, escalation_path: updated } });
  };

  const getCommitteeProgress = (committee) => {
    let filled = 0;
    if (committee.name_en || committee.name_ar) filled++;
    if (committee.type) filled++;
    if (committee.chair_role_en) filled++;
    const members = Array.isArray(committee.members) ? committee.members : 
                    (typeof committee.members === 'string' ? committee.members.split('\n').filter(Boolean) : []);
    if (members.length > 0) filled++;
    if (committee.responsibilities_en || committee.responsibilities_ar) filled++;
    return Math.round((filled / 5) * 100);
  };

  const getRoleProgress = (role) => {
    let filled = 0;
    if (role.title_en || role.title_ar) filled++;
    if (role.type) filled++;
    if (role.department_en) filled++;
    if (role.key_responsibilities_en || role.key_responsibilities_ar) filled++;
    if (role.reports_to_en) filled++;
    return Math.round((filled / 5) * 100);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dashboard Header */}
      <StepDashboardHeader
        score={completenessScore}
        title={t({ en: 'Governance Structure', ar: 'هيكل الحوكمة' })}
        subtitle={t({ en: 'Define committees, roles, and accountability', ar: 'تحديد اللجان والأدوار والمساءلة' })}
        language={language}
        stats={[
          { icon: Building2, value: stats.totalCommittees, label: t({ en: 'Committees', ar: 'اللجان' }) },
          { icon: Users, value: stats.totalRoles, label: t({ en: 'Roles', ar: 'الأدوار' }) },
          { icon: GitBranch, value: stats.escalationLevels, label: t({ en: 'Escalation', ar: 'التصعيد' }) },
          { icon: LayoutDashboard, value: stats.totalDashboards, label: t({ en: 'Dashboards', ar: 'لوحات' }) },
          { icon: Grid3X3, value: stats.totalRaciEntries, label: t({ en: 'RACI Entries', ar: 'إدخالات' }) },
        ]}
      />
      
      {/* AI Generation Card */}
      {!isReadOnly && (
        <MainAIGeneratorCard
          title={{ en: 'AI-Powered Governance Structure', ar: 'هيكل الحوكمة بالذكاء الاصطناعي' }}
          description={{ en: 'Generate committees, roles, RACI matrix, and dashboards', ar: 'إنشاء اللجان والأدوار ومصفوفة RACI ولوحات التحكم' }}
          onGenerate={onGenerateAI}
          isGenerating={isGenerating}
          generateLabel={{ en: 'Generate Governance', ar: 'إنشاء الحوكمة' }}
        />
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <Alert key={idx} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              {alert.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* View Mode Buttons */}
      <div className="flex gap-2">
        <Button variant={viewMode === 'cards' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('cards')}>
          <Layers className="w-4 h-4 mr-1" />
          {t({ en: 'Cards', ar: 'بطاقات' })}
        </Button>
        <Button variant={viewMode === 'structure' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('structure')}>
          <GitBranch className="w-4 h-4 mr-1" />
          {t({ en: 'Structure', ar: 'الهيكل' })}
        </Button>
        <Button variant={viewMode === 'summary' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('summary')}>
          <BarChart3 className="w-4 h-4 mr-1" />
          {t({ en: 'Summary', ar: 'الملخص' })}
        </Button>
      </div>

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
            {roles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                {t({ en: 'No roles defined yet', ar: 'لم يتم تحديد أدوار بعد' })}
              </div>
            ) : (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map(level => {
                  const levelRoles = roles.filter(r => {
                    const typeConfig = ROLE_TYPES.find(rt => rt.value === r.type);
                    return (typeConfig?.level || 3) === level;
                  });
                  if (levelRoles.length === 0) return null;
                  const levelConfig = ROLE_TYPES.find(rt => rt.level === level);
                  return (
                    <div key={level}>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{levelConfig?.label[language] || `Level ${level}`}</Badge>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {levelRoles.map(role => {
                          const typeConfig = ROLE_TYPES.find(rt => rt.value === role.type);
                          const TypeIcon = typeConfig?.icon || Users;
                          return (
                            <div key={role.id} className="p-3 border rounded-lg bg-card flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <TypeIcon className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{role.title_en || role.title_ar || t({ en: 'Untitled', ar: 'بدون عنوان' })}</div>
                                <div className="text-xs text-muted-foreground truncate">{role.department_en || role.department_ar}</div>
                                {role.reports_to_en && <div className="text-xs text-muted-foreground mt-1">→ {role.reports_to_en}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {level < 6 && levelRoles.length > 0 && (
                        <div className="flex justify-center my-2"><ArrowDown className="w-4 h-4 text-muted-foreground" /></div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary View */}
      {viewMode === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {t({ en: 'Committee Coverage', ar: 'تغطية اللجان' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {COMMITTEE_TYPES.slice(0, 5).map(ct => {
                const has = committees.some(c => c.type === ct.value);
                return (
                  <div key={ct.value} className={cn("flex items-center gap-2 p-2 rounded-lg text-sm", has ? 'bg-green-500/10 text-green-700 dark:text-green-300' : 'bg-muted/50 text-muted-foreground')}>
                    {has ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {ct.label[language]}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" />
                {t({ en: 'RACI Coverage', ar: 'تغطية RACI' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {RACI_AREAS.slice(0, 5).map(area => {
                const has = raciMatrix.some(r => r.area === area.value);
                return (
                  <div key={area.value} className={cn("flex items-center gap-2 p-2 rounded-lg text-sm", has ? 'bg-green-500/10 text-green-700 dark:text-green-300' : 'bg-muted/50 text-muted-foreground')}>
                    {has ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {area.label[language]}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <RecommendationsCard
            className="md:col-span-2"
            title={t({ en: 'Recommendations', ar: 'التوصيات' })}
            recommendations={[
              ...(!stats.hasSteeringCommittee ? [{ type: 'warning', text: { en: 'Add a Steering Committee for strategic oversight and major decisions', ar: 'أضف لجنة توجيهية للرقابة الاستراتيجية والقرارات الرئيسية' } }] : []),
              ...(!stats.hasRiskCommittee ? [{ type: 'warning', text: { en: 'Consider a Risk & Compliance committee for risk management', ar: 'فكر في لجنة للمخاطر والامتثال لإدارة المخاطر' } }] : []),
              ...(stats.escalationLevels < 3 ? [{ type: 'warning', text: { en: 'Define at least 3 escalation levels for issue resolution', ar: 'حدد 3 مستويات تصعيد على الأقل لحل المشاكل' } }] : []),
              ...(stats.totalDashboards === 0 ? [{ type: 'warning', text: { en: 'Add monitoring dashboards for performance tracking', ar: 'أضف لوحات مراقبة لتتبع الأداء' } }] : []),
              ...(completenessScore >= 80 ? [{ type: 'success', text: { en: 'Governance structure is well-defined. Review periodically.', ar: 'هيكل الحوكمة محدد جيداً. راجعه دورياً.' } }] : []),
            ]}
            language={language}
          />
        </div>
      )}

      {/* Cards View - Tabs */}
      {viewMode === 'cards' && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="committees" className="gap-1">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Committees', ar: 'اللجان' })}</span>
              <Badge variant="secondary" className="ml-1 text-xs">{committees.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-1">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Roles', ar: 'الأدوار' })}</span>
              <Badge variant="secondary" className="ml-1 text-xs">{roles.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="escalation" className="gap-1">
              <GitBranch className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Escalation', ar: 'التصعيد' })}</span>
              <Badge variant="secondary" className="ml-1 text-xs">{escalationPath.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="dashboards" className="gap-1">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Dashboards', ar: 'لوحات' })}</span>
              <Badge variant="secondary" className="ml-1 text-xs">{dashboards.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="raci" className="gap-1">
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'RACI', ar: 'RACI' })}</span>
              <Badge variant="secondary" className="ml-1 text-xs">{raciMatrix.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Committees Tab */}
          <TabsContent value="committees" className="space-y-4">
            {!isReadOnly && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={addCommittee}>
                  <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Committee', ar: 'إضافة لجنة' })}
                </Button>
              </div>
            )}

            {committees.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">{t({ en: 'No committees defined', ar: 'لم يتم تحديد لجان' })}</p>
                  {!isReadOnly && (
                    <Button variant="link" onClick={addCommittee} className="mt-2">
                      <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add first committee', ar: 'أضف أول لجنة' })}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {committees.map(committee => {
                  const isExpanded = expandedItems[committee.id];
                  const typeConfig = COMMITTEE_TYPES.find(ct => ct.value === committee.type) || COMMITTEE_TYPES[0];
                  const TypeIcon = typeConfig.icon;
                  const progress = getCommitteeProgress(committee);
                  const members = Array.isArray(committee.members) ? committee.members : 
                                  (typeof committee.members === 'string' ? committee.members.split('\n').filter(Boolean) : []);

                  return (
                    <Collapsible key={committee.id} open={isExpanded} onOpenChange={() => toggleExpanded(committee.id)}>
                      <Card className={cn("border-2 transition-all", progress >= 80 && "border-green-300")}>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", typeConfig.color)}>
                                  <TypeIcon className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{committee.name_en || committee.name || t({ en: 'Unnamed Committee', ar: 'لجنة بدون اسم' })}</span>
                                    {progress >= 80 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {typeConfig.label[language]} • {FREQUENCY_OPTIONS.find(f => f.value === committee.meeting_frequency)?.label[language] || 'Monthly'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2">
                                  <Progress value={progress} className="w-16 h-1.5" />
                                  <span className="text-xs text-muted-foreground">{progress}%</span>
                                </div>
                                <Badge variant="outline" className="text-xs">{members.length} {t({ en: 'members', ar: 'أعضاء' })}</Badge>
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </div>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <CardContent className="space-y-4 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">{t({ en: 'Committee Name (EN)', ar: 'اسم اللجنة (إنجليزي)' })}</Label>
                                <Input
                                  value={committee.name_en || committee.name || ''}
                                  onChange={(e) => updateCommittee(committee.id, 'name_en', e.target.value)}
                                  className={cn((committee.name_en || committee.name) && "border-green-300")}
                                  disabled={isReadOnly}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">{t({ en: 'Committee Name (AR)', ar: 'اسم اللجنة (عربي)' })}</Label>
                                <Input
                                  dir="rtl"
                                  value={committee.name_ar || ''}
                                  onChange={(e) => updateCommittee(committee.id, 'name_ar', e.target.value)}
                                  className={cn(committee.name_ar && "border-green-300")}
                                  disabled={isReadOnly}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs">{t({ en: 'Type', ar: 'النوع' })}</Label>
                                <Select value={committee.type || 'steering'} onValueChange={(v) => updateCommittee(committee.id, 'type', v)} disabled={isReadOnly}>
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
                                <Label className="text-xs">{t({ en: 'Chair Role', ar: 'رئيس اللجنة' })}</Label>
                                <Input
                                  value={committee.chair_role_en || ''}
                                  onChange={(e) => updateCommittee(committee.id, 'chair_role_en', e.target.value)}
                                  className={cn(committee.chair_role_en && "border-green-300")}
                                  disabled={isReadOnly}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">{t({ en: 'Meeting Frequency', ar: 'تكرار الاجتماعات' })}</Label>
                                <Select value={committee.meeting_frequency || 'monthly'} onValueChange={(v) => updateCommittee(committee.id, 'meeting_frequency', v)} disabled={isReadOnly}>
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
                              <Label className="text-xs">{t({ en: 'Members (one per line)', ar: 'الأعضاء (كل عضو في سطر)' })}</Label>
                              <Textarea
                                value={members.join('\n')}
                                onChange={(e) => updateCommittee(committee.id, 'members', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                                rows={3}
                                className={cn(members.length > 0 && "border-green-300")}
                                disabled={isReadOnly}
                              />
                            </div>

                            <div>
                              <Label className="text-xs">{t({ en: 'Responsibilities', ar: 'المسؤوليات' })}</Label>
                              <Textarea
                                value={committee.responsibilities_en || committee.responsibilities || ''}
                                onChange={(e) => updateCommittee(committee.id, 'responsibilities_en', e.target.value)}
                                rows={2}
                                className={cn((committee.responsibilities_en || committee.responsibilities) && "border-green-300")}
                                disabled={isReadOnly}
                              />
                            </div>

                            {!isReadOnly && (
                              <div className="flex justify-end pt-2 border-t">
                                <Button variant="ghost" size="sm" onClick={() => removeCommittee(committee.id)} className="text-destructive hover:text-destructive">
                                  <X className="w-4 h-4 mr-1" />{t({ en: 'Remove', ar: 'حذف' })}
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-4">
            {!isReadOnly && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={addRole}>
                  <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Role', ar: 'إضافة دور' })}
                </Button>
              </div>
            )}

            {roles.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">{t({ en: 'No roles defined', ar: 'لم يتم تحديد أدوار' })}</p>
                  {!isReadOnly && (
                    <Button variant="link" onClick={addRole} className="mt-2">
                      <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add first role', ar: 'أضف أول دور' })}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {roles.map(role => {
                  const isExpanded = expandedItems[role.id];
                  const typeConfig = ROLE_TYPES.find(rt => rt.value === role.type) || ROLE_TYPES[2];
                  const TypeIcon = typeConfig.icon;
                  const progress = getRoleProgress(role);

                  return (
                    <Collapsible key={role.id} open={isExpanded} onOpenChange={() => toggleExpanded(role.id)}>
                      <Card className={cn("border-2 transition-all", progress >= 80 && "border-green-300")}>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <TypeIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{role.title_en || t({ en: 'Unnamed Role', ar: 'دور بدون اسم' })}</span>
                                    {progress >= 80 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {typeConfig.label[language]} • {role.department_en || t({ en: 'No department', ar: 'بدون قسم' })}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2">
                                  <Progress value={progress} className="w-16 h-1.5" />
                                  <span className="text-xs text-muted-foreground">{progress}%</span>
                                </div>
                                <Badge variant="outline" className="text-xs">L{typeConfig.level}</Badge>
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </div>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <CardContent className="space-y-4 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">{t({ en: 'Role Title (EN)', ar: 'عنوان الدور (إنجليزي)' })}</Label>
                                <Input
                                  value={role.title_en || ''}
                                  onChange={(e) => updateRole(role.id, 'title_en', e.target.value)}
                                  className={cn(role.title_en && "border-green-300")}
                                  disabled={isReadOnly}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">{t({ en: 'Role Title (AR)', ar: 'عنوان الدور (عربي)' })}</Label>
                                <Input
                                  dir="rtl"
                                  value={role.title_ar || ''}
                                  onChange={(e) => updateRole(role.id, 'title_ar', e.target.value)}
                                  className={cn(role.title_ar && "border-green-300")}
                                  disabled={isReadOnly}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs">{t({ en: 'Type', ar: 'النوع' })}</Label>
                                <Select value={role.type || 'management'} onValueChange={(v) => updateRole(role.id, 'type', v)} disabled={isReadOnly}>
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
                                <Label className="text-xs">{t({ en: 'Department', ar: 'القسم' })}</Label>
                                <Input
                                  value={role.department_en || ''}
                                  onChange={(e) => updateRole(role.id, 'department_en', e.target.value)}
                                  className={cn(role.department_en && "border-green-300")}
                                  disabled={isReadOnly}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">{t({ en: 'Reports To', ar: 'يقدم تقاريره إلى' })}</Label>
                                <Input
                                  value={role.reports_to_en || ''}
                                  onChange={(e) => updateRole(role.id, 'reports_to_en', e.target.value)}
                                  className={cn(role.reports_to_en && "border-green-300")}
                                  disabled={isReadOnly}
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs">{t({ en: 'Key Responsibilities', ar: 'المسؤوليات الرئيسية' })}</Label>
                              <Textarea
                                value={role.key_responsibilities_en || ''}
                                onChange={(e) => updateRole(role.id, 'key_responsibilities_en', e.target.value)}
                                rows={2}
                                className={cn(role.key_responsibilities_en && "border-green-300")}
                                disabled={isReadOnly}
                              />
                            </div>

                            {!isReadOnly && (
                              <div className="flex justify-end pt-2 border-t">
                                <Button variant="ghost" size="sm" onClick={() => removeRole(role.id)} className="text-destructive hover:text-destructive">
                                  <X className="w-4 h-4 mr-1" />{t({ en: 'Remove', ar: 'حذف' })}
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Escalation Tab */}
          <TabsContent value="escalation" className="space-y-4">
            {!isReadOnly && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={addEscalationStep}>
                  <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Step', ar: 'إضافة خطوة' })}
                </Button>
              </div>
            )}

            {escalationPath.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <GitBranch className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">{t({ en: 'No escalation steps defined', ar: 'لم يتم تحديد خطوات التصعيد' })}</p>
                  {!isReadOnly && (
                    <Button variant="link" onClick={addEscalationStep} className="mt-2">
                      <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add first step', ar: 'أضف أول خطوة' })}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {escalationPath.map((step, idx) => (
                  <div key={step.id} className="relative">
                    {idx < escalationPath.length - 1 && (
                      <div className="absolute left-6 top-full w-0.5 h-4 bg-primary/30 z-0" />
                    )}
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                            <span className="text-lg font-bold text-primary">{step.level || idx + 1}</span>
                          </div>
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">{t({ en: 'Role/Position', ar: 'الدور/المنصب' })}</Label>
                              <Input
                                value={step.role_en || ''}
                                onChange={(e) => updateEscalationStep(step.id, 'role_en', e.target.value)}
                                className={cn(step.role_en && "border-green-300")}
                                disabled={isReadOnly}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">{t({ en: 'Timeframe', ar: 'الإطار الزمني' })}</Label>
                              <Input
                                placeholder={t({ en: 'e.g., Within 24 hours', ar: 'مثال: خلال 24 ساعة' })}
                                value={step.timeframe_en || ''}
                                onChange={(e) => updateEscalationStep(step.id, 'timeframe_en', e.target.value)}
                                disabled={isReadOnly}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">{t({ en: 'Description', ar: 'الوصف' })}</Label>
                              <Input
                                value={step.description_en || ''}
                                onChange={(e) => updateEscalationStep(step.id, 'description_en', e.target.value)}
                                disabled={isReadOnly}
                              />
                            </div>
                          </div>
                          
                          {!isReadOnly && (
                            <div className="flex flex-col gap-1">
                              <Button variant="ghost" size="icon" onClick={() => moveEscalationStep(step.id, -1)} disabled={idx === 0} className="h-8 w-8">
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => moveEscalationStep(step.id, 1)} disabled={idx === escalationPath.length - 1} className="h-8 w-8">
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => removeEscalationStep(step.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {idx < escalationPath.length - 1 && (
                      <div className="flex justify-center py-1"><ArrowDown className="w-5 h-5 text-primary/50" /></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Dashboards Tab */}
          <TabsContent value="dashboards" className="space-y-4">
            {!isReadOnly && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={addDashboard}>
                  <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Dashboard', ar: 'إضافة لوحة' })}
                </Button>
              </div>
            )}

            {dashboards.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <LayoutDashboard className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">{t({ en: 'No dashboards defined', ar: 'لم يتم تحديد لوحات تحكم' })}</p>
                  {!isReadOnly && (
                    <Button variant="link" onClick={addDashboard} className="mt-2">
                      <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add first dashboard', ar: 'أضف أول لوحة' })}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboards.map(dashboard => {
                  const typeConfig = DASHBOARD_TYPES.find(d => d.value === dashboard.type) || DASHBOARD_TYPES[0];
                  const TypeIcon = typeConfig.icon;
                  return (
                    <Card key={dashboard.id} className="relative">
                      {!isReadOnly && (
                        <Button variant="ghost" size="icon" onClick={() => removeDashboard(dashboard.id)} className="absolute top-2 right-2 h-6 w-6">
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-2 rounded-lg", `${typeConfig.color}/10`)}>
                            <TypeIcon className={cn("w-4 h-4", typeConfig.color.replace('bg-', 'text-'))} />
                          </div>
                          <div className="flex-1">
                            <Input
                              placeholder={t({ en: 'Dashboard Name', ar: 'اسم اللوحة' })}
                              value={dashboard.name_en || ''}
                              onChange={(e) => updateDashboard(dashboard.id, 'name_en', e.target.value)}
                              className="h-8 font-medium"
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <Select value={dashboard.type || 'executive'} onValueChange={(v) => updateDashboard(dashboard.id, 'type', v)} disabled={isReadOnly}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {DASHBOARD_TYPES.map((d) => (
                                <SelectItem key={d.value} value={d.value}>{d.label[language]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={dashboard.update_frequency || 'weekly'} onValueChange={(v) => updateDashboard(dashboard.id, 'update_frequency', v)} disabled={isReadOnly}>
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
                          onChange={(e) => updateDashboard(dashboard.id, 'key_metrics_en', e.target.value)}
                          rows={2}
                          className="text-xs"
                          disabled={isReadOnly}
                        />
                        <Input
                          placeholder={t({ en: 'Target Audience', ar: 'الجمهور المستهدف' })}
                          value={dashboard.audience_en || ''}
                          onChange={(e) => updateDashboard(dashboard.id, 'audience_en', e.target.value)}
                          className="h-8 text-xs"
                          disabled={isReadOnly}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* RACI Tab */}
          <TabsContent value="raci" className="space-y-4">
            {!isReadOnly && (
              <div className="flex justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  {RACI_VALUES.map((v) => (
                    <Badge key={v.value} variant="outline" className="gap-1">
                      <span className={cn("w-2 h-2 rounded-full", v.color)} />
                      {v.value} - {v.label[language]}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addRaciEntry}>
                  <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Entry', ar: 'إضافة إدخال' })}
                </Button>
              </div>
            )}

            {raciMatrix.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Grid3X3 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">{t({ en: 'No RACI entries defined', ar: 'لم يتم تحديد إدخالات RACI' })}</p>
                  {!isReadOnly && (
                    <Button variant="link" onClick={addRaciEntry} className="mt-2">
                      <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add first entry', ar: 'أضف أول إدخال' })}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {raciMatrix.map(entry => {
                  const areaConfig = RACI_AREAS.find(a => a.value === entry.area);
                  const AreaIcon = areaConfig?.icon || Target;
                  return (
                    <Card key={entry.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <AreaIcon className="w-4 h-4 text-primary" />
                            <Select value={entry.area || 'strategic_decisions'} onValueChange={(v) => updateRaciEntry(entry.id, 'area', v)} disabled={isReadOnly}>
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
                          {!isReadOnly && (
                            <Button variant="ghost" size="icon" onClick={() => removeRaciEntry(entry.id)}>
                              <X className="w-4 h-4" />
                            </Button>
                          )}
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
                              onChange={(e) => updateRaciEntry(entry.id, 'responsible_en', e.target.value)}
                              className="h-8 text-xs"
                              disabled={isReadOnly}
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
                              onChange={(e) => updateRaciEntry(entry.id, 'accountable_en', e.target.value)}
                              className="h-8 text-xs"
                              disabled={isReadOnly}
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
                              onChange={(e) => updateRaciEntry(entry.id, 'consulted_en', e.target.value)}
                              className="h-8 text-xs"
                              disabled={isReadOnly}
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
                              onChange={(e) => updateRaciEntry(entry.id, 'informed_en', e.target.value)}
                              className="h-8 text-xs"
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
