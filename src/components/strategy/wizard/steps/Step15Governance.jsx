import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Building2, Plus, X, AlertTriangle, Users, LayoutDashboard, Grid3X3 } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { GOVERNANCE_ROLES } from '../StrategyWizardSteps';

const ROLE_TYPES = [
  { value: 'executive', label: { en: 'Executive', ar: 'تنفيذي' } },
  { value: 'management', label: { en: 'Management', ar: 'إدارة' } },
  { value: 'specialist', label: { en: 'Specialist', ar: 'متخصص' } },
  { value: 'coordinator', label: { en: 'Coordinator', ar: 'منسق' } }
];

const DASHBOARD_TYPES = [
  { value: 'executive', label: { en: 'Executive Dashboard', ar: 'لوحة تحكم تنفيذية' } },
  { value: 'operational', label: { en: 'Operational Dashboard', ar: 'لوحة تحكم تشغيلية' } },
  { value: 'innovation', label: { en: 'Innovation Dashboard', ar: 'لوحة تحكم الابتكار' } },
  { value: 'kpi', label: { en: 'KPI Dashboard', ar: 'لوحة مؤشرات الأداء' } },
  { value: 'risk', label: { en: 'Risk Dashboard', ar: 'لوحة المخاطر' } }
];

const RACI_AREAS = [
  { value: 'strategic_decisions', label: { en: 'Strategic Decisions', ar: 'القرارات الاستراتيجية' } },
  { value: 'budget_allocation', label: { en: 'Budget Allocation', ar: 'تخصيص الميزانية' } },
  { value: 'technology_adoption', label: { en: 'Technology Adoption', ar: 'اعتماد التقنية' } },
  { value: 'pilot_approval', label: { en: 'Pilot Approval', ar: 'اعتماد المشاريع التجريبية' } },
  { value: 'vendor_selection', label: { en: 'Vendor Selection', ar: 'اختيار الموردين' } },
  { value: 'rd_partnerships', label: { en: 'R&D Partnerships', ar: 'شراكات البحث والتطوير' } },
  { value: 'hiring', label: { en: 'Hiring Decisions', ar: 'قرارات التوظيف' } },
  { value: 'policy_changes', label: { en: 'Policy Changes', ar: 'تغييرات السياسات' } }
];

const RACI_VALUES = [
  { value: 'R', label: { en: 'R - Responsible', ar: 'م - مسؤول' }, color: 'bg-blue-500' },
  { value: 'A', label: { en: 'A - Accountable', ar: 'ح - محاسب' }, color: 'bg-green-500' },
  { value: 'C', label: { en: 'C - Consulted', ar: 'ش - مستشار' }, color: 'bg-yellow-500' },
  { value: 'I', label: { en: 'I - Informed', ar: 'ع - مطلع' }, color: 'bg-gray-400' }
];

export default function Step15Governance({ data, onChange, onGenerateAI, isGenerating }) {
  const { language, t, isRTL } = useLanguage();

  const committees = data.governance?.committees || [];
  const roles = data.governance?.roles || [];
  const dashboards = data.governance?.dashboards || [];
  const raciMatrix = data.governance?.raci_matrix || [];
  
  const escalationPath = Array.isArray(data.governance?.escalation_path)
    ? data.governance.escalation_path
    : (typeof data.governance?.escalation_path === 'string'
      ? data.governance.escalation_path.split(/\n|;|,/).map(s => s.trim()).filter(Boolean)
      : []);

  const frequencyOptions = [
    { value: 'weekly', label: { en: 'Weekly', ar: 'أسبوعي' } },
    { value: 'biweekly', label: { en: 'Bi-weekly', ar: 'كل أسبوعين' } },
    { value: 'monthly', label: { en: 'Monthly', ar: 'شهري' } },
    { value: 'quarterly', label: { en: 'Quarterly', ar: 'ربع سنوي' } }
  ];

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

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onGenerateAI} disabled={isGenerating} className="gap-2">
          <Sparkles className="w-4 h-4" />
          {isGenerating ? t({ en: 'Generating...', ar: 'جاري الإنشاء...' }) : t({ en: 'Generate Governance Structure', ar: 'إنشاء هيكل الحوكمة' })}
        </Button>
      </div>

      <Tabs defaultValue="committees" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="committees" className="gap-2">
            <Building2 className="w-4 h-4" />
            {t({ en: 'Committees', ar: 'اللجان' })}
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Users className="w-4 h-4" />
            {t({ en: 'Roles', ar: 'الأدوار' })}
          </TabsTrigger>
          <TabsTrigger value="dashboards" className="gap-2">
            <LayoutDashboard className="w-4 h-4" />
            {t({ en: 'Dashboards', ar: 'لوحات التحكم' })}
          </TabsTrigger>
          <TabsTrigger value="raci" className="gap-2">
            <Grid3X3 className="w-4 h-4" />
            {t({ en: 'RACI Matrix', ar: 'مصفوفة RACI' })}
          </TabsTrigger>
        </TabsList>

        {/* Committees Tab */}
        <TabsContent value="committees" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t({ en: 'Reporting Frequency', ar: 'تكرار التقارير' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={data.governance?.reporting_frequency || 'monthly'}
                onValueChange={(v) => onChange({ governance: { ...data.governance, reporting_frequency: v } })}
              >
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label[language]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-primary" />
                {t({ en: 'Escalation Path', ar: 'مسار التصعيد' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">{t({ en: 'Escalation Path (EN)', ar: 'مسار التصعيد (إنجليزي)' })}</Label>
                <Textarea
                  className="mt-2"
                  placeholder="Enter escalation steps (one per line)"
                  value={data.governance?.escalation_path_en || escalationPath.join('\n')}
                  onChange={(e) => onChange({
                    governance: {
                      ...data.governance,
                      escalation_path_en: e.target.value,
                      escalation_path: e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
                    }
                  })}
                  rows={4}
                />
              </div>
              <div>
                <Label className="text-sm">{t({ en: 'Escalation Path (AR)', ar: 'مسار التصعيد (عربي)' })}</Label>
                <Textarea
                  dir="rtl"
                  className="mt-2"
                  placeholder="أدخل خطوات التصعيد (كل خطوة في سطر)"
                  value={data.governance?.escalation_path_ar || ''}
                  onChange={(e) => onChange({
                    governance: {
                      ...data.governance,
                      escalation_path_ar: e.target.value
                    }
                  })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5 text-primary" />
                {t({ en: 'Governance Committees', ar: 'لجان الحوكمة' })}
                <Badge variant="secondary">{committees.length}</Badge>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={addCommittee}>
                <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Committee', ar: 'إضافة لجنة' })}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {committees.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                  {t({ en: 'No committees defined. Click "Add Committee" to start.', ar: 'لم يتم تحديد لجان. انقر على "إضافة لجنة" للبدء.' })}
                </div>
              ) : (
                committees.map((committee, idx) => {
                  const members = Array.isArray(committee.members)
                    ? committee.members
                    : (typeof committee.members === 'string'
                      ? committee.members.split('\n').map(s => s.trim()).filter(Boolean)
                      : []);

                  return (
                    <div key={committee.id || idx} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">
                          {committee.type === 'steering' ? t({ en: 'Steering', ar: 'توجيهية' }) :
                           committee.type === 'executive' ? t({ en: 'Executive', ar: 'تنفيذية' }) :
                           committee.type === 'technical' ? t({ en: 'Technical', ar: 'فنية' }) :
                           committee.type === 'advisory' ? t({ en: 'Advisory', ar: 'استشارية' }) :
                           committee.type === 'innovation' ? t({ en: 'Innovation', ar: 'ابتكار' }) :
                           GOVERNANCE_ROLES.find(r => r.code === committee.role)?.[`name_${language}`] || committee.type}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => removeCommittee(idx)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">{t({ en: 'Committee Name (EN)', ar: 'اسم اللجنة (إنجليزي)' })}</Label>
                          <Input
                            placeholder="Committee Name"
                            value={committee.name_en || committee.name || ''}
                            onChange={(e) => updateCommittee(idx, 'name_en', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{t({ en: 'Committee Name (AR)', ar: 'اسم اللجنة (عربي)' })}</Label>
                          <Input
                            dir="rtl"
                            placeholder="اسم اللجنة"
                            value={committee.name_ar || ''}
                            onChange={(e) => updateCommittee(idx, 'name_ar', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">{t({ en: 'Type', ar: 'النوع' })}</Label>
                          <Select value={committee.type || 'steering'} onValueChange={(v) => updateCommittee(idx, 'type', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="steering">{t({ en: 'Steering Committee', ar: 'لجنة توجيهية' })}</SelectItem>
                              <SelectItem value="executive">{t({ en: 'Executive Committee', ar: 'لجنة تنفيذية' })}</SelectItem>
                              <SelectItem value="technical">{t({ en: 'Technical Committee', ar: 'لجنة فنية' })}</SelectItem>
                              <SelectItem value="advisory">{t({ en: 'Advisory Committee', ar: 'لجنة استشارية' })}</SelectItem>
                              <SelectItem value="innovation">{t({ en: 'Innovation Committee', ar: 'لجنة الابتكار' })}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">{t({ en: 'Chair Role (EN)', ar: 'رئيس اللجنة (إنجليزي)' })}</Label>
                          <Input
                            placeholder="e.g., Deputy Minister"
                            value={committee.chair_role_en || ''}
                            onChange={(e) => updateCommittee(idx, 'chair_role_en', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{t({ en: 'Meeting Frequency', ar: 'تكرار الاجتماعات' })}</Label>
                          <Select value={committee.meeting_frequency} onValueChange={(v) => updateCommittee(idx, 'meeting_frequency', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {frequencyOptions.map((f) => (
                                <SelectItem key={f.value} value={f.value}>{f.label[language]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-sm">{t({ en: 'Members (one per line)', ar: 'الأعضاء (كل عضو في سطر)' })}</Label>
                        <Textarea
                          value={members.join('\n')}
                          onChange={(e) => updateCommittee(idx, 'members', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">{t({ en: 'Responsibilities (EN)', ar: 'المسؤوليات (إنجليزي)' })}</Label>
                          <Textarea
                            placeholder="Key responsibilities..."
                            value={committee.responsibilities_en || committee.responsibilities || ''}
                            onChange={(e) => updateCommittee(idx, 'responsibilities_en', e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{t({ en: 'Responsibilities (AR)', ar: 'المسؤوليات (عربي)' })}</Label>
                          <Textarea
                            dir="rtl"
                            placeholder="المسؤوليات الرئيسية..."
                            value={committee.responsibilities_ar || ''}
                            onChange={(e) => updateCommittee(idx, 'responsibilities_ar', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-primary" />
                {t({ en: 'Governance Roles', ar: 'أدوار الحوكمة' })}
                <Badge variant="secondary">{roles.length}</Badge>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={addRole}>
                <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Role', ar: 'إضافة دور' })}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {roles.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                  {t({ en: 'No roles defined. Click "Add Role" to define key governance roles.', ar: 'لم يتم تحديد أدوار. انقر على "إضافة دور" لتحديد الأدوار الرئيسية.' })}
                </div>
              ) : (
                roles.map((role, idx) => (
                  <div key={role.id || idx} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">
                        {ROLE_TYPES.find(r => r.value === role.type)?.label[language] || role.type}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => removeRole(idx)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t({ en: 'Role Title (EN)', ar: 'عنوان الدور (إنجليزي)' })}</Label>
                        <Input
                          placeholder="e.g., Chief Innovation Officer"
                          value={role.title_en || ''}
                          onChange={(e) => updateRole(idx, 'title_en', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t({ en: 'Role Title (AR)', ar: 'عنوان الدور (عربي)' })}</Label>
                        <Input
                          dir="rtl"
                          placeholder="مثال: رئيس قسم الابتكار"
                          value={role.title_ar || ''}
                          onChange={(e) => updateRole(idx, 'title_ar', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">{t({ en: 'Type', ar: 'النوع' })}</Label>
                        <Select value={role.type || 'management'} onValueChange={(v) => updateRole(idx, 'type', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ROLE_TYPES.map((r) => (
                              <SelectItem key={r.value} value={r.value}>{r.label[language]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">{t({ en: 'Department (EN)', ar: 'القسم (إنجليزي)' })}</Label>
                        <Input
                          placeholder="Department/Unit"
                          value={role.department_en || ''}
                          onChange={(e) => updateRole(idx, 'department_en', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t({ en: 'Department (AR)', ar: 'القسم (عربي)' })}</Label>
                        <Input
                          dir="rtl"
                          placeholder="القسم/الوحدة"
                          value={role.department_ar || ''}
                          onChange={(e) => updateRole(idx, 'department_ar', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t({ en: 'Reports To (EN)', ar: 'يقدم تقاريره إلى (إنجليزي)' })}</Label>
                        <Input
                          placeholder="e.g., Deputy Minister"
                          value={role.reports_to_en || ''}
                          onChange={(e) => updateRole(idx, 'reports_to_en', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t({ en: 'Reports To (AR)', ar: 'يقدم تقاريره إلى (عربي)' })}</Label>
                        <Input
                          dir="rtl"
                          placeholder="مثال: نائب الوزير"
                          value={role.reports_to_ar || ''}
                          onChange={(e) => updateRole(idx, 'reports_to_ar', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t({ en: 'Key Responsibilities (EN)', ar: 'المسؤوليات الرئيسية (إنجليزي)' })}</Label>
                        <Textarea
                          placeholder="Key responsibilities (one per line)..."
                          value={role.key_responsibilities_en || ''}
                          onChange={(e) => updateRole(idx, 'key_responsibilities_en', e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t({ en: 'Key Responsibilities (AR)', ar: 'المسؤوليات الرئيسية (عربي)' })}</Label>
                        <Textarea
                          dir="rtl"
                          placeholder="المسؤوليات الرئيسية (كل مسؤولية في سطر)..."
                          value={role.key_responsibilities_ar || ''}
                          onChange={(e) => updateRole(idx, 'key_responsibilities_ar', e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboards Tab */}
        <TabsContent value="dashboards" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                {t({ en: 'Monitoring Dashboards', ar: 'لوحات المراقبة' })}
                <Badge variant="secondary">{dashboards.length}</Badge>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={addDashboard}>
                <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Dashboard', ar: 'إضافة لوحة' })}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboards.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                  {t({ en: 'No dashboards defined. Click "Add Dashboard" to configure monitoring dashboards.', ar: 'لم يتم تحديد لوحات تحكم. انقر على "إضافة لوحة" لإعداد لوحات المراقبة.' })}
                </div>
              ) : (
                dashboards.map((dashboard, idx) => (
                  <div key={dashboard.id || idx} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">
                        {DASHBOARD_TYPES.find(d => d.value === dashboard.type)?.label[language] || dashboard.type}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => removeDashboard(idx)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t({ en: 'Dashboard Name (EN)', ar: 'اسم اللوحة (إنجليزي)' })}</Label>
                        <Input
                          placeholder="e.g., Innovation Performance Dashboard"
                          value={dashboard.name_en || ''}
                          onChange={(e) => updateDashboard(idx, 'name_en', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t({ en: 'Dashboard Name (AR)', ar: 'اسم اللوحة (عربي)' })}</Label>
                        <Input
                          dir="rtl"
                          placeholder="مثال: لوحة أداء الابتكار"
                          value={dashboard.name_ar || ''}
                          onChange={(e) => updateDashboard(idx, 'name_ar', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t({ en: 'Type', ar: 'النوع' })}</Label>
                        <Select value={dashboard.type || 'executive'} onValueChange={(v) => updateDashboard(idx, 'type', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {DASHBOARD_TYPES.map((d) => (
                              <SelectItem key={d.value} value={d.value}>{d.label[language]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">{t({ en: 'Update Frequency', ar: 'تكرار التحديث' })}</Label>
                        <Select value={dashboard.update_frequency || 'weekly'} onValueChange={(v) => updateDashboard(idx, 'update_frequency', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realtime">{t({ en: 'Real-time', ar: 'فوري' })}</SelectItem>
                            <SelectItem value="daily">{t({ en: 'Daily', ar: 'يومي' })}</SelectItem>
                            <SelectItem value="weekly">{t({ en: 'Weekly', ar: 'أسبوعي' })}</SelectItem>
                            <SelectItem value="monthly">{t({ en: 'Monthly', ar: 'شهري' })}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t({ en: 'Description (EN)', ar: 'الوصف (إنجليزي)' })}</Label>
                        <Textarea
                          placeholder="Dashboard purpose and scope..."
                          value={dashboard.description_en || ''}
                          onChange={(e) => updateDashboard(idx, 'description_en', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t({ en: 'Description (AR)', ar: 'الوصف (عربي)' })}</Label>
                        <Textarea
                          dir="rtl"
                          placeholder="الغرض من اللوحة ونطاقها..."
                          value={dashboard.description_ar || ''}
                          onChange={(e) => updateDashboard(idx, 'description_ar', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t({ en: 'Key Metrics (EN)', ar: 'المقاييس الرئيسية (إنجليزي)' })}</Label>
                        <Textarea
                          placeholder="Key metrics to display (one per line)..."
                          value={dashboard.key_metrics_en || ''}
                          onChange={(e) => updateDashboard(idx, 'key_metrics_en', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t({ en: 'Key Metrics (AR)', ar: 'المقاييس الرئيسية (عربي)' })}</Label>
                        <Textarea
                          dir="rtl"
                          placeholder="المقاييس الرئيسية للعرض..."
                          value={dashboard.key_metrics_ar || ''}
                          onChange={(e) => updateDashboard(idx, 'key_metrics_ar', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t({ en: 'Target Audience (EN)', ar: 'الجمهور المستهدف (إنجليزي)' })}</Label>
                        <Input
                          placeholder="e.g., Executive Leadership, IT Team"
                          value={dashboard.audience_en || ''}
                          onChange={(e) => updateDashboard(idx, 'audience_en', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t({ en: 'Target Audience (AR)', ar: 'الجمهور المستهدف (عربي)' })}</Label>
                        <Input
                          dir="rtl"
                          placeholder="مثال: القيادة التنفيذية، فريق تقنية المعلومات"
                          value={dashboard.audience_ar || ''}
                          onChange={(e) => updateDashboard(idx, 'audience_ar', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RACI Matrix Tab */}
        <TabsContent value="raci" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Grid3X3 className="w-5 h-5 text-primary" />
                {t({ en: 'RACI Decision Matrix', ar: 'مصفوفة قرارات RACI' })}
                <Badge variant="secondary">{raciMatrix.length}</Badge>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={addRaciEntry}>
                <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Decision Area', ar: 'إضافة مجال قرار' })}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {RACI_VALUES.map((v) => (
                  <Badge key={v.value} variant="outline" className="gap-1">
                    <span className={`w-3 h-3 rounded-full ${v.color}`}></span>
                    {v.label[language]}
                  </Badge>
                ))}
              </div>

              {raciMatrix.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                  {t({ en: 'No RACI entries defined. Click "Add Decision Area" to define decision rights.', ar: 'لم يتم تحديد إدخالات RACI. انقر على "إضافة مجال قرار" لتحديد حقوق القرار.' })}
                </div>
              ) : (
                raciMatrix.map((entry, idx) => (
                  <div key={entry.id || idx} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">
                        {RACI_AREAS.find(a => a.value === entry.area)?.label[language] || entry.area}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => removeRaciEntry(idx)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div>
                      <Label className="text-xs">{t({ en: 'Decision Area', ar: 'مجال القرار' })}</Label>
                      <Select value={entry.area || 'strategic_decisions'} onValueChange={(v) => updateRaciEntry(idx, 'area', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {RACI_AREAS.map((a) => (
                            <SelectItem key={a.value} value={a.value}>{a.label[language]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                          {t({ en: 'Responsible (EN) - Does the work', ar: 'مسؤول (إنجليزي) - ينفذ العمل' })}
                        </Label>
                        <Input
                          placeholder="Role/Person responsible"
                          value={entry.responsible_en || ''}
                          onChange={(e) => updateRaciEntry(idx, 'responsible_en', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                          {t({ en: 'Responsible (AR)', ar: 'مسؤول (عربي)' })}
                        </Label>
                        <Input
                          dir="rtl"
                          placeholder="الدور/الشخص المسؤول"
                          value={entry.responsible_ar || ''}
                          onChange={(e) => updateRaciEntry(idx, 'responsible_ar', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-green-500"></span>
                          {t({ en: 'Accountable (EN) - Final approver', ar: 'محاسب (إنجليزي) - الموافق النهائي' })}
                        </Label>
                        <Input
                          placeholder="Role/Person accountable"
                          value={entry.accountable_en || ''}
                          onChange={(e) => updateRaciEntry(idx, 'accountable_en', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-green-500"></span>
                          {t({ en: 'Accountable (AR)', ar: 'محاسب (عربي)' })}
                        </Label>
                        <Input
                          dir="rtl"
                          placeholder="الدور/الشخص المحاسب"
                          value={entry.accountable_ar || ''}
                          onChange={(e) => updateRaciEntry(idx, 'accountable_ar', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                          {t({ en: 'Consulted (EN) - Input required', ar: 'مستشار (إنجليزي) - مدخلات مطلوبة' })}
                        </Label>
                        <Input
                          placeholder="Roles/Persons consulted"
                          value={entry.consulted_en || ''}
                          onChange={(e) => updateRaciEntry(idx, 'consulted_en', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                          {t({ en: 'Consulted (AR)', ar: 'مستشار (عربي)' })}
                        </Label>
                        <Input
                          dir="rtl"
                          placeholder="الأدوار/الأشخاص المستشارون"
                          value={entry.consulted_ar || ''}
                          onChange={(e) => updateRaciEntry(idx, 'consulted_ar', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                          {t({ en: 'Informed (EN) - Kept updated', ar: 'مطلع (إنجليزي) - يتم إبلاغه' })}
                        </Label>
                        <Input
                          placeholder="Roles/Persons informed"
                          value={entry.informed_en || ''}
                          onChange={(e) => updateRaciEntry(idx, 'informed_en', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                          {t({ en: 'Informed (AR)', ar: 'مطلع (عربي)' })}
                        </Label>
                        <Input
                          dir="rtl"
                          placeholder="الأدوار/الأشخاص المطلعون"
                          value={entry.informed_ar || ''}
                          onChange={(e) => updateRaciEntry(idx, 'informed_ar', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
