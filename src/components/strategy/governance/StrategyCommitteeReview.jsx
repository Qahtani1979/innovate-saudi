import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/components/LanguageContext';
import { useCommitteeDecisions } from '@/hooks/strategy/useCommitteeDecisions';
import { useCommitteeAI } from '@/hooks/strategy/useCommitteeAI';
import { 
  Users, Calendar, CheckCircle2, XCircle, Clock, 
  Plus, Loader2, Gavel, FileText, ArrowRight, Sparkles, ListTodo, FileOutput
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

// Helper to safely render AI response items that may be strings or objects
const renderItemText = (item) => {
  if (typeof item === 'string') return item;
  if (item?.title) return item.title;
  if (item?.subject) return item.subject;
  if (item?.description) return item.description;
  if (item?.name) return item.name;
  if (item?.text) return item.text;
  return JSON.stringify(item);
};

export default function StrategyCommitteeReview({ planId }) {
  const { t, language } = useLanguage();
  const { decisions, isLoading, createDecision } = useCommitteeDecisions(planId);
  const { prioritizeAgenda, predictDecisionImpact, generateActionItems, summarizeMeeting } = useCommitteeAI();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [impactAnalysis, setImpactAnalysis] = useState(null);
  const [actionItems, setActionItems] = useState(null);
  const [meetingSummary, setMeetingSummary] = useState(null);
  
  const [newDecision, setNewDecision] = useState({
    committee_name: '',
    meeting_date: '',
    decision_type: '',
    subject: '',
    decision_text: '',
    rationale: '',
    vote_for: 0,
    vote_against: 0,
    vote_abstain: 0,
    responsible_email: '',
    due_date: ''
  });

  const getDecisionConfig = (type) => {
    const configs = {
      approval: { 
        icon: CheckCircle2, 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        label: { en: 'Approved', ar: 'موافق عليه' }
      },
      rejection: { 
        icon: XCircle, 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        label: { en: 'Rejected', ar: 'مرفوض' }
      },
      deferral: { 
        icon: Clock, 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        label: { en: 'Deferred', ar: 'مؤجل' }
      },
      direction: { 
        icon: ArrowRight, 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        label: { en: 'Direction Given', ar: 'توجيه' }
      }
    };
    return configs[type] || configs.direction;
  };

  const handlePredictImpact = async (decision) => {
    const result = await predictDecisionImpact.mutateAsync({
      decisions: decision,
      committeeData: { type: decision.committee_name },
      meetingContext: { plan_context: { planId } }
    });
    setImpactAnalysis(result);
  };

  const handleGenerateActionItems = async () => {
    if (!decisions || decisions.length === 0) return;
    const recentDecisions = decisions.slice(0, 5);
    const result = await generateActionItems.mutateAsync({
      decisions: recentDecisions,
      committeeData: { members: [] },
      meetingContext: { planId }
    });
    setActionItems(result);
  };

  const handleSummarizeMeeting = async () => {
    if (!decisions || decisions.length === 0) return;
    const recentDecisions = decisions.slice(0, 10);
    const result = await summarizeMeeting.mutateAsync({
      decisions: recentDecisions,
      agendaItems: recentDecisions.map(d => ({ subject: d.subject })),
      committeeData: {},
      meetingContext: { planId }
    });
    setMeetingSummary(result);
  };

  const handleAddDecision = async () => {
    if (!newDecision.committee_name || !newDecision.subject) return;
    
    await createDecision.mutateAsync({
      strategic_plan_id: planId,
      committee_name: newDecision.committee_name,
      meeting_date: newDecision.meeting_date ? new Date(newDecision.meeting_date).toISOString() : null,
      decision_type: newDecision.decision_type,
      subject: newDecision.subject,
      decision_text: newDecision.decision_text,
      rationale: newDecision.rationale,
      vote_for: parseInt(newDecision.vote_for) || 0,
      vote_against: parseInt(newDecision.vote_against) || 0,
      vote_abstain: parseInt(newDecision.vote_abstain) || 0,
      responsible_email: newDecision.responsible_email,
      due_date: newDecision.due_date ? new Date(newDecision.due_date).toISOString() : null
    });
    
    setNewDecision({
      committee_name: '', meeting_date: '', decision_type: '', subject: '',
      decision_text: '', rationale: '', vote_for: 0, vote_against: 0,
      vote_abstain: 0, responsible_email: '', due_date: ''
    });
    setIsDialogOpen(false);
  };

  const committees = [
    { id: 'strategy_board', name: { en: 'Strategy Board', ar: 'مجلس الاستراتيجية' } },
    { id: 'innovation_council', name: { en: 'Innovation Council', ar: 'مجلس الابتكار' } },
    { id: 'budget_committee', name: { en: 'Budget Committee', ar: 'لجنة الميزانية' } },
    { id: 'technical_review', name: { en: 'Technical Review Board', ar: 'مجلس المراجعة الفنية' } },
    { id: 'risk_committee', name: { en: 'Risk Committee', ar: 'لجنة المخاطر' } }
  ];

  const stats = {
    total: decisions?.length || 0,
    approvals: decisions?.filter(d => d.decision_type === 'approval').length || 0,
    pending: decisions?.filter(d => d.decision_type === 'deferral').length || 0,
    rejections: decisions?.filter(d => d.decision_type === 'rejection').length || 0
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
              <span className="font-medium">{t({ en: 'AI Committee Assistant', ar: 'مساعد اللجان الذكي' })}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGenerateActionItems}
                disabled={generateActionItems.isPending || stats.total === 0}
              >
                {generateActionItems.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ListTodo className="h-4 w-4 mr-2" />}
                {t({ en: 'Generate Actions', ar: 'إنشاء المهام' })}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSummarizeMeeting}
                disabled={summarizeMeeting.isPending || stats.total === 0}
              >
                {summarizeMeeting.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileOutput className="h-4 w-4 mr-2" />}
                {t({ en: 'Meeting Summary', ar: 'ملخص الاجتماع' })}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Generated Action Items Dialog */}
      <Dialog open={!!actionItems} onOpenChange={() => setActionItems(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-primary" />
              {t({ en: 'AI Generated Action Items', ar: 'المهام المنشأة ذكياً' })}
            </DialogTitle>
          </DialogHeader>
          {actionItems && (
            <div className="space-y-4 pt-4 max-h-96 overflow-y-auto">
              {actionItems.action_items?.map((item, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}>
                      {item.priority}
                    </Badge>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{t({ en: 'Owner:', ar: 'المسؤول:' })} {item.responsible_role}</span>
                    <span>{t({ en: 'Due:', ar: 'الاستحقاق:' })} +{item.due_date_offset_days} days</span>
                  </div>
                </div>
              ))}
              {actionItems.immediate_actions?.length > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    {t({ en: 'Immediate Actions (24h)', ar: 'إجراءات فورية (24 ساعة)' })}
                  </p>
                  <ul className="space-y-1">
                    {actionItems.immediate_actions.map((action, idx) => (
                      <li key={idx} className="text-sm">{renderItemText(action)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Meeting Summary Dialog */}
      <Dialog open={!!meetingSummary} onOpenChange={() => setMeetingSummary(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileOutput className="h-5 w-5 text-primary" />
              {t({ en: 'AI Meeting Summary', ar: 'ملخص الاجتماع الذكي' })}
            </DialogTitle>
          </DialogHeader>
          {meetingSummary && (
            <div className="space-y-4 pt-4 max-h-96 overflow-y-auto">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-2">{t({ en: 'Executive Summary', ar: 'الملخص التنفيذي' })}</p>
                <p className="text-sm">{meetingSummary.executive_summary}</p>
              </div>
              {meetingSummary.key_decisions?.length > 0 && (
                <div>
                  <p className="font-medium mb-2">{t({ en: 'Key Decisions', ar: 'القرارات الرئيسية' })}</p>
                  <ul className="space-y-1">
                    {meetingSummary.key_decisions.map((decision, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                        {renderItemText(decision)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {meetingSummary.next_steps?.length > 0 && (
                <div>
                  <p className="font-medium mb-2">{t({ en: 'Next Steps', ar: 'الخطوات التالية' })}</p>
                  <ul className="space-y-1">
                    {meetingSummary.next_steps.map((step, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                        {renderItemText(step)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {meetingSummary.arabic_summary && (
                <div className="p-4 bg-primary/5 rounded-lg" dir="rtl">
                  <p className="font-medium mb-2">الملخص بالعربية</p>
                  <p className="text-sm">{meetingSummary.arabic_summary}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Impact Analysis Dialog */}
      <Dialog open={!!impactAnalysis} onOpenChange={() => setImpactAnalysis(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t({ en: 'Decision Impact Analysis', ar: 'تحليل تأثير القرار' })}</DialogTitle>
          </DialogHeader>
          {impactAnalysis && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">{t({ en: 'Success Probability', ar: 'احتمالية النجاح' })}</p>
                  <p className="text-2xl font-bold">{impactAnalysis.success_probability}%</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">{t({ en: 'Complexity', ar: 'التعقيد' })}</p>
                  <p className="text-lg font-bold capitalize">{impactAnalysis.implementation_complexity}</p>
                </div>
              </div>
              {impactAnalysis.key_success_factors?.length > 0 && (
                <div>
                  <p className="font-medium mb-2">{t({ en: 'Success Factors', ar: 'عوامل النجاح' })}</p>
                  <ul className="space-y-1">
                    {impactAnalysis.key_success_factors.slice(0, 4).map((factor, idx) => (
                      <li key={idx} className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {renderItemText(factor)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Total Decisions', ar: 'إجمالي القرارات' })}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Gavel className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Approvals', ar: 'الموافقات' })}</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvals}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Deferred', ar: 'مؤجل' })}</p>
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
                <p className="text-sm text-muted-foreground">{t({ en: 'Rejections', ar: 'الرفض' })}</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejections}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Committee Decisions Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {t({ en: 'Committee Decisions', ar: 'قرارات اللجان' })}
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Record Decision', ar: 'تسجيل قرار' })}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t({ en: 'Record Committee Decision', ar: 'تسجيل قرار اللجنة' })}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Committee', ar: 'اللجنة' })}</label>
                  <Select value={newDecision.committee_name} onValueChange={(value) => setNewDecision({ ...newDecision, committee_name: value })}>
                    <SelectTrigger><SelectValue placeholder={t({ en: 'Select committee', ar: 'اختر اللجنة' })} /></SelectTrigger>
                    <SelectContent>
                      {committees.map(c => (<SelectItem key={c.id} value={c.id}>{t(c.name)}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Meeting Date', ar: 'تاريخ الاجتماع' })}</label>
                  <Input type="datetime-local" value={newDecision.meeting_date} onChange={(e) => setNewDecision({ ...newDecision, meeting_date: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">{t({ en: 'Subject', ar: 'الموضوع' })}</label>
                  <Input value={newDecision.subject} onChange={(e) => setNewDecision({ ...newDecision, subject: e.target.value })} placeholder={t({ en: 'Enter subject', ar: 'أدخل الموضوع' })} />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Decision Type', ar: 'نوع القرار' })}</label>
                  <Select value={newDecision.decision_type} onValueChange={(value) => setNewDecision({ ...newDecision, decision_type: value })}>
                    <SelectTrigger><SelectValue placeholder={t({ en: 'Select type', ar: 'اختر النوع' })} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approval">{t({ en: 'Approval', ar: 'موافقة' })}</SelectItem>
                      <SelectItem value="rejection">{t({ en: 'Rejection', ar: 'رفض' })}</SelectItem>
                      <SelectItem value="deferral">{t({ en: 'Deferral', ar: 'تأجيل' })}</SelectItem>
                      <SelectItem value="direction">{t({ en: 'Direction', ar: 'توجيه' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-sm font-medium">{t({ en: 'For', ar: 'مع' })}</label>
                    <Input type="number" min="0" value={newDecision.vote_for} onChange={(e) => setNewDecision({ ...newDecision, vote_for: e.target.value })} />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium">{t({ en: 'Against', ar: 'ضد' })}</label>
                    <Input type="number" min="0" value={newDecision.vote_against} onChange={(e) => setNewDecision({ ...newDecision, vote_against: e.target.value })} />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium">{t({ en: 'Abstain', ar: 'امتناع' })}</label>
                    <Input type="number" min="0" value={newDecision.vote_abstain} onChange={(e) => setNewDecision({ ...newDecision, vote_abstain: e.target.value })} />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">{t({ en: 'Decision Text', ar: 'نص القرار' })}</label>
                  <Textarea value={newDecision.decision_text} onChange={(e) => setNewDecision({ ...newDecision, decision_text: e.target.value })} rows={2} />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">{t({ en: 'Rationale', ar: 'المبررات' })}</label>
                  <Textarea value={newDecision.rationale} onChange={(e) => setNewDecision({ ...newDecision, rationale: e.target.value })} rows={2} />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Responsible Person', ar: 'الشخص المسؤول' })}</label>
                  <Input type="email" value={newDecision.responsible_email} onChange={(e) => setNewDecision({ ...newDecision, responsible_email: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Due Date', ar: 'تاريخ الاستحقاق' })}</label>
                  <Input type="date" value={newDecision.due_date} onChange={(e) => setNewDecision({ ...newDecision, due_date: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Button onClick={handleAddDecision} className="w-full" disabled={createDecision.isPending}>
                    {createDecision.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Gavel className="h-4 w-4 mr-2" />}
                    {t({ en: 'Record Decision', ar: 'تسجيل القرار' })}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {decisions?.map((decision) => {
              const config = getDecisionConfig(decision.decision_type);
              const DecisionIcon = config.icon;
              const committee = committees.find(c => c.id === decision.committee_name);
              
              return (
                <div key={decision.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Gavel className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{decision.subject}</p>
                        <p className="text-sm text-muted-foreground">{committee ? t(committee.name) : decision.committee_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handlePredictImpact(decision)} disabled={predictDecisionImpact.isPending}>
                        <Sparkles className="h-4 w-4" />
                      </Button>
                      <Badge className={config.color}>
                        <DecisionIcon className="h-3 w-3 mr-1" />
                        {t(config.label)}
                      </Badge>
                    </div>
                  </div>
                  
                  {decision.decision_text && (
                    <div className="mb-3 p-3 bg-muted/50 rounded-md">
                      <p className="text-sm font-medium mb-1">{t({ en: 'Decision:', ar: 'القرار:' })}</p>
                      <p className="text-sm">{decision.decision_text}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    {decision.meeting_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(decision.meeting_date).toLocaleDateString()}
                      </span>
                    )}
                    {(decision.vote_for > 0 || decision.vote_against > 0 || decision.vote_abstain > 0) && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {t({ en: 'Vote:', ar: 'التصويت:' })} {decision.vote_for}-{decision.vote_against}-{decision.vote_abstain}
                      </span>
                    )}
                    {decision.responsible_email && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {decision.responsible_email}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {(!decisions || decisions.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                {t({ en: 'No committee decisions recorded yet', ar: 'لم يتم تسجيل قرارات اللجان بعد' })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
