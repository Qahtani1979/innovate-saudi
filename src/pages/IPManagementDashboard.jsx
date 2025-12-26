import { useState } from 'react';
import { useRDProjects } from '@/hooks/useRDProjects';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Award, Shield, DollarSign, Building2, Search, Calendar, FileText } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

/**
 * IPManagementDashboard
 * ✅ GOLD STANDARD COMPLIANT
 */
function IPManagementDashboard() {
  const { language, isRTL, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: rdProjects = [], isLoading } = useRDProjects();

  // Aggregate IP data
  const allPatents = rdProjects.flatMap(p =>
    (p.patents || []).map(patent => ({ ...patent, project_id: p.id, project_title: p.title_en, institution: p.institution_en }))
  );

  const allLicenses = rdProjects.flatMap(p =>
    (p.ip_licenses || []).map(license => ({ ...license, project_id: p.id, project_title: p.title_en }))
  );

  const filteredPatents = allPatents.filter(p => {
    const matchesSearch = !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total_patents: allPatents.length,
    granted: allPatents.filter(p => p.status === 'granted').length,
    pending: allPatents.filter(p => p.status === 'pending').length,
    filed: allPatents.filter(p => p.status === 'filed').length,
    total_licenses: allLicenses.length,
    active_licenses: allLicenses.filter(l => new Date(l.end_date) > new Date()).length
  };

  const statusColors = {
    filed: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
    granted: 'bg-green-100 text-green-700',
    expired: 'bg-slate-100 text-slate-700',
    rejected: 'bg-red-100 text-red-700'
  };

  return (
    <PageLayout>
      <PageHeader
        icon={Award}
        title={{ en: 'Intellectual Property Management', ar: 'إدارة الملكية الفكرية' }}
        description={{ en: 'Track patents, licenses, and commercialization from R&D projects', ar: 'تتبع البراءات والتراخيص والتسويق من مشاريع البحث' }}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Patents', ar: 'إجمالي البراءات' })}</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{stats.total_patents}</p>
              </div>
              <Award className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Granted', ar: 'ممنوحة' })}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.granted}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pending', ar: 'قيد المراجعة' })}</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Licenses', ar: 'تراخيص نشطة' })}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.active_licenses}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Licenses', ar: 'إجمالي التراخيص' })}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.total_licenses}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search patents...', ar: 'ابحث في البراءات...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <div className="flex gap-2">
              <Button variant={filterStatus === 'all' ? 'default' : 'outline'} onClick={() => setFilterStatus('all')}>
                {t({ en: 'All', ar: 'الكل' })}
              </Button>
              <Button variant={filterStatus === 'granted' ? 'default' : 'outline'} onClick={() => setFilterStatus('granted')}>
                {t({ en: 'Granted', ar: 'ممنوحة' })}
              </Button>
              <Button variant={filterStatus === 'pending' ? 'default' : 'outline'} onClick={() => setFilterStatus('pending')}>
                {t({ en: 'Pending', ar: 'قيد المراجعة' })}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            {t({ en: 'Patents Portfolio', ar: 'محفظة براءات الاختراع' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPatents.length > 0 ? (
            <div className="space-y-3">
              {filteredPatents.map((patent, i) => (
                <div key={i} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-slate-900">{patent.title}</p>
                        <Badge className={statusColors[patent.status]}>{patent.status}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{patent.number}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>{patent.institution}</span>
                        </div>
                        {patent.jurisdiction && (
                          <Badge variant="outline" className="text-xs">{patent.jurisdiction}</Badge>
                        )}
                        {patent.filing_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{patent.filing_date}</span>
                          </div>
                        )}
                      </div>
                      <Link to={createPageUrl(`RDProjectDetail?id=${patent.project_id}`)} className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                        {patent.project_title}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'No patents found', ar: 'لا توجد براءات' })}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Licenses Overview */}
      {allLicenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              {t({ en: 'License Agreements', ar: 'اتفاقيات الترخيص' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allLicenses.map((license, i) => (
                <div key={i} className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{license.licensee}</p>
                      <p className="text-sm text-slate-600 mt-1">{license.patent_title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-blue-100 text-blue-700">{license.license_type}</Badge>
                        {license.royalty_rate && (
                          <Badge variant="outline">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {license.royalty_rate}% royalty
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {license.start_date} - {license.end_date}
                        </Badge>
                      </div>
                      <Link to={createPageUrl(`RDProjectDetail?id=${license.project_id}`)} className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                        {license.project_title}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

export default ProtectedPage(IPManagementDashboard, { requiredPermissions: ['rd_project_view_all'] });
