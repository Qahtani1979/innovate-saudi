import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/components/LanguageContext';
import { useStrategySignoffs } from '@/hooks/strategy/useStrategySignoffs';
import { useSignoffAI } from '@/hooks/strategy/useSignoffAI';
import { 
  UserCheck, Clock, CheckCircle2, XCircle, AlertCircle, 
  Send, Bell, FileSignature, Plus, Trash2, Loader2, Sparkles, TrendingUp, AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function StakeholderSignoffTracker({ planId }) {
  const { t, language } = useLanguage();
  const { signoffs, isLoading, createSignoff, updateSignoff, deleteSignoff, sendReminder } = useStrategySignoffs(planId);
  const { suggestStakeholders, predictApprovalRisk, optimizeReminders, analyzeSentiment } = useSignoffAI();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [selectedSignoffForRisk, setSelectedSignoffForRisk] = useState(null);
  
  const [newSignoff, setNewSignoff] = useState({
    stakeholder_name: '',
    stakeholder_role: '',
    stakeholder_email: '',
    due_date: ''
  });

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        icon: Clock, 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        label: { en: 'Pending', ar: 'قيد الانتظار' }
      },
      approved: { 
        icon: CheckCircle2, 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        label: { en: 'Approved', ar: 'تمت الموافقة' }
      },
      rejected: { 
        icon: XCircle, 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        label: { en: 'Rejected', ar: 'مرفوض' }
      },
      changes_requested: { 
        icon: AlertCircle, 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        label: { en: 'Changes Requested', ar: 'تم طلب تغييرات' }
      }
    };
    return configs[status] || configs.pending;
  };

  const handleAISuggest = async () => {
    const result = await suggestStakeholders.mutateAsync({
      documentType: 'Strategic Plan',
      planData: { planId, signoffsCount: signoffs?.length || 0 }
    });
    setAiSuggestions(result);
    setIsAIDialogOpen(true);
  };

  const handleAddFromSuggestion = async (suggestion) => {
    await createSignoff.mutateAsync({
      strategic_plan_id: planId,
      stakeholder_name: suggestion.name,
      stakeholder_role: suggestion.role,
      stakeholder_email: '',
      due_date: new Date(Date.now() + (suggestion.sla_days || 14) * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      reminder_count: 0
    });
  };

  const handlePredictRisk = async (signoff) => {
    setSelectedSignoffForRisk(signoff);
    const result = await predictApprovalRisk.mutateAsync({
      stakeholderData: signoff,
      planData: { planId },
      context: { pending_count: signoffs?.filter(s => s.status === 'pending').length }
    });
    setRiskAnalysis(result);
  };

  const handleOptimizeReminders = async () => {
    const pendingSignoffs = signoffs?.filter(s => s.status === 'pending') || [];
    if (pendingSignoffs.length === 0) return;
    
    await optimizeReminders.mutateAsync({
      stakeholderData: pendingSignoffs,
      context: { total: signoffs?.length }
    });
  };

  const handleAddSignoff = async () => {
    if (!newSignoff.stakeholder_name || !newSignoff.stakeholder_role) return;
    
    await createSignoff.mutateAsync({
      strategic_plan_id: planId,
      stakeholder_name: newSignoff.stakeholder_name,
      stakeholder_role: newSignoff.stakeholder_role,
      stakeholder_email: newSignoff.stakeholder_email,
      due_date: newSignoff.due_date ? new Date(newSignoff.due_date).toISOString() : null,
      status: 'pending',
      reminder_count: 0
    });
    
    setNewSignoff({ stakeholder_name: '', stakeholder_role: '', stakeholder_email: '', due_date: '' });
    setIsDialogOpen(false);
  };

  const handleSendReminder = async (id) => {
    await sendReminder.mutateAsync(id);
  };

  const handleRemove = async (id) => {
    await deleteSignoff.mutateAsync(id);
  };

  const handleApprove = async (id) => {
    await updateSignoff.mutateAsync({
      id,
      status: 'approved',
      signed_date: new Date().toISOString()
    });
  };

  const stats = {
    total: signoffs?.length || 0,
    approved: signoffs?.filter(s => s.status === 'approved').length || 0,
    pending: signoffs?.filter(s => s.status === 'pending').length || 0,
    changes: signoffs?.filter(s => s.status === 'changes_requested').length || 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Actions Bar */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-medium">{t({ en: 'AI Assistance', ar: 'المساعدة الذكية' })}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAISuggest}
                disabled={suggestStakeholders.isPending}
              >
                {suggestStakeholders.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserCheck className="h-4 w-4 mr-2" />}
                {t({ en: 'Suggest Stakeholders', ar: 'اقتراح أصحاب المصلحة' })}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOptimizeReminders}
                disabled={optimizeReminders.isPending || stats.pending === 0}
              >
                {optimizeReminders.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bell className="h-4 w-4 mr-2" />}
                {t({ en: 'Optimize Reminders', ar: 'تحسين التذكيرات' })}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <UserCheck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Approved', ar: 'موافق عليها' })}</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Pending', ar: 'قيد الانتظار' })}</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Changes Requested', ar: 'تغييرات مطلوبة' })}</p>
                <p className="text-2xl font-bold text-orange-600">{stats.changes}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t({ en: 'AI Suggested Stakeholders', ar: 'أصحاب المصلحة المقترحون' })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4 max-h-96 overflow-y-auto">
            {Array.isArray(aiSuggestions) && aiSuggestions.map((suggestion, idx) => (
              <div key={idx} className="p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{suggestion.name}</p>
                    <p className="text-sm text-muted-foreground">{suggestion.role}</p>
                    <p className="text-xs text-muted-foreground mt-1">{suggestion.rationale}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">SLA: {suggestion.sla_days} days</Badge>
                      <Badge variant={suggestion.authority_level === 'high' ? 'destructive' : 'secondary'}>
                        {suggestion.authority_level}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleAddFromSuggestion(suggestion)}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t({ en: 'Add', ar: 'إضافة' })}
                  </Button>
                </div>
              </div>
            ))}
            {!Array.isArray(aiSuggestions) && aiSuggestions && (
              <p className="text-muted-foreground text-center py-4">
                {t({ en: 'Could not parse suggestions', ar: 'تعذر تحليل الاقتراحات' })}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Risk Analysis Dialog */}
      <Dialog open={!!riskAnalysis} onOpenChange={() => setRiskAnalysis(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t({ en: 'Approval Risk Analysis', ar: 'تحليل مخاطر الموافقة' })}
            </DialogTitle>
          </DialogHeader>
          {riskAnalysis && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span>{t({ en: 'Approval Probability', ar: 'احتمالية الموافقة' })}</span>
                <span className="text-2xl font-bold">{riskAnalysis.approval_probability}%</span>
              </div>
              <div>
                <p className="font-medium mb-2">{t({ en: 'Key Concerns', ar: 'المخاوف الرئيسية' })}</p>
                <div className="space-y-1">
                  {riskAnalysis.key_concerns?.map((concern, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-3 w-3 text-yellow-500" />
                      {concern}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium mb-2">{t({ en: 'Recommendations', ar: 'التوصيات' })}</p>
                <div className="space-y-1">
                  {riskAnalysis.recommendations?.map((rec, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Main Tracker Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-primary" />
            {t({ en: 'Stakeholder Sign-off Tracker', ar: 'متتبع توقيعات أصحاب المصلحة' })}
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add Stakeholder', ar: 'إضافة صاحب مصلحة' })}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t({ en: 'Request Sign-off', ar: 'طلب التوقيع' })}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Stakeholder Name', ar: 'اسم صاحب المصلحة' })}</label>
                  <Input 
                    value={newSignoff.stakeholder_name}
                    onChange={(e) => setNewSignoff({ ...newSignoff, stakeholder_name: e.target.value })}
                    placeholder={t({ en: 'Enter name', ar: 'أدخل الاسم' })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Email', ar: 'البريد الإلكتروني' })}</label>
                  <Input 
                    type="email"
                    value={newSignoff.stakeholder_email}
                    onChange={(e) => setNewSignoff({ ...newSignoff, stakeholder_email: e.target.value })}
                    placeholder={t({ en: 'Enter email', ar: 'أدخل البريد الإلكتروني' })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Role', ar: 'الدور' })}</label>
                  <Select 
                    value={newSignoff.stakeholder_role}
                    onValueChange={(value) => setNewSignoff({ ...newSignoff, stakeholder_role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select role', ar: 'اختر الدور' })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Minister">Minister</SelectItem>
                      <SelectItem value="Deputy Minister">Deputy Minister</SelectItem>
                      <SelectItem value="Director General">Director General</SelectItem>
                      <SelectItem value="Innovation Director">Innovation Director</SelectItem>
                      <SelectItem value="Finance Director">Finance Director</SelectItem>
                      <SelectItem value="Legal Advisor">Legal Advisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Due Date', ar: 'تاريخ الاستحقاق' })}</label>
                  <Input 
                    type="date"
                    value={newSignoff.due_date}
                    onChange={(e) => setNewSignoff({ ...newSignoff, due_date: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddSignoff} className="w-full" disabled={createSignoff.isPending}>
                  {createSignoff.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  {t({ en: 'Send Request', ar: 'إرسال الطلب' })}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {signoffs?.map((signoff) => {
              const config = getStatusConfig(signoff.status);
              const StatusIcon = config.icon;
              
              return (
                <div 
                  key={signoff.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{signoff.stakeholder_name}</p>
                      <p className="text-sm text-muted-foreground">{signoff.stakeholder_role}</p>
                      {signoff.stakeholder_email && (
                        <p className="text-xs text-muted-foreground">{signoff.stakeholder_email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      {signoff.due_date && (
                        <p className="text-sm text-muted-foreground">
                          {t({ en: 'Due:', ar: 'الاستحقاق:' })} {new Date(signoff.due_date).toLocaleDateString()}
                        </p>
                      )}
                      {signoff.signed_date && (
                        <p className="text-xs text-green-600">
                          {t({ en: 'Signed:', ar: 'موقع:' })} {new Date(signoff.signed_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <Badge className={config.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {t(config.label)}
                    </Badge>
                    
                    {signoff.status === 'pending' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handlePredictRisk(signoff)}
                          disabled={predictApprovalRisk.isPending}
                        >
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleApprove(signoff.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          {t({ en: 'Approve', ar: 'موافقة' })}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSendReminder(signoff.id)}
                        >
                          <Bell className="h-4 w-4 mr-1" />
                          {signoff.reminder_count > 0 && <span className="mr-1">({signoff.reminder_count})</span>}
                          {t({ en: 'Remind', ar: 'تذكير' })}
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemove(signoff.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {(!signoffs || signoffs.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                {t({ en: 'No sign-off requests yet', ar: 'لا توجد طلبات توقيع بعد' })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
