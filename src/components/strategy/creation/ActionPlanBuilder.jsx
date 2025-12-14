import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from '@/components/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useActionPlans } from '@/hooks/strategy';
import { supabase } from '@/integrations/supabase/client';
import {
  ClipboardList,
  Plus,
  Trash2,
  Save,
  Target,
  Calendar,
  DollarSign,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Sparkles,
  ChevronRight,
  ListTodo,
  BarChart3
} from 'lucide-react';

const SAMPLE_OBJECTIVES = [
  { id: '1', title_en: 'Increase Digital Service Adoption', title_ar: 'زيادة تبني الخدمات الرقمية' },
  { id: '2', title_en: 'Reduce Response Time for Citizen Requests', title_ar: 'تقليل وقت الاستجابة لطلبات المواطنين' },
  { id: '3', title_en: 'Expand Innovation Partnerships', title_ar: 'توسيع شراكات الابتكار' }
];

const STATUS_OPTIONS = [
  { value: 'pending', label: { en: 'Pending', ar: 'معلق' }, color: 'bg-slate-500' },
  { value: 'in_progress', label: { en: 'In Progress', ar: 'قيد التنفيذ' }, color: 'bg-blue-500' },
  { value: 'completed', label: { en: 'Completed', ar: 'مكتمل' }, color: 'bg-green-500' },
  { value: 'blocked', label: { en: 'Blocked', ar: 'محظور' }, color: 'bg-red-500' }
];

const ActionPlanBuilder = ({ strategicPlan, objectives = SAMPLE_OBJECTIVES, onSave }) => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const strategicPlanId = strategicPlan?.id;
  
  const { 
    actionPlans: dbPlans, 
    isLoading, 
    saveActionPlan, 
    saveBulkActionPlans,
    deleteActionPlan 
  } = useActionPlans(strategicPlanId);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');
  
  // Initialize local state from DB or create from objectives
  const [actionPlans, setActionPlans] = useState([]);
  
  useEffect(() => {
    if (dbPlans && dbPlans.length > 0) {
      setActionPlans(dbPlans);
    } else if (objectives.length > 0 && actionPlans.length === 0) {
      setActionPlans(objectives.map(obj => ({
        id: `ap-${obj.id}`,
        objective_id: obj.id,
        objective_title: obj.title_en,
        title_en: `Action Plan for ${obj.title_en}`,
        title_ar: `خطة عمل لـ ${obj.title_ar}`,
        total_budget: 0,
        currency: 'SAR',
        start_date: '',
        end_date: '',
        status: 'draft',
        actions: []
      })));
    }
  }, [dbPlans, objectives]);

  const [selectedPlan, setSelectedPlan] = useState('');
  
  useEffect(() => {
    if (actionPlans.length > 0 && !selectedPlan) {
      setSelectedPlan(actionPlans[0]?.id || '');
    }
  }, [actionPlans, selectedPlan]);

  const addAction = (planId) => {
    setActionPlans(prev => prev.map(plan => {
      if (plan.id !== planId) return plan;
      return {
        ...plan,
        actions: [
          ...plan.actions,
          {
            id: `action-${Date.now()}`,
            title_en: '',
            title_ar: '',
            description: '',
            owner: '',
            start_date: '',
            end_date: '',
            budget: 0,
            status: 'pending',
            progress: 0,
            deliverables: []
          }
        ]
      };
    }));
  };

  const updateAction = (planId, actionId, field, value) => {
    setActionPlans(prev => prev.map(plan => {
      if (plan.id !== planId) return plan;
      return {
        ...plan,
        actions: plan.actions.map(action => 
          action.id === actionId ? { ...action, [field]: value } : action
        )
      };
    }));
  };

  const removeAction = (planId, actionId) => {
    setActionPlans(prev => prev.map(plan => {
      if (plan.id !== planId) return plan;
      return {
        ...plan,
        actions: plan.actions.filter(action => action.id !== actionId)
      };
    }));
  };

  const updatePlan = (planId, field, value) => {
    setActionPlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, [field]: value } : plan
    ));
  };

  const generateActionsWithAI = async (planId) => {
    setIsGenerating(true);
    try {
      const plan = actionPlans.find(p => p.id === planId);
      
      const { data, error } = await supabase.functions.invoke('strategy-action-plan-generator', {
        body: {
          action_plan_id: planId,
          objective_title: plan.objective_title,
          objective_description: plan.description,
          strategic_plan_id: strategicPlanId,
          plan_context: strategicPlan?.vision_en
        }
      });

      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }

      const { action_plan } = data;

      setActionPlans(prev => prev.map(p => {
        if (p.id !== planId) return p;
        return {
          ...p,
          actions: [...p.actions, ...action_plan.actions],
          total_budget: p.total_budget + action_plan.total_budget
        };
      }));

      toast({
        title: t({ en: 'Actions Generated', ar: 'تم إنشاء الإجراءات' }),
        description: t({ en: '4 action items generated by AI', ar: 'تم إنشاء 4 عناصر إجراءات بواسطة الذكاء الاصطناعي' })
      });
    } catch (error) {
      toast({
        title: t({ en: 'Generation Failed', ar: 'فشل الإنشاء' }),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      const success = await saveBulkActionPlans(actionPlans);
      if (success && onSave) onSave(actionPlans);
    } catch (error) {
      toast({
        title: t({ en: 'Error', ar: 'خطأ' }),
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const calculateProgress = (plan) => {
    if (plan.actions.length === 0) return 0;
    const totalProgress = plan.actions.reduce((sum, a) => sum + a.progress, 0);
    return Math.round(totalProgress / plan.actions.length);
  };

  const calculateTotalBudget = (plan) => {
    return plan.actions.reduce((sum, a) => sum + (a.budget || 0), 0);
  };

  const currentPlan = actionPlans.find(p => p.id === selectedPlan);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <ClipboardList className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-emerald-900">
                  {t({ en: 'Action Plan Builder', ar: 'منشئ خطة العمل' })}
                </CardTitle>
                <CardDescription>
                  {t({ en: 'Create detailed action plans for strategic objectives', ar: 'إنشاء خطط عمل مفصلة للأهداف الاستراتيجية' })}
                </CardDescription>
              </div>
            </div>
            <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {t({ en: 'Save All Plans', ar: 'حفظ جميع الخطط' })}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Plan Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actionPlans.map(plan => (
          <Card 
            key={plan.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedPlan === plan.id ? 'border-2 border-emerald-500 bg-emerald-50' : 'border border-slate-200'
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="bg-white">
                  {plan.actions.length} {t({ en: 'actions', ar: 'إجراءات' })}
                </Badge>
                <Badge className={calculateProgress(plan) === 100 ? 'bg-green-500' : 'bg-blue-500'}>
                  {calculateProgress(plan)}%
                </Badge>
              </div>
              <h4 className="font-medium text-sm mb-2 line-clamp-2">{plan.objective_title}</h4>
              <Progress value={calculateProgress(plan)} className="h-2" />
              <p className="text-xs text-slate-500 mt-2">
                {t({ en: 'Budget:', ar: 'الميزانية:' })} {calculateTotalBudget(plan).toLocaleString()} SAR
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Plan Editor */}
      {currentPlan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600" />
                  {currentPlan.objective_title}
                </CardTitle>
                <CardDescription>
                  {t({ en: 'Total Budget:', ar: 'إجمالي الميزانية:' })} {calculateTotalBudget(currentPlan).toLocaleString()} SAR
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => generateActionsWithAI(currentPlan.id)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                  )}
                  {t({ en: 'Generate with AI', ar: 'إنشاء بالذكاء الاصطناعي' })}
                </Button>
                <Button onClick={() => addAction(currentPlan.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t({ en: 'Add Action', ar: 'إضافة إجراء' })}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentPlan.actions.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed">
                <ListTodo className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="font-medium text-slate-700 mb-2">
                  {t({ en: 'No Actions Yet', ar: 'لا توجد إجراءات بعد' })}
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  {t({ en: 'Add action items or generate them with AI', ar: 'أضف عناصر الإجراءات أو أنشئها بالذكاء الاصطناعي' })}
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" onClick={() => addAction(currentPlan.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t({ en: 'Add Manually', ar: 'إضافة يدوياً' })}
                  </Button>
                  <Button onClick={() => generateActionsWithAI(currentPlan.id)} disabled={isGenerating}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t({ en: 'Generate with AI', ar: 'إنشاء بالذكاء الاصطناعي' })}
                  </Button>
                </div>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {currentPlan.actions.map((action, index) => (
                  <AccordionItem key={action.id} value={action.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-4 flex-1">
                        <Badge variant="outline" className="bg-slate-50">#{index + 1}</Badge>
                        <span className="font-medium text-left flex-1">
                          {action.title_en || t({ en: 'New Action', ar: 'إجراء جديد' })}
                        </span>
                        <Badge className={STATUS_OPTIONS.find(s => s.value === action.status)?.color || 'bg-slate-500'}>
                          {t(STATUS_OPTIONS.find(s => s.value === action.status)?.label || { en: 'Pending', ar: 'معلق' })}
                        </Badge>
                        <span className="text-sm text-slate-500">{action.progress}%</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })}</Label>
                          <Input
                            value={action.title_en}
                            onChange={(e) => updateAction(currentPlan.id, action.id, 'title_en', e.target.value)}
                            placeholder={t({ en: 'Enter action title', ar: 'أدخل عنوان الإجراء' })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</Label>
                          <Input
                            value={action.title_ar}
                            onChange={(e) => updateAction(currentPlan.id, action.id, 'title_ar', e.target.value)}
                            placeholder={t({ en: 'Enter Arabic title', ar: 'أدخل العنوان بالعربية' })}
                            dir="rtl"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{t({ en: 'Description', ar: 'الوصف' })}</Label>
                        <Textarea
                          value={action.description}
                          onChange={(e) => updateAction(currentPlan.id, action.id, 'description', e.target.value)}
                          placeholder={t({ en: 'Describe the action item...', ar: 'وصف عنصر الإجراء...' })}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {t({ en: 'Owner', ar: 'المالك' })}
                          </Label>
                          <Input
                            value={action.owner}
                            onChange={(e) => updateAction(currentPlan.id, action.id, 'owner', e.target.value)}
                            placeholder={t({ en: 'Email', ar: 'البريد' })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {t({ en: 'Budget (SAR)', ar: 'الميزانية' })}
                          </Label>
                          <Input
                            type="number"
                            value={action.budget}
                            onChange={(e) => updateAction(currentPlan.id, action.id, 'budget', Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {t({ en: 'Start Date', ar: 'تاريخ البدء' })}
                          </Label>
                          <Input
                            type="date"
                            value={action.start_date}
                            onChange={(e) => updateAction(currentPlan.id, action.id, 'start_date', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {t({ en: 'End Date', ar: 'تاريخ الانتهاء' })}
                          </Label>
                          <Input
                            type="date"
                            value={action.end_date}
                            onChange={(e) => updateAction(currentPlan.id, action.id, 'end_date', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t({ en: 'Status', ar: 'الحالة' })}</Label>
                          <Select
                            value={action.status}
                            onValueChange={(val) => updateAction(currentPlan.id, action.id, 'status', val)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                  {t(status.label)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t({ en: 'Progress', ar: 'التقدم' })} ({action.progress}%)</Label>
                          <Input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={action.progress}
                            onChange={(e) => updateAction(currentPlan.id, action.id, 'progress', Number(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAction(currentPlan.id, action.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t({ en: 'Remove Action', ar: 'إزالة الإجراء' })}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ListTodo className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {actionPlans.reduce((sum, p) => sum + p.actions.length, 0)}
                </p>
                <p className="text-xs text-slate-500">{t({ en: 'Total Actions', ar: 'إجمالي الإجراءات' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {actionPlans.reduce((sum, p) => sum + p.actions.filter(a => a.status === 'completed').length, 0)}
                </p>
                <p className="text-xs text-slate-500">{t({ en: 'Completed', ar: 'مكتملة' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">
                  {actionPlans.reduce((sum, p) => sum + p.actions.filter(a => a.status === 'in_progress').length, 0)}
                </p>
                <p className="text-xs text-slate-500">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700">
                  {(actionPlans.reduce((sum, p) => sum + calculateTotalBudget(p), 0) / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-slate-500">{t({ en: 'Total Budget (SAR)', ar: 'إجمالي الميزانية' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActionPlanBuilder;
