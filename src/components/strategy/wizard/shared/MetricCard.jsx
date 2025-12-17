import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Plus, X, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Info,
  Target, TrendingUp, TrendingDown, Activity, Gauge, BarChart3, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '../../../LanguageContext';
import { BilingualInput, BilingualTextarea } from './BilingualFieldPair';

/**
 * MetricCard - Reusable card for KPIs, Risks, and other measurable items
 * 
 * @param {Object} props
 * @param {Object} props.metric - Metric data
 * @param {number} props.index - Index in the list
 * @param {Function} props.onUpdate - Callback to update metric (field, value)
 * @param {Function} props.onRemove - Callback to remove metric
 * @param {boolean} props.isReadOnly - Disable editing
 * @param {boolean} props.isExpanded - Expansion state
 * @param {Function} props.onToggleExpand - Toggle expansion
 * @param {string} props.metricType - Type: 'kpi' | 'risk' | 'milestone' | 'custom'
 * @param {Object} props.fieldConfig - Custom field configuration
 * @param {Object} props.linkedEntity - Optional linked entity (objective, etc.)
 * @param {number} props.qualityScore - Optional quality/completeness score (0-100)
 */
export function MetricCard({
  metric,
  index,
  onUpdate,
  onRemove,
  isReadOnly = false,
  isExpanded = false,
  onToggleExpand,
  metricType = 'kpi',
  fieldConfig,
  linkedEntity,
  qualityScore,
  className
}) {
  const { language, t, isRTL } = useLanguage();
  
  // Default field configurations by type
  const defaultConfigs = {
    kpi: {
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      fields: [
        { key: 'name', type: 'bilingual', label: { en: 'KPI Name', ar: 'اسم المؤشر' }, required: true },
        { 
          key: 'category', type: 'select', label: { en: 'Category', ar: 'الفئة' },
          options: [
            { value: 'outcome', label: { en: 'Outcome', ar: 'نتيجة' }, icon: Target },
            { value: 'output', label: { en: 'Output', ar: 'مخرجات' }, icon: BarChart3 },
            { value: 'process', label: { en: 'Process', ar: 'عملية' }, icon: TrendingUp },
            { value: 'input', label: { en: 'Input', ar: 'مدخلات' }, icon: Gauge }
          ]
        },
        { key: 'unit', type: 'text', label: { en: 'Unit', ar: 'الوحدة' }, placeholder: { en: '%', ar: '%' } },
        { key: 'baseline_value', type: 'number', label: { en: 'Baseline', ar: 'خط الأساس' } },
        { key: 'target_value', type: 'number', label: { en: 'Target', ar: 'المستهدف' } },
        { 
          key: 'frequency', type: 'select', label: { en: 'Frequency', ar: 'التكرار' },
          options: [
            { value: 'monthly', label: { en: 'Monthly', ar: 'شهري' } },
            { value: 'quarterly', label: { en: 'Quarterly', ar: 'ربع سنوي' } },
            { value: 'annual', label: { en: 'Annual', ar: 'سنوي' } }
          ]
        },
        { key: 'owner', type: 'text', label: { en: 'Owner', ar: 'المسؤول' } },
        { key: 'data_source', type: 'text', label: { en: 'Data Source', ar: 'مصدر البيانات' } }
      ]
    },
    risk: {
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      fields: [
        { key: 'name', type: 'bilingual', label: { en: 'Risk Description', ar: 'وصف المخاطر' }, required: true },
        { 
          key: 'likelihood', type: 'select', label: { en: 'Likelihood', ar: 'الاحتمالية' },
          options: [
            { value: 'high', label: { en: 'High', ar: 'مرتفع' }, color: 'text-red-600' },
            { value: 'medium', label: { en: 'Medium', ar: 'متوسط' }, color: 'text-yellow-600' },
            { value: 'low', label: { en: 'Low', ar: 'منخفض' }, color: 'text-green-600' }
          ]
        },
        { 
          key: 'impact', type: 'select', label: { en: 'Impact', ar: 'التأثير' },
          options: [
            { value: 'high', label: { en: 'High', ar: 'مرتفع' }, color: 'text-red-600' },
            { value: 'medium', label: { en: 'Medium', ar: 'متوسط' }, color: 'text-yellow-600' },
            { value: 'low', label: { en: 'Low', ar: 'منخفض' }, color: 'text-green-600' }
          ]
        },
        { key: 'mitigation', type: 'bilingual-textarea', label: { en: 'Mitigation Strategy', ar: 'استراتيجية التخفيف' } },
        { key: 'owner', type: 'text', label: { en: 'Risk Owner', ar: 'مسؤول المخاطر' } },
        { 
          key: 'status', type: 'select', label: { en: 'Status', ar: 'الحالة' },
          options: [
            { value: 'identified', label: { en: 'Identified', ar: 'محدد' } },
            { value: 'monitoring', label: { en: 'Monitoring', ar: 'مراقبة' } },
            { value: 'mitigating', label: { en: 'Mitigating', ar: 'تخفيف' } },
            { value: 'closed', label: { en: 'Closed', ar: 'مغلق' } }
          ]
        }
      ]
    },
    milestone: {
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      fields: [
        { key: 'name', type: 'bilingual', label: { en: 'Milestone', ar: 'المرحلة' }, required: true },
        { key: 'due_date', type: 'date', label: { en: 'Due Date', ar: 'تاريخ الاستحقاق' } },
        { 
          key: 'status', type: 'select', label: { en: 'Status', ar: 'الحالة' },
          options: [
            { value: 'pending', label: { en: 'Pending', ar: 'قيد الانتظار' } },
            { value: 'in_progress', label: { en: 'In Progress', ar: 'قيد التنفيذ' } },
            { value: 'completed', label: { en: 'Completed', ar: 'مكتمل' } },
            { value: 'delayed', label: { en: 'Delayed', ar: 'متأخر' } }
          ]
        },
        { key: 'deliverables', type: 'bilingual-textarea', label: { en: 'Deliverables', ar: 'المخرجات' } }
      ]
    }
  };
  
  const config = fieldConfig || defaultConfigs[metricType] || defaultConfigs.kpi;
  const Icon = config.icon;
  
  // Get display name
  const displayName = metric.name_en || metric.name_ar || metric.name || 
                      t({ en: `${metricType.charAt(0).toUpperCase() + metricType.slice(1)} ${index + 1}`, 
                          ar: `${metricType === 'kpi' ? 'مؤشر' : metricType === 'risk' ? 'خطر' : 'مرحلة'} ${index + 1}` });
  
  // Calculate risk score if applicable
  const riskScore = metricType === 'risk' ? calculateRiskScore(metric) : null;
  
  // Render field based on type
  const renderField = (field) => {
    const value = metric[field.key];
    
    switch (field.type) {
      case 'bilingual':
        return (
          <BilingualInput
            label={field.label}
            value={{ en: metric[`${field.key}_en`] || '', ar: metric[`${field.key}_ar`] || '' }}
            onChange={(lang, val) => onUpdate(`${field.key}_${lang}`, val)}
            disabled={isReadOnly}
            compact
          />
        );
      
      case 'bilingual-textarea':
        return (
          <BilingualTextarea
            label={field.label}
            value={{ en: metric[`${field.key}_en`] || '', ar: metric[`${field.key}_ar`] || '' }}
            onChange={(lang, val) => onUpdate(`${field.key}_${lang}`, val)}
            disabled={isReadOnly}
            rows={2}
            compact
          />
        );
      
      case 'select':
        return (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t(field.label)}</Label>
            <Select 
              value={metric[field.key] || 'none'} 
              onValueChange={(v) => onUpdate(field.key, v !== 'none' ? v : null)}
              disabled={isReadOnly}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={t({ en: 'Select...', ar: 'اختر...' })} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map(opt => {
                  const OptionIcon = opt.icon;
                  return (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className={cn('flex items-center gap-2', opt.color)}>
                        {OptionIcon && <OptionIcon className="h-3 w-3" />}
                        {t(opt.label)}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        );
      
      case 'number':
        return (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t(field.label)}</Label>
            <Input
              type="number"
              value={metric[field.key] ?? ''}
              onChange={(e) => onUpdate(field.key, e.target.value)}
              disabled={isReadOnly}
              className="h-8 text-sm"
              placeholder={t(field.placeholder || field.label)}
            />
          </div>
        );
      
      case 'date':
        return (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t(field.label)}</Label>
            <Input
              type="date"
              value={metric[field.key] || ''}
              onChange={(e) => onUpdate(field.key, e.target.value)}
              disabled={isReadOnly}
              className="h-8 text-sm"
            />
          </div>
        );
      
      case 'text':
      default:
        return (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t(field.label)}</Label>
            <Input
              value={metric[field.key] || ''}
              onChange={(e) => onUpdate(field.key, e.target.value)}
              disabled={isReadOnly}
              className="h-8 text-sm"
              placeholder={t(field.placeholder || field.label)}
            />
          </div>
        );
    }
  };
  
  // Quality indicator
  const getQualityIndicator = () => {
    if (qualityScore === undefined) return null;
    
    const color = qualityScore >= 80 ? 'text-green-600' : 
                  qualityScore >= 60 ? 'text-blue-600' : 
                  qualityScore >= 40 ? 'text-amber-600' : 'text-red-600';
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={cn('text-xs', color)}>
              {qualityScore}%
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t({ en: 'Completeness Score', ar: 'درجة الاكتمال' })}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  return (
    <Card className={cn(
      'transition-all',
      isExpanded ? config.bgColor : 'hover:bg-muted/30',
      className
    )}>
      <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn('p-1.5 rounded-lg', config.bgColor)}>
                  <Icon className={cn('h-4 w-4', config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm truncate">
                    {displayName}
                  </CardTitle>
                  {linkedEntity && (
                    <CardDescription className="text-xs truncate">
                      {linkedEntity.name_en || linkedEntity.name_ar}
                    </CardDescription>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {riskScore !== null && (
                  <RiskScoreBadge score={riskScore} />
                )}
                {getQualityIndicator()}
                {!isReadOnly && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove?.();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.fields.map((field) => (
                <div key={field.key} className={field.type.includes('textarea') ? 'md:col-span-2' : ''}>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

/**
 * RiskScoreBadge - Display risk level badge
 */
function RiskScoreBadge({ score }) {
  const { t } = useLanguage();
  
  const config = score >= 6 ? { label: { en: 'High', ar: 'مرتفع' }, color: 'bg-red-100 text-red-700' }
               : score >= 3 ? { label: { en: 'Medium', ar: 'متوسط' }, color: 'bg-amber-100 text-amber-700' }
               : { label: { en: 'Low', ar: 'منخفض' }, color: 'bg-green-100 text-green-700' };
  
  return (
    <Badge className={cn('text-xs', config.color)}>
      {t(config.label)}
    </Badge>
  );
}

/**
 * Calculate risk score from likelihood and impact
 */
function calculateRiskScore(risk) {
  const values = { high: 3, medium: 2, low: 1 };
  const likelihood = values[risk.likelihood] || 0;
  const impact = values[risk.impact] || 0;
  return likelihood * impact;
}

/**
 * MetricList - List of metric cards with add functionality
 */
export function MetricList({
  metrics = [],
  onAdd,
  onUpdate,
  onRemove,
  isReadOnly = false,
  metricType = 'kpi',
  emptyMessage,
  className
}) {
  const { t } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState(null);
  
  return (
    <div className={cn('space-y-3', className)}>
      {metrics.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{emptyMessage || t({ en: 'No items yet', ar: 'لا توجد عناصر بعد' })}</p>
          {!isReadOnly && (
            <Button variant="outline" size="sm" onClick={onAdd} className="mt-3">
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'Add First Item', ar: 'إضافة أول عنصر' })}
            </Button>
          )}
        </div>
      ) : (
        <>
          {metrics.map((metric, index) => (
            <MetricCard
              key={metric.id || index}
              metric={metric}
              index={index}
              onUpdate={(field, value) => onUpdate(index, field, value)}
              onRemove={() => onRemove(index)}
              isReadOnly={isReadOnly}
              isExpanded={expandedIndex === index}
              onToggleExpand={() => setExpandedIndex(expandedIndex === index ? null : index)}
              metricType={metricType}
            />
          ))}
          {!isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAdd}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: `Add ${metricType.charAt(0).toUpperCase() + metricType.slice(1)}`, 
                   ar: `إضافة ${metricType === 'kpi' ? 'مؤشر' : metricType === 'risk' ? 'خطر' : 'عنصر'}` })}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export default MetricCard;
