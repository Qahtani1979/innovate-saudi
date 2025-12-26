import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import {
  Mail,
  Globe,
  MapPin,
  Users,
  Lightbulb,
  TestTube,
  Award,
  Sparkles,
  TrendingUp,
  FileText,
  Target,
  AlertCircle,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import OrganizationActivityDashboard from '../components/organizations/OrganizationActivityDashboard';
import PartnershipWorkflow from '../components/partnerships/PartnershipWorkflow';
import AINetworkAnalysis from '../components/organizations/AINetworkAnalysis';
import ProtectedPage from '../components/permissions/ProtectedPage';
import UnifiedWorkflowApprovalTab from '../components/approval/UnifiedWorkflowApprovalTab';
import OrganizationWorkflowTab from '../components/organizations/OrganizationWorkflowTab';
import { PageLayout } from '@/components/layout/PersonaPageLayout';
import { useOrganization, useOrganizationSolutions, useOrganizationPilots } from '@/hooks/useOrganization';

function OrganizationDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const orgId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();

  const { data: organization, isLoading, error: orgError } = useOrganization(orgId);
  const { data: solutions = [] } = useOrganizationSolutions(orgId);
  const { data: pilots = [] } = useOrganizationPilots(orgId);

  if (orgError) {
    return (
      <PageLayout>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{t({ en: 'Error loading organization', ar: 'خطأ في تحميل الجهة' })}</span>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (isLoading || !organization) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <div className="h-48 bg-muted animate-pulse rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-64 bg-muted animate-pulse rounded-lg" />
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </PageLayout>
    );
  }

  const typeColors = {
    startup: 'bg-orange-100 text-orange-700',
    sme: 'bg-blue-100 text-blue-700',
    company: 'bg-purple-100 text-purple-700',
    university: 'bg-green-100 text-green-700',
    research_center: 'bg-teal-100 text-teal-700',
    ministry: 'bg-indigo-100 text-indigo-700',
    municipality: 'bg-cyan-100 text-cyan-700',
    agency: 'bg-violet-100 text-violet-700',
    ngo: 'bg-pink-100 text-pink-700',
    international_org: 'bg-slate-100 text-slate-700'
  };

  return (
    <PageLayout>
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge className={typeColors[organization.org_type]}>
                  {organization.org_type?.replace(/_/g, ' ')}
                </Badge>
                {organization.is_partner && (
                  <Badge className="bg-green-500 text-white">
                    ✓ Partner
                  </Badge>
                )}
              </div>
              <h1 className="text-5xl font-bold mb-2">
                {language === 'ar' && organization.name_ar ? organization.name_ar : organization.name_en}
              </h1>
              {organization.name_ar && organization.name_en && (
                <p className="text-xl text-white/90">
                  {language === 'en' ? organization.name_ar : organization.name_en}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm">
                {organization.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{organization.location}</span>
                  </div>
                )}
                {organization.sectors?.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>{organization.sectors.length} sectors</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to={createPageUrl(`OrganizationEdit?id=${orgId}`)}>
                <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                  {t({ en: 'Edit', ar: 'تعديل' })}
                </Button>
              </Link>
              <Button className="bg-white text-indigo-600 hover:bg-white/90">
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Connect', ar: 'تواصل' })}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Solutions</p>
                <p className="text-sm text-slate-600" dir="rtl">الحلول</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{solutions.length}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Pilots</p>
                <p className="text-sm text-slate-600" dir="rtl">التجارب النشطة</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {pilots.filter(p => p.stage === 'in_progress').length}
                </p>
              </div>
              <TestTube className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-sm text-slate-600" dir="rtl">المكتملة</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {pilots.filter(p => p.stage === 'completed').length}
                </p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Success Rate</p>
                <p className="text-sm text-slate-600" dir="rtl">معدل النجاح</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {pilots.length > 0 ? Math.round((pilots.filter(p => p.stage === 'completed').length / pilots.length) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="workflow" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 h-auto">
              <TabsTrigger value="workflow" className="flex flex-col gap-1 py-3">
                <Activity className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Workflow', ar: 'سير العمل' })}</span>
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex flex-col gap-1 py-3">
                <FileText className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Overview', ar: 'نظرة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex flex-col gap-1 py-3">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Activity', ar: 'نشاط' })}</span>
              </TabsTrigger>
              <TabsTrigger value="partnerships" className="flex flex-col gap-1 py-3">
                <Users className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Partnerships', ar: 'شراكات' })}</span>
              </TabsTrigger>
              <TabsTrigger value="solutions" className="flex flex-col gap-1 py-3">
                <Lightbulb className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Solutions', ar: 'حلول' })}</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex flex-col gap-1 py-3">
                <Mail className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Contact', ar: 'تواصل' })}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workflow" className="space-y-6">
              <OrganizationWorkflowTab organization={organization} />
              <UnifiedWorkflowApprovalTab
                entityType="Organization"
                entityId={orgId}
                currentStage={
                  organization.is_verified ? 'verified' :
                    organization.verification_date ? 'verification' :
                      organization.partnership_status === 'pending' ? 'partnership' : 'registration'
                }
              />
            </TabsContent>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About | عن الجهة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {organization.description_en || 'No description provided'}
                    </p>
                  </div>
                  {organization.description_ar && (
                    <div className="pt-4 border-t" dir="rtl">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {organization.description_ar}
                      </p>
                    </div>
                  )}

                  {organization.specializations?.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-xs text-slate-500 mb-2">{t({ en: 'Specializations', ar: 'التخصصات' })}</p>
                      <div className="flex flex-wrap gap-2">
                        {organization.specializations.map((spec, i) => (
                          <Badge key={i} variant="outline">{spec}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {organization.capabilities?.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-xs text-slate-500 mb-2">{t({ en: 'Capabilities', ar: 'القدرات' })}</p>
                      <div className="flex flex-wrap gap-2">
                        {organization.capabilities.map((cap, i) => (
                          <Badge key={i} className="bg-blue-100 text-blue-700">{cap}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {organization.is_partner && (
                <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-green-600" />
                      {t({ en: 'Partnership Status', ar: 'حالة الشراكة' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{t({ en: 'Status', ar: 'الحالة' })}</span>
                      <Badge className="bg-green-600 text-white">
                        {organization.partnership_status?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    {organization.partnership_type && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{t({ en: 'Type', ar: 'النوع' })}</span>
                        <span className="text-sm font-medium">{organization.partnership_type?.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                    {organization.partnership_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{t({ en: 'Since', ar: 'منذ' })}</span>
                        <span className="text-sm font-medium">{new Date(organization.partnership_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {organization.funding_rounds?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Funding History', ar: 'تاريخ التمويل' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {organization.funding_rounds.map((round, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <Badge>{round.round_type?.replace(/_/g, ' ')}</Badge>
                            <span className="text-sm font-medium">{round.amount?.toLocaleString()} {round.currency || 'SAR'}</span>
                          </div>
                          {round.date && <p className="text-xs text-slate-600">{new Date(round.date).toLocaleDateString()}</p>}
                          {round.lead_investor && <p className="text-xs text-slate-500 mt-1">Lead: {round.lead_investor}</p>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {organization.key_investors?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Key Investors', ar: 'المستثمرون الرئيسيون' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {organization.key_investors.map((investor, i) => (
                        <div key={i} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="text-sm font-medium">{investor.name}</p>
                            <Badge variant="outline" className="text-xs mt-1">{investor.type}</Badge>
                          </div>
                          {investor.stake_percentage && <span className="text-sm text-slate-600">{investor.stake_percentage}%</span>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {organization.partnership_agreements?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Partnership Agreements', ar: 'اتفاقيات الشراكة' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {organization.partnership_agreements.map((agreement, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">{agreement.partner_name}</p>
                            <Badge className={agreement.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}>
                              {agreement.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600">{agreement.type}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {agreement.start_date && new Date(agreement.start_date).toLocaleDateString()}
                            {agreement.end_date && ` - ${new Date(agreement.end_date).toLocaleDateString()}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {organization.regulatory_compliance && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Regulatory Compliance', ar: 'الامتثال التنظيمي' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {organization.regulatory_compliance.iso_certified && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-700">ISO Certified</Badge>
                          {organization.regulatory_compliance.iso_standards?.map((std, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{std}</Badge>
                          ))}
                        </div>
                      )}
                      {organization.regulatory_compliance.gdpr_compliant && (
                        <Badge className="bg-green-100 text-green-700">GDPR Compliant</Badge>
                      )}
                      {organization.regulatory_compliance.pdpl_compliant && (
                        <Badge className="bg-green-100 text-green-700">PDPL Compliant</Badge>
                      )}
                      {organization.regulatory_compliance.last_audit_date && (
                        <p className="text-xs text-slate-600 mt-2">
                          Last audit: {new Date(organization.regulatory_compliance.last_audit_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {organization.intellectual_property && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Intellectual Property', ar: 'الملكية الفكرية' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {organization.intellectual_property.patents?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">{t({ en: 'Patents', ar: 'براءات الاختراع' })} ({organization.intellectual_property.patents.length})</p>
                          <div className="space-y-2">
                            {organization.intellectual_property.patents.slice(0, 3).map((patent, i) => (
                              <div key={i} className="p-2 border rounded text-xs">
                                <p className="font-medium">{patent.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline">{patent.status}</Badge>
                                  {patent.number && <span className="text-slate-600">{patent.number}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {organization.intellectual_property.trademarks?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">{t({ en: 'Trademarks', ar: 'العلامات التجارية' })} ({organization.intellectual_property.trademarks.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {organization.intellectual_property.trademarks.map((tm, i) => (
                              <Badge key={i} variant="outline">{tm.name}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {organization.certifications?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Certifications', ar: 'الشهادات' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {organization.certifications.map((cert, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <p className="font-medium text-sm">{cert.name}</p>
                          <p className="text-xs text-slate-600 mt-1">{cert.issuer}</p>
                          {cert.date && <p className="text-xs text-slate-500">{new Date(cert.date).toLocaleDateString()}</p>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <OrganizationActivityDashboard organizationId={orgId} />
            </TabsContent>

            <TabsContent value="partnerships" className="space-y-6">
              <AINetworkAnalysis organization={organization} />
              <PartnershipWorkflow organization={organization} onComplete={() => { }} />
            </TabsContent>

            <TabsContent value="solutions">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Solutions Portfolio', ar: 'محفظة الحلول' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {solutions.length > 0 ? (
                    <div className="space-y-3">
                      {solutions.map((solution) => (
                        <Link key={solution.id} to={createPageUrl(`SolutionDetail?id=${solution.id}`)} className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{solution.name_en}</p>
                              <p className="text-sm text-slate-600 mt-1">
                                {solution.maturity_level?.replace(/_/g, ' ')} • TRL {solution.trl}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {solution.deployment_count || 0} {t({ en: 'deployments', ar: 'نشر' })}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">{t({ en: 'No solutions yet', ar: 'لا توجد حلول' })}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pilots">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Pilot Projects', ar: 'المشاريع التجريبية' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {pilots.length > 0 ? (
                    <div className="space-y-3">
                      {pilots.map((pilot) => (
                        <Link key={pilot.id} to={createPageUrl(`PilotDetail?id=${pilot.id}`)} className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{pilot.title_en}</p>
                              <p className="text-sm text-slate-600 mt-1">{pilot.municipality_id}</p>
                            </div>
                            <Badge>{pilot.stage?.replace(/_/g, ' ')}</Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">{t({ en: 'No pilots yet', ar: 'لا توجد تجارب' })}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Contact Information', ar: 'معلومات التواصل' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {organization.contact_email && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{t({ en: 'Email', ar: 'البريد' })}</p>
                      <a href={`mailto:${organization.contact_email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {organization.contact_email}
                      </a>
                    </div>
                  )}
                  {organization.website && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{t({ en: 'Website', ar: 'الموقع' })}</p>
                      <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {organization.website}
                      </a>
                    </div>
                  )}
                  {organization.location && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{t({ en: 'Location', ar: 'الموقع' })}</p>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span className="text-sm">{organization.location}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Quick Info', ar: 'معلومات سريعة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Type', ar: 'النوع' })}</p>
              <Badge className={typeColors[organization.org_type]}>
                {organization.org_type?.replace(/_/g, ' ')}
              </Badge>
            </div>

            {organization.sectors && organization.sectors.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Sectors', ar: 'القطاعات' })}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {organization.sectors.slice(0, 3).map((sector, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{sector}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Partnership', ar: 'الشراكة' })}</p>
              <Badge variant={organization.is_partner ? "default" : "outline"}>
                {organization.partnership_status === 'active' ? t({ en: 'Active Partner', ar: 'شريك نشط' }) :
                  organization.partnership_status === 'pending' ? t({ en: 'Pending', ar: 'معلق' }) :
                    organization.partnership_status === 'suspended' ? t({ en: 'Suspended', ar: 'معلق' }) :
                      t({ en: 'Not Partner', ar: 'غير شريك' })}
              </Badge>
            </div>

            {organization.is_verified && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Verification', ar: 'التحقق' })}</p>
                <Badge className="bg-green-100 text-green-700">
                  ✓ {t({ en: 'Verified', ar: 'موثق' })}
                </Badge>
              </div>
            )}

            {organization.team_size && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Team Size', ar: 'حجم الفريق' })}</p>
                <p className="text-sm">{organization.team_size} {t({ en: 'employees', ar: 'موظف' })}</p>
              </div>
            )}

            {organization.maturity_level && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Maturity', ar: 'النضج' })}</p>
                <Badge variant="outline">{organization.maturity_level?.replace(/_/g, ' ')}</Badge>
              </div>
            )}

            {organization.performance_metrics && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Performance', ar: 'الأداء' })}</p>
                <div className="space-y-1 text-xs">
                  {organization.performance_metrics.solution_count > 0 && (
                    <p>{organization.performance_metrics.solution_count} {t({ en: 'solutions', ar: 'حل' })}</p>
                  )}
                  {organization.performance_metrics.pilot_count > 0 && (
                    <p>{organization.performance_metrics.pilot_count} {t({ en: 'pilots', ar: 'تجربة' })}</p>
                  )}
                  {organization.performance_metrics.success_rate && (
                    <p>{organization.performance_metrics.success_rate}% {t({ en: 'success rate', ar: 'معدل النجاح' })}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(OrganizationDetail, { requiredPermissions: [] });
