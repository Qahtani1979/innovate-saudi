import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useLanguage } from '@/components/LanguageContext';
import { useStrategicPlansAdmin } from '@/hooks/useStrategicPlansAdmin';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { format } from 'date-fns';
import { 
  Target, Plus, Search, MoreVertical, Edit, Eye, Copy, Archive,
  Trash2, CheckCircle2, Play, RotateCcw, Clock, FileText, Calendar,
  TrendingUp, AlertCircle, Filter, Loader2
} from 'lucide-react';

const statusConfig = {
  draft: { label: { en: 'Draft', ar: 'مسودة' }, color: 'bg-slate-100 text-slate-700 border-slate-200' },
  active: { label: { en: 'Active', ar: 'نشط' }, color: 'bg-green-100 text-green-700 border-green-200' },
  completed: { label: { en: 'Completed', ar: 'مكتمل' }, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  archived: { label: { en: 'Archived', ar: 'مؤرشف' }, color: 'bg-amber-100 text-amber-700 border-amber-200' },
};

const approvalConfig = {
  pending: { label: { en: 'Pending Approval', ar: 'بانتظار الموافقة' }, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  approved: { label: { en: 'Approved', ar: 'موافق عليه' }, color: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { label: { en: 'Rejected', ar: 'مرفوض' }, color: 'bg-red-100 text-red-700 border-red-200' },
};

function StrategicPlansPage() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { setActivePlanId } = useActivePlan();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, plan: null });

  const { 
    plans, 
    isLoading, 
    stats,
    activatePlan,
    completePlan,
    archivePlan,
    deletePlan,
    restorePlan,
    duplicatePlan,
    revertToDraft
  } = useStrategicPlansAdmin({ includeDeleted: activeTab === 'deleted' });

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = !searchQuery || 
      plan.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.name_ar?.includes(searchQuery) ||
      plan.code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch && !plan.is_deleted;
    if (activeTab === 'draft') return matchesSearch && plan.status === 'draft' && !plan.is_deleted;
    if (activeTab === 'active') return matchesSearch && plan.status === 'active' && !plan.is_deleted;
    if (activeTab === 'completed') return matchesSearch && plan.status === 'completed' && !plan.is_deleted;
    if (activeTab === 'archived') return matchesSearch && plan.status === 'archived' && !plan.is_deleted;
    if (activeTab === 'pending') return matchesSearch && plan.approval_status === 'pending' && !plan.is_deleted;
    if (activeTab === 'deleted') return matchesSearch && plan.is_deleted;
    return matchesSearch;
  });

  const handleAction = async (action, plan) => {
    switch (action) {
      case 'activate':
        setConfirmDialog({ 
          open: true, 
          action: 'activate', 
          plan,
          title: t({ en: 'Activate Plan', ar: 'تفعيل الخطة' }),
          description: t({ en: 'This will set this plan as active. Continue?', ar: 'سيتم تفعيل هذه الخطة. هل تريد المتابعة؟' })
        });
        break;
      case 'complete':
        setConfirmDialog({ 
          open: true, 
          action: 'complete', 
          plan,
          title: t({ en: 'Complete Plan', ar: 'إكمال الخطة' }),
          description: t({ en: 'This will mark the plan as completed. Continue?', ar: 'سيتم تحديد الخطة كمكتملة. هل تريد المتابعة؟' })
        });
        break;
      case 'archive':
        setConfirmDialog({ 
          open: true, 
          action: 'archive', 
          plan,
          title: t({ en: 'Archive Plan', ar: 'أرشفة الخطة' }),
          description: t({ en: 'This will archive the plan. It will still be accessible but marked as archived.', ar: 'سيتم أرشفة الخطة. ستبقى متاحة ولكن مؤرشفة.' })
        });
        break;
      case 'delete':
        setConfirmDialog({ 
          open: true, 
          action: 'delete', 
          plan,
          title: t({ en: 'Delete Plan', ar: 'حذف الخطة' }),
          description: t({ en: 'This will soft-delete the plan. You can restore it later.', ar: 'سيتم حذف الخطة. يمكنك استعادتها لاحقًا.' })
        });
        break;
      case 'restore':
        await restorePlan.mutateAsync(plan.id);
        break;
      case 'duplicate':
        await duplicatePlan.mutateAsync(plan.id);
        break;
      case 'revert':
        await revertToDraft.mutateAsync(plan.id);
        break;
      case 'setActive':
        setActivePlanId(plan.id);
        navigate('/strategy-cockpit');
        break;
      case 'edit':
        navigate(`/strategic-plan-builder?id=${plan.id}&mode=edit`);
        break;
      case 'view':
        navigate(`/strategic-plan-builder?id=${plan.id}&mode=review`);
        break;
    }
  };

  const confirmAction = async () => {
    const { action, plan } = confirmDialog;
    switch (action) {
      case 'activate':
        await activatePlan.mutateAsync(plan.id);
        break;
      case 'complete':
        await completePlan.mutateAsync(plan.id);
        break;
      case 'archive':
        await archivePlan.mutateAsync(plan.id);
        break;
      case 'delete':
        await deletePlan.mutateAsync(plan.id);
        break;
    }
    setConfirmDialog({ open: false, action: null, plan: null });
  };

  const getPlanName = (plan) => {
    return language === 'ar' && plan.name_ar ? plan.name_ar : plan.name_en;
  };

  const getAvailableActions = (plan) => {
    const actions = [];
    
    // View is always available
    actions.push({ key: 'view', label: t({ en: 'View', ar: 'عرض' }), icon: Eye });
    
    if (plan.is_deleted) {
      actions.push({ key: 'restore', label: t({ en: 'Restore', ar: 'استعادة' }), icon: RotateCcw });
      return actions;
    }
    
    // Edit for drafts and active
    if (['draft', 'active'].includes(plan.status)) {
      actions.push({ key: 'edit', label: t({ en: 'Edit', ar: 'تعديل' }), icon: Edit });
    }
    
    // Set as active context
    if (plan.status === 'active') {
      actions.push({ key: 'setActive', label: t({ en: 'Set as Active', ar: 'تعيين كنشط' }), icon: Target });
    }
    
    // Duplicate
    actions.push({ key: 'duplicate', label: t({ en: 'Duplicate', ar: 'نسخ' }), icon: Copy });
    
    // Status transitions
    if (plan.status === 'draft' && plan.approval_status === 'approved') {
      actions.push({ key: 'activate', label: t({ en: 'Activate', ar: 'تفعيل' }), icon: Play, variant: 'success' });
    }
    
    if (plan.status === 'active') {
      actions.push({ key: 'complete', label: t({ en: 'Mark Complete', ar: 'تحديد كمكتمل' }), icon: CheckCircle2 });
    }
    
    if (['completed', 'draft'].includes(plan.status)) {
      actions.push({ key: 'archive', label: t({ en: 'Archive', ar: 'أرشفة' }), icon: Archive });
    }
    
    if (plan.approval_status === 'rejected') {
      actions.push({ key: 'revert', label: t({ en: 'Revert to Draft', ar: 'إرجاع للمسودة' }), icon: RotateCcw });
    }
    
    // Delete
    actions.push({ key: 'delete', label: t({ en: 'Delete', ar: 'حذف' }), icon: Trash2, variant: 'destructive' });
    
    return actions;
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Target className="h-10 w-10" />
              {t({ en: 'Strategic Plans', ar: 'الخطط الاستراتيجية' })}
            </h1>
            <p className="text-xl text-white/90">
              {t({ en: 'Manage your strategic plans lifecycle', ar: 'إدارة دورة حياة الخطط الاستراتيجية' })}
            </p>
          </div>
          <Link to="/strategic-plan-builder">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90">
              <Plus className="h-5 w-5 mr-2" />
              {t({ en: 'New Plan', ar: 'خطة جديدة' })}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { key: 'total', label: t({ en: 'Total', ar: 'الإجمالي' }), value: stats.total, icon: FileText, color: 'text-slate-600' },
          { key: 'draft', label: t({ en: 'Draft', ar: 'مسودة' }), value: stats.draft, icon: Edit, color: 'text-slate-600' },
          { key: 'pendingApproval', label: t({ en: 'Pending', ar: 'بانتظار' }), value: stats.pendingApproval, icon: Clock, color: 'text-yellow-600' },
          { key: 'active', label: t({ en: 'Active', ar: 'نشط' }), value: stats.active, icon: Play, color: 'text-green-600' },
          { key: 'completed', label: t({ en: 'Completed', ar: 'مكتمل' }), value: stats.completed, icon: CheckCircle2, color: 'text-blue-600' },
          { key: 'archived', label: t({ en: 'Archived', ar: 'مؤرشف' }), value: stats.archived, icon: Archive, color: 'text-amber-600' },
          { key: 'rejected', label: t({ en: 'Rejected', ar: 'مرفوض' }), value: stats.rejected, icon: AlertCircle, color: 'text-red-600' },
        ].map(stat => (
          <Card key={stat.key} className="text-center">
            <CardContent className="pt-4 pb-3">
              <stat.icon className={`h-6 w-6 mx-auto mb-1 ${stat.color}`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t({ en: 'Search plans...', ar: 'البحث في الخطط...' })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">{t({ en: 'All', ar: 'الكل' })} ({stats.total})</TabsTrigger>
          <TabsTrigger value="draft">{t({ en: 'Draft', ar: 'مسودة' })} ({stats.draft})</TabsTrigger>
          <TabsTrigger value="pending">{t({ en: 'Pending', ar: 'بانتظار' })} ({stats.pendingApproval})</TabsTrigger>
          <TabsTrigger value="active">{t({ en: 'Active', ar: 'نشط' })} ({stats.active})</TabsTrigger>
          <TabsTrigger value="completed">{t({ en: 'Completed', ar: 'مكتمل' })} ({stats.completed})</TabsTrigger>
          <TabsTrigger value="archived">{t({ en: 'Archived', ar: 'مؤرشف' })} ({stats.archived})</TabsTrigger>
          <TabsTrigger value="deleted">{t({ en: 'Deleted', ar: 'محذوف' })}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPlans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {t({ en: 'No plans found', ar: 'لا توجد خطط' })}
                </p>
                {activeTab === 'all' && (
                  <Link to="/strategic-plan-builder">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      {t({ en: 'Create Your First Plan', ar: 'إنشاء أول خطة' })}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPlans.map(plan => {
                const status = statusConfig[plan.status] || statusConfig.draft;
                const approval = plan.approval_status ? approvalConfig[plan.approval_status] : null;
                const actions = getAvailableActions(plan);
                
                return (
                  <Card key={plan.id} className={`hover:shadow-md transition-shadow ${plan.is_deleted ? 'opacity-60' : ''}`}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {plan.code && (
                              <Badge variant="outline" className="font-mono text-xs">{plan.code}</Badge>
                            )}
                            <Badge className={status.color}>{t(status.label)}</Badge>
                            {approval && (
                              <Badge className={approval.color}>{t(approval.label)}</Badge>
                            )}
                            {plan.is_deleted && (
                              <Badge variant="destructive">{t({ en: 'Deleted', ar: 'محذوف' })}</Badge>
                            )}
                          </div>
                          
                          <h3 className="font-semibold text-lg truncate" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {getPlanName(plan)}
                          </h3>
                          
                          {plan.vision_en && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1" dir={language === 'ar' && plan.vision_ar ? 'rtl' : 'ltr'}>
                              {language === 'ar' && plan.vision_ar ? plan.vision_ar : plan.vision_en}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                            {plan.start_year && plan.end_year && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {plan.start_year} - {plan.end_year}
                              </span>
                            )}
                            {plan.objectives?.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {plan.objectives.length} {t({ en: 'objectives', ar: 'أهداف' })}
                              </span>
                            )}
                            {plan.owner_email && (
                              <span className="truncate max-w-[200px]">{plan.owner_email}</span>
                            )}
                            {plan.updated_at && (
                              <span>
                                {t({ en: 'Updated', ar: 'تحديث' })}: {format(new Date(plan.updated_at), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {actions.map((action, idx) => (
                              <React.Fragment key={action.key}>
                                {action.key === 'delete' && <DropdownMenuSeparator />}
                                <DropdownMenuItem 
                                  onClick={() => handleAction(action.key, plan)}
                                  className={action.variant === 'destructive' ? 'text-destructive' : action.variant === 'success' ? 'text-green-600' : ''}
                                >
                                  <action.icon className="h-4 w-4 mr-2" />
                                  {action.label}
                                </DropdownMenuItem>
                              </React.Fragment>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, action: null, plan: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t({ en: 'Cancel', ar: 'إلغاء' })}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {t({ en: 'Confirm', ar: 'تأكيد' })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ProtectedPage(StrategicPlansPage, { requiredPermissions: ['strategy_view'] });
