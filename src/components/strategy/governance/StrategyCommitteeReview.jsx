import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/components/LanguageContext';
import { useCommitteeDecisions } from '@/hooks/strategy/useCommitteeDecisions';
import { 
  Users, Calendar, CheckCircle2, XCircle, Clock, 
  Plus, Loader2, Gavel, FileText, ArrowRight
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

export default function StrategyCommitteeReview({ planId }) {
  const { t, language } = useLanguage();
  const { decisions, isLoading, createDecision } = useCommitteeDecisions(planId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
                  <Select 
                    value={newDecision.committee_name}
                    onValueChange={(value) => setNewDecision({ ...newDecision, committee_name: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select committee', ar: 'اختر اللجنة' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {committees.map(c => (
                        <SelectItem key={c.id} value={c.id}>{t(c.name)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Meeting Date', ar: 'تاريخ الاجتماع' })}</label>
                  <Input 
                    type="datetime-local"
                    value={newDecision.meeting_date}
                    onChange={(e) => setNewDecision({ ...newDecision, meeting_date: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">{t({ en: 'Subject', ar: 'الموضوع' })}</label>
                  <Input 
                    value={newDecision.subject}
                    onChange={(e) => setNewDecision({ ...newDecision, subject: e.target.value })}
                    placeholder={t({ en: 'Enter subject', ar: 'أدخل الموضوع' })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Decision Type', ar: 'نوع القرار' })}</label>
                  <Select 
                    value={newDecision.decision_type}
                    onValueChange={(value) => setNewDecision({ ...newDecision, decision_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select type', ar: 'اختر النوع' })} />
                    </SelectTrigger>
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
                    <Input 
                      type="number"
                      min="0"
                      value={newDecision.vote_for}
                      onChange={(e) => setNewDecision({ ...newDecision, vote_for: e.target.value })}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium">{t({ en: 'Against', ar: 'ضد' })}</label>
                    <Input 
                      type="number"
                      min="0"
                      value={newDecision.vote_against}
                      onChange={(e) => setNewDecision({ ...newDecision, vote_against: e.target.value })}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium">{t({ en: 'Abstain', ar: 'امتناع' })}</label>
                    <Input 
                      type="number"
                      min="0"
                      value={newDecision.vote_abstain}
                      onChange={(e) => setNewDecision({ ...newDecision, vote_abstain: e.target.value })}
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">{t({ en: 'Decision Text', ar: 'نص القرار' })}</label>
                  <Textarea 
                    value={newDecision.decision_text}
                    onChange={(e) => setNewDecision({ ...newDecision, decision_text: e.target.value })}
                    placeholder={t({ en: 'Enter exact decision wording...', ar: 'أدخل صياغة القرار...' })}
                    rows={2}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">{t({ en: 'Rationale', ar: 'المبررات' })}</label>
                  <Textarea 
                    value={newDecision.rationale}
                    onChange={(e) => setNewDecision({ ...newDecision, rationale: e.target.value })}
                    placeholder={t({ en: 'Enter reasoning behind decision...', ar: 'أدخل أسباب القرار...' })}
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Responsible Person', ar: 'الشخص المسؤول' })}</label>
                  <Input 
                    type="email"
                    value={newDecision.responsible_email}
                    onChange={(e) => setNewDecision({ ...newDecision, responsible_email: e.target.value })}
                    placeholder={t({ en: 'Enter email', ar: 'أدخل البريد الإلكتروني' })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Due Date', ar: 'تاريخ الاستحقاق' })}</label>
                  <Input 
                    type="date"
                    value={newDecision.due_date}
                    onChange={(e) => setNewDecision({ ...newDecision, due_date: e.target.value })}
                  />
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
                <div 
                  key={decision.id} 
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Gavel className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{decision.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {committee ? t(committee.name) : decision.committee_name}
                        </p>
                      </div>
                    </div>
                    <Badge className={config.color}>
                      <DecisionIcon className="h-3 w-3 mr-1" />
                      {t(config.label)}
                    </Badge>
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
