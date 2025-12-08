import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Calendar, User } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function IdeaVersionHistory({ versions = [] }) {
  const { t } = useLanguage();

  if (!versions || versions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="h-4 w-4" />
          {t({ en: 'Version History', ar: 'تاريخ الإصدارات' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {versions.map((version, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-700">v{versions.length - idx}</span>
                </div>
                {idx < versions.length - 1 && (
                  <div className="w-0.5 h-8 bg-slate-200" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {version.change_type || 'Updated'}
                  </Badge>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(version.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{version.description}</p>
                {version.changed_by && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {version.changed_by}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}