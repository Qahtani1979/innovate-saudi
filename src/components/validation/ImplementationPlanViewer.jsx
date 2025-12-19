import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from '@/components/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { getImplementationPlan, getPlanSummary } from '@/constants/implementationPlans';
import { 
  FileCode, Clock, CheckCircle2, AlertTriangle, XCircle, 
  Copy, ExternalLink, ChevronRight, Layers, Database,
  Code, Shield, GitBranch, Bell, FileText, Eye, Lock, 
  Globe, BookOpen, Zap, ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';

const priorityConfig = {
  critical: { color: 'bg-destructive text-destructive-foreground', icon: XCircle },
  high: { color: 'bg-orange-500 text-white', icon: AlertTriangle },
  medium: { color: 'bg-yellow-500 text-white', icon: Clock },
  low: { color: 'bg-muted text-muted-foreground', icon: CheckCircle2 }
};

const codeTypeIcons = {
  sql: Database,
  jsx: Code,
  typescript: Code,
  markdown: FileText
};

function CodeBlock({ code, type, file }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const Icon = codeTypeIcons[type] || Code;

  return (
    <div className="relative rounded-lg border bg-slate-950 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-mono">{file}</span>
          <Badge variant="outline" className="text-[10px] bg-slate-800 border-slate-700 text-slate-300">
            {type.toUpperCase()}
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={copyToClipboard}
          className="h-6 px-2 text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
      <ScrollArea className="max-h-[300px]">
        <pre className="p-3 text-xs font-mono text-green-400 whitespace-pre-wrap overflow-x-auto">
          {code}
        </pre>
      </ScrollArea>
    </div>
  );
}

function FixItem({ fix, phaseId }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-start gap-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div className={`mt-0.5 h-5 w-5 rounded flex items-center justify-center shrink-0 ${
          fix.status === 'completed' ? 'bg-green-600' : 'bg-muted'
        }`}>
          {fix.status === 'completed' ? (
            <CheckCircle2 className="h-3 w-3 text-white" />
          ) : (
            <span className="text-[10px] font-mono text-muted-foreground">{fix.checkId}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{t(fix.title)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t(fix.description)}</p>
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
      
      {expanded && (
        <div className="border-t p-3 space-y-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {fix.checkId}
            </Badge>
            <Badge variant={fix.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
              {fix.status === 'completed' ? t({ en: 'Completed', ar: 'مكتمل' }) : t({ en: 'Pending', ar: 'قيد الانتظار' })}
            </Badge>
          </div>
          
          {fix.codeChanges?.map((change, idx) => (
            <CodeBlock 
              key={idx} 
              code={change.code} 
              type={change.type} 
              file={change.file} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PhaseCard({ phase, index }) {
  const { t } = useLanguage();
  const PriorityIcon = priorityConfig[phase.priority]?.icon || Clock;
  
  const completedFixes = phase.fixes.filter(f => f.status === 'completed').length;
  const progress = phase.fixes.length > 0 ? Math.round((completedFixes / phase.fixes.length) * 100) : 0;

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${priorityConfig[phase.priority]?.color || 'bg-muted'}`}>
              <PriorityIcon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">{t(phase.name)}</CardTitle>
              <CardDescription className="text-xs">
                {phase.fixes.length} {t({ en: 'fixes', ar: 'إصلاحات' })} • ~{phase.estimatedHours}h
              </CardDescription>
            </div>
          </div>
          <Badge variant={progress === 100 ? 'default' : 'secondary'}>
            {completedFixes}/{phase.fixes.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-1.5 mt-2" />
      </CardHeader>
      <CardContent className="space-y-2">
        {phase.fixes.map((fix, idx) => (
          <FixItem key={idx} fix={fix} phaseId={phase.id} />
        ))}
      </CardContent>
    </Card>
  );
}

function PlanSummaryCard({ plan, summary }) {
  const { t } = useLanguage();

  if (!plan || !summary) return null;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={`h-14 w-14 rounded-full flex items-center justify-center shrink-0 ${
              summary.progress === 100 ? 'bg-green-600' : summary.progress >= 50 ? 'bg-amber-500' : 'bg-destructive'
            }`}>
              <span className="text-xl font-bold text-white">{summary.progress}%</span>
            </div>
            <div>
              <p className="text-lg font-semibold">{plan.systemName}</p>
              <p className="text-sm text-muted-foreground">
                {summary.completedFixes}/{summary.totalFixes} {t({ en: 'fixes completed', ar: 'إصلاحات مكتملة' })}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="text-center p-2 bg-destructive/10 rounded-lg">
              <p className="text-lg font-bold text-destructive">{summary.criticalFixes - summary.criticalCompleted}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Critical', ar: 'حرجة' })}</p>
            </div>
            <div className="text-center p-2 bg-muted rounded-lg">
              <p className="text-lg font-bold">{summary.totalHours}h</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Est. Time', ar: 'الوقت المقدر' })}</p>
            </div>
          </div>
        </div>
        
        <Progress value={summary.progress} className="h-2 mt-4" />
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {plan.phases.slice(0, 4).map((phase, idx) => {
            const completed = phase.fixes.filter(f => f.status === 'completed').length;
            return (
              <div key={idx} className="p-2 bg-muted/50 rounded-lg text-center">
                <p className="text-xs font-medium truncate">{phase.id.replace('phase-', 'P')}</p>
                <p className="text-sm font-bold">{completed}/{phase.fixes.length}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ImplementationPlanViewer({ systemId, trigger }) {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [activePhase, setActivePhase] = useState('all');
  
  const plan = getImplementationPlan(systemId);
  const summary = getPlanSummary(plan);

  if (!plan) {
    return (
      <div className="text-center py-8">
        <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">
          {t({ en: 'No implementation plan available for this system', ar: 'لا توجد خطة تنفيذ متاحة لهذا النظام' })}
        </p>
      </div>
    );
  }

  const Content = () => (
    <div className="space-y-4">
      <PlanSummaryCard plan={plan} summary={summary} />
      
      <Tabs value={activePhase} onValueChange={setActivePhase}>
        <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="all" className="text-xs">
            {t({ en: 'All Phases', ar: 'كل المراحل' })}
          </TabsTrigger>
          {plan.phases.map((phase, idx) => (
            <TabsTrigger key={phase.id} value={phase.id} className="text-xs">
              P{idx + 1}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <ScrollArea className="h-[calc(100vh-400px)] min-h-[400px]">
            <div className="space-y-4 pr-4">
              {plan.phases.map((phase, idx) => (
                <PhaseCard key={phase.id} phase={phase} index={idx} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        {plan.phases.map((phase, idx) => (
          <TabsContent key={phase.id} value={phase.id} className="mt-4">
            <ScrollArea className="h-[calc(100vh-400px)] min-h-[400px]">
              <div className="pr-4">
                <PhaseCard phase={phase} index={idx} />
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );

  // Use Sheet on mobile, Dialog on desktop
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm" className="gap-2">
              <FileCode className="h-4 w-4" />
              {t({ en: 'View Plan', ar: 'عرض الخطة' })}
            </Button>
          )}
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-primary" />
              {t({ en: 'Implementation Plan', ar: 'خطة التنفيذ' })}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <Content />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <FileCode className="h-4 w-4" />
            {t({ en: 'View Plan', ar: 'عرض الخطة' })}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            {t({ en: 'Implementation Plan', ar: 'خطة التنفيذ' })} - {plan.systemName}
          </DialogTitle>
        </DialogHeader>
        <Content />
      </DialogContent>
    </Dialog>
  );
}
