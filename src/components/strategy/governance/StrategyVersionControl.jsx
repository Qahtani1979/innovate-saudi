import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/components/LanguageContext';
import { useStrategyVersions } from '@/hooks/strategy/useStrategyVersions';
import { 
  GitBranch, Clock, CheckCircle2, FileEdit, RotateCcw, 
  Eye, Plus, ArrowRight, User, Calendar, Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function StrategyVersionControl({ planId }) {
  const { t, language } = useLanguage();
  const { versions, isLoading, createVersion, restoreVersion, getNextVersionNumber } = useStrategyVersions(planId);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newVersion, setNewVersion] = useState({ label: '', summary: '' });
  const [selectedVersion, setSelectedVersion] = useState(null);

  const getStatusConfig = (status) => {
    const configs = {
      draft: { color: 'secondary', label: { en: 'Draft', ar: 'مسودة' } },
      in_review: { color: 'default', label: { en: 'In Review', ar: 'قيد المراجعة' } },
      approved: { color: 'default', label: { en: 'Current', ar: 'الحالي' } },
      superseded: { color: 'outline', label: { en: 'Superseded', ar: 'مستبدل' } }
    };
    return configs[status] || configs.draft;
  };

  const getChangeTypeIcon = (type) => {
    switch (type) {
      case 'added': return <Plus className="h-3 w-3 text-green-600" />;
      case 'modified': return <FileEdit className="h-3 w-3 text-blue-600" />;
      case 'removed': return <span className="h-3 w-3 text-red-600">×</span>;
      default: return null;
    }
  };

  const handleCreateVersion = async () => {
    if (!newVersion.label || !newVersion.summary) return;
    
    await createVersion.mutateAsync({
      strategic_plan_id: planId,
      version_number: getNextVersionNumber(),
      version_label: newVersion.label,
      change_summary: newVersion.summary,
      status: 'draft',
      changes: []
    });
    
    setNewVersion({ label: '', summary: '' });
    setIsCreateDialogOpen(false);
  };

  const handleRestore = async (versionId) => {
    await restoreVersion.mutateAsync(versionId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            {t({ en: 'Strategy Version Control', ar: 'التحكم في إصدارات الاستراتيجية' })}
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Create Version', ar: 'إنشاء إصدار' })}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t({ en: 'Create New Version', ar: 'إنشاء إصدار جديد' })}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Version Label', ar: 'تسمية الإصدار' })}</label>
                  <input 
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    value={newVersion.label}
                    onChange={(e) => setNewVersion({ ...newVersion, label: e.target.value })}
                    placeholder={t({ en: 'e.g., Q2 2024 Update', ar: 'مثال: تحديث الربع الثاني 2024' })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Change Summary', ar: 'ملخص التغييرات' })}</label>
                  <Textarea 
                    value={newVersion.summary}
                    onChange={(e) => setNewVersion({ ...newVersion, summary: e.target.value })}
                    placeholder={t({ en: 'Describe what changed in this version...', ar: 'صف ما تغير في هذا الإصدار...' })}
                    rows={3}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {t({ en: 'Next version:', ar: 'الإصدار التالي:' })} <span className="font-mono font-bold">v{getNextVersionNumber()}</span>
                </div>
                <Button onClick={handleCreateVersion} className="w-full" disabled={createVersion.isPending}>
                  {createVersion.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {t({ en: 'Create Version', ar: 'إنشاء الإصدار' })}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            {versions && versions.length > 0 && (
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            )}
            
            <div className="space-y-6">
              {versions?.map((version, index) => {
                const config = getStatusConfig(version.status);
                const changes = Array.isArray(version.changes) ? version.changes : [];
                
                return (
                  <div key={version.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className={`absolute left-2 top-2 h-5 w-5 rounded-full border-2 bg-background flex items-center justify-center ${
                      version.status === 'approved' ? 'border-primary' : 'border-muted-foreground'
                    }`}>
                      {version.status === 'approved' && <CheckCircle2 className="h-3 w-3 text-primary" />}
                    </div>
                    
                    <Card className={version.status === 'approved' ? 'border-primary' : ''}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold">v{version.version_number}</span>
                              <Badge variant={config.color}>{t(config.label)}</Badge>
                            </div>
                            <p className="font-medium mt-1">{version.version_label}</p>
                          </div>
                          <div className="flex gap-2">
                            {version.status === 'superseded' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRestore(version.id)}
                                disabled={restoreVersion.isPending}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                {t({ en: 'Restore', ar: 'استعادة' })}
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedVersion(selectedVersion === version.id ? null : version.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {t({ en: 'Details', ar: 'التفاصيل' })}
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{version.change_summary}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {version.created_by || 'System'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(version.created_at)}
                          </span>
                        </div>
                        
                        {/* Expanded changes */}
                        {selectedVersion === version.id && changes.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium mb-2">{t({ en: 'Changes', ar: 'التغييرات' })}</p>
                            <div className="space-y-2">
                              {changes.map((change, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm p-2 bg-muted/50 rounded">
                                  {getChangeTypeIcon(change.change_type)}
                                  <div className="flex-1">
                                    <code className="text-xs bg-muted px-1 rounded">{change.field_path}</code>
                                    {change.old_value && change.new_value && (
                                      <div className="flex items-center gap-2 mt-1 text-xs">
                                        <span className="line-through text-muted-foreground">{change.old_value}</span>
                                        <ArrowRight className="h-3 w-3" />
                                        <span className="text-primary">{change.new_value}</span>
                                      </div>
                                    )}
                                    {change.reason && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {t({ en: 'Reason:', ar: 'السبب:' })} {change.reason}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}

              {(!versions || versions.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  {t({ en: 'No versions created yet', ar: 'لم يتم إنشاء إصدارات بعد' })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
