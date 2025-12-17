import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Plus, X, ChevronDown, ChevronUp, CheckCircle2, AlertCircle,
  TrendingUp, TrendingDown, Minus, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '../../../LanguageContext';
import { BilingualInput, BilingualTextarea } from './BilingualFieldPair';

/**
 * AnalysisCard - Reusable card for SWOT/PESTEL style analysis items
 * 
 * @param {Object} props
 * @param {Object} props.category - Category config { key, title, description, icon, color, bgColor }
 * @param {Array} props.items - Array of analysis items
 * @param {Function} props.onAddItem - Callback to add new item
 * @param {Function} props.onUpdateItem - Callback to update item (index, field, value)
 * @param {Function} props.onRemoveItem - Callback to remove item (index)
 * @param {boolean} props.isReadOnly - Disable editing
 * @param {string} props.itemType - Type of analysis: 'swot' | 'pestel'
 * @param {Object} props.fieldConfig - Custom field configuration
 */
export function AnalysisCard({
  category,
  items = [],
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  isReadOnly = false,
  itemType = 'swot',
  fieldConfig,
  defaultExpanded = true,
  showCount = true,
  className
}) {
  const { language, t, isRTL } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const Icon = category.icon;
  
  // Default field configurations
  const defaultFields = {
    swot: [
      { key: 'text', type: 'bilingual', label: { en: 'Description', ar: 'الوصف' }, required: true },
      { 
        key: 'priority', 
        type: 'select', 
        label: { en: 'Priority', ar: 'الأولوية' },
        options: [
          { value: 'high', label: { en: 'High', ar: 'عالي' }, color: 'text-red-600 bg-red-100' },
          { value: 'medium', label: { en: 'Medium', ar: 'متوسط' }, color: 'text-yellow-600 bg-yellow-100' },
          { value: 'low', label: { en: 'Low', ar: 'منخفض' }, color: 'text-green-600 bg-green-100' }
        ]
      }
    ],
    pestel: [
      { key: 'factor', type: 'bilingual', label: { en: 'Factor', ar: 'العامل' }, required: true },
      { 
        key: 'impact', 
        type: 'select', 
        label: { en: 'Impact', ar: 'التأثير' },
        options: [
          { value: 'high', label: { en: 'High', ar: 'مرتفع' }, color: 'text-red-600 bg-red-100', icon: Target },
          { value: 'medium', label: { en: 'Medium', ar: 'متوسط' }, color: 'text-yellow-600 bg-yellow-100', icon: AlertCircle },
          { value: 'low', label: { en: 'Low', ar: 'منخفض' }, color: 'text-green-600 bg-green-100', icon: Minus }
        ]
      },
      { 
        key: 'trend', 
        type: 'select', 
        label: { en: 'Trend', ar: 'الاتجاه' },
        options: [
          { value: 'growing', label: { en: 'Growing', ar: 'متنامي' }, color: 'text-green-500', icon: TrendingUp },
          { value: 'stable', label: { en: 'Stable', ar: 'مستقر' }, color: 'text-gray-500', icon: Minus },
          { value: 'declining', label: { en: 'Declining', ar: 'متراجع' }, color: 'text-red-500', icon: TrendingDown }
        ]
      },
      { key: 'implications', type: 'bilingual-textarea', label: { en: 'Implications', ar: 'التداعيات' } }
    ]
  };
  
  const fields = fieldConfig || defaultFields[itemType] || defaultFields.swot;
  
  // Check if item is complete
  const isItemComplete = (item) => {
    const requiredFields = fields.filter(f => f.required);
    return requiredFields.every(f => {
      const value = item[f.key];
      if (f.type === 'bilingual' || f.type === 'bilingual-textarea') {
        return (value?.en || value?.ar);
      }
      return value && value !== '';
    });
  };
  
  const completeCount = items.filter(isItemComplete).length;
  
  // Render field based on type
  const renderField = (field, item, index) => {
    const value = item[field.key];
    
    switch (field.type) {
      case 'bilingual':
        return (
          <BilingualInput
            label={field.label}
            value={{ en: item[`${field.key}_en`] || value?.en || '', ar: item[`${field.key}_ar`] || value?.ar || '' }}
            onChange={(lang, val) => onUpdateItem(index, `${field.key}_${lang}`, val)}
            disabled={isReadOnly}
            compact
          />
        );
      
      case 'bilingual-textarea':
        return (
          <BilingualTextarea
            label={field.label}
            value={{ en: item[`${field.key}_en`] || value?.en || '', ar: item[`${field.key}_ar`] || value?.ar || '' }}
            onChange={(lang, val) => onUpdateItem(index, `${field.key}_${lang}`, val)}
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
              value={item[field.key] || 'none'} 
              onValueChange={(v) => onUpdateItem(index, field.key, v !== 'none' ? v : null)}
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
      
      case 'text':
        return (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t(field.label)}</Label>
            <Input
              value={item[field.key] || ''}
              onChange={(e) => onUpdateItem(index, field.key, e.target.value)}
              disabled={isReadOnly}
              className="h-8 text-sm"
              placeholder={t(field.placeholder || field.label)}
            />
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Card className={cn(
      'transition-all',
      category.bgColor || 'bg-card',
      className
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className={cn('p-2 rounded-lg', category.badgeColor ? `${category.badgeColor}/20` : 'bg-primary/10')}>
                    <Icon className={cn('h-5 w-5', category.color || 'text-primary')} />
                  </div>
                )}
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {t(category.title)}
                    {showCount && (
                      <Badge variant="secondary" className="text-xs">
                        {completeCount}/{items.length}
                      </Badge>
                    )}
                  </CardTitle>
                  {category.description && (
                    <CardDescription className="text-xs mt-0.5">
                      {t(category.description)}
                    </CardDescription>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isReadOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddItem?.();
                    }}
                    className="h-7 px-2"
                  >
                    <Plus className="h-4 w-4" />
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
          <CardContent className="pt-0 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                {t({ en: 'No items yet. Click + to add one.', ar: 'لا توجد عناصر بعد. انقر + للإضافة.' })}
              </div>
            ) : (
              items.map((item, index) => (
                <div 
                  key={item.id || index}
                  className={cn(
                    'p-3 rounded-lg border bg-background/50 relative group',
                    isItemComplete(item) ? 'border-green-200 dark:border-green-800' : 'border-muted'
                  )}
                >
                  {/* Completion indicator */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    {isItemComplete(item) ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    {!isReadOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onRemoveItem?.(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Fields */}
                  <div className="space-y-3 pr-16">
                    {fields.map((field) => (
                      <div key={field.key}>
                        {renderField(field, item, index)}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
            
            {/* Add button at bottom */}
            {!isReadOnly && items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddItem}
                className="w-full border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add Item', ar: 'إضافة عنصر' })}
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

/**
 * AnalysisMatrix - 2x2 matrix display for SWOT/similar analyses
 */
export function AnalysisMatrix({
  categories,
  data,
  className
}) {
  const { t } = useLanguage();
  
  return (
    <div className={cn('grid grid-cols-2 gap-4', className)}>
      {categories.map((category) => {
        const items = data[category.key] || [];
        const Icon = category.icon;
        
        return (
          <Card key={category.key} className={cn('overflow-hidden', category.bgColor)}>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                {Icon && <Icon className={cn('h-4 w-4', category.color)} />}
                {t(category.title)}
                <Badge variant="secondary" className="text-xs ml-auto">
                  {items.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  {t({ en: 'No items', ar: 'لا توجد عناصر' })}
                </p>
              ) : (
                <ul className="space-y-1">
                  {items.slice(0, 5).map((item, idx) => (
                    <li key={idx} className="text-xs flex items-start gap-2">
                      <span className={cn('mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0', category.badgeColor)} />
                      <span className="line-clamp-2">
                        {item.text_en || item.factor_en || item.text || item.factor || '-'}
                      </span>
                    </li>
                  ))}
                  {items.length > 5 && (
                    <li className="text-xs text-muted-foreground">
                      +{items.length - 5} {t({ en: 'more', ar: 'المزيد' })}
                    </li>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default AnalysisCard;
