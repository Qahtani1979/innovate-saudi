import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Search, Microscope, Building2, Mail, BookOpen, Award } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ResearcherNetwork() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects-network'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rd_projects')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations-network'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const researchAreas = [...new Set(rdProjects.flatMap(p => p.research_area_en || p.research_area || []))].filter(Boolean);

  const filteredProjects = rdProjects.filter(p => {
    const areaMatch = selectedArea === 'all' || (p.research_area_en || p.research_area) === selectedArea;
    const searchMatch = !searchTerm || 
      p.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.institution_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.principal_investigator?.name_en?.toLowerCase().includes(searchTerm.toLowerCase());
    return areaMatch && searchMatch;
  });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Researcher Network', ar: 'شبكة الباحثين' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Discover and connect with researchers across Saudi Arabia', ar: 'اكتشف وتواصل مع الباحثين في المملكة' })}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
                <Input
                  placeholder={t({ en: 'Search researchers, institutions, topics...', ar: 'ابحث عن باحثين، مؤسسات، مواضيع...' })}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={isRTL ? 'pr-10' : 'pl-10'}
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedArea === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedArea('all')}
              >
                {t({ en: 'All', ar: 'الكل' })}
              </Button>
              {researchAreas.slice(0, 5).map((area) => (
                <Button
                  key={area}
                  variant={selectedArea === area ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedArea(area)}
                >
                  {area}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{rdProjects.length}</div>
            <div className="text-sm text-slate-600">{t({ en: 'Active Projects', ar: 'مشاريع نشطة' })}</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {[...new Set(rdProjects.map(p => p.principal_investigator?.name_en).filter(Boolean))].length}
            </div>
            <div className="text-sm text-slate-600">{t({ en: 'Researchers', ar: 'باحثون' })}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {organizations.filter(o => o.org_type === 'university' || o.org_type === 'research_center').length}
            </div>
            <div className="text-sm text-slate-600">{t({ en: 'Institutions', ar: 'مؤسسات' })}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge variant="outline" className="mb-2 text-xs">{project.code}</Badge>
                  <Link to={createPageUrl(`RDProjectDetail?id=${project.id}`)}>
                    <h3 className="font-semibold text-slate-900 hover:text-blue-600 line-clamp-2">
                      {language === 'ar' && project.title_ar ? project.title_ar : project.title_en}
                    </h3>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.principal_investigator && (
                <div className="flex items-start gap-2">
                  <Microscope className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {language === 'ar' && project.principal_investigator.name_ar ? project.principal_investigator.name_ar : project.principal_investigator.name_en}
                    </p>
                    <p className="text-xs text-slate-600">
                      {language === 'ar' && project.principal_investigator.title_ar ? project.principal_investigator.title_ar : project.principal_investigator.title_en}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Building2 className="h-4 w-4" />
                <span>{language === 'ar' && project.institution_ar ? project.institution_ar : (project.institution_en || project.institution)}</span>
              </div>

              {project.research_themes && project.research_themes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.research_themes.slice(0, 3).map((theme, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{theme}</Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 pt-2 border-t">
                {project.publications?.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <BookOpen className="h-3 w-3" />
                    <span>{project.publications.length}</span>
                  </div>
                )}
                {project.trl_current && (
                  <Badge variant="outline" className="text-xs">TRL {project.trl_current}</Badge>
                )}
              </div>

              <Button size="sm" variant="outline" className="w-full">
                <Mail className="h-3 w-3 mr-2" />
                {t({ en: 'Contact', ar: 'تواصل' })}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Microscope className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t({ en: 'No researchers found', ar: 'لم يتم العثور على باحثين' })}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(ResearcherNetwork, { requiredPermissions: [] });