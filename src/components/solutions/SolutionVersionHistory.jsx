import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { History, Eye, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SolutionVersionHistory({ solutionId }) {
  const { language, isRTL, t } = useLanguage();
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState([]);

  const { data: currentSolution } = useQuery({
    queryKey: ['solution', solutionId],
    queryFn: async () => {
      const { data } = await supabase.from('solutions').select('*').eq('id', solutionId).single();
      return data;
    }
  });

  const { data: versions = [] } = useQuery({
    queryKey: ['solution-versions', solutionId],
    queryFn: async () => {
      const allVersions = [];
      let current = currentSolution;
      
      while (current?.previous_version_id) {
        const { data: prev } = await supabase.from('solutions').select('*')
          .eq('id', current.previous_version_id).single();
        if (prev) {
          allVersions.push(prev);
          current = prev;
        } else {
          break;
        }
      }
      
      return [currentSolution, ...allVersions];
    },
    enabled: !!currentSolution
  });

  const handleCompareToggle = (version) => {
    if (compareVersions.includes(version.id)) {
      setCompareVersions(compareVersions.filter(v => v !== version.id));
    } else if (compareVersions.length < 2) {
      setCompareVersions([...compareVersions, version.id]);
    }
  };

  const getChangedFields = (v1, v2) => {
    if (!v1 || !v2) return [];
    const changed = [];
    const fieldsToCheck = ['name_en', 'name_ar', 'description_en', 'description_ar', 'maturity_level', 'trl', 'pricing_model', 'value_proposition'];
    
    fieldsToCheck.forEach(field => {
      if (v1[field] !== v2[field]) {
        changed.push({
          field,
          old: v2[field],
          new: v1[field]
        });
      }
    });
    
    return changed;
  };

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <History className="h-5 w-5 text-blue-600" />
          {t({ en: 'Version History', ar: 'سجل الإصدارات' })}
        </h3>
        {versions.length > 1 && (
          <Badge variant="outline">
            {versions.length} {t({ en: 'versions', ar: 'إصدارات' })}
          </Badge>
        )}
      </div>

      {versions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              {t({ en: 'No version history available', ar: 'لا يوجد سجل إصدارات' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {versions.map((version, idx) => {
            const isCurrent = idx === 0;
            const changedFields = idx < versions.length - 1 ? getChangedFields(version, versions[idx + 1]) : [];
            
            return (
              <Card key={version.id} className={isCurrent ? 'border-2 border-blue-400 bg-blue-50' : 'border'}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={isCurrent ? 'bg-blue-600' : 'bg-slate-600'}>
                          {isCurrent ? t({ en: 'Current', ar: 'الحالي' }) : `v${version.version_number || idx + 1}`}
                        </Badge>
                        {version.updated_date && (
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Clock className="h-3 w-3" />
                            {format(new Date(version.updated_date), 'MMM d, yyyy HH:mm')}
                          </div>
                        )}
                        {version.updated_by && (
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <User className="h-3 w-3" />
                            {version.updated_by}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm font-medium text-slate-900 mb-1">
                        {version.name_en}
                      </p>
                      
                      {changedFields.length > 0 && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <p className="text-xs font-semibold text-slate-700 mb-1">
                            {t({ en: 'Changes:', ar: 'التغييرات:' })}
                          </p>
                          <div className="space-y-1">
                            {changedFields.slice(0, 3).map((change, i) => (
                              <div key={i} className="text-xs text-slate-600">
                                <span className="font-medium">{change.field.replace(/_/g, ' ')}</span> updated
                              </div>
                            ))}
                            {changedFields.length > 3 && (
                              <p className="text-xs text-blue-600">
                                +{changedFields.length - 3} more changes
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedVersion(version)}>
                            <Eye className="h-3 w-3 mr-1" />
                            {t({ en: 'View', ar: 'عرض' })}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              {t({ en: 'Version', ar: 'الإصدار' })} {version.version_number || idx + 1} - {version.name_en}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-slate-600">{t({ en: 'Maturity Level', ar: 'مستوى النضج' })}</p>
                                <p className="font-semibold">{version.maturity_level}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-600">TRL</p>
                                <p className="font-semibold">{version.trl}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600">{t({ en: 'Description', ar: 'الوصف' })}</p>
                              <p className="text-sm text-slate-900 mt-1">{version.description_en}</p>
                            </div>
                            {version.value_proposition && (
                              <div>
                                <p className="text-xs text-slate-600">{t({ en: 'Value Proposition', ar: 'عرض القيمة' })}</p>
                                <p className="text-sm text-slate-900 mt-1">{version.value_proposition}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}