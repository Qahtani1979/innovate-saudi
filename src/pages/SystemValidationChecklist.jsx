import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { useSystemValidation } from '@/hooks/useSystemValidation';
import { PLATFORM_SYSTEMS } from '@/constants/platformSystems';
import { VALIDATION_CATEGORIES } from '@/constants/validationCategories';
import { useIsMobile } from '@/hooks/use-mobile';
import ExpertValidationPanel from '@/components/validation/ExpertValidationPanel';
import { 
  ClipboardCheck, Database, Shield, Code, Users, GitBranch, Bell, 
  FileText, Eye, Lock, Search, Download, RefreshCw, CheckCircle2,
  AlertTriangle, XCircle, Layers, Activity, Settings, Server, 
  Globe, FolderOpen, BookOpen, Zap, Menu, Save, ChevronRight,
  LayoutGrid, Navigation, UserCog, Palette, Sparkles
} from 'lucide-react';
// Use validation categories from constants with icon mapping
const categoryIcons = {
  database: Database,
  hooks: Code,
  components: Layers,
  api: Server,
  permissions: Shield,
  workflow: GitBranch,
  notifications: Bell,
  audit: FileText,
  uiux: Eye,
  integration: Globe,
  documentation: BookOpen,
  security: Lock,
  pages: LayoutGrid,
  navigation: Navigation,
  roles: UserCog,
  design: Palette
};

const validationCategories = VALIDATION_CATEGORIES.map(cat => ({
  ...cat,
  icon: categoryIcons[cat.id] || Layers
}));

function SystemValidationChecklist() {
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  const [selectedSystemId, setSelectedSystemId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [validationMode, setValidationMode] = useState('standard'); // 'standard' or 'expert'
  
  const { 
    validationMap, 
    summaries,
    dynamicProgress, // Use dynamic progress for real-time updates
    isLoading, 
    toggleCheck, 
    bulkStatusChange,
    updateSummary, 
    resetSystem,
    initializeSystem,
    systems 
  } = useSystemValidation(selectedSystemId);

  // Auto-initialize checks when system is selected
  React.useEffect(() => {
    if (selectedSystemId && !isLoading) {
      const selectedSystem = systems.find(s => s.id === selectedSystemId);
      if (selectedSystem) {
        initializeSystem.mutate({ 
          systemId: selectedSystemId, 
          systemName: selectedSystem.name.en 
        });
      }
    }
  }, [selectedSystemId]);

  const selectedSystem = systems.find(s => s.id === selectedSystemId);

  // Calculate totals
  const getTotalChecks = () => {
    let total = 0;
    validationCategories.forEach(cat => {
      cat.subcategories.forEach(sub => {
        total += sub.checks.length;
      });
    });
    return total;
  };

  // Helper to check if a validation is checked (handles new structure)
  const isChecked = (checkId) => {
    const val = validationMap[checkId];
    if (!val) return false;
    // Handle both old (boolean) and new ({ isChecked, status }) structure
    return typeof val === 'boolean' ? val : val.isChecked;
  };

  // Helper to check if N/A
  const isNotApplicable = (checkId) => {
    const val = validationMap[checkId];
    return val?.status === 'not_applicable';
  };

  const getCompletedChecks = () => {
    return Object.entries(validationMap).filter(([_, val]) => {
      if (typeof val === 'boolean') return val;
      return val?.isChecked && val?.status !== 'not_applicable';
    }).length;
  };

  const getCategoryProgress = (category) => {
    let total = 0;
    let completed = 0;
    category.subcategories.forEach(sub => {
      sub.checks.forEach(check => {
        total++;
        if (isChecked(check.id)) completed++;
      });
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getCriticalCount = () => {
    let total = 0;
    let completed = 0;
    validationCategories.forEach(cat => {
      cat.subcategories.forEach(sub => {
        sub.checks.forEach(check => {
          if (check.priority === 'critical') {
            total++;
            if (isChecked(check.id)) completed++;
          }
        });
      });
    });
    return { total, completed };
  };

  const handleCheck = async (checkId, categoryId) => {
    if (!selectedSystemId || !selectedSystem) return;
    
    // Don't allow changing N/A checks
    if (isNotApplicable(checkId)) return;
    
    const newValue = !isChecked(checkId);
    await toggleCheck.mutateAsync({
      systemId: selectedSystemId,
      systemName: t(selectedSystem.name),
      categoryId,
      checkId,
      isChecked: newValue
    });
  };

  const handleSaveProgress = async () => {
    if (!selectedSystemId || !selectedSystem) return;
    
    const criticalStats = getCriticalCount();
    await updateSummary.mutateAsync({
      systemId: selectedSystemId,
      systemName: t(selectedSystem.name),
      totalChecks: getTotalChecks(),
      completedChecks: getCompletedChecks(),
      criticalTotal: criticalStats.total,
      criticalCompleted: criticalStats.completed
    });
  };

  const handleReset = async () => {
    if (!selectedSystemId) return;
    await resetSystem.mutateAsync(selectedSystemId);
  };

  const exportChecklist = () => {
    const data = {
      system: selectedSystem ? t(selectedSystem.name) : 'All Systems',
      date: new Date().toISOString(),
      totalChecks: getTotalChecks(),
      completedChecks: getCompletedChecks(),
      categories: validationCategories.map(cat => ({
        name: t(cat.name),
        progress: getCategoryProgress(cat),
        subcategories: cat.subcategories.map(sub => ({
          name: t(sub.name),
          checks: sub.checks.map(check => ({
            text: t(check.text),
            priority: check.priority,
            completed: isChecked(check.id),
            notApplicable: isNotApplicable(check.id)
          }))
        }))
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-${selectedSystemId || 'all'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted';
    }
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      critical: { en: 'Critical', ar: 'حرج' },
      high: { en: 'High', ar: 'عالي' },
      medium: { en: 'Medium', ar: 'متوسط' },
      low: { en: 'Low', ar: 'منخفض' }
    };
    return t(labels[priority] || { en: priority, ar: priority });
  };

  const totalChecks = getTotalChecks();
  const completedChecks = getCompletedChecks();
  const overallProgress = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;
  const criticalStats = getCriticalCount();

  const filteredCategories = validationCategories.filter(cat => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t(cat.name).toLowerCase().includes(query) ||
      cat.subcategories.some(sub => 
        t(sub.name).toLowerCase().includes(query) ||
        sub.checks.some(check => t(check.text).toLowerCase().includes(query))
      )
    );
  });

  // Get summary for current system
  const currentSummary = summaries?.find(s => s.system_id === selectedSystemId);

  // System selector for mobile
  const SystemSelector = () => (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground mb-2">
        {t({ en: 'Select System to Validate', ar: 'اختر النظام للتحقق' })}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
        {systems.map(system => {
          // Use dynamic progress for real-time updates
          const dynamicSummary = dynamicProgress?.find(s => s.system_id === system.id);
          const progress = dynamicSummary && dynamicSummary.total_checks > 0 
            ? Math.round((dynamicSummary.completed_checks / dynamicSummary.total_checks) * 100) 
            : 0;
          const hasData = dynamicSummary && dynamicSummary.total_checks > 0;
          
          return (
            <button
              key={system.id}
              onClick={() => {
                setSelectedSystemId(system.id);
                setShowMobileNav(false);
              }}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedSystemId === system.id 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{t(system.name)}</span>
                {hasData && (
                  <Badge variant={progress === 100 ? 'default' : 'secondary'} className="text-xs">
                    {progress}%
                  </Badge>
                )}
              </div>
              {hasData && (
                <Progress value={progress} className="h-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <PageLayout>
      <PageHeader
        title={t({ en: 'System Validation Checklist', ar: 'قائمة التحقق من النظام' })}
        description={t({ en: 'Comprehensive 16-layer deep validation for all 38 platform systems', ar: 'قائمة تحقق شاملة من 16 طبقة لجميع 38 نظام في المنصة' })}
        icon={<ClipboardCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />}
      />

      {/* System Selection - Mobile uses Sheet */}
      {isMobile ? (
        <div className="flex flex-col gap-3">
          <Sheet open={showMobileNav} onOpenChange={setShowMobileNav}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedSystem ? t(selectedSystem.name) : t({ en: 'Select System', ar: 'اختر النظام' })}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>{t({ en: 'Platform Systems', ar: 'أنظمة المنصة' })}</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <SystemSelector />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t({ en: 'Select System to Validate', ar: 'اختر النظام للتحقق' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {systems.map(system => {
                // Use dynamic progress for real-time updates
                const dynamicSummary = dynamicProgress?.find(s => s.system_id === system.id);
                const progress = dynamicSummary && dynamicSummary.total_checks > 0 
                  ? Math.round((dynamicSummary.completed_checks / dynamicSummary.total_checks) * 100) 
                  : 0;
                const hasData = dynamicSummary && dynamicSummary.total_checks > 0;
                
                return (
                  <button
                    key={system.id}
                    onClick={() => setSelectedSystemId(system.id)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      selectedSystemId === system.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-xs truncate">{t(system.name)}</span>
                      {hasData && (
                        <Badge variant={progress === 100 ? 'default' : 'secondary'} className="text-[10px] px-1">
                          {progress}%
                        </Badge>
                      )}
                    </div>
                    {hasData && (
                      <Progress value={progress} className="h-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedSystemId && (
        <>
          {/* Overall Progress */}
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center shrink-0 ${
                      overallProgress === 100 ? 'bg-green-600' : overallProgress >= 70 ? 'bg-amber-500' : 'bg-red-500'
                    }`}>
                      {overallProgress === 100 ? (
                        <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      ) : overallProgress >= 70 ? (
                        <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      ) : (
                        <XCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-2xl sm:text-3xl font-bold">{overallProgress}%</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {completedChecks} / {totalChecks} {t({ en: 'checks', ar: 'فحص' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 sm:p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-red-900 dark:text-red-100">
                        {t({ en: 'Critical', ar: 'الحرجة' })}
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        {criticalStats.completed}/{criticalStats.total}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Progress value={overallProgress} className="h-2 sm:h-3" />
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs sm:text-sm">
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                    {t({ en: 'Reset', ar: 'إعادة' })}
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportChecklist} className="gap-1.5 text-xs sm:text-sm">
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                    {t({ en: 'Export', ar: 'تصدير' })}
                  </Button>
                  <Button size="sm" onClick={handleSaveProgress} className="gap-1.5 text-xs sm:text-sm" disabled={updateSummary.isPending}>
                    <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                    {t({ en: 'Save Progress', ar: 'حفظ التقدم' })}
                  </Button>
                  <Button 
                    variant={validationMode === 'expert' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setValidationMode(validationMode === 'expert' ? 'standard' : 'expert')} 
                    className="gap-1.5 text-xs sm:text-sm"
                  >
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                    {t({ en: 'Open Expert', ar: 'وضع الخبير' })}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expert Mode Panel */}
          {validationMode === 'expert' ? (
            <ExpertValidationPanel
              systemId={selectedSystemId}
              systemName={selectedSystem ? t(selectedSystem.name) : ''}
              validationMap={validationMap}
              onStatusChange={async (update) => {
                await toggleCheck.mutateAsync(update);
              }}
              onBulkStatusChange={async (updates) => {
                await bulkStatusChange.mutateAsync(updates);
              }}
              onSaveProgress={handleSaveProgress}
              isLoading={toggleCheck.isPending || bulkStatusChange?.isPending || isLoading}
            />
          ) : (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t({ en: 'Search checks...', ar: 'البحث في الفحوصات...' })}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Progress Overview - Scrollable on mobile */}
              <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex sm:grid sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 min-w-max sm:min-w-0">
                  {validationCategories.map(cat => {
                    const Icon = cat.icon;
                    const progress = getCategoryProgress(cat);
                    return (
                      <Card key={cat.id} className="hover:shadow-md transition-shadow w-24 sm:w-auto shrink-0">
                        <CardContent className="p-2 sm:pt-3 sm:pb-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                            <span className="text-[10px] sm:text-xs font-medium truncate">{cat.id.slice(0, 4).toUpperCase()}</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                          <p className="text-[10px] text-muted-foreground text-right mt-1">{progress}%</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

          {/* Validation Categories */}
          <ScrollArea className="h-[calc(100vh-580px)] min-h-[300px] sm:min-h-[400px]">
            <div className="space-y-3 sm:space-y-4 pr-2 sm:pr-4">
              {filteredCategories.map(category => {
                const Icon = category.icon;
                const progress = getCategoryProgress(category);
                
                return (
                  <Card key={category.id} className="border-2 border-primary/10">
                    <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          <span className="truncate">{t(category.name)}</span>
                        </CardTitle>
                        <div className="flex items-center gap-2 shrink-0">
                          <Progress value={progress} className="w-16 sm:w-24 h-2" />
                          <Badge variant={progress === 100 ? 'default' : 'secondary'} className="text-xs">
                            {progress}%
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                      <Accordion type="multiple" className="w-full">
                        {category.subcategories.map((subcat, subIdx) => (
                          <AccordionItem key={subIdx} value={`${category.id}-${subIdx}`}>
                            <AccordionTrigger className="text-xs sm:text-sm font-medium hover:no-underline py-2">
                              <div className="flex items-center gap-2">
                                <span className="truncate">{t(subcat.name)}</span>
                                <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
                                  {subcat.checks.filter(c => isChecked(c.id)).length}/{subcat.checks.length}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 pt-2">
                                {subcat.checks.map(check => {
                                  const checkIsNA = isNotApplicable(check.id);
                                  const checkIsChecked = isChecked(check.id);
                                  
                                  return (
                                    <div 
                                      key={check.id} 
                                      className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-colors ${
                                        checkIsNA 
                                          ? 'bg-muted/50 border-muted opacity-60'
                                          : checkIsChecked 
                                            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                                            : 'bg-background hover:bg-muted/50'
                                      }`}
                                    >
                                      <Checkbox
                                        id={`${selectedSystemId}-${check.id}`}
                                        checked={checkIsChecked}
                                        onCheckedChange={() => handleCheck(check.id, category.id)}
                                        disabled={toggleCheck.isPending || checkIsNA}
                                        className="mt-0.5"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <label 
                                          htmlFor={`${selectedSystemId}-${check.id}`}
                                          className={`text-xs sm:text-sm cursor-pointer block ${
                                            checkIsNA ? 'text-muted-foreground italic' :
                                            checkIsChecked ? 'line-through text-muted-foreground' : ''
                                          }`}
                                        >
                                          {t(check.text)}
                                          {checkIsNA && <span className="ml-2 text-xs">(N/A)</span>}
                                        </label>
                                      </div>
                                      <Badge className={`text-[10px] sm:text-xs shrink-0 ${getPriorityColor(check.priority)}`}>
                                        {getPriorityLabel(check.priority)}
                                      </Badge>
                                    </div>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          {/* SQL Validation Queries */}
          <Card className="border-2 border-muted">
            <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Database className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                {t({ en: 'Validation SQL Queries', ar: 'استعلامات SQL للتحقق' })}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t({ en: 'Run these queries to validate database configuration', ar: 'قم بتشغيل هذه الاستعلامات للتحقق من تكوين قاعدة البيانات' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="p-3 bg-slate-900 rounded-lg overflow-x-auto">
                <p className="text-[10px] sm:text-xs text-slate-400 mb-1">-- 1. {t({ en: 'Check RLS enabled', ar: 'تحقق من تفعيل RLS' })}</p>
                <code className="text-xs sm:text-sm text-green-400 font-mono whitespace-pre">
                  SELECT tablename, rowsecurity FROM pg_tables{'\n'}WHERE schemaname = 'public';
                </code>
              </div>
              
              <div className="p-3 bg-slate-900 rounded-lg overflow-x-auto">
                <p className="text-[10px] sm:text-xs text-slate-400 mb-1">-- 2. {t({ en: 'List all policies', ar: 'عرض جميع السياسات' })}</p>
                <code className="text-xs sm:text-sm text-green-400 font-mono whitespace-pre">
                  SELECT tablename, policyname, cmd FROM pg_policies{'\n'}WHERE schemaname = 'public';
                </code>
              </div>
              
              <div className="p-3 bg-slate-900 rounded-lg overflow-x-auto">
                <p className="text-[10px] sm:text-xs text-slate-400 mb-1">-- 3. {t({ en: 'Find tables without policies', ar: 'الجداول بدون سياسات' })}</p>
                <code className="text-xs sm:text-sm text-green-400 font-mono whitespace-pre">
                  SELECT t.tablename FROM pg_tables t{'\n'}LEFT JOIN pg_policies p ON t.tablename = p.tablename{'\n'}WHERE t.schemaname = 'public' AND p.policyname IS NULL;
                </code>
              </div>
              
              <div className="p-3 bg-slate-900 rounded-lg overflow-x-auto">
                <p className="text-[10px] sm:text-xs text-slate-400 mb-1">-- 4. {t({ en: 'Check "Allow all" policies', ar: 'سياسات السماح للجميع' })}</p>
                <code className="text-xs sm:text-sm text-green-400 font-mono whitespace-pre">
                  SELECT tablename, policyname FROM pg_policies WHERE qual = 'true';
                </code>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedSystemId && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {t({ en: 'Select a system above to begin validation', ar: 'اختر نظامًا أعلاه لبدء التحقق' })}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t({ en: `${systems.length} systems available for validation`, ar: `${systems.length} نظام متاح للتحقق` })}
            </p>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

export default ProtectedPage(SystemValidationChecklist, { requireAdmin: true });
