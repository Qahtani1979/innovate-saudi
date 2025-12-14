import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/components/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useStrategyOwnership } from '@/hooks/strategy';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  UserCheck,
  UserCog,
  Mail,
  Bell,
  Shield,
  Eye,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  Building2,
  Target,
  ArrowRight,
  Loader2
} from 'lucide-react';

const RACI_ROLES = [
  { key: 'responsible', label: { en: 'Responsible', ar: 'المسؤول' }, color: 'bg-blue-500', description: { en: 'Does the work', ar: 'ينفذ العمل' } },
  { key: 'accountable', label: { en: 'Accountable', ar: 'المحاسب' }, color: 'bg-purple-500', description: { en: 'Ultimately answerable', ar: 'المسؤول النهائي' } },
  { key: 'consulted', label: { en: 'Consulted', ar: 'مستشار' }, color: 'bg-amber-500', description: { en: 'Provides input', ar: 'يقدم المشورة' } },
  { key: 'informed', label: { en: 'Informed', ar: 'مطلع' }, color: 'bg-green-500', description: { en: 'Kept updated', ar: 'يبقى على اطلاع' } }
];

const SAMPLE_OBJECTIVES = [
  { id: '1', title_en: 'Increase Digital Service Adoption', title_ar: 'زيادة تبني الخدمات الرقمية' },
  { id: '2', title_en: 'Reduce Response Time for Citizen Requests', title_ar: 'تقليل وقت الاستجابة لطلبات المواطنين' },
  { id: '3', title_en: 'Expand Innovation Partnerships', title_ar: 'توسيع شراكات الابتكار' },
  { id: '4', title_en: 'Improve Municipal MII Scores', title_ar: 'تحسين درجات مؤشر الابتكار البلدي' }
];

const StrategyOwnershipAssigner = ({ strategicPlan, objectives = SAMPLE_OBJECTIVES, onSave }) => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const strategicPlanId = strategicPlan?.id;
  
  const {
    assignments: dbAssignments,
    isLoading,
    saveAssignment,
    saveBulkAssignments,
    deleteAssignment
  } = useStrategyOwnership(strategicPlanId);

  // Fetch real users from the platform for assignment selection
  const { data: platformUsers = [] } = useQuery({
    queryKey: ['platform-users-for-ownership'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_email, full_name, persona_type, municipality_id')
        .order('full_name');
      if (error) return [];
      return data?.map(u => ({
        email: u.user_email,
        name: u.full_name || u.user_email,
        role: u.persona_type || 'User'
      })) || [];
    }
  });

  // Fetch team members for quick assignment
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members-for-ownership'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, user_email, role, team_id')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) return [];
      return data || [];
    }
  });

  // Use platform users if available, fallback to sample
  const availableUsers = platformUsers.length > 0 ? platformUsers : [
    { email: 'director@innovation.gov.sa', name: 'Ahmed Al-Rashid', role: 'Innovation Director' },
    { email: 'manager@digital.gov.sa', name: 'Fatima Al-Qahtani', role: 'Digital Transformation Manager' },
    { email: 'analyst@strategy.gov.sa', name: 'Mohammed Al-Harbi', role: 'Strategy Analyst' },
    { email: 'coordinator@muni.gov.sa', name: 'Sara Al-Dosari', role: 'Municipality Coordinator' }
  ];
  
  const [activeTab, setActiveTab] = useState('assignments');
  
  const [assignments, setAssignments] = useState([]);
  
  useEffect(() => {
    if (dbAssignments && dbAssignments.length > 0) {
      setAssignments(dbAssignments);
    } else if (objectives.length > 0 && assignments.length === 0) {
      setAssignments(objectives.map(obj => ({
        objective_id: obj.id,
        objective_title: obj.title_en,
        responsible: '',
        accountable: '',
        consulted: [],
        informed: [],
        delegation_allowed: false,
        escalation_path: '',
        notifications_enabled: true
      })));
    }
  }, [dbAssignments, objectives]);

  const [newConsulted, setNewConsulted] = useState({});
  const [newInformed, setNewInformed] = useState({});

  const updateAssignment = (objectiveId, field, value) => {
    setAssignments(prev => prev.map(a => 
      a.objective_id === objectiveId ? { ...a, [field]: value } : a
    ));
  };

  const addToList = (objectiveId, field, value) => {
    if (!value) return;
    setAssignments(prev => prev.map(a => 
      a.objective_id === objectiveId 
        ? { ...a, [field]: [...a[field], value] }
        : a
    ));
    if (field === 'consulted') {
      setNewConsulted(prev => ({ ...prev, [objectiveId]: '' }));
    } else {
      setNewInformed(prev => ({ ...prev, [objectiveId]: '' }));
    }
  };

  const removeFromList = (objectiveId, field, index) => {
    setAssignments(prev => prev.map(a => 
      a.objective_id === objectiveId 
        ? { ...a, [field]: a[field].filter((_, i) => i !== index) }
        : a
    ));
  };

  const handleSave = async () => {
    try {
      // Validate all objectives have at least responsible and accountable
      const incomplete = assignments.filter(a => !a.responsible || !a.accountable);
      if (incomplete.length > 0) {
        toast({
          title: t({ en: 'Incomplete Assignments', ar: 'تعيينات غير مكتملة' }),
          description: t({ en: `${incomplete.length} objectives need Responsible and Accountable roles`, ar: `${incomplete.length} أهداف تحتاج أدوار المسؤول والمحاسب` }),
          variant: 'destructive'
        });
        return;
      }

      const success = await saveBulkAssignments(assignments);
      if (success && onSave) {
        onSave(assignments);
      }
    } catch (error) {
      toast({
        title: t({ en: 'Error', ar: 'خطأ' }),
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getCompletionStatus = () => {
    const complete = assignments.filter(a => a.responsible && a.accountable).length;
    return { complete, total: assignments.length, percentage: Math.round((complete / assignments.length) * 100) };
  };

  const status = getCompletionStatus();

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-indigo-900">
                  {t({ en: 'Strategy Ownership Assigner', ar: 'مُعيِّن ملكية الاستراتيجية' })}
                </CardTitle>
                <CardDescription>
                  {t({ en: 'Define RACI matrix for strategic objectives', ar: 'تحديد مصفوفة RACI للأهداف الاستراتيجية' })}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-500">{t({ en: 'Completion', ar: 'الاكتمال' })}</p>
                <p className="text-2xl font-bold text-indigo-600">{status.percentage}%</p>
              </div>
              <Button onClick={handleSave} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {t({ en: 'Save Assignments', ar: 'حفظ التعيينات' })}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* RACI Legend */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {RACI_ROLES.map(role => (
              <div key={role.key} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${role.color}`} />
                <span className="font-medium text-sm">{t(role.label)}</span>
                <span className="text-xs text-slate-500">- {t(role.description)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            {t({ en: 'Assignments', ar: 'التعيينات' })}
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            {t({ en: 'RACI Matrix', ar: 'مصفوفة RACI' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4 mt-4">
          {assignments.map((assignment, index) => (
            <Card key={assignment.objective_id} className="border border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-indigo-50">
                      {t({ en: 'Objective', ar: 'هدف' })} {index + 1}
                    </Badge>
                    <span className="font-medium">{assignment.objective_title}</span>
                  </div>
                  {assignment.responsible && assignment.accountable ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {t({ en: 'Complete', ar: 'مكتمل' })}
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {t({ en: 'Incomplete', ar: 'غير مكتمل' })}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Responsible */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      {t({ en: 'Responsible', ar: 'المسؤول' })} *
                    </Label>
                    <Select
                      value={assignment.responsible}
                      onValueChange={(val) => updateAssignment(assignment.objective_id, 'responsible', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t({ en: 'Select responsible person', ar: 'اختر الشخص المسؤول' })} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map(user => (
                          <SelectItem key={user.email} value={user.email}>
                            {user.name} - {user.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Accountable */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      {t({ en: 'Accountable', ar: 'المحاسب' })} *
                    </Label>
                    <Select
                      value={assignment.accountable}
                      onValueChange={(val) => updateAssignment(assignment.objective_id, 'accountable', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t({ en: 'Select accountable person', ar: 'اختر الشخص المحاسب' })} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map(user => (
                          <SelectItem key={user.email} value={user.email}>
                            {user.name} - {user.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Consulted */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    {t({ en: 'Consulted', ar: 'مستشارون' })}
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {assignment.consulted.map((email, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-1">
                        {availableUsers.find(u => u.email === email)?.name || email}
                        <button onClick={() => removeFromList(assignment.objective_id, 'consulted', i)}>
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={newConsulted[assignment.objective_id] || ''}
                      onValueChange={(val) => setNewConsulted(prev => ({ ...prev, [assignment.objective_id]: val }))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={t({ en: 'Add consulted', ar: 'إضافة مستشار' })} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.filter(u => !assignment.consulted.includes(u.email)).map(user => (
                          <SelectItem key={user.email} value={user.email}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addToList(assignment.objective_id, 'consulted', newConsulted[assignment.objective_id])}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Informed */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    {t({ en: 'Informed', ar: 'مطلعون' })}
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {assignment.informed.map((email, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-1">
                        {availableUsers.find(u => u.email === email)?.name || email}
                        <button onClick={() => removeFromList(assignment.objective_id, 'informed', i)}>
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={newInformed[assignment.objective_id] || ''}
                      onValueChange={(val) => setNewInformed(prev => ({ ...prev, [assignment.objective_id]: val }))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={t({ en: 'Add informed', ar: 'إضافة مطلع' })} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.filter(u => !assignment.informed.includes(u.email)).map(user => (
                          <SelectItem key={user.email} value={user.email}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addToList(assignment.objective_id, 'informed', newInformed[assignment.objective_id])}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Settings */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={assignment.delegation_allowed}
                        onCheckedChange={(val) => updateAssignment(assignment.objective_id, 'delegation_allowed', val)}
                      />
                      <Label className="text-sm">{t({ en: 'Allow Delegation', ar: 'السماح بالتفويض' })}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={assignment.notifications_enabled}
                        onCheckedChange={(val) => updateAssignment(assignment.objective_id, 'notifications_enabled', val)}
                      />
                      <Label className="text-sm">{t({ en: 'Enable Notifications', ar: 'تفعيل الإشعارات' })}</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="matrix" className="mt-4">
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">{t({ en: 'Objective', ar: 'الهدف' })}</th>
                    {SAMPLE_USERS.map(user => (
                      <th key={user.email} className="p-2 text-center">
                        <div className="font-semibold">{user.name.split(' ')[0]}</div>
                        <div className="text-xs text-slate-500">{user.role}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment, index) => (
                    <tr key={assignment.objective_id} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-medium">{assignment.objective_title}</td>
                      {SAMPLE_USERS.map(user => {
                        let role = '';
                        let color = '';
                        if (assignment.responsible === user.email) { role = 'R'; color = 'bg-blue-500'; }
                        else if (assignment.accountable === user.email) { role = 'A'; color = 'bg-purple-500'; }
                        else if (assignment.consulted.includes(user.email)) { role = 'C'; color = 'bg-amber-500'; }
                        else if (assignment.informed.includes(user.email)) { role = 'I'; color = 'bg-green-500'; }
                        
                        return (
                          <td key={user.email} className="p-2 text-center">
                            {role && (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${color}`}>
                                {role}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrategyOwnershipAssigner;
