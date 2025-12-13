import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/components/LanguageContext';
import { 
  GitBranch, Clock, CheckCircle2, FileEdit, RotateCcw, 
  Eye, Plus, ArrowRight, User, Calendar
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function StrategyVersionControl({ planId }) {
  const { t, language } = useLanguage();
  const [versions, setVersions] = useState([
    {
      id: '1',
      version_number: '2.1.0',
      version_label: 'Q1 2024 Update',
      created_at: '2024-01-20T10:30:00Z',
      created_by: 'Ahmed Al-Rashid',
      change_summary: 'Updated KPIs and added new strategic objective for digital transformation',
      status: 'approved',
      changes: [
        { field_path: 'objectives[3]', change_type: 'added', old_value: null, new_value: 'Digital Transformation Initiative', reason: 'Align with Vision 2030' },
        { field_path: 'kpis.innovation_rate', change_type: 'modified', old_value: '15%', new_value: '20%', reason: 'More ambitious target' },
        { field_path: 'budget.r&d', change_type: 'modified', old_value: '5M SAR', new_value: '7M SAR', reason: 'Increased R&D allocation' }
      ]
    },
    {
      id: '2',
      version_number: '2.0.0',
      version_label: 'Major Revision',
      created_at: '2023-12-15T14:00:00Z',
      created_by: 'Sarah Al-Faisal',
      change_summary: 'Complete strategy refresh with new vision and restructured objectives',
      status: 'superseded',
      changes: [
        { field_path: 'vision', change_type: 'modified', old_value: 'Previous vision statement', new_value: 'New vision statement', reason: 'Strategic pivot' },
        { field_path: 'objectives', change_type: 'modified', old_value: '5 objectives', new_value: '7 objectives', reason: 'Expanded scope' }
      ]
    },
    {
      id: '3',
      version_number: '1.5.0',
      version_label: 'Budget Adjustment',
      created_at: '2023-10-01T09:00:00Z',
      created_by: 'Mohammed Al-Qahtani',
      change_summary: 'Adjusted budget allocations based on Q3 review',
      status: 'superseded',
      changes: [
        { field_path: 'budget.total', change_type: 'modified', old_value: '50M SAR', new_value: '55M SAR', reason: 'Additional funding secured' }
      ]
    }
  ]);
  
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

  const handleCreateVersion = () => {
    if (!newVersion.label || !newVersion.summary) return;
    
    const lastVersion = versions[0]?.version_number || '1.0.0';
    const [major, minor] = lastVersion.split('.').map(Number);
    const newVersionNumber = `${major}.${minor + 1}.0`;
    
    setVersions([{
      id: Date.now().toString(),
      version_number: newVersionNumber,
      version_label: newVersion.label,
      created_at: new Date().toISOString(),
      created_by: 'Current User',
      change_summary: newVersion.summary,
      status: 'draft',
      changes: []
    }, ...versions]);
    
    setNewVersion({ label: '', summary: '' });
    setIsCreateDialogOpen(false);
  };

  const handleRestore = (versionId) => {
    // Mark current as superseded, restore selected as current
    setVersions(versions.map(v => ({
      ...v,
      status: v.id === versionId ? 'approved' : (v.status === 'approved' ? 'superseded' : v.status)
    })));
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
                <Button onClick={handleCreateVersion} className="w-full">
                  {t({ en: 'Create Version', ar: 'إنشاء الإصدار' })}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            
            <div className="space-y-6">
              {versions.map((version, index) => {
                const config = getStatusConfig(version.status);
                
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
                            {version.created_by}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(version.created_at)}
                          </span>
                        </div>
                        
                        {/* Expanded changes */}
                        {selectedVersion === version.id && version.changes.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium mb-2">{t({ en: 'Changes', ar: 'التغييرات' })}</p>
                            <div className="space-y-2">
                              {version.changes.map((change, i) => (
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
