import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { CheckCircle2, X, FileText, AlertCircle, DollarSign, Sparkles, Loader2 } from 'lucide-react';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { useExecutiveApprovals } from '@/hooks/useExecutiveApprovals';

export default function ExecutiveApprovals() {
  const { language, isRTL, t } = useLanguage();
  const {
    pilots,
    rdCalls,
    sandboxApps,
    approveMutation,
    selectedItem,
    setSelectedItem,
    decision,
    setDecision,
    comments,
    setComments,
    aiBrief,
    generateAIBrief,
    generatingBrief,
    aiStatus,
    aiRateLimitInfo,
    aiIsAvailable
  } = useExecutiveApprovals();

  const allPendingItems = [
    ...pilots.map(p => ({
      ...p,
      type: 'pilot',
      itemType: 'Pilot',
      displayName_en: p.title_en,
      displayName_ar: p.title_ar,
      displayBudget: p.budget,
      displaySector: p.sector
    })),
    ...rdCalls.map(r => ({
      ...r,
      type: 'rd_call',
      itemType: 'R&D Call',
      displayName_en: r.title_en,
      displayName_ar: r.title_ar,
      displayBudget: r.budget_total,
      displaySector: r.sector
    })),
    ...sandboxApps.map(s => ({
      ...s,
      type: 'sandbox',
      itemType: 'Sandbox',
      displayName_en: s.organization_name || s.title_en || 'Sandbox App',
      displayName_ar: s.organization_name_ar || s.title_ar || 'طلب منطقة رملية',
      displayBudget: s.budget_requested || s.budget,
      displaySector: s.sector
    }))
  ];

  return (
    <PageLayout>
      <PageHeader
        icon={CheckCircle2}
        title={{ en: 'Executive Approvals', ar: 'موافقات القيادة' }}
        description={{ en: 'Strategic decisions queue', ar: 'قائمة القرارات الاستراتيجية' }}
        stats={[
          { icon: FileText, value: allPendingItems.length, label: { en: 'Pending', ar: 'معلق' } }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{pilots.length}</div>
            <div className="text-sm text-slate-600">{t({ en: 'Pilots', ar: 'تجارب' })}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{rdCalls.length}</div>
            <div className="text-sm text-slate-600">{t({ en: 'R&D Calls', ar: 'دعوات بحث' })}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600">{sandboxApps.length}</div>
            <div className="text-sm text-slate-600">{t({ en: 'Sandboxes', ar: 'مناطق' })}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval Queue */}
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Pending Approvals', ar: 'الموافقات المعلقة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allPendingItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedItem?.id === item.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2 text-xs">{item.itemType}</Badge>
                      <h4 className="font-medium text-slate-900 text-sm">
                        {language === 'ar' ? (item.displayName_ar || item.title_ar) : (item.displayName_en || item.title_en)}
                      </h4>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                        {item.displayBudget && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {(item.displayBudget / 1000000).toFixed(1)}M SAR
                          </span>
                        )}
                        {item.displaySector && <span>{item.displaySector.replace(/_/g, ' ')}</span>}
                      </div>
                    </div>
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              ))}
              {allPendingItems.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-green-300 mx-auto mb-3" />
                  <p className="text-slate-500">{t({ en: 'All caught up!', ar: 'تم الانتهاء من الكل!' })}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Decision Panel */}
        <div className="space-y-4">
          {selectedItem ? (
            <>
              <Card className="border-2 border-blue-300">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{t({ en: 'Review Item', ar: 'مراجعة العنصر' })}</span>
                    <Button
                      onClick={() => generateAIBrief(selectedItem, selectedItem.type)}
                      disabled={generatingBrief || !aiIsAvailable}
                      size="sm"
                      variant="outline"
                    >
                      {generatingBrief ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      {t({ en: 'AI Brief', ar: 'ملخص ذكي' })}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AIStatusIndicator status={aiStatus} rateLimitInfo={aiRateLimitInfo} />
                  <div>
                    <Badge className="mb-2">{selectedItem.itemType}</Badge>
                    <h3 className="font-bold text-lg">
                      {language === 'ar' ? (selectedItem.displayName_ar || selectedItem.title_ar) : (selectedItem.displayName_en || selectedItem.title_en)}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2">
                      {language === 'ar' && selectedItem.description_ar
                        ? selectedItem.description_ar.substring(0, 200)
                        : (selectedItem.description_en || '')?.substring(0, 200)}...
                    </p>
                  </div>

                  {aiBrief && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        {t({ en: 'AI Decision Brief', ar: 'ملخص القرار الذكي' })}
                      </p>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium text-purple-800">{t({ en: 'Strategic Alignment:', ar: 'المواءمة الاستراتيجية:' })}</p>
                          <p className="text-slate-700">{aiBrief.strategic_alignment}</p>
                        </div>
                        <div>
                          <p className="font-medium text-purple-800">{t({ en: 'Risk Level:', ar: 'مستوى المخاطر:' })}</p>
                          <Badge className={
                            aiBrief.risk_level === 'high' ? 'bg-red-100 text-red-700' :
                              aiBrief.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                          }>{aiBrief.risk_level}</Badge>
                        </div>
                        <div>
                          <p className="font-medium text-purple-800">{t({ en: 'Expected Impact:', ar: 'التأثير المتوقع:' })}</p>
                          <p className="text-slate-700">{aiBrief.expected_impact}</p>
                        </div>
                        <div>
                          <p className="font-medium text-green-800">{t({ en: 'AI Recommendation:', ar: 'التوصية الذكية:' })}</p>
                          <p className="text-green-700 font-semibold">{aiBrief.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Your Decision', ar: 'قرارك' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setDecision('approve')}
                      className={`${decision === 'approve' ? 'bg-green-600' : 'bg-slate-200 text-slate-700'}`}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t({ en: 'Approve', ar: 'موافقة' })}
                    </Button>
                    <Button
                      onClick={() => setDecision('reject')}
                      className={`${decision === 'reject' ? 'bg-red-600' : 'bg-slate-200 text-slate-700'}`}
                    >
                      <X className="h-4 w-4 mr-2" />
                      {t({ en: 'Reject', ar: 'رفض' })}
                    </Button>
                  </div>
                  <Textarea
                    placeholder={t({ en: 'Add comments...', ar: 'أضف تعليقات...' })}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                  />
                  <Button
                    onClick={() => {
                      approveMutation.mutate({
                        id: selectedItem.id,
                        type: selectedItem.type,
                        approved: decision === 'approve',
                        comments
                      });
                    }}
                    disabled={!decision || approveMutation.isPending}
                    className="w-full"
                  >
                    {t({ en: 'Submit Decision', ar: 'تقديم القرار' })}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  {t({ en: 'Select an item to review', ar: 'اختر عنصر للمراجعة' })}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}