import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/components/LanguageContext';
import { useStrategyVersions } from '@/hooks/strategy/useStrategyVersions';
import { useVersionAI } from '@/hooks/strategy/useVersionAI';
import { 
  GitBranch, CheckCircle2, FileEdit, RotateCcw, 
  Eye, Plus, ArrowRight, User, Calendar, Loader2, Sparkles, AlertTriangle, FileSearch
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
  const { analyzeImpact, categorizeChange, compareVersions, predictRollbackImpact } = useVersionAI();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newVersion, setNewVersion] = useState({ label: '', summary: '' });
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [rollbackAnalysis, setRollbackAnalysis] = useState(null);
  const [compareResult, setCompareResult] = useState(null);

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

  const handleAICategorize = async () => {
    if (!newVersion.summary) return;
    
    const result = await categorizeChange.mutateAsync({
      changes: { summary: newVersion.summary },
      versionData: { previous_version: versions?.[0]?.version_number },
      planContext: { planId }
    });
    
    setAiAnalysis(result);
    if (result?.suggested_version) {
      setNewVersion(prev => ({ 
        ...prev, 
        label: result.suggested_label || prev.label 
      }));
    }
  };

  const handlePredictRollback = async (version) => {
    const currentVersion = versions?.find(v => v.status === 'approved');
    const result = await predictRollbackImpact.mutateAsync({
      versionData: { current: currentVersion, target: version },
      planContext: { planId }
    });
    setRollbackAnalysis(result);
  };

  const handleCompareVersions = async (versionA, versionB) => {
    const result = await compareVersions.mutateAsync({
      versionData: { version_a: versionA, version_b: versionB },
      planContext: { planId }
    });
    setCompareResult(result);
  };

  const handleCreateVersion = async () => {
    if (!newVersion.label || !newVersion.summary) return;
    
    await createVersion.mutateAsync({
      strategic_plan_id: planId,
      version_number: aiAnalysis?.suggested_version || getNextVersionNumber(),
      version_label: newVersion.label,
      change_summary: newVersion.summary,
      status: 'draft',
      changes: []
    });
    
    setNewVersion({ label: '', summary: '' });
    setAiAnalysis(null);
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
      {/* AI Analysis Dialog */}
      <Dialog open={!!rollbackAnalysis} onOpenChange={() => setRollbackAnalysis(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {t({ en: 'Rollback Impact Analysis', ar: 'تحليل تأثير الاستعادة' })}
            </DialogTitle>
          </DialogHeader>
          {rollbackAnalysis && (
            <div className="space-y-4 pt-4">
              <div className={`p-4 rounded-lg ${
                rollbackAnalysis.rollback_risk === 'high' ? 'bg-red-50 dark:bg-red-950' :
                rollbackAnalysis.rollback_risk === 'medium' ? 'bg-yellow-50 dark:bg-yellow-950' :
                'bg-green-50 dark:bg-green-950'
              }`}>
                <p className="font-medium">{t({ en: 'Risk Level', ar: 'مستوى المخاطر' })}: {rollbackAnalysis.rollback_risk}</p>
              </div>
              {rollbackAnalysis.data_loss_risk?.length > 0 && (
                <div>
                  <p className="font-medium mb-2">{t({ en: 'Data Loss Risk', ar: 'مخاطر فقدان البيانات' })}</p>
                  <ul className="text-sm space-y-1">
                    {rollbackAnalysis.data_loss_risk.map((risk, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="font-medium mb-2">{t({ en: 'Recommendation', ar: 'التوصية' })}</p>
                <Badge variant={
                  rollbackAnalysis.recommended_action === 'proceed' ? 'default' :
                  rollbackAnalysis.recommended_action === 'caution' ? 'secondary' : 'destructive'
                }>
                  {rollbackAnalysis.recommended_action}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Compare Dialog */}
      <Dialog open={!!compareResult} onOpenChange={() => setCompareResult(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-primary" />
              {t({ en: 'Version Comparison', ar: 'مقارنة الإصدارات' })}
            </DialogTitle>
          </DialogHeader>
          {compareResult && (
            <div className="space-y-4 pt-4 max-h-96 overflow-y-auto">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-2">{t({ en: 'Summary', ar: 'الملخص' })}</p>
                <p className="text-sm">{compareResult.summary}</p>
              </div>
              {compareResult.major_changes?.length > 0 && (
                <div>
                  <p className="font-medium mb-2 text-red-600">{t({ en: 'Major Changes', ar: 'تغييرات رئيسية' })}</p>
                  <ul className="space-y-1">
                    {compareResult.major_changes.map((change, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-red-500">●</span> {change}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {compareResult.minor_changes?.length > 0 && (
                <div>
                  <p className="font-medium mb-2 text-blue-600">{t({ en: 'Minor Changes', ar: 'تغييرات ثانوية' })}</p>
                  <ul className="space-y-1">
                    {compareResult.minor_changes.map((change, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-blue-500">●</span> {change}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                  <label className="text-sm font-medium">{t({ en: 'Change Summary', ar: 'ملخص التغييرات' })}</label>
                  <Textarea 
                    value={newVersion.summary}
                    onChange={(e) => setNewVersion({ ...newVersion, summary: e.target.value })}
                    placeholder={t({ en: 'Describe what changed in this version...', ar: 'صف ما تغير في هذا الإصدار...' })}
                    rows={3}
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={handleAICategorize} 
                  className="w-full"
                  disabled={!newVersion.summary || categorizeChange.isPending}
                >
                  {categorizeChange.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {t({ en: 'AI Categorize & Suggest', ar: 'تصنيف واقتراح ذكي' })}
                </Button>
                
                {aiAnalysis && (
                  <div className="p-3 bg-primary/10 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge>{aiAnalysis.version_increment}</Badge>
                      <span className="text-sm font-mono">{aiAnalysis.suggested_version}</span>
                    </div>
                    <p className="text-sm">{aiAnalysis.suggested_label}</p>
                    {aiAnalysis.requires_signoff && (
                      <p className="text-xs text-yellow-600">{t({ en: 'Re-approval required', ar: 'يتطلب إعادة موافقة' })}</p>
                    )}
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Version Label', ar: 'تسمية الإصدار' })}</label>
                  <input 
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    value={newVersion.label}
                    onChange={(e) => setNewVersion({ ...newVersion, label: e.target.value })}
                    placeholder={t({ en: 'e.g., Q2 2024 Update', ar: 'مثال: تحديث الربع الثاني 2024' })}
                  />
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {t({ en: 'Next version:', ar: 'الإصدار التالي:' })} <span className="font-mono font-bold">v{aiAnalysis?.suggested_version || getNextVersionNumber()}</span>
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
            {versions && versions.length > 0 && (
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            )}
            
            <div className="space-y-6">
              {versions?.map((version, index) => {
                const config = getStatusConfig(version.status);
                const changes = Array.isArray(version.changes) ? version.changes : [];
                
                return (
                  <div key={version.id} className="relative pl-10">
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
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handlePredictRollback(version)}
                                  disabled={predictRollbackImpact.isPending}
                                >
                                  <Sparkles className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleRestore(version.id)}
                                  disabled={restoreVersion.isPending}
                                >
                                  <RotateCcw className="h-4 w-4 mr-1" />
                                  {t({ en: 'Restore', ar: 'استعادة' })}
                                </Button>
                              </>
                            )}
                            {index < versions.length - 1 && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleCompareVersions(version, versions[index + 1])}
                                disabled={compareVersions.isPending}
                              >
                                <FileSearch className="h-4 w-4" />
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
