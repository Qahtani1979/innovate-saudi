import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, XCircle, Clock, SkipForward, 
  ChevronLeft, ChevronRight, PlayCircle, Pause,
  AlertTriangle, Shield, Zap, Info, CheckCheck,
  RotateCcw, Save
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { VALIDATION_CATEGORIES } from '@/constants/validationCategories';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  pending: {
    label: { en: 'Pending', ar: 'قيد الانتظار' },
    icon: Clock,
    color: 'bg-muted text-muted-foreground',
    bgColor: 'bg-muted/30'
  },
  checked: {
    label: { en: 'Checked', ar: 'تم الفحص' },
    icon: CheckCircle2,
    color: 'bg-green-500 text-white',
    bgColor: 'bg-green-50 dark:bg-green-950/20'
  },
  not_applicable: {
    label: { en: 'N/A', ar: 'غير متاح' },
    icon: SkipForward,
    color: 'bg-slate-400 text-white',
    bgColor: 'bg-slate-50 dark:bg-slate-900/20'
  },
  skipped: {
    label: { en: 'Skipped', ar: 'تم التخطي' },
    icon: XCircle,
    color: 'bg-amber-500 text-white',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20'
  }
};

const PRIORITY_CONFIG = {
  critical: { label: { en: 'Critical', ar: 'حرج' }, color: 'bg-destructive text-destructive-foreground' },
  high: { label: { en: 'High', ar: 'عالي' }, color: 'bg-orange-500 text-white' },
  medium: { label: { en: 'Medium', ar: 'متوسط' }, color: 'bg-yellow-500 text-white' },
  low: { label: { en: 'Low', ar: 'منخفض' }, color: 'bg-muted text-muted-foreground' }
};

export function ExpertValidationPanel({ 
  systemId, 
  systemName,
  validationMap = {},
  onStatusChange,
  onBulkStatusChange,
  onSaveProgress,
  isLoading = false 
}) {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState(VALIDATION_CATEGORIES[0]?.id);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [currentCheckIndex, setCurrentCheckIndex] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Get current category and subcategory
  const currentCategory = useMemo(() => 
    VALIDATION_CATEGORIES.find(c => c.id === activeCategory),
    [activeCategory]
  );

  // Get all checks for current category
  const categoryChecks = useMemo(() => {
    if (!currentCategory) return [];
    const checks = [];
    currentCategory.subcategories.forEach((sub, subIdx) => {
      sub.checks.forEach((check, checkIdx) => {
        checks.push({
          ...check,
          categoryId: currentCategory.id,
          subcategoryId: sub.id,
          subcategoryName: sub.name,
          globalIndex: checks.length
        });
      });
    });
    return checks;
  }, [currentCategory]);

  // Current check being validated
  const currentCheck = categoryChecks[currentCheckIndex] || null;

  // Get status for a check
  const getStatus = (checkId) => {
    const val = validationMap[checkId];
    if (!val) return 'pending';
    return val.status || (val.isChecked ? 'checked' : 'pending');
  };

  // Category stats
  const getCategoryStats = (category) => {
    let total = 0, checked = 0, pending = 0, na = 0, skipped = 0;
    category.subcategories.forEach(sub => {
      sub.checks.forEach(check => {
        total++;
        const status = getStatus(check.id);
        if (status === 'checked') checked++;
        else if (status === 'not_applicable') na++;
        else if (status === 'skipped') skipped++;
        else pending++;
      });
    });
    return { total, checked, pending, na, skipped, progress: total > 0 ? Math.round(((checked + na) / total) * 100) : 0 };
  };

  // Handle status change for current check
  const handleStatusChange = async (status) => {
    if (!currentCheck || isLoading) return;
    
    const isChecked = status === 'checked';
    await onStatusChange({
      systemId,
      systemName,
      categoryId: currentCheck.categoryId,
      checkId: currentCheck.id,
      isChecked,
      status
    });

    // Auto-advance to next check
    if (autoAdvance && currentCheckIndex < categoryChecks.length - 1) {
      setCurrentCheckIndex(prev => prev + 1);
    }
  };

  // Mark all checks in subcategory
  const handleBulkMark = async (subcategoryId, status) => {
    if (!currentCategory || isLoading) return;
    
    const subcategory = currentCategory.subcategories.find(s => s.id === subcategoryId);
    if (!subcategory) return;

    const updates = subcategory.checks.map(check => ({
      systemId,
      systemName,
      categoryId: currentCategory.id,
      checkId: check.id,
      isChecked: status === 'checked',
      status
    }));

    await onBulkStatusChange?.(updates);
  };

  // Mark all checks in category
  const handleMarkAllCategory = async (status) => {
    if (!currentCategory || isLoading) return;

    const updates = [];
    currentCategory.subcategories.forEach(sub => {
      sub.checks.forEach(check => {
        updates.push({
          systemId,
          systemName,
          categoryId: currentCategory.id,
          checkId: check.id,
          isChecked: status === 'checked',
          status
        });
      });
    });

    await onBulkStatusChange?.(updates);
  };

  // Navigate to next/prev check
  const goToCheck = (index) => {
    if (index >= 0 && index < categoryChecks.length) {
      setCurrentCheckIndex(index);
    }
  };

  // Navigate to next/prev category
  const goToCategory = (direction) => {
    const currentIdx = VALIDATION_CATEGORIES.findIndex(c => c.id === activeCategory);
    const newIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
    if (newIdx >= 0 && newIdx < VALIDATION_CATEGORIES.length) {
      setActiveCategory(VALIDATION_CATEGORIES[newIdx].id);
      setCurrentCheckIndex(0);
    }
  };

  const currentStats = currentCategory ? getCategoryStats(currentCategory) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Left: Category Navigator */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            {t({ en: 'Categories', ar: 'الفئات' })}
          </CardTitle>
          <CardDescription className="text-xs">
            {t({ en: '16 validation layers', ar: '16 طبقة تحقق' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          <ScrollArea className="h-[400px]">
            <div className="space-y-1 pr-2">
              {VALIDATION_CATEGORIES.map((category, idx) => {
                const stats = getCategoryStats(category);
                const isActive = category.id === activeCategory;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setCurrentCheckIndex(0);
                    }}
                    className={cn(
                      "w-full p-2 rounded-lg text-left transition-all text-xs",
                      isActive 
                        ? "bg-primary/10 border-2 border-primary" 
                        : "hover:bg-muted border-2 border-transparent"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate flex-1">{idx + 1}. {t(category.name).split('.')[1] || t(category.name)}</span>
                      <Badge 
                        variant={stats.progress === 100 ? 'default' : 'secondary'} 
                        className="text-[10px] ml-1"
                      >
                        {stats.progress}%
                      </Badge>
                    </div>
                    <Progress value={stats.progress} className="h-1" />
                    <div className="flex gap-1 mt-1 text-[9px] text-muted-foreground">
                      <span className="text-green-600">{stats.checked}✓</span>
                      <span className="text-amber-600">{stats.pending}○</span>
                      {stats.na > 0 && <span className="text-slate-500">{stats.na}N/A</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Center: Current Check Focus */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              {currentCategory && t(currentCategory.name)}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoAdvance(!autoAdvance)}
                className="h-7 text-xs gap-1"
              >
                {autoAdvance ? <PlayCircle className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                {t({ en: autoAdvance ? 'Auto' : 'Manual', ar: autoAdvance ? 'تلقائي' : 'يدوي' })}
              </Button>
            </div>
          </div>
          {currentStats && (
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{currentStats.checked}/{currentStats.total} {t({ en: 'checked', ar: 'تم الفحص' })}</span>
              <Progress value={currentStats.progress} className="flex-1 h-2" />
              <span>{currentStats.progress}%</span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Current Check Card */}
          {currentCheck ? (
            <div className="space-y-4">
              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToCheck(currentCheckIndex - 1)}
                  disabled={currentCheckIndex === 0}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t({ en: 'Prev', ar: 'السابق' })}
                </Button>
                <span className="text-sm font-medium">
                  {currentCheckIndex + 1} / {categoryChecks.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToCheck(currentCheckIndex + 1)}
                  disabled={currentCheckIndex === categoryChecks.length - 1}
                  className="gap-1"
                >
                  {t({ en: 'Next', ar: 'التالي' })}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Check Details */}
              <Card className={cn(
                "border-2 transition-all",
                STATUS_CONFIG[getStatus(currentCheck.id)]?.bgColor
              )}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Badge className={cn("shrink-0", PRIORITY_CONFIG[currentCheck.priority]?.color)}>
                      {t(PRIORITY_CONFIG[currentCheck.priority]?.label)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {currentCheck.id}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {t(currentCheck.subcategoryName)}
                  </p>
                  
                  <p className="text-lg font-medium mb-4">
                    {t(currentCheck.text)}
                  </p>

                  <Separator className="my-4" />

                  {/* Status Actions */}
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                      const Icon = config.icon;
                      const isActive = getStatus(currentCheck.id) === status;
                      
                      return (
                        <Button
                          key={status}
                          variant={isActive ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleStatusChange(status)}
                          disabled={isLoading}
                          className={cn(
                            "flex-col h-auto py-3 gap-1",
                            isActive && config.color
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-[10px]">{t(config.label)}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Jump */}
              <div className="flex flex-wrap gap-1">
                {categoryChecks.map((check, idx) => {
                  const status = getStatus(check.id);
                  const StatusIcon = STATUS_CONFIG[status]?.icon || Clock;
                  
                  return (
                    <button
                      key={check.id}
                      onClick={() => goToCheck(idx)}
                      className={cn(
                        "w-6 h-6 rounded text-[10px] flex items-center justify-center transition-all",
                        idx === currentCheckIndex 
                          ? "ring-2 ring-primary ring-offset-2" 
                          : "",
                        status === 'checked' && "bg-green-100 text-green-700 dark:bg-green-900/40",
                        status === 'not_applicable' && "bg-slate-100 text-slate-500 dark:bg-slate-800/40",
                        status === 'skipped' && "bg-amber-100 text-amber-700 dark:bg-amber-900/40",
                        status === 'pending' && "bg-muted text-muted-foreground"
                      )}
                      title={t(check.text)}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>{t({ en: 'No checks available', ar: 'لا توجد فحوصات متاحة' })}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right: Subcategory Overview */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            {t({ en: 'Subcategories', ar: 'الفئات الفرعية' })}
          </CardTitle>
          <div className="flex gap-1 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMarkAllCategory('checked')}
              disabled={isLoading}
              className="flex-1 text-xs h-7"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              {t({ en: 'All ✓', ar: 'الكل ✓' })}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMarkAllCategory('not_applicable')}
              disabled={isLoading}
              className="flex-1 text-xs h-7"
            >
              {t({ en: 'All N/A', ar: 'الكل N/A' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <ScrollArea className="h-[350px]">
            <div className="space-y-2 pr-2">
              {currentCategory?.subcategories.map(sub => {
                let checked = 0, total = sub.checks.length;
                sub.checks.forEach(c => {
                  if (getStatus(c.id) === 'checked' || getStatus(c.id) === 'not_applicable') checked++;
                });
                const progress = total > 0 ? Math.round((checked / total) * 100) : 0;
                
                return (
                  <div key={sub.id} className="p-2 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium truncate flex-1">{t(sub.name)}</span>
                      <Badge variant={progress === 100 ? 'default' : 'secondary'} className="text-[10px]">
                        {checked}/{total}
                      </Badge>
                    </div>
                    <Progress value={progress} className="h-1 mb-2" />
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBulkMark(sub.id, 'checked')}
                        disabled={isLoading}
                        className="flex-1 h-6 text-[10px] text-green-600"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t({ en: 'All ✓', ar: 'الكل ✓' })}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBulkMark(sub.id, 'not_applicable')}
                        disabled={isLoading}
                        className="flex-1 h-6 text-[10px] text-slate-500"
                      >
                        N/A
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
        
        {/* Save & Navigate */}
        <div className="p-3 border-t space-y-2">
          <Button
            onClick={onSaveProgress}
            disabled={isLoading}
            className="w-full gap-2"
            size="sm"
          >
            <Save className="h-4 w-4" />
            {t({ en: 'Save Progress', ar: 'حفظ التقدم' })}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToCategory('prev')}
              disabled={VALIDATION_CATEGORIES.findIndex(c => c.id === activeCategory) === 0}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToCategory('next')}
              disabled={VALIDATION_CATEGORIES.findIndex(c => c.id === activeCategory) === VALIDATION_CATEGORIES.length - 1}
              className="flex-1"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ExpertValidationPanel;
