import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Users, Search, Mail, Building2, Microscope } from 'lucide-react';
import { useRDProjectsWithVisibility } from '@/hooks/useRDProjectsWithVisibility';
import { useOrganizationsWithVisibility } from '@/hooks/useOrganizationsWithVisibility';

export default function CollaborationHub() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  // Use visibility-aware hooks
  const { data: rdProjects = [] } = useRDProjectsWithVisibility();
  const { data: organizations = [] } = useOrganizationsWithVisibility();

  // Find potential collaborators based on sectors/themes
  const myProjects = rdProjects.filter(p => p.created_by === user?.email);
  const myThemes = [...new Set(myProjects.flatMap(p => p.research_themes || []))];
  
  const potentialCollaborators = rdProjects.filter(p => 
    p.created_by !== user?.email &&
    p.research_themes?.some(theme => myThemes.includes(theme))
  );

  const relevantOrgs = organizations.filter(org => 
    org.org_type === 'university' || org.org_type === 'research_center'
  );

  const filteredCollaborators = potentialCollaborators.filter(p => 
    !searchTerm || 
    p.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.research_area_en?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t({ en: 'Collaboration Opportunities', ar: 'فرص التعاون' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
            <Input
              placeholder={t({ en: 'Search researchers, themes...', ar: 'ابحث عن باحثين، مواضيع...' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{potentialCollaborators.length}</div>
                <div className="text-sm text-slate-600">{t({ en: 'Potential Matches', ar: 'تطابقات محتملة' })}</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-purple-600">{myThemes.length}</div>
                <div className="text-sm text-slate-600">{t({ en: 'My Themes', ar: 'مواضيعي' })}</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-600">{relevantOrgs.length}</div>
                <div className="text-sm text-slate-600">{t({ en: 'Institutions', ar: 'مؤسسات' })}</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Researchers in Similar Areas', ar: 'باحثون في مجالات مشابهة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredCollaborators.slice(0, 8).map((project) => (
              <div key={project.id} className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Microscope className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-slate-900 text-sm">
                        {language === 'ar' && project.title_ar ? project.title_ar : project.title_en}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">
                      {project.principal_investigator?.name_en} • {project.institution_en}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {project.research_themes?.slice(0, 3).map((theme, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{theme}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Mail className="h-3 w-3 mr-1" />
                    {t({ en: 'Contact', ar: 'تواصل' })}
                  </Button>
                </div>
              </div>
            ))}
            {filteredCollaborators.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">{t({ en: 'No matches found', ar: 'لا توجد تطابقات' })}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Research Institutions', ar: 'المؤسسات البحثية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {relevantOrgs.slice(0, 6).map((org) => (
              <div key={org.id} className="p-3 border rounded-lg hover:bg-slate-50 flex items-center gap-3">
                <Building2 className="h-8 w-8 text-slate-400" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900">
                    {language === 'ar' && org.name_ar ? org.name_ar : org.name_en}
                  </p>
                  <p className="text-xs text-slate-600">{org.org_type?.replace(/_/g, ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
