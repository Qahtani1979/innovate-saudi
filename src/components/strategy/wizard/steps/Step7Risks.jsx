import React, { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Sparkles, AlertTriangle, Plus, X, Shield, ChevronDown, ChevronUp, 
  CheckCircle2, ListChecks, Grid3X3, BarChart3, User, FileText,
  TrendingUp, TrendingDown, Minus, Target, AlertCircle, Lightbulb,
  FolderOpen, Clock, Percent
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { useTaxonomy } from '@/contexts/TaxonomyContext';
import { useRiskAssessment } from '@/hooks/strategy/useRiskAssessment';
import { cn } from '@/lib/utils';

const LEVEL_OPTIONS = [
  { value: 'low', label: { en: 'Low', ar: 'منخفض' }, color: 'bg-green-100 text-green-800 border-green-300', score: 1 },
  { value: 'medium', label: { en: 'Medium', ar: 'متوسط' }, color: 'bg-yellow-100 text-yellow-800 border-yellow-300', score: 2 },
  { value: 'high', label: { en: 'High', ar: 'مرتفع' }, color: 'bg-red-100 text-red-800 border-red-300', score: 3 }
];

const STATUS_OPTIONS = [
  { value: 'identified', label: { en: 'Identified', ar: 'محدد' }, icon: Target, color: 'text-blue-500' },
  { value: 'mitigating', label: { en: 'Mitigating', ar: 'قيد التخفيف' }, icon: TrendingDown, color: 'text-yellow-500' },
  { value: 'resolved', label: { en: 'Resolved', ar: 'تم الحل' }, icon: CheckCircle2, color: 'text-green-500' },
  { value: 'accepted', label: { en: 'Accepted', ar: 'مقبول' }, icon: Minus, color: 'text-gray-500' }
];

const RISK_APPETITE_OPTIONS = [
  { value: 'low', label: { en: 'Low (Risk Averse)', ar: 'منخفض (تجنب المخاطر)' }, description: { en: 'Minimize all risks', ar: 'تقليل جميع المخاطر' } },
  { value: 'moderate', label: { en: 'Moderate (Balanced)', ar: 'معتدل (متوازن)' }, description: { en: 'Accept calculated risks', ar: 'قبول المخاطر المحسوبة' } },
  { value: 'high', label: { en: 'High (Risk Tolerant)', ar: 'مرتفع (تحمل المخاطر)' }, description: { en: 'Embrace strategic risks', ar: 'تقبل المخاطر الاستراتيجية' } }
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
const StatCard = ({ icon: Icon, label, value, color = "text-primary", subValue }) => (
  <div className="text-center p-3 bg-background rounded-lg border hover:shadow-sm transition-shadow">
    <Icon className={cn("w-5 h-5 mx-auto mb-1", color)} />
    <div className={cn("text-2xl font-bold", color)}>{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
    {subValue && <div className="text-xs text-muted-foreground mt-0.5">{subValue}</div>}
  </div>
);

export default function Step7Risks({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating,
  isReadOnly = false,
  strategicPlanId = null
}) {
  const { language, t, isRTL } = useLanguage();
  const { riskCategories } = useTaxonomy();
  const [activeTab, setActiveTab] = useState('register');
  const [expandedRisks, setExpandedRisks] = useState({});
  
  const {
    risks: dbRisks,
    loading: dbLoading,
    saving: dbSaving,
    saveRisk,
    deleteRisk
  } = useRiskAssessment(strategicPlanId);
  
  useEffect(() => {
    if (strategicPlanId && dbRisks?.length > 0 && !dbLoading && !data.risks?.length) {
      onChange({ risks: dbRisks });
    }
  }, [strategicPlanId, dbRisks, dbLoading]);

  // Calculate statistics
  const stats = useMemo(() => {
    const risks = data.risks || [];
    let highRisk = 0, mediumRisk = 0, lowRisk = 0;
    let mitigated = 0, resolved = 0, identified = 0, accepted = 0;
    let withOwner = 0, withContingency = 0;
    const categoryCount = {};

    risks.forEach(r => {
      const score = r.risk_score || 0;
      if (score >= 6) highRisk++;
      else if (score >= 3) mediumRisk++;
      else lowRisk++;
      
      if (r.status === 'mitigating') mitigated++;
      if (r.status === 'resolved') resolved++;
      if (r.status === 'identified') identified++;
      if (r.status === 'accepted') accepted++;
      if (r.owner) withOwner++;
      if (r.contingency_plan_en || r.contingency_plan_ar || r.contingency_plan) withContingency++;
      
      const cat = r.category || 'OTHER';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    const withMitigation = risks.filter(r => r.mitigation_strategy_en || r.mitigation_strategy_ar || r.mitigation_strategy).length;

    return {
      total: risks.length,
      highRisk,
      mediumRisk,
      lowRisk,
      mitigated,
      resolved,
      identified,
      accepted,
      withMitigation,
      withOwner,
      withContingency,
      categoryCount,
      mitigationRate: risks.length > 0 ? Math.round((withMitigation / risks.length) * 100) : 0,
      ownershipRate: risks.length > 0 ? Math.round((withOwner / risks.length) * 100) : 0
    };
  }, [data.risks]);

  // Calculate completeness score
  const completenessScore = useMemo(() => {
    if (stats.total === 0) return 0;
    
    let score = 0;
    
    // 25% for having risks identified (minimum 3 recommended)
    score += Math.min((stats.total / 3) * 25, 25);
    
    // 20% for risk appetite defined
    if (data.risk_appetite) score += 20;
    
    // 25% for mitigation strategies
    score += (stats.mitigationRate / 100) * 25;
    
    // 15% for risk owners assigned
    score += (stats.ownershipRate / 100) * 15;
    
    // 15% for contingency plans
    const contingencyRate = stats.total > 0 ? (stats.withContingency / stats.total) : 0;
    score += contingencyRate * 15;
    
    return Math.round(Math.min(score, 100));
  }, [stats, data.risk_appetite]);

  // Generate alerts
  const alerts = useMemo(() => {
    const warnings = [];
    
    if (stats.total === 0) {
      warnings.push({ type: 'error', message: t({ en: 'No risks identified. Add at least 3-5 key risks.', ar: 'لم يتم تحديد مخاطر. أضف 3-5 مخاطر رئيسية على الأقل.' }) });
    } else if (stats.total < 3) {
      warnings.push({ type: 'warning', message: t({ en: 'Consider identifying more risks (recommended: 3-5 minimum)', ar: 'فكر في تحديد المزيد من المخاطر (الموصى به: 3-5 كحد أدنى)' }) });
    }
    
    if (!data.risk_appetite) {
      warnings.push({ type: 'warning', message: t({ en: 'Risk appetite not defined', ar: 'لم يتم تحديد تحمل المخاطر' }) });
    }
    
    if (stats.highRisk > 0 && stats.mitigationRate < 100) {
      const unmit = stats.total - stats.withMitigation;
      warnings.push({ type: 'warning', message: t({ en: `${unmit} risk(s) without mitigation strategy`, ar: `${unmit} مخاطر بدون استراتيجية تخفيف` }) });
    }
    
    if (stats.highRisk > stats.total * 0.5 && stats.total > 0) {
      warnings.push({ type: 'error', message: t({ en: 'More than 50% of risks are high severity', ar: 'أكثر من 50% من المخاطر ذات شدة عالية' }) });
    }
    
    if (stats.ownershipRate < 50 && stats.total > 0) {
      warnings.push({ type: 'warning', message: t({ en: 'Assign owners to all risks for accountability', ar: 'عيّن مالكين لجميع المخاطر للمساءلة' }) });
    }
    
    return warnings;
  }, [stats, data.risk_appetite, t]);

  // Risk Matrix data
  const riskMatrix = useMemo(() => ({
    high_high: (data.risks || []).filter(r => r.likelihood === 'high' && r.impact === 'high'),
    high_medium: (data.risks || []).filter(r => r.likelihood === 'high' && r.impact === 'medium'),
    high_low: (data.risks || []).filter(r => r.likelihood === 'high' && r.impact === 'low'),
    medium_high: (data.risks || []).filter(r => r.likelihood === 'medium' && r.impact === 'high'),
    medium_medium: (data.risks || []).filter(r => r.likelihood === 'medium' && r.impact === 'medium'),
    medium_low: (data.risks || []).filter(r => r.likelihood === 'medium' && r.impact === 'low'),
    low_high: (data.risks || []).filter(r => r.likelihood === 'low' && r.impact === 'high'),
    low_medium: (data.risks || []).filter(r => r.likelihood === 'low' && r.impact === 'medium'),
    low_low: (data.risks || []).filter(r => r.likelihood === 'low' && r.impact === 'low')
  }), [data.risks]);

  // Group risks by category
  const risksByCategory = useMemo(() => {
    const grouped = {};
    (data.risks || []).forEach(risk => {
      const cat = risk.category || 'OTHER';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(risk);
    });
    return grouped;
  }, [data.risks]);

  const toggleRisk = (id) => {
    setExpandedRisks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addRisk = () => {
    if (isReadOnly) return;
    const newRisk = {
      id: Date.now().toString(),
      title_en: '',
      title_ar: '',
      description_en: '',
      description_ar: '',
      category: 'OPERATIONAL',
      likelihood: 'medium',
      impact: 'medium',
      risk_score: 4,
      mitigation_strategy_en: '',
      mitigation_strategy_ar: '',
      contingency_plan_en: '',
      contingency_plan_ar: '',
      owner: '',
      status: 'identified'
    };
    onChange({ risks: [...(data.risks || []), newRisk] });
    setExpandedRisks(prev => ({ ...prev, [newRisk.id]: true }));
  };

  const updateRisk = (riskId, field, value) => {
    if (isReadOnly) return;
    const updated = (data.risks || []).map(r => {
      if (r.id !== riskId) return r;
      const updatedRisk = { ...r, [field]: value };
      
      if (field === 'likelihood' || field === 'impact') {
        const scores = { low: 1, medium: 2, high: 3 };
        const likelihood = field === 'likelihood' ? value : updatedRisk.likelihood;
        const impact = field === 'impact' ? value : updatedRisk.impact;
        updatedRisk.risk_score = scores[likelihood] * scores[impact];
      }
      
      return updatedRisk;
    });
    
    onChange({ risks: updated });
  };

  const removeRisk = (riskId) => {
    if (isReadOnly) return;
    onChange({ risks: (data.risks || []).filter(r => r.id !== riskId) });
  };

  const getRiskColor = (score) => {
    if (score >= 6) return 'bg-red-500 text-white';
    if (score >= 3) return 'bg-yellow-500 text-black';
    return 'bg-green-500 text-white';
  };

  const getDisplayTitle = (risk) => {
    if (risk.title_en || risk.title_ar) {
      return language === 'ar' ? (risk.title_ar || risk.title_en) : (risk.title_en || risk.title_ar);
    }
    return risk.title || t({ en: 'Untitled Risk', ar: 'خطر بدون عنوان' });
  };

  const getRiskProgress = (risk) => {
    let filled = 0;
    let total = 6;
    
    if (risk.title_en || risk.title_ar) filled++;
    if (risk.description_en || risk.description_ar) filled++;
    if (risk.mitigation_strategy_en || risk.mitigation_strategy_ar || risk.mitigation_strategy) filled++;
    if (risk.contingency_plan_en || risk.contingency_plan_ar || risk.contingency_plan) filled++;
    if (risk.owner) filled++;
    if (risk.category && risk.likelihood && risk.impact) filled++;
    
    return Math.round((filled / total) * 100);
  };

  const isRiskComplete = (risk) => getRiskProgress(risk) >= 80;

  // Risk Card Component
  const RiskCard = ({ risk, index }) => {
    const isExpanded = expandedRisks[risk.id];
    const complete = isRiskComplete(risk);
    const progress = getRiskProgress(risk);
    const StatusIcon = STATUS_OPTIONS.find(s => s.value === risk.status)?.icon || Target;
    const statusColor = STATUS_OPTIONS.find(s => s.value === risk.status)?.color || 'text-gray-500';

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleRisk(risk.id)}>
        <Card className={cn("border-2 transition-all", complete && "border-green-300")}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Badge className={cn("shrink-0", getRiskColor(risk.risk_score))}>{risk.risk_score || 0}</Badge>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{getDisplayTitle(risk)}</span>
                      {complete && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Badge variant="outline" className="text-xs">
                        {riskCategories.find(c => c.code === risk.category)?.[`name_${language}`] || risk.category}
                      </Badge>
                      <StatusIcon className={cn("w-3 h-3", statusColor)} />
                      <span>{STATUS_OPTIONS.find(s => s.value === risk.status)?.label[language]}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex items-center gap-2">
                    <Progress value={progress} className="w-16 h-1.5" />
                    <span className="text-xs text-muted-foreground">{progress}%</span>
                  </div>
                  {risk.owner && (
                    <Badge variant="secondary" className="text-xs hidden md:flex">
                      <User className="w-3 h-3 mr-1" />
                      {risk.owner}
                    </Badge>
                  )}
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              {/* Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })} *</Label>
                  <Input
                    value={risk.title_en || risk.title || ''}
                    onChange={(e) => updateRisk(risk.id, 'title_en', e.target.value)}
                    placeholder={t({ en: 'Brief risk title', ar: 'عنوان موجز' })}
                    className={cn(risk.title_en && "border-green-300")}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <Label className="text-xs">{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</Label>
                  <Input
                    value={risk.title_ar || ''}
                    onChange={(e) => updateRisk(risk.id, 'title_ar', e.target.value)}
                    placeholder={t({ en: 'Arabic title', ar: 'العنوان بالعربية' })}
                    dir="rtl"
                    className={cn(risk.title_ar && "border-green-300")}
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              {/* Category, Likelihood, Impact */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">{t({ en: 'Category', ar: 'الفئة' })}</Label>
                  <Select value={risk.category} onValueChange={(v) => updateRisk(risk.id, 'category', v)} disabled={isReadOnly}>
                    <SelectTrigger className={cn(risk.category && "border-green-300")}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {riskCategories.map(cat => (
                        <SelectItem key={cat.code} value={cat.code}>{cat[`name_${language}`]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{t({ en: 'Likelihood', ar: 'الاحتمالية' })}</Label>
                  <Select value={risk.likelihood} onValueChange={(v) => updateRisk(risk.id, 'likelihood', v)} disabled={isReadOnly}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEVEL_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className={cn("px-2 py-0.5 rounded text-xs", opt.color)}>{opt.label[language]}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{t({ en: 'Impact', ar: 'التأثير' })}</Label>
                  <Select value={risk.impact} onValueChange={(v) => updateRisk(risk.id, 'impact', v)} disabled={isReadOnly}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEVEL_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className={cn("px-2 py-0.5 rounded text-xs", opt.color)}>{opt.label[language]}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
                  <Textarea
                    value={risk.description_en || risk.description || ''}
                    onChange={(e) => updateRisk(risk.id, 'description_en', e.target.value)}
                    placeholder={t({ en: 'Describe the risk...', ar: 'وصف الخطر...' })}
                    rows={2}
                    className={cn((risk.description_en || risk.description) && "border-green-300")}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <Label className="text-xs">{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
                  <Textarea
                    value={risk.description_ar || ''}
                    onChange={(e) => updateRisk(risk.id, 'description_ar', e.target.value)}
                    placeholder={t({ en: 'Arabic description', ar: 'الوصف بالعربية' })}
                    rows={2}
                    dir="rtl"
                    className={cn(risk.description_ar && "border-green-300")}
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              {/* Mitigation & Contingency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">{t({ en: 'Mitigation Strategy', ar: 'استراتيجية التخفيف' })} *</Label>
                  <Input
                    value={risk.mitigation_strategy_en || risk.mitigation_strategy || ''}
                    onChange={(e) => updateRisk(risk.id, 'mitigation_strategy_en', e.target.value)}
                    placeholder={t({ en: 'English...', ar: 'إنجليزي...' })}
                    className={cn((risk.mitigation_strategy_en || risk.mitigation_strategy) && "border-green-300")}
                    disabled={isReadOnly}
                  />
                  <Input
                    value={risk.mitigation_strategy_ar || ''}
                    onChange={(e) => updateRisk(risk.id, 'mitigation_strategy_ar', e.target.value)}
                    placeholder={t({ en: 'Arabic...', ar: 'عربي...' })}
                    dir="rtl"
                    className={cn(risk.mitigation_strategy_ar && "border-green-300")}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">{t({ en: 'Contingency Plan', ar: 'خطة الطوارئ' })}</Label>
                  <Input
                    value={risk.contingency_plan_en || risk.contingency_plan || ''}
                    onChange={(e) => updateRisk(risk.id, 'contingency_plan_en', e.target.value)}
                    placeholder={t({ en: 'English...', ar: 'إنجليزي...' })}
                    className={cn((risk.contingency_plan_en || risk.contingency_plan) && "border-green-300")}
                    disabled={isReadOnly}
                  />
                  <Input
                    value={risk.contingency_plan_ar || ''}
                    onChange={(e) => updateRisk(risk.id, 'contingency_plan_ar', e.target.value)}
                    placeholder={t({ en: 'Arabic...', ar: 'عربي...' })}
                    dir="rtl"
                    className={cn(risk.contingency_plan_ar && "border-green-300")}
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              {/* Owner & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">{t({ en: 'Risk Owner', ar: 'مالك الخطر' })}</Label>
                  <Input
                    value={risk.owner}
                    onChange={(e) => updateRisk(risk.id, 'owner', e.target.value)}
                    placeholder={t({ en: 'Name or role', ar: 'الاسم أو الدور' })}
                    className={cn(risk.owner && "border-green-300")}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <Label className="text-xs">{t({ en: 'Status', ar: 'الحالة' })}</Label>
                  <Select value={risk.status} onValueChange={(v) => updateRisk(risk.id, 'status', v)} disabled={isReadOnly}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <opt.icon className={cn("w-4 h-4", opt.color)} />
                            {opt.label[language]}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Delete Button */}
              {!isReadOnly && (
                <div className="flex justify-end pt-2 border-t">
                  <Button variant="ghost" size="sm" onClick={() => removeRisk(risk.id)} className="text-destructive hover:text-destructive">
                    <X className="w-4 h-4 mr-1" />
                    {t({ en: 'Remove Risk', ar: 'إزالة الخطر' })}
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dashboard Header */}
      <Card className="bg-gradient-to-br from-background to-muted/30 border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <CircularProgress value={completenessScore} label={t({ en: 'Complete', ar: 'مكتمل' })} />
            
            <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatCard icon={AlertTriangle} label={t({ en: 'Total Risks', ar: 'إجمالي المخاطر' })} value={stats.total} />
              <StatCard icon={AlertCircle} label={t({ en: 'High Risk', ar: 'مخاطر عالية' })} value={stats.highRisk} color="text-red-500" />
              <StatCard icon={Shield} label={t({ en: 'With Mitigation', ar: 'مع تخفيف' })} value={stats.withMitigation} color="text-green-500" />
              <StatCard icon={User} label={t({ en: 'With Owner', ar: 'مع مالك' })} value={stats.withOwner} color="text-blue-500" />
              <StatCard icon={Percent} label={t({ en: 'Mitigation Rate', ar: 'معدل التخفيف' })} value={`${stats.mitigationRate}%`} color="text-purple-500" />
            </div>

            {!isReadOnly && (
              <Button variant="outline" onClick={onGenerateAI} disabled={isGenerating} className="gap-2 shrink-0">
                <Sparkles className="w-4 h-4" />
                {isGenerating ? t({ en: 'Generating...', ar: 'جاري الإنشاء...' }) : t({ en: 'Identify Risks', ar: 'تحديد المخاطر' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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

      {/* Risk Appetite */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-5 h-5 text-primary" />
            {t({ en: 'Risk Appetite', ar: 'تحمل المخاطر' })}
          </CardTitle>
          <CardDescription>{t({ en: 'Define organizational tolerance for risk', ar: 'حدد تحمل المنظمة للمخاطر' })}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={data.risk_appetite || ''}
            onValueChange={(v) => !isReadOnly && onChange({ risk_appetite: v })}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            disabled={isReadOnly}
          >
            {RISK_APPETITE_OPTIONS.map(opt => (
              <div 
                key={opt.value} 
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                  data.risk_appetite === opt.value ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50",
                  isReadOnly && "cursor-default"
                )}
                onClick={() => !isReadOnly && onChange({ risk_appetite: opt.value })}
              >
                <RadioGroupItem value={opt.value} id={opt.value} disabled={isReadOnly} />
                <div>
                  <Label htmlFor={opt.value} className="font-medium cursor-pointer">{opt.label[language]}</Label>
                  <p className="text-xs text-muted-foreground mt-1">{opt.description[language]}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="register" className="gap-2">
            <ListChecks className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Register', ar: 'السجل' })}</span>
          </TabsTrigger>
          <TabsTrigger value="category" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'By Category', ar: 'بالفئة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="matrix" className="gap-2">
            <Grid3X3 className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Matrix', ar: 'المصفوفة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Summary', ar: 'الملخص' })}</span>
          </TabsTrigger>
        </TabsList>

        {/* Register Tab */}
        <TabsContent value="register" className="space-y-4">
          {!isReadOnly && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {t({ en: `${stats.total} risks identified`, ar: `${stats.total} مخاطر محددة` })}
              </p>
              <Button variant="outline" size="sm" onClick={addRisk}>
                <Plus className="w-4 h-4 mr-1" />
                {t({ en: 'Add Risk', ar: 'إضافة خطر' })}
              </Button>
            </div>
          )}

          {(data.risks || []).length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">{t({ en: 'No risks identified yet', ar: 'لم يتم تحديد مخاطر بعد' })}</p>
                <p className="text-xs text-muted-foreground mt-1">{t({ en: 'Use AI to identify risks or add manually', ar: 'استخدم الذكاء الاصطناعي لتحديد المخاطر أو أضفها يدوياً' })}</p>
                {!isReadOnly && (
                  <Button variant="link" onClick={addRisk} className="mt-2">
                    <Plus className="w-4 h-4 mr-1" />
                    {t({ en: 'Add your first risk', ar: 'أضف أول خطر' })}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {(data.risks || []).map((risk, index) => (
                <RiskCard key={risk.id} risk={risk} index={index} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* By Category Tab */}
        <TabsContent value="category" className="space-y-4">
          {Object.keys(risksByCategory).length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">{t({ en: 'No risks to categorize', ar: 'لا توجد مخاطر للتصنيف' })}</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(risksByCategory).map(([categoryCode, risks]) => {
              const category = riskCategories.find(c => c.code === categoryCode);
              const catName = category?.[`name_${language}`] || categoryCode;
              const highCount = risks.filter(r => (r.risk_score || 0) >= 6).length;
              
              return (
                <Card key={categoryCode}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FolderOpen className="w-5 h-5 text-primary" />
                        {catName}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">{risks.length} {t({ en: 'risks', ar: 'مخاطر' })}</Badge>
                        {highCount > 0 && (
                          <Badge variant="destructive">{highCount} {t({ en: 'high', ar: 'عالي' })}</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {risks.map((risk, idx) => (
                      <div key={risk.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={getRiskColor(risk.risk_score)}>{risk.risk_score || 0}</Badge>
                          <div>
                            <span className="font-medium">{getDisplayTitle(risk)}</span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{LEVEL_OPTIONS.find(l => l.value === risk.likelihood)?.label[language]} × {LEVEL_OPTIONS.find(l => l.value === risk.impact)?.label[language]}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {risk.owner && <Badge variant="secondary" className="text-xs">{risk.owner}</Badge>}
                          {(risk.mitigation_strategy_en || risk.mitigation_strategy) && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Matrix Tab */}
        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5" />
                {t({ en: 'Risk Assessment Matrix', ar: 'مصفوفة تقييم المخاطر' })}
              </CardTitle>
              <CardDescription>{t({ en: 'Visual mapping of risks by likelihood and impact', ar: 'تمثيل مرئي للمخاطر حسب الاحتمالية والتأثير' })}</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.total === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Grid3X3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t({ en: 'Add risks to see the matrix', ar: 'أضف مخاطر لرؤية المصفوفة' })}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-1 text-xs">
                    <div className="p-2 text-center font-medium">{t({ en: 'Impact →', ar: 'التأثير →' })}</div>
                    <div className="text-center font-medium p-2 bg-muted rounded">{t({ en: 'Low', ar: 'منخفض' })}</div>
                    <div className="text-center font-medium p-2 bg-muted rounded">{t({ en: 'Medium', ar: 'متوسط' })}</div>
                    <div className="text-center font-medium p-2 bg-muted rounded">{t({ en: 'High', ar: 'عالي' })}</div>
                    
                    <div className="font-medium p-2 bg-muted rounded text-center">{t({ en: 'High', ar: 'مرتفع' })}</div>
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded min-h-[80px]">
                      {riskMatrix.high_low.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5 block truncate">{getDisplayTitle(r)}</Badge>)}
                    </div>
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded min-h-[80px]">
                      {riskMatrix.high_medium.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5 block truncate">{getDisplayTitle(r)}</Badge>)}
                    </div>
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded min-h-[80px]">
                      {riskMatrix.high_high.map(r => <Badge key={r.id} variant="destructive" className="text-[10px] m-0.5 block truncate">{getDisplayTitle(r)}</Badge>)}
                    </div>
                    
                    <div className="font-medium p-2 bg-muted rounded text-center">{t({ en: 'Medium', ar: 'متوسط' })}</div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded min-h-[80px]">
                      {riskMatrix.medium_low.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5 block truncate">{getDisplayTitle(r)}</Badge>)}
                    </div>
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded min-h-[80px]">
                      {riskMatrix.medium_medium.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5 block truncate">{getDisplayTitle(r)}</Badge>)}
                    </div>
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded min-h-[80px]">
                      {riskMatrix.medium_high.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5 block truncate">{getDisplayTitle(r)}</Badge>)}
                    </div>
                    
                    <div className="font-medium p-2 bg-muted rounded text-center">{t({ en: 'Low', ar: 'منخفض' })}</div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded min-h-[80px]">
                      {riskMatrix.low_low.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5 block truncate">{getDisplayTitle(r)}</Badge>)}
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded min-h-[80px]">
                      {riskMatrix.low_medium.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5 block truncate">{getDisplayTitle(r)}</Badge>)}
                    </div>
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded min-h-[80px]">
                      {riskMatrix.low_high.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5 block truncate">{getDisplayTitle(r)}</Badge>)}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-200 dark:bg-green-800"></div> {t({ en: 'Low (1-2)', ar: 'منخفض (1-2)' })}</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-200 dark:bg-yellow-800"></div> {t({ en: 'Medium (3-4)', ar: 'متوسط (3-4)' })}</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-200 dark:bg-orange-800"></div> {t({ en: 'High (6)', ar: 'عالي (6)' })}</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-200 dark:bg-red-800"></div> {t({ en: 'Critical (9)', ar: 'حرج (9)' })}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risk Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {t({ en: 'Risk Distribution', ar: 'توزيع المخاطر' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500"></div>
                    {t({ en: 'High Risk', ar: 'مخاطر عالية' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress value={stats.total > 0 ? (stats.highRisk / stats.total) * 100 : 0} className="w-24 h-2" />
                    <span className="text-sm font-bold w-8">{stats.highRisk}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-500"></div>
                    {t({ en: 'Medium Risk', ar: 'مخاطر متوسطة' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress value={stats.total > 0 ? (stats.mediumRisk / stats.total) * 100 : 0} className="w-24 h-2" />
                    <span className="text-sm font-bold w-8">{stats.mediumRisk}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    {t({ en: 'Low Risk', ar: 'مخاطر منخفضة' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress value={stats.total > 0 ? (stats.lowRisk / stats.total) * 100 : 0} className="w-24 h-2" />
                    <span className="text-sm font-bold w-8">{stats.lowRisk}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t({ en: 'Risk Status', ar: 'حالة المخاطر' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {STATUS_OPTIONS.map(status => {
                    const count = (data.risks || []).filter(r => r.status === status.value).length;
                    return (
                      <div key={status.value} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <status.icon className={cn("w-5 h-5", status.color)} />
                        <div>
                          <div className="text-lg font-bold">{count}</div>
                          <div className="text-xs text-muted-foreground">{status.label[language]}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  {t({ en: 'By Category', ar: 'حسب الفئة' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(stats.categoryCount).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">{t({ en: 'No data', ar: 'لا توجد بيانات' })}</p>
                ) : (
                  Object.entries(stats.categoryCount).map(([code, count]) => {
                    const cat = riskCategories.find(c => c.code === code);
                    return (
                      <div key={code} className="flex items-center justify-between">
                        <span className="text-sm">{cat?.[`name_${language}`] || code}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Data Quality */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {t({ en: 'Data Quality', ar: 'جودة البيانات' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t({ en: 'Mitigation Coverage', ar: 'تغطية التخفيف' })}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={stats.mitigationRate} className="w-20 h-2" />
                    <span className="text-sm font-medium">{stats.mitigationRate}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t({ en: 'Owner Assignment', ar: 'تعيين المالك' })}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={stats.ownershipRate} className="w-20 h-2" />
                    <span className="text-sm font-medium">{stats.ownershipRate}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t({ en: 'Contingency Plans', ar: 'خطط الطوارئ' })}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={stats.total > 0 ? (stats.withContingency / stats.total) * 100 : 0} className="w-20 h-2" />
                    <span className="text-sm font-medium">{stats.total > 0 ? Math.round((stats.withContingency / stats.total) * 100) : 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                {t({ en: 'Recommendations', ar: 'التوصيات' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {stats.total < 3 && (
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    {t({ en: 'Identify at least 3-5 strategic risks for comprehensive coverage', ar: 'حدد 3-5 مخاطر استراتيجية على الأقل لتغطية شاملة' })}
                  </li>
                )}
                {stats.mitigationRate < 100 && (
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    {t({ en: 'Define mitigation strategies for all identified risks', ar: 'حدد استراتيجيات التخفيف لجميع المخاطر المحددة' })}
                  </li>
                )}
                {stats.ownershipRate < 100 && (
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    {t({ en: 'Assign owners to all risks for clear accountability', ar: 'عيّن مالكين لجميع المخاطر لمساءلة واضحة' })}
                  </li>
                )}
                {stats.highRisk > 0 && stats.withContingency < stats.highRisk && (
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    {t({ en: 'High-risk items should have contingency plans', ar: 'يجب أن يكون للمخاطر العالية خطط طوارئ' })}
                  </li>
                )}
                {!data.risk_appetite && (
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    {t({ en: 'Define organizational risk appetite to guide risk management decisions', ar: 'حدد تحمل المنظمة للمخاطر لتوجيه قرارات إدارة المخاطر' })}
                  </li>
                )}
                {completenessScore >= 80 && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {t({ en: 'Risk assessment is well-documented. Review periodically.', ar: 'تقييم المخاطر موثق جيداً. راجعه دورياً.' })}
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
