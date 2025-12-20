import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/components/LanguageContext';
import { useStrategyRecalibration } from '@/hooks/strategy/useStrategyRecalibration';
import {
  GitBranch, Clock, CheckCircle2, XCircle, RefreshCw, Zap
} from 'lucide-react';

const PIVOT_TYPES = [
  { 
    id: 'entity', 
    label: { en: 'Entity Pivot', ar: 'محور الكيان' },
    description: { en: 'Adjust a single entity (pilot, challenge, etc.)', ar: 'تعديل كيان واحد (تجريبي، تحدي، إلخ)' }
  },
  { 
    id: 'strategic', 
    label: { en: 'Strategic Pivot', ar: 'محور استراتيجي' },
    description: { en: 'Major shift affecting multiple entities/objectives', ar: 'تحول كبير يؤثر على كيانات/أهداف متعددة' }
  },
  { 
    id: 'resource', 
    label: { en: 'Resource Reallocation', ar: 'إعادة تخصيص الموارد' },
    description: { en: 'Shift budget or staff between initiatives', ar: 'نقل الميزانية أو الموظفين بين المبادرات' }
  },
  { 
    id: 'timeline', 
    label: { en: 'Timeline Adjustment', ar: 'تعديل الجدول الزمني' },
    description: { en: 'Extend or compress project timelines', ar: 'تمديد أو ضغط الجداول الزمنية للمشروع' }
  }
];

const STAKEHOLDER_GROUPS = [
  { id: 'executive', label: { en: 'Executive Leadership', ar: 'القيادة التنفيذية' }, timing: 'Immediately' },
  { id: 'strategy_team', label: { en: 'Strategy Team', ar: 'فريق الاستراتيجية' }, timing: 'Same day' },
  { id: 'entity_owners', label: { en: 'Entity Owners', ar: 'مالكو الكيانات' }, timing: '24 hours' },
  { id: 'staff', label: { en: 'Wider Staff', ar: 'الموظفون' }, timing: '48 hours' },
  { id: 'partners', label: { en: 'External Partners', ar: 'الشركاء الخارجيون' }, timing: '72 hours' },
  { id: 'citizens', label: { en: 'Citizens', ar: 'المواطنون' }, timing: '1 week' }
];

export default function MidCyclePivotManager({ planId }) {
  const { t, language } = useLanguage();
  const { pivotsHistory, createPivot, isPivotPending, isLoading } = useStrategyRecalibration(planId);
  
  const [activeTab, setActiveTab] = useState('create');
  const [newPivot, setNewPivot] = useState({
    type: '',
    reason: '',
    scope: '',
    affectedEntities: '',
    targetPhases: [],
    stakeholdersToNotify: [],
    urgency: 'medium'
  });

  const handlePhaseToggle = (phase) => {
    setNewPivot(prev => ({
      ...prev,
      targetPhases: prev.targetPhases.includes(phase)
        ? prev.targetPhases.filter(p => p !== phase)
        : [...prev.targetPhases, phase]
    }));
  };

  const handleStakeholderToggle = (stakeholder) => {
    setNewPivot(prev => ({
      ...prev,
      stakeholdersToNotify: prev.stakeholdersToNotify.includes(stakeholder)
        ? prev.stakeholdersToNotify.filter(s => s !== stakeholder)
        : [...prev.stakeholdersToNotify, stakeholder]
    }));
  };

  const submitPivot = () => {
    createPivot({
      pivotType: newPivot.type,
      scope: newPivot.scope,
      reason: newPivot.reason,
      targetPhases: newPivot.targetPhases,
      changes: {
        affectedEntities: newPivot.affectedEntities,
        stakeholdersToNotify: newPivot.stakeholdersToNotify,
        urgency: newPivot.urgency
      }
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'pending_approval':
        return <Badge className="bg-amber-100 text-amber-800"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          {t({ en: 'Mid-Cycle Pivot Manager', ar: 'مدير التحولات منتصف الدورة' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">
              {t({ en: 'Create Pivot', ar: 'إنشاء محور' })}
            </TabsTrigger>
            <TabsTrigger value="history">
              {t({ en: 'Pivot History', ar: 'سجل التحولات' })} ({pivotsHistory.length})
            </TabsTrigger>
          </TabsList>

          {/* Create Pivot Tab */}
          <TabsContent value="create" className="space-y-6 mt-6">
            {/* Pivot Type Selection */}
            <div className="space-y-3">
              <Label>{t({ en: 'Pivot Type', ar: 'نوع التحول' })}</Label>
              <div className="grid grid-cols-2 gap-3">
                {PIVOT_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setNewPivot(prev => ({ ...prev, type: type.id }))}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      newPivot.type === type.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-muted-foreground/50'
                    }`}
                  >
                    <p className="font-medium text-sm">{t(type.label)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t(type.description)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Reason & Scope */}
            <div className="space-y-2">
              <Label>{t({ en: 'Reason for Pivot', ar: 'سبب التحول' })}</Label>
              <Textarea
                value={newPivot.reason}
                onChange={(e) => setNewPivot(prev => ({ ...prev, reason: e.target.value }))}
                placeholder={t({ en: 'Explain why this pivot is necessary...', ar: 'اشرح لماذا هذا التحول ضروري...' })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Scope', ar: 'النطاق' })}</Label>
                <Select
                  value={newPivot.scope}
                  onValueChange={(value) => setNewPivot(prev => ({ ...prev, scope: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Select scope', ar: 'حدد النطاق' })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_entity">{t({ en: 'Single Entity', ar: 'كيان واحد' })}</SelectItem>
                    <SelectItem value="multiple_entities">{t({ en: 'Multiple Entities', ar: 'كيانات متعددة' })}</SelectItem>
                    <SelectItem value="objective_level">{t({ en: 'Objective Level', ar: 'مستوى الهدف' })}</SelectItem>
                    <SelectItem value="plan_wide">{t({ en: 'Plan-Wide', ar: 'على مستوى الخطة' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Urgency', ar: 'الاستعجال' })}</Label>
                <Select
                  value={newPivot.urgency}
                  onValueChange={(value) => setNewPivot(prev => ({ ...prev, urgency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t({ en: 'Low', ar: 'منخفض' })}</SelectItem>
                    <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</SelectItem>
                    <SelectItem value="high">{t({ en: 'High', ar: 'عالي' })}</SelectItem>
                    <SelectItem value="critical">{t({ en: 'Critical', ar: 'حرج' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target Phases */}
            <div className="space-y-3">
              <Label>{t({ en: 'Target Phases for Modification', ar: 'المراحل المستهدفة للتعديل' })}</Label>
              <div className="flex flex-wrap gap-2">
                {[2, 3, 4, 5, 6].map(phase => (
                  <Button
                    key={phase}
                    variant={newPivot.targetPhases.includes(phase) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePhaseToggle(phase)}
                  >
                    Phase {phase}
                  </Button>
                ))}
              </div>
            </div>

            {/* Stakeholder Notification */}
            <div className="space-y-3">
              <Label>{t({ en: 'Stakeholders to Notify', ar: 'أصحاب المصلحة للإخطار' })}</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {STAKEHOLDER_GROUPS.map(stakeholder => (
                  <label
                    key={stakeholder.id}
                    className="flex items-start gap-2 p-2 border rounded cursor-pointer hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={newPivot.stakeholdersToNotify.includes(stakeholder.id)}
                      onCheckedChange={() => handleStakeholderToggle(stakeholder.id)}
                    />
                    <div>
                      <p className="text-sm font-medium">{t(stakeholder.label)}</p>
                      <p className="text-xs text-muted-foreground">{stakeholder.timing}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button 
              onClick={submitPivot}
              disabled={!newPivot.type || !newPivot.reason || isPivotPending}
              className="w-full"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isPivotPending 
                ? t({ en: 'Creating...', ar: 'جاري الإنشاء...' })
                : t({ en: 'Initiate Pivot', ar: 'بدء التحول' })
              }
            </Button>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4 mt-6">
            {pivotsHistory.length > 0 ? (
              pivotsHistory.map((pivot) => (
                <div key={pivot.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{pivot.change_summary}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pivot.created_at).toLocaleDateString()} • {pivot.created_by}
                      </p>
                    </div>
                    {getStatusBadge(pivot.status)}
                  </div>
                  {pivot.changes_json && (
                    <div className="mt-2 pt-2 border-t text-sm text-muted-foreground">
                      <span className="font-medium">Type:</span> {pivot.changes_json.pivot_type || 'N/A'}
                      {pivot.changes_json.target_phases && (
                        <span className="ml-4">
                          <span className="font-medium">Phases:</span> {pivot.changes_json.target_phases.join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {t({ en: 'No pivots recorded yet', ar: 'لم يتم تسجيل أي تحولات بعد' })}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
