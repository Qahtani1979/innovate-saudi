import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { createPageUrl } from '@/utils';
import { Microscope } from 'lucide-react';

export default function ChallengeRDTab({ relatedRD = [] }) {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-5 w-5 text-blue-600" />
            {t({ en: 'Related R&D Projects', ar: 'مشاريع البحث والتطوير' })} ({relatedRD.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {relatedRD.length > 0 ? (
            <div className="space-y-3">
              {relatedRD.map((rd) => (
                <Link
                  key={rd.id}
                  to={createPageUrl(`RDProjectDetail?id=${rd.id}`)}
                  className="block p-4 border rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono text-xs">{rd.code}</Badge>
                        <Badge className="text-xs">TRL {rd.trl_current || rd.trl_start}</Badge>
                      </div>
                      <p className="font-medium text-slate-900">
                        {language === 'ar' && rd.title_ar ? rd.title_ar : rd.title_en}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">{rd.institution_en}</p>
                    </div>
                    <Badge className={
                      rd.status === 'active' ? 'bg-green-100 text-green-700' :
                      rd.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {rd.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Microscope className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {t({ en: 'No R&D projects linked yet', ar: 'لا توجد مشاريع بحثية مرتبطة' })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
