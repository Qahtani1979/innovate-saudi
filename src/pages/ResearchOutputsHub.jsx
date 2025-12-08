import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { BookOpen, FileText, Award, ExternalLink, Microscope } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ResearchOutputsHub() {
  const { language, isRTL, t } = useLanguage();

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects-outputs'],
    queryFn: () => base44.entities.RDProject.list()
  });

  const allPublications = rdProjects.flatMap(p => 
    (p.publications || []).map(pub => ({ ...pub, project: p }))
  );

  const allPatents = rdProjects.flatMap(p => 
    (p.patents || []).map(pat => ({ ...pat, project: p }))
  );

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Research Outputs & Publications', ar: 'المخرجات البحثية والمنشورات' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Publications, patents, and research outcomes', ar: 'المنشورات وبراءات الاختراع والنتائج البحثية' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Publications', ar: 'المنشورات' })}</p>
                <p className="text-3xl font-bold text-blue-600">{allPublications.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Patents', ar: 'براءات الاختراع' })}</p>
                <p className="text-3xl font-bold text-purple-600">{allPatents.length}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'R&D Projects', ar: 'مشاريع البحث' })}</p>
                <p className="text-3xl font-bold text-green-600">{rdProjects.length}</p>
              </div>
              <Microscope className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            {t({ en: 'Publications', ar: 'المنشورات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allPublications.map((pub, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">{pub.title}</h3>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {pub.authors?.map((author, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{author}</Badge>
                  ))}
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  {pub.publication} ({pub.year})
                </p>
                <div className="flex items-center gap-3">
                  <Link to={createPageUrl(`RDProjectDetail?id=${pub.project.id}`)} className="text-sm text-blue-600 hover:underline">
                    {t({ en: 'View Project', ar: 'عرض المشروع' })}
                  </Link>
                  {pub.url && (
                    <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {t({ en: 'Full Text', ar: 'النص الكامل' })}
                    </a>
                  )}
                </div>
              </div>
            ))}
            {allPublications.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No publications yet', ar: 'لا توجد منشورات بعد' })}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            {t({ en: 'Patents', ar: 'براءات الاختراع' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allPatents.map((pat, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">{pat.title}</h3>
                    <p className="text-sm text-slate-600 mb-2">
                      {t({ en: 'Patent Number:', ar: 'رقم البراءة:' })} {pat.number}
                    </p>
                    <div className="flex items-center gap-3">
                      <Badge className={
                        pat.status === 'granted' ? 'bg-green-100 text-green-700' :
                        pat.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-700'
                      }>
                        {pat.status}
                      </Badge>
                      <span className="text-sm text-slate-500">{pat.date}</span>
                    </div>
                  </div>
                  <Link to={createPageUrl(`RDProjectDetail?id=${pat.project.id}`)}>
                    <Button variant="outline" size="sm">
                      {t({ en: 'Project', ar: 'المشروع' })}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            {allPatents.length === 0 && (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No patents yet', ar: 'لا توجد براءات اختراع بعد' })}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ResearchOutputsHub, { requiredPermissions: [] });