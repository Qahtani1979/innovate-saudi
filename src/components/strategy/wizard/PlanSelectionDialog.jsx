import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FolderOpen, Search, FileText, Clock, Edit, Eye, 
  Plus, Loader2, Star, Copy, Lightbulb, Zap, Leaf, Building2, Globe
} from 'lucide-react';
import { useLanguage } from '../../LanguageContext';


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

export default function PlanSelectionDialog({ 
  onSelectPlan, 
  onCreateNew,
  trigger,
  defaultOpen = false
}) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(defaultOpen);
  const [search, setSearch] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('drafts');

  // Fetch public templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['strategy-templates-selection'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('is_template', true)
        .eq('is_public', true)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .order('is_featured', { ascending: false })
        .order('usage_count', { ascending: false, nullsFirst: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: open
  });

  // Fetch strategic plans (excluding templates)
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['strategic-plans-selection'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .or('is_template.is.null,is_template.eq.false')
        .or('is_deleted.is.null,is_deleted.eq.false')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: open
  });

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = !search || 
      plan.name_en?.toLowerCase().includes(search.toLowerCase()) ||
      plan.name_ar?.includes(search);
    
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'drafts' && plan.status === 'draft') ||
      (activeTab === 'active' && plan.status === 'active') ||
      (activeTab === 'pending' && plan.approval_status === 'pending');
    
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <FolderOpen className="h-4 w-4 mr-2" />
            {t({ en: 'Open Plan', ar: 'فتح خطة' })}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t({ en: 'Strategic Plans', ar: 'الخطط الاستراتيجية' })}
          </DialogTitle>
          <DialogDescription>
            {t({ en: 'Select a plan to edit, start from a template, or create a new one', ar: 'اختر خطة للتعديل، أو ابدأ من قالب، أو أنشئ خطة جديدة' })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create New Button */}
          <Button onClick={handleCreateNew} className="w-full">
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
              className="pl-9"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="drafts">
                {t({ en: 'Drafts', ar: 'مسودات' })}
              </TabsTrigger>
              <TabsTrigger value="pending">
                {t({ en: 'Pending', ar: 'معلق' })}
              </TabsTrigger>
              <TabsTrigger value="active">
                {t({ en: 'Active', ar: 'نشط' })}
              </TabsTrigger>
              <TabsTrigger value="all">
                {t({ en: 'All', ar: 'الكل' })}
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-1">
                <Star className="h-3 w-3" />
                {t({ en: 'Templates', ar: 'القوالب' })}
              </TabsTrigger>
            </TabsList>

            {/* Plans Tabs */}
            {['drafts', 'pending', 'active', 'all'].map(tab => (
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
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {filteredPlans.map((plan) => (
                        <Card key={plan.id} className="hover:border-primary/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">
                                  {language === 'ar' ? (plan.name_ar || plan.name_en) : plan.name_en}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {new Date(plan.updated_at).toLocaleDateString()}
                                  {plan.last_saved_step && (
                                    <span className="text-xs">
                                      • {t({ en: 'Step', ar: 'خطوة' })} {plan.last_saved_step}/18
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  {getStatusBadge(plan)}
                                  {getApprovalBadge(plan)}
                                  {plan.version_number > 1 && (
                                    <Badge variant="outline" className="text-xs">
                                      v{plan.version_number}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {plan.status === 'draft' ? (
                                  <Button size="sm" onClick={() => handleSelect(plan, 'edit')}>
                                    <Edit className="h-4 w-4 mr-1" />
                                    {t({ en: 'Edit', ar: 'تعديل' })}
                                  </Button>
                                ) : (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleSelect(plan, 'review')}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      {t({ en: 'Review', ar: 'مراجعة' })}
                                    </Button>
                                    <Button 
                                      size="sm"
                                      onClick={() => handleSelect(plan, 'edit')}
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      {t({ en: 'Edit', ar: 'تعديل' })}
                                    </Button>
                                  </>
                                )}
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
  );
}
