import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/components/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useStrategyMilestones } from '@/hooks/strategy';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Download,
  ChevronRight,
  Clock,
  Users,
  Target,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Milestone,
  GitBranch,
  BarChart3,
  Sparkles,
  Loader2
} from 'lucide-react';

const StrategyTimelinePlanner = ({ strategicPlan, onSave }) => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const strategicPlanId = strategicPlan?.id;
  
  const {
    milestones: dbMilestones,
    isLoading,
    saveMilestone,
    deleteMilestone,
    saveBulkMilestones
  } = useStrategyMilestones(strategicPlanId);
  
  const [milestones, setMilestones] = useState([]);
  
  useEffect(() => {
    if (dbMilestones && dbMilestones.length > 0) {
      // Transform DB milestones to component format
      setMilestones(dbMilestones.map(m => ({
        ...m,
        deliverables: m.deliverables || [],
        resources_required: m.resources_required || [],
        dependencies: m.dependencies || []
      })));
    }
  }, [dbMilestones]);
  
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('timeline'); // timeline, gantt, list
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    start_date: '',
    end_date: '',
    dependencies: [],
    owner: '',
    status: 'planned',
    deliverables: '',
    resources_required: ''
  });

  const statusOptions = [
    { value: 'planned', label: { en: 'Planned', ar: 'مخطط' }, color: 'bg-secondary' },
    { value: 'in_progress', label: { en: 'In Progress', ar: 'قيد التنفيذ' }, color: 'bg-blue-500' },
    { value: 'completed', label: { en: 'Completed', ar: 'مكتمل' }, color: 'bg-green-500' },
    { value: 'delayed', label: { en: 'Delayed', ar: 'متأخر' }, color: 'bg-amber-500' },
    { value: 'cancelled', label: { en: 'Cancelled', ar: 'ملغي' }, color: 'bg-destructive' }
  ];

  const getStatusBadge = (status) => {
    const option = statusOptions.find(o => o.value === status);
    return option ? (
      <Badge className={`${option.color} text-white`}>
        {t(option.label)}
      </Badge>
    ) : null;
  };

  const handleAddMilestone = () => {
    setEditingMilestone(null);
    setFormData({
      title_en: '',
      title_ar: '',
      start_date: '',
      end_date: '',
      dependencies: [],
      owner: '',
      status: 'planned',
      deliverables: '',
      resources_required: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    setFormData({
      ...milestone,
      deliverables: milestone.deliverables.join(', '),
      resources_required: milestone.resources_required.join(', ')
    });
    setIsDialogOpen(true);
  };

  const handleSaveMilestone = async () => {
    setIsSaving(true);
    const newMilestone = {
      id: editingMilestone?.id || `milestone-${Date.now()}`,
      objective_id: formData.objective_id || 'obj-1',
      title_en: formData.title_en,
      title_ar: formData.title_ar,
      start_date: formData.start_date,
      end_date: formData.end_date,
      dependencies: formData.dependencies,
      owner: formData.owner,
      status: formData.status,
      deliverables: formData.deliverables.split(',').map(d => d.trim()).filter(Boolean),
      resources_required: formData.resources_required.split(',').map(r => r.trim()).filter(Boolean),
      progress_percentage: formData.status === 'completed' ? 100 : (formData.status === 'planned' ? 0 : 50)
    };

    const savedMilestone = await saveMilestone(newMilestone);
    if (savedMilestone) {
      if (editingMilestone) {
        setMilestones(prev => prev.map(m => m.id === editingMilestone.id ? savedMilestone : m));
      } else {
        setMilestones(prev => [...prev, savedMilestone]);
      }
    }
    setIsSaving(false);
    setIsDialogOpen(false);
  };

  const handleDeleteMilestone = async (id) => {
    const success = await deleteMilestone(id);
    if (success) {
      setMilestones(prev => prev.filter(m => m.id !== id));
    }
  };

  const calculateTimelinePosition = (startDate, endDate) => {
    const timelineStart = new Date('2024-01-01');
    const timelineEnd = new Date('2025-12-31');
    const totalDays = (timelineEnd - timelineStart) / (1000 * 60 * 60 * 24);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startOffset = ((start - timelineStart) / (1000 * 60 * 60 * 24)) / totalDays * 100;
    const width = ((end - start) / (1000 * 60 * 60 * 24)) / totalDays * 100;
    
    return { left: `${Math.max(0, startOffset)}%`, width: `${Math.min(100 - startOffset, width)}%` };
  };

  const getOverallProgress = () => {
    if (milestones.length === 0) return 0;
    return Math.round(milestones.reduce((sum, m) => sum + m.progress_percentage, 0) / milestones.length);
  };

  const handleExport = () => {
    const data = {
      exportDate: new Date().toISOString(),
      milestones: milestones,
      summary: {
        total: milestones.length,
        completed: milestones.filter(m => m.status === 'completed').length,
        inProgress: milestones.filter(m => m.status === 'in_progress').length,
        planned: milestones.filter(m => m.status === 'planned').length,
        overallProgress: getOverallProgress()
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategy-timeline-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    toast({
      title: t({ en: 'Export Complete', ar: 'اكتمل التصدير' }),
      description: t({ en: 'Timeline exported successfully.', ar: 'تم تصدير الجدول الزمني بنجاح.' })
    });
  };

  const renderGanttView = () => {
    const quarters = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
    
    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="flex border-b border-border">
            <div className="w-64 p-3 font-medium bg-muted/50">
              {t({ en: 'Milestone', ar: 'المعلم' })}
            </div>
            <div className="flex-1 flex">
              {quarters.map(q => (
                <div key={q} className="flex-1 p-3 text-center text-sm font-medium border-l border-border bg-muted/30">
                  {q}
                </div>
              ))}
            </div>
          </div>
          
          {/* Milestones */}
          {milestones.map((milestone, index) => {
            const position = calculateTimelinePosition(milestone.start_date, milestone.end_date);
            const statusColor = statusOptions.find(o => o.value === milestone.status)?.color || 'bg-secondary';
            
            return (
              <div key={milestone.id} className="flex border-b border-border hover:bg-muted/20">
                <div className="w-64 p-3 flex items-center gap-2">
                  <Milestone className="h-4 w-4 text-primary" />
                  <span className="text-sm truncate">{isRTL ? milestone.title_ar : milestone.title_en}</span>
                </div>
                <div className="flex-1 relative h-12">
                  <div 
                    className={`absolute top-2 h-8 ${statusColor} rounded-md flex items-center px-2 text-white text-xs`}
                    style={position}
                  >
                    <span className="truncate">{milestone.progress_percentage}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTimelineView = () => {
    const sortedMilestones = [...milestones].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    
    return (
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-6">
          {sortedMilestones.map((milestone, index) => {
            const statusColor = statusOptions.find(o => o.value === milestone.status)?.color || 'bg-secondary';
            
            return (
              <div key={milestone.id} className="relative flex gap-4">
                {/* Timeline dot */}
                <div className={`absolute left-6 w-4 h-4 rounded-full ${statusColor} border-2 border-background z-10`} />
                
                {/* Content */}
                <div className="ml-16 flex-1">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">
                              {isRTL ? milestone.title_ar : milestone.title_en}
                            </h4>
                            {getStatusBadge(milestone.status)}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(milestone.start_date).toLocaleDateString()} - {new Date(milestone.end_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {milestone.owner}
                            </div>
                          </div>
                          
                          {milestone.deliverables.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {milestone.deliverables.map((d, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {d}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Progress value={milestone.progress_percentage} className="h-2 flex-1" />
                            <span className="text-sm font-medium">{milestone.progress_percentage}%</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditMilestone(milestone)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteMilestone(milestone.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Dependencies */}
                      {milestone.dependencies.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <GitBranch className="h-4 w-4" />
                            {t({ en: 'Depends on:', ar: 'يعتمد على:' })}
                            {milestone.dependencies.map(depId => {
                              const dep = milestones.find(m => m.id === depId);
                              return dep ? (
                                <Badge key={depId} variant="secondary" className="text-xs">
                                  {isRTL ? dep.title_ar : dep.title_en}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-3">
      {milestones.map(milestone => (
        <Card key={milestone.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="font-medium">{isRTL ? milestone.title_ar : milestone.title_en}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(milestone.start_date).toLocaleDateString()} - {new Date(milestone.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Progress value={milestone.progress_percentage} className="w-24 h-2" />
                <span className="text-sm w-12">{milestone.progress_percentage}%</span>
                {getStatusBadge(milestone.status)}
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditMilestone(milestone)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteMilestone(milestone.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {t({ en: 'Strategy Timeline Planner', ar: 'مخطط الجدول الزمني للاستراتيجية' })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  en: 'Plan milestones, dependencies, and track progress across your strategic objectives',
                  ar: 'خطط للمعالم والتبعيات وتتبع التقدم عبر أهدافك الاستراتيجية'
                })}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                {t({ en: 'Export', ar: 'تصدير' })}
              </Button>
              <Button onClick={handleAddMilestone}>
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add Milestone', ar: 'إضافة معلم' })}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">{milestones.length}</div>
              <div className="text-sm text-muted-foreground">{t({ en: 'Total Milestones', ar: 'إجمالي المعالم' })}</div>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{milestones.filter(m => m.status === 'completed').length}</div>
              <div className="text-sm text-muted-foreground">{t({ en: 'Completed', ar: 'مكتمل' })}</div>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{milestones.filter(m => m.status === 'in_progress').length}</div>
              <div className="text-sm text-muted-foreground">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</div>
            </div>
            <div className="p-4 bg-amber-500/10 rounded-lg text-center">
              <div className="text-2xl font-bold text-amber-600">{milestones.filter(m => m.status === 'delayed').length}</div>
              <div className="text-sm text-muted-foreground">{t({ en: 'Delayed', ar: 'متأخر' })}</div>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">{getOverallProgress()}%</div>
              <div className="text-sm text-muted-foreground">{t({ en: 'Overall Progress', ar: 'التقدم الكلي' })}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList>
          <TabsTrigger value="timeline">
            <Clock className="h-4 w-4 mr-2" />
            {t({ en: 'Timeline', ar: 'الجدول الزمني' })}
          </TabsTrigger>
          <TabsTrigger value="gantt">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t({ en: 'Gantt Chart', ar: 'مخطط جانت' })}
          </TabsTrigger>
          <TabsTrigger value="list">
            <Target className="h-4 w-4 mr-2" />
            {t({ en: 'List View', ar: 'عرض القائمة' })}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="mt-4">
          {renderTimelineView()}
        </TabsContent>
        
        <TabsContent value="gantt" className="mt-4">
          <Card>
            <CardContent className="p-4">
              {renderGanttView()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list" className="mt-4">
          {renderListView()}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMilestone 
                ? t({ en: 'Edit Milestone', ar: 'تعديل المعلم' })
                : t({ en: 'Add New Milestone', ar: 'إضافة معلم جديد' })
              }
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })}</Label>
                <Input
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  placeholder={t({ en: 'Enter milestone title', ar: 'أدخل عنوان المعلم' })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</Label>
                <Input
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  placeholder={t({ en: 'Enter Arabic title', ar: 'أدخل العنوان بالعربية' })}
                  dir="rtl"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Start Date', ar: 'تاريخ البدء' })}</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'End Date', ar: 'تاريخ الانتهاء' })}</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Owner', ar: 'المسؤول' })}</Label>
                <Input
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder={t({ en: 'Enter owner name', ar: 'أدخل اسم المسؤول' })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Status', ar: 'الحالة' })}</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {t(option.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{t({ en: 'Deliverables (comma-separated)', ar: 'المخرجات (مفصولة بفاصلة)' })}</Label>
              <Textarea
                value={formData.deliverables}
                onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                placeholder={t({ en: 'e.g., Report, Presentation, Dashboard', ar: 'مثال: تقرير، عرض تقديمي، لوحة معلومات' })}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{t({ en: 'Resources Required (comma-separated)', ar: 'الموارد المطلوبة (مفصولة بفاصلة)' })}</Label>
              <Textarea
                value={formData.resources_required}
                onChange={(e) => setFormData({ ...formData, resources_required: e.target.value })}
                placeholder={t({ en: 'e.g., Team Lead, Analyst, Budget', ar: 'مثال: قائد فريق، محلل، ميزانية' })}
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button onClick={handleSaveMilestone}>
              <Save className="h-4 w-4 mr-2" />
              {t({ en: 'Save Milestone', ar: 'حفظ المعلم' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StrategyTimelinePlanner;
