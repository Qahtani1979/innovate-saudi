import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FolderOpen, Search, FileText, Clock, Edit, Eye,
  Plus, Loader2, Star, Copy, Lightbulb, Zap, Leaf, Building2, Globe,
  MoreVertical, Trash2, Archive, Download
} from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { toast } from 'sonner';
import { useStrategicPlans } from '@/hooks/useStrategicPlans';
import { useStrategyTemplates } from '@/hooks/strategy/useStrategyTemplates';
import { useStrategyMutations } from '@/hooks/useStrategyMutations';

const TEMPLATE_TYPE_ICONS = {
  innovation: Lightbulb,
  digital_transformation: Zap,
  sustainability: Leaf,
  sector_specific: Building2,
  municipality: Globe,
  smart_city: Zap,
  citizen_services: Building2
};

const TEMPLATE_TYPE_COLORS = {
  innovation: 'bg-amber-500',
  digital_transformation: 'bg-blue-500',
  sustainability: 'bg-green-500',
  sector_specific: 'bg-purple-500',
  municipality: 'bg-cyan-500',
  smart_city: 'bg-indigo-500',
  citizen_services: 'bg-rose-500'
};

/**
 * ✅ GOLD STANDARD COMPLIANT
 * - No direct supabase imports
 * - No direct react-query imports
 * - Uses custom hooks for all data access
 */
export default function PlanSelectionDialog({
  onSelectPlan,
  onCreateNew,
  trigger,
  defaultOpen = false
}) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(defaultOpen);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('drafts');

  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null, // 'delete' | 'archive' | 'duplicate' | 'export'
    plan: null
  });

  // Custom hooks
  const {
    templates = [],
    isLoading: isLoadingTemplates
  } = useStrategyTemplates();

  const {
    data: plans = [],
    isLoading,
    refetch
  } = useStrategicPlans(); // Fetches all non-template plans

  const {
    deleteStrategy,
    updateStrategy,
    duplicateStrategy
  } = useStrategyMutations();

  const isProcessing = deleteStrategy.isPending || updateStrategy.isPending || duplicateStrategy.isPending;

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = !search ||
      plan.name_en?.toLowerCase().includes(search.toLowerCase()) ||
      plan.name_ar?.includes(search);

    const matchesTab = activeTab === 'all' ||
      (activeTab === 'drafts' && plan.status === 'draft') ||
      (activeTab === 'active' && plan.status === 'active') ||
      (activeTab === 'pending' && plan.approval_status === 'pending') ||
      (activeTab === 'archived' && plan.status === 'archived');

    return matchesSearch && matchesTab;
  });

  const filteredTemplates = templates.filter(template => {
    if (!search) return true;
    return template.name_en?.toLowerCase().includes(search.toLowerCase()) ||
      template.name_ar?.includes(search);
  });

  const getStatusBadge = (plan) => {
    const statusColors = {
      draft: 'bg-muted text-muted-foreground',
      active: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      archived: 'bg-gray-100 text-gray-700'
    };

    return (
      <Badge className={statusColors[plan.status] || 'bg-muted'}>
        {plan.status || 'draft'}
      </Badge>
    );
  };

  const getApprovalBadge = (plan) => {
    if (!plan.approval_status || plan.approval_status === 'draft') return null;

    const colors = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };

    return (
      <Badge className={colors[plan.approval_status] || 'bg-muted'}>
        {plan.approval_status}
      </Badge>
    );
  };

  const handleSelect = (plan, mode) => {
    onSelectPlan?.(plan, mode);
    setOpen(false);
  };

  const handleApplyTemplate = (template) => {
    setOpen(false);
    navigate(`/strategic-plan-builder?template=${template.id}`);
  };

  const handleCreateNew = () => {
    onCreateNew?.();
    setOpen(false);
  };

  // Action handlers
  const handleDeletePlan = () => {
    if (!confirmDialog.plan) return;

    deleteStrategy.mutate(confirmDialog.plan.id, {
      onSuccess: () => {
        setConfirmDialog({ open: false, type: null, plan: null });
        refetch(); // Ensure list is updated
      }
    });
  };

  const handleDuplicatePlan = () => {
    if (!confirmDialog.plan) return;

    duplicateStrategy.mutate(confirmDialog.plan, {
      onSuccess: (newPlan) => {
        setConfirmDialog({ open: false, type: null, plan: null });
        refetch(); // Ensure list is updated

        // Optionally navigate to the new plan
        if (newPlan) {
          setOpen(false);
          const path = `/strategic-plan-builder?id=${newPlan.id}&mode=edit`;
          navigate(path);
        }
      }
    });
  };

  const handleArchivePlan = () => {
    if (!confirmDialog.plan) return;

    const newStatus = confirmDialog.plan.status === 'archived' ? 'draft' : 'archived';

    updateStrategy.mutate({
      id: confirmDialog.plan.id,
      data: { status: newStatus },
      metadata: { activity_type: newStatus === 'archived' ? 'archive' : 'restore' }
    }, {
      onSuccess: () => {
        const message = newStatus === 'archived'
          ? t({ en: 'Plan archived successfully', ar: 'تم أرشفة الخطة بنجاح' })
          : t({ en: 'Plan restored from archive', ar: 'تم استعادة الخطة من الأرشيف' });
        toast.success(message);
        setConfirmDialog({ open: false, type: null, plan: null });
        refetch();
      }
    });
  };

  const handleExportPlan = async () => {
    if (!confirmDialog.plan) return;
    setIsProcessing(true);

    try {
      const plan = confirmDialog.plan;

      // Create export data
      const exportData = {
        exportedAt: new Date().toISOString(),
        plan: {
          name_en: plan.name_en,
          name_ar: plan.name_ar,
          description_en: plan.description_en,
          description_ar: plan.description_ar,
          vision_en: plan.vision_en,
          vision_ar: plan.vision_ar,
          mission_en: plan.mission_en,
          mission_ar: plan.mission_ar,
          objectives: plan.objectives,
          pillars: plan.pillars,
          core_values: plan.core_values,
          start_date: plan.start_date,
          end_date: plan.end_date,
          status: plan.status,
          wizard_data: plan.wizard_data,
          version_number: plan.version_number
        }
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `strategic-plan-${plan.name_en?.replace(/\s+/g, '-').toLowerCase() || plan.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t({ en: 'Plan exported successfully', ar: 'تم تصدير الخطة بنجاح' }));
    } catch (error) {
      console.error('Error exporting plan:', error);
      toast.error(t({ en: 'Failed to export plan', ar: 'فشل في تصدير الخطة' }));
    } finally {
      setIsProcessing(false);
      setConfirmDialog({ open: false, type: null, plan: null });
    }
  };

  const openConfirmDialog = (type, plan) => {
    setConfirmDialog({ open: true, type, plan });
  };

  const getConfirmDialogContent = () => {
    const { type, plan } = confirmDialog;
    const planName = language === 'ar' ? (plan?.name_ar || plan?.name_en) : plan?.name_en;

    switch (type) {
      case 'delete':
        return {
          title: t({ en: 'Delete Strategic Plan', ar: 'حذف الخطة الاستراتيجية' }),
          description: t({
            en: `Are you sure you want to delete "${planName}"? This action cannot be undone.`,
            ar: `هل أنت متأكد من حذف "${planName}"؟ لا يمكن التراجع عن هذا الإجراء.`
          }),
          action: t({ en: 'Delete', ar: 'حذف' }),
          variant: 'destructive',
          onConfirm: handleDeletePlan
        };
      case 'duplicate':
        return {
          title: t({ en: 'Duplicate Strategic Plan', ar: 'نسخ الخطة الاستراتيجية' }),
          description: t({
            en: `Create a copy of "${planName}"? The new plan will be saved as a draft.`,
            ar: `إنشاء نسخة من "${planName}"؟ سيتم حفظ الخطة الجديدة كمسودة.`
          }),
          action: t({ en: 'Duplicate', ar: 'نسخ' }),
          variant: 'default',
          onConfirm: handleDuplicatePlan
        };
      case 'archive':
        const isArchived = plan?.status === 'archived';
        return {
          title: isArchived
            ? t({ en: 'Restore from Archive', ar: 'استعادة من الأرشيف' })
            : t({ en: 'Archive Strategic Plan', ar: 'أرشفة الخطة الاستراتيجية' }),
          description: isArchived
            ? t({
              en: `Restore "${planName}" from archive? It will be set to draft status.`,
              ar: `استعادة "${planName}" من الأرشيف؟ سيتم تعيينها كمسودة.`
            })
            : t({
              en: `Archive "${planName}"? You can restore it later from the archived tab.`,
              ar: `أرشفة "${planName}"؟ يمكنك استعادتها لاحقاً من علامة التبويب المؤرشفة.`
            }),
          action: isArchived ? t({ en: 'Restore', ar: 'استعادة' }) : t({ en: 'Archive', ar: 'أرشفة' }),
          variant: 'default',
          onConfirm: handleArchivePlan
        };
      case 'export':
        return {
          title: t({ en: 'Export Strategic Plan', ar: 'تصدير الخطة الاستراتيجية' }),
          description: t({
            en: `Export "${planName}" as a JSON file? This will include all plan data.`,
            ar: `تصدير "${planName}" كملف JSON؟ سيشمل ذلك جميع بيانات الخطة.`
          }),
          action: t({ en: 'Export', ar: 'تصدير' }),
          variant: 'default',
          onConfirm: handleExportPlan
        };
      default:
        return null;
    }
  };

  const dialogContent = getConfirmDialogContent();

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline">
              <FolderOpen className="h-4 w-4 mr-2" />
              {t({ en: 'Open Plan', ar: 'فتح خطة' })}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[85vh] sm:max-h-[80vh] w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              {t({ en: 'Strategic Plans', ar: 'الخطط الاستراتيجية' })}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {t({ en: 'Select a plan to edit, start from a template, or create a new one', ar: 'اختر خطة للتعديل، أو ابدأ من قالب، أو أنشئ خطة جديدة' })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4">
            {/* Create New Button */}
            <Button onClick={handleCreateNew} className="w-full text-sm">
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'Create New Strategic Plan', ar: 'إنشاء خطة استراتيجية جديدة' })}
            </Button>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t({ en: 'Search plans or templates...', ar: 'بحث في الخطط والقوالب...' })}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto">
                <TabsTrigger value="drafts" className="text-xs sm:text-sm py-1.5 sm:py-2">
                  {t({ en: 'Drafts', ar: 'مسودات' })}
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs sm:text-sm py-1.5 sm:py-2">
                  {t({ en: 'Pending', ar: 'معلق' })}
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs sm:text-sm py-1.5 sm:py-2">
                  {t({ en: 'Active', ar: 'نشط' })}
                </TabsTrigger>
                <TabsTrigger value="archived" className="text-xs sm:text-sm py-1.5 sm:py-2">
                  {t({ en: 'Archived', ar: 'مؤرشف' })}
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs sm:text-sm py-1.5 sm:py-2">
                  {t({ en: 'All', ar: 'الكل' })}
                </TabsTrigger>
                <TabsTrigger value="templates" className="gap-1 text-xs sm:text-sm py-1.5 sm:py-2">
                  <Star className="h-3 w-3" />
                  <span className="hidden sm:inline">{t({ en: 'Templates', ar: 'القوالب' })}</span>
                  <span className="sm:hidden">{t({ en: 'Tpl', ar: 'قوالب' })}</span>
                </TabsTrigger>
              </TabsList>

              {/* Plans Tabs */}
              {['drafts', 'pending', 'active', 'archived', 'all'].map(tab => (
                <TabsContent key={tab} value={tab} className="mt-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredPlans.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t({ en: 'No plans found', ar: 'لم يتم العثور على خطط' })}</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px] sm:h-[400px] pr-2 sm:pr-4">
                      <div className="space-y-2 sm:space-y-3">
                        {filteredPlans.map((plan) => (
                          <Card key={plan.id} className="hover:border-primary/50 transition-colors">
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm sm:text-base truncate">
                                    {language === 'ar' ? (plan.name_ar || plan.name_en) : plan.name_en}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3 flex-shrink-0" />
                                    <span>{new Date(plan.updated_at).toLocaleDateString()}</span>
                                    {plan.last_saved_step && (
                                      <span className="text-xs">
                                        • {t({ en: 'Step', ar: 'خطوة' })} {plan.last_saved_step}/18
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                                    {getStatusBadge(plan)}
                                    {getApprovalBadge(plan)}
                                    {plan.version_number > 1 && (
                                      <Badge variant="outline" className="text-xs">
                                        v{plan.version_number}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2 items-center justify-end sm:justify-start mt-2 sm:mt-0">
                                  {plan.status === 'draft' ? (
                                    <Button size="sm" onClick={() => handleSelect(plan, 'edit')} className="text-xs sm:text-sm">
                                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                      <span className="hidden xs:inline">{t({ en: 'Edit', ar: 'تعديل' })}</span>
                                    </Button>
                                  ) : plan.status === 'archived' ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openConfirmDialog('archive', plan)}
                                      className="text-xs sm:text-sm"
                                    >
                                      {t({ en: 'Restore', ar: 'استعادة' })}
                                    </Button>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleSelect(plan, 'review')}
                                        className="text-xs sm:text-sm"
                                      >
                                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                        <span className="hidden xs:inline">{t({ en: 'Review', ar: 'مراجعة' })}</span>
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleSelect(plan, 'edit')}
                                        className="text-xs sm:text-sm"
                                      >
                                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                        <span className="hidden xs:inline">{t({ en: 'Edit', ar: 'تعديل' })}</span>
                                      </Button>
                                    </>
                                  )}

                                  {/* Actions Dropdown */}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openConfirmDialog('duplicate', plan)}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        {t({ en: 'Duplicate', ar: 'نسخ' })}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => openConfirmDialog('export', plan)}>
                                        <Download className="h-4 w-4 mr-2" />
                                        {t({ en: 'Export', ar: 'تصدير' })}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      {plan.status !== 'archived' && (
                                        <DropdownMenuItem onClick={() => openConfirmDialog('archive', plan)}>
                                          <Archive className="h-4 w-4 mr-2" />
                                          {t({ en: 'Archive', ar: 'أرشفة' })}
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem
                                        onClick={() => openConfirmDialog('delete', plan)}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {t({ en: 'Delete', ar: 'حذف' })}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>
              ))}

              {/* Templates Tab */}
              <TabsContent value="templates" className="mt-4">
                {isLoadingTemplates ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t({ en: 'No templates available', ar: 'لا توجد قوالب متاحة' })}</p>
                    <Button
                      variant="link"
                      className="mt-2"
                      onClick={() => {
                        setOpen(false);
                        navigate('/strategy-templates-page');
                      }}
                    >
                      {t({ en: 'Browse Template Library', ar: 'تصفح مكتبة القوالب' })}
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {filteredTemplates.map((template) => {
                        const TypeIcon = TEMPLATE_TYPE_ICONS[template.template_type] || FileText;
                        const typeColor = TEMPLATE_TYPE_COLORS[template.template_type] || 'bg-gray-500';

                        return (
                          <Card key={template.id} className="hover:border-primary/50 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-lg ${typeColor}`}>
                                  <TypeIcon className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium truncate">
                                    {language === 'ar' ? (template.name_ar || template.name_en) : template.name_en}
                                  </h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                    {language === 'ar' ? template.description_ar : template.description_en}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {template.objectives?.length || 0} {t({ en: 'objectives', ar: 'أهداف' })}
                                    </Badge>
                                    {template.usage_count > 0 && (
                                      <Badge variant="secondary" className="text-xs">
                                        {template.usage_count} {t({ en: 'uses', ar: 'استخدامات' })}
                                      </Badge>
                                    )}
                                    {template.is_featured && (
                                      <Badge className="bg-amber-100 text-amber-700 text-xs">
                                        <Star className="h-3 w-3 mr-1 fill-current" />
                                        {t({ en: 'Featured', ar: 'مميز' })}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Button size="sm" onClick={() => handleApplyTemplate(template)}>
                                  <Copy className="h-4 w-4 mr-1" />
                                  {t({ en: 'Use', ar: 'استخدام' })}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, type: null, plan: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent?.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialogContent?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={dialogContent?.onConfirm}
              disabled={isProcessing}
              className={dialogContent?.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {dialogContent?.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
