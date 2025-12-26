import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useSandboxes } from '@/hooks/useSandboxes';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Beaker, Shield, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function SandboxLabCapacityPlanner() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const { invokeAI, status, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const [selectedSandbox, setSelectedSandbox] = useState(null);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [newResource, setNewResource] = useState({ name: '', type: 'equipment', quantity: 1, available: true, metadata: {} });
  const [bookingBlock, setBookingBlock] = useState(null);

  const {
    useAllSandboxes,
    useResources,
    useBookings,
    useCreateResource,
    useCreateBooking
  } = useSandboxes();

  const { data: sandboxes = [] } = useAllSandboxes(user);

  const sandboxIds = sandboxes.map(s => s.id);
  const { data: resources = [] } = useResources(sandboxIds);

  const resourceIds = resources.map(r => r.id);
  const { data: bookings = [] } = useBookings(resourceIds);

  const createResourceMutation = useCreateResource();
  const createBookingMutation = useCreateBooking();

  const { data: pilots = [] } = usePilotsWithVisibility({
    status: 'active',
    includeDeleted: false
  });

  const labBookings = pilots.filter(p => p.living_lab_id);

  const analyzeCapacity = async () => {
    const result = await invokeAI({
      prompt: `Analyze sandbox and living lab capacity for Saudi municipal innovation:

Sandboxes: ${sandboxes.length}
- Active: ${sandboxes.filter(s => s.status === 'active').length}
- Capacity: ${sandboxes.reduce((sum, s) => sum + (s.capacity || 5), 0)} total slots
- Occupied: ${sandboxes.reduce((sum, s) => sum + (s.current_pilots || 0), 0)}

Living Labs: ${livingLabs.length}
- Total Capacity: ${livingLabs.reduce((sum, l) => sum + (l.capacity_projects || 3), 0)}
- Bookings: ${labBookings.length}

Pilots needing facilities: ${pilots.filter(p => !p.living_lab_id && !p.sandbox_id && p.stage === 'active').length}

Generate bilingual capacity analysis:
1. Current utilization by facility
2. Capacity bottlenecks and constraints
3. Expansion recommendations(where, when, capacity)
4. Booking optimization suggestions
5. AI allocation recommendations for upcoming pilots`,
      response_json_schema: {
        type: 'object',
        properties: {
          facility_utilization: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                facility_name: { type: 'string' },
                type: { type: 'string' },
                capacity: { type: 'number' },
                occupied: { type: 'number' },
                utilization_percentage: { type: 'number' }
              }
            }
          },
          bottlenecks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                issue_en: { type: 'string' },
                issue_ar: { type: 'string' },
                severity: { type: 'string' },
                recommendation_en: { type: 'string' },
                recommendation_ar: { type: 'string' }
              }
            }
          },
          expansion_plan: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                location_en: { type: 'string' },
                location_ar: { type: 'string' },
                type: { type: 'string' },
                capacity: { type: 'number' },
                timeline: { type: 'string' },
                priority: { type: 'string' }
              }
            }
          }
        }
      }
    });

    if (result.success) {
      setAiRecommendations(result.data);
      toast.success(t({ en: 'Capacity analysis complete', ar: 'اكتمل تحليل السعة' }));
    }
  };

  const handleAddResource = () => {
    if (!selectedSandbox) return;
    createResourceMutation.mutate({
      sandbox_id: selectedSandbox,
      resource_name: newResource.name,
      resource_type: newResource.type,
      capacity: parseInt(newResource.quantity),
      is_available: newResource.available,
      metadata: newResource.metadata || {}
    }, {
      onSuccess: () => {
        setIsAddResourceOpen(false);
        setNewResource({ name: '', type: 'equipment', quantity: 1, available: true, metadata: {} });
      }
    });
  };

  const handleBookingConfirm = (details) => {
    if (!bookingBlock) return;
    createBookingMutation.mutate({
      resource_id: bookingBlock.resourceId,
      booked_by: user.email,
      project_id: details.projectId,
      start_time: bookingBlock.start.toISOString(),
      end_time: bookingBlock.end.toISOString(),
      status: 'confirmed',
      notes: details.notes
    }, {
      onSuccess: () => {
        setBookingBlock(null);
      }
    });
  };

  const capacityData = [
    ...sandboxes.map(s => ({
      name: language === 'ar' ? s.name_ar : s.name_en,
      type: 'Sandbox',
      capacity: s.capacity || 5,
      occupied: s.current_pilots || 0,
      utilization: ((s.current_pilots || 0) / (s.capacity || 5)) * 100
    })),
    ...livingLabs.map(l => ({
      name: language === 'ar' ? l.name_ar : l.name_en,
      type: 'Living Lab',
      capacity: l.capacity_projects || 3,
      occupied: labBookings.filter(b => b.living_lab_id === l.id).length,
      utilization: (labBookings.filter(b => b.living_lab_id === l.id).length / (l.capacity_projects || 3)) * 100
    }))
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '🧪 Sandbox & Lab Capacity Planner', ar: '🧪 مخطط سعة المناطق والمختبرات' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Infrastructure capacity planning, utilization tracking, and expansion recommendations', ar: 'تخطيط سعة البنية التحتية وتتبع الاستخدام وتوصيات التوسع' })}
        </p>
      </div>

      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900 mb-1 text-lg">
                {t({ en: 'AI Capacity Analyzer', ar: 'محلل السعة الذكي' })}
              </p>
              <p className="text-sm text-slate-600">
                {t({ en: 'Analyze utilization, identify bottlenecks, and recommend expansions', ar: 'تحليل الاستخدام وتحديد الاختناقات والتوصية بالتوسعات' })}
              </p>
            </div>
            <Button onClick={analyzeCapacity} disabled={loading || !isAvailable} className="bg-gradient-to-r from-teal-600 to-blue-600">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Analyze Capacity', ar: 'تحليل السعة' })}
            </Button>
          </div>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Facility Utilization', ar: 'استخدام المرافق' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {capacityData.map((facility, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {facility.type === 'Sandbox' ? <Shield className="h-5 w-5 text-purple-600" /> : <Beaker className="h-5 w-5 text-teal-600" />}
                    <div>
                      <p className="font-medium text-slate-900">{facility.name}</p>
                      <p className="text-xs text-slate-500">{facility.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{facility.occupied}/{facility.capacity}</p>
                    <Badge className={facility.utilization > 80 ? 'bg-red-600' : facility.utilization > 60 ? 'bg-yellow-600' : 'bg-green-600'}>
                      {facility.utilization.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={facility.utilization} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {aiRecommendations && (
        <div className="space-y-6">
          {aiRecommendations.bottlenecks?.length > 0 && (
            <Card className="border-2 border-red-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <AlertCircle className="h-5 w-5" />
                  {t({ en: 'Capacity Bottlenecks', ar: 'اختناقات السعة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiRecommendations.bottlenecks.map((bottleneck, idx) => (
                    <div key={idx} className={`p - 4 border - 2 rounded - lg ${bottleneck.severity === 'high' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'
                      } `}>
                      <p className="font-semibold text-slate-900 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? bottleneck.issue_ar : bottleneck.issue_en}
                      </p>
                      <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        💡 {language === 'ar' ? bottleneck.recommendation_ar : bottleneck.recommendation_en}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {aiRecommendations.expansion_plan?.length > 0 && (
            <Card className="border-2 border-green-300">
              <CardHeader>
                <CardTitle className="text-green-900">{t({ en: 'Expansion Recommendations', ar: 'توصيات التوسع' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiRecommendations.expansion_plan.map((plan, idx) => (
                    <div key={idx} className="p-4 bg-white border-2 border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-900">
                          {language === 'ar' ? plan.location_ar : plan.location_en}
                        </p>
                        <Badge className={plan.priority === 'high' ? 'bg-red-600' : 'bg-blue-600'}>
                          {plan.priority}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-slate-500">{t({ en: 'Type', ar: 'النوع' })}</p>
                          <Badge variant="outline">{plan.type}</Badge>
                        </div>
                        <div>
                          <p className="text-slate-500">{t({ en: 'Capacity', ar: 'السعة' })}</p>
                          <p className="font-bold">{plan.capacity} projects</p>
                        </div>
                        <div>
                          <p className="text-slate-500">{t({ en: 'Timeline', ar: 'الجدول' })}</p>
                          <p className="font-medium">{plan.timeline}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default ProtectedPage(SandboxLabCapacityPlanner, { requireAdmin: true });