import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import {
  Megaphone,
  Calendar,
  DollarSign,
  FileText,
  Search,
  Plus,
  Sparkles,
  Clock,
  CheckCircle2,
  LayoutGrid,
  List,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Edit, Trash2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedPage from '../components/permissions/ProtectedPage';
import { usePermissions } from '../components/permissions/usePermissions';

function RDCallsPage() {
  const { hasPermission } = usePermissions();
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const { invokeAI, status: aiStatus, isLoading: aiLoading, rateLimitInfo, isAvailable } = useAIWithFallback();

  const { data: calls = [], isLoading: callsLoading } = useQuery({
    queryKey: ['rd-calls'],
    queryFn: () => base44.entities.RDCall.list('-created_date')
  });

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery({
    queryKey: ['rd-proposals'],
    queryFn: () => base44.entities.RDProposal.list('-created_date')
  });

  const filteredCalls = calls.filter(call => {
    const matchesSearch = !searchTerm || 
      call.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.title_ar?.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || call.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalCalls: calls.length,
    openCalls: calls.filter(c => c.status === 'open').length,
    totalProposals: proposals.length,
    approvedProposals: proposals.filter(p => p.status === 'approved').length
  };

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    open: 'bg-green-100 text-green-700',
    closed: 'bg-red-100 text-red-700',
    evaluation: 'bg-yellow-100 text-yellow-700',
    awarded: 'bg-blue-100 text-blue-700'
  };

  const proposalStatusColors = {
    draft: 'bg-slate-100 text-slate-700',
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  };

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    const callSummary = calls.slice(0, 10).map(c => ({
      title: c.title_en,
      type: c.call_type,
      status: c.status,
      budget: c.budget_total,
      proposals: c.proposals_count,
      themes: c.research_themes
    }));

    const { success, data } = await invokeAI({
      prompt: `Analyze these R&D calls for Saudi municipal innovation and provide strategic insights in BOTH English AND Arabic:

R&D Calls: ${JSON.stringify(callSummary)}

Statistics:
- Total Calls: ${stats.totalCalls}
- Open Calls: ${stats.openCalls}
- Total Proposals: ${stats.totalProposals}
- Approved Proposals: ${stats.approvedProposals}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Research priority alignment with national needs
2. Proposal quality and competitiveness trends
3. Funding allocation optimization
4. Emerging research themes to prioritize
5. Success factors for future calls`,
      response_json_schema: {
        type: 'object',
        properties: {
          research_alignment: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          proposal_trends: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          funding_optimization: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          emerging_themes: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          success_factors: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
        }
      }
    });

    if (success) {
      setAiInsights(data);
    }
  };

  if (callsLoading || proposalsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'R&D Calls & Proposals', ar: 'دعوات البحث والمقترحات' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Research funding opportunities and submissions', ar: 'فرص التمويل البحثي والمقترحات' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handleAIInsights} disabled={!isAvailable || aiLoading}>
            <Sparkles className="h-4 w-4" />
            {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
          </Button>
          <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} />
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          {hasPermission('rd_call_manage') && (
            <Link to={createPageUrl('RDCallCreate')}>
              <Button className="bg-gradient-to-r from-blue-600 to-teal-600 gap-2">
                <Plus className="h-5 w-5" />
                {t({ en: 'New R&D Call', ar: 'دعوة جديدة' })}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* AI Insights Modal */}
      {showAIInsights && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Strategic Insights', ar: 'الرؤى الاستراتيجية الذكية' })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing R&D calls...', ar: 'جاري تحليل دعوات البحث...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.research_alignment?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Research Alignment', ar: 'توافق البحث' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.research_alignment.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.proposal_trends?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Proposal Trends', ar: 'اتجاهات المقترحات' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.proposal_trends.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.funding_optimization?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Funding Optimization', ar: 'تحسين التمويل' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.funding_optimization.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.emerging_themes?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Emerging Themes', ar: 'المواضيع الناشئة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.emerging_themes.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.success_factors?.length > 0 && (
                  <div className="p-4 bg-teal-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-teal-700 mb-2">{t({ en: 'Success Factors', ar: 'عوامل النجاح' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.success_factors.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Calls', ar: 'إجمالي الدعوات' })}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalCalls}</p>
              </div>
              <Megaphone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Open Calls', ar: 'الدعوات المفتوحة' })}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.openCalls}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Proposals', ar: 'المقترحات' })}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalProposals}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Approved', ar: 'المعتمدة' })}</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.approvedProposals}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calls" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calls">{t({ en: 'R&D Calls', ar: 'الدعوات' })}</TabsTrigger>
          <TabsTrigger value="proposals">{t({ en: 'My Proposals', ar: 'مقترحاتي' })}</TabsTrigger>
        </TabsList>

        {/* R&D Calls Tab */}
        <TabsContent value="calls" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
                  <Input
                    placeholder={t({ en: 'Search R&D calls...', ar: 'ابحث عن الدعوات...' })}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={isRTL ? 'pr-10' : 'pl-10'}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t({ en: 'Status', ar: 'الحالة' })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t({ en: 'All Statuses', ar: 'جميع الحالات' })}</SelectItem>
                    <SelectItem value="draft">{t({ en: 'Draft', ar: 'مسودة' })}</SelectItem>
                    <SelectItem value="open">{t({ en: 'Open', ar: 'مفتوحة' })}</SelectItem>
                    <SelectItem value="closed">{t({ en: 'Closed', ar: 'مغلقة' })}</SelectItem>
                    <SelectItem value="evaluation">{t({ en: 'Evaluation', ar: 'تقييم' })}</SelectItem>
                    <SelectItem value="awarded">{t({ en: 'Awarded', ar: 'ممنوحة' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Calls Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCalls.map((call) => {
                const daysLeft = call.close_date ? Math.ceil((new Date(call.close_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                
                return (
                  <Card key={call.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                    {call.image_url && (
                      <div className="h-48 overflow-hidden">
                        <img src={call.image_url} alt={call.title_en} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={statusColors[call.status]}>
                          {call.status?.replace(/_/g, ' ')}
                        </Badge>
                        {daysLeft !== null && daysLeft > 0 && call.status === 'open' && (
                          <Badge variant="outline" className="border-red-300 text-red-700">
                            {daysLeft} {t({ en: 'days left', ar: 'يوم متبقي' })}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl" dir={language === 'ar' && call.title_ar ? 'rtl' : 'ltr'}>
                        {language === 'ar' && call.title_ar ? call.title_ar : call.title_en}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {call.theme_en && (
                        <p className="text-sm font-medium text-blue-600" dir={language === 'ar' && call.theme_ar ? 'rtl' : 'ltr'}>
                          {language === 'ar' && call.theme_ar ? call.theme_ar : call.theme_en}
                        </p>
                      )}
                      <p className="text-sm text-slate-600 line-clamp-3" dir={language === 'ar' && call.description_ar ? 'rtl' : 'ltr'}>
                        {language === 'ar' && call.description_ar ? call.description_ar : call.description_en}
                      </p>

                      <div className="space-y-2 text-sm">
                        {call.budget_total && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <DollarSign className="h-4 w-4" />
                            <span>{(call.budget_total / 1000000).toFixed(1)}M {call.budget_currency || 'SAR'}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(call.open_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')} - {new Date(call.close_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                        </div>
                        {call.proposals_count > 0 && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <FileText className="h-4 w-4" />
                            <span>{call.proposals_count} {t({ en: 'proposals', ar: 'مقترح' })}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Link to={createPageUrl(`RDCallDetail?id=${call.id}`)} className="flex-1">
                          <Button variant="outline" className="w-full">
                            {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                          </Button>
                        </Link>
                        {call.status === 'open' && (
                          <Link to={createPageUrl('ProposalWizard')} className="flex-1">
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-600">
                              {t({ en: 'Apply', ar: 'تقديم' })}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Call', ar: 'الدعوة' })}</th>
                        <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Type', ar: 'النوع' })}</th>
                        <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Status', ar: 'الحالة' })}</th>
                        <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Deadline', ar: 'الموعد' })}</th>
                        <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Funding', ar: 'التمويل' })}</th>
                        <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Submissions', ar: 'الطلبات' })}</th>
                        <th className="text-right p-4 text-sm font-semibold">{t({ en: 'Actions', ar: 'إجراءات' })}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCalls.map((call) => (
                        <tr key={call.id} className="border-b hover:bg-slate-50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {call.image_url && (
                                <img src={call.image_url} alt={call.title_en} className="w-12 h-12 object-cover rounded" />
                              )}
                              <div>
                                <p className="font-medium">{call.title_en}</p>
                                <p className="text-xs text-slate-500">{call.code}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{call.call_type?.replace(/_/g, ' ')}</Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={statusColors[call.status]}>{call.status?.replace(/_/g, ' ')}</Badge>
                          </td>
                          <td className="p-4 text-sm">
                            {call.close_date ? new Date(call.close_date).toLocaleDateString() : 'TBD'}
                          </td>
                          <td className="p-4 text-sm">
                            {call.budget_total ? `${(call.budget_total / 1000000).toFixed(1)}M SAR` : 'N/A'}
                          </td>
                          <td className="p-4 text-sm">{call.proposals_count || 0}</td>
                          <td className="p-4 text-right">
                            <Link to={createPageUrl(`RDCallDetail?id=${call.id}`)}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                {t({ en: 'View', ar: 'عرض' })}
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Proposals Tab */}
        <TabsContent value="proposals">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'My R&D Proposals', ar: 'مقترحاتي البحثية' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {proposals.length > 0 ? (
                <div className="space-y-3">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-slate-900" dir={language === 'ar' && proposal.title_ar ? 'rtl' : 'ltr'}>
                              {language === 'ar' && proposal.title_ar ? proposal.title_ar : proposal.title_en}
                            </h3>
                            <Badge className={proposalStatusColors[proposal.status]}>
                              {proposal.status?.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2" dir={language === 'ar' && proposal.abstract_ar ? 'rtl' : 'ltr'}>
                            {language === 'ar' && proposal.abstract_ar ? proposal.abstract_ar : proposal.abstract_en}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            {proposal.principal_investigator && (
                              <span>PI: {typeof proposal.principal_investigator === 'object' 
                                ? proposal.principal_investigator.name 
                                : proposal.principal_investigator}</span>
                            )}
                            {proposal.budget_requested && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {(proposal.budget_requested / 1000).toFixed(0)}K
                              </span>
                            )}
                            {proposal.ai_score && (
                              <span className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                AI Score: {proposal.ai_score}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link to={createPageUrl(`RDProposalDetail?id=${proposal.id}`)}>
                          <Button variant="outline" size="sm">
                            {t({ en: 'View', ar: 'عرض' })}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">{t({ en: 'No proposals submitted yet', ar: 'لا توجد مقترحات' })}</p>
                  <Button className="mt-4 bg-gradient-to-r from-blue-600 to-teal-600">
                    {t({ en: 'Submit First Proposal', ar: 'تقديم أول مقترح' })}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(RDCallsPage, { requiredPermissions: ['rd_call_view'] });