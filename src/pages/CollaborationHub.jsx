import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { Users, Sparkles, Network, MessageSquare, Calendar, Target, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function CollaborationHub() {
  const { language, isRTL, t } = useLanguage();
  const [suggestions, setSuggestions] = useState(null);
  const { invokeAI, status: aiStatus, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list()
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });

  const generateCollaborationSuggestions = async () => {
    try {
      const myChallenges = challenges.filter(c => c.created_by === user?.email);
      const myPilots = pilots.filter(p => p.created_by === user?.email);

      const response = await invokeAI({
        prompt: `Based on this user's activities, suggest strategic collaboration opportunities:

My Challenges (${myChallenges.length}):
${myChallenges.slice(0, 5).map(c => `- ${c.title_en} (${c.sector})`).join('\n')}

My Pilots (${myPilots.length}):
${myPilots.slice(0, 5).map(p => `- ${p.title_en} (${p.sector})`).join('\n')}

Available Organizations (${organizations.length}):
${organizations.slice(0, 15).map(o => `- ${o.name_en} (${o.organization_type})`).join('\n')}

Suggest:
1. 5 potential collaboration partners (from organizations list) with specific collaboration opportunities
2. 3 cross-sector collaboration ideas
3. 2 networking events/meetings to organize`,
        response_json_schema: {
          type: "object",
          properties: {
            partner_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  organization: { type: "string" },
                  opportunity: { type: "string" },
                  benefit: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            cross_sector_ideas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  sectors: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            event_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  purpose: { type: "string" },
                  attendees: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (response.success) {
        setSuggestions(response.data);
        toast.success(t({ en: 'Collaboration opportunities generated', ar: 'تم إنشاء فرص التعاون' }));
      } else {
        toast.error(t({ en: 'Failed to generate suggestions', ar: 'فشل إنشاء الاقتراحات' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Failed to generate suggestions', ar: 'فشل إنشاء الاقتراحات' }));
    }
  };

  const activeCollaborations = teams.filter(team => 
    team.members?.some(m => m.email === user?.email)
  );

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Collaboration Hub', ar: 'مركز التعاون' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Build strategic partnerships and cross-sector collaborations', ar: 'بناء شراكات استراتيجية وتعاون متعدد القطاعات' })}
          </p>
        </div>
        <Button onClick={generateCollaborationSuggestions} disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Sparkles className="h-4 w-4 mr-2" />
          {loading ? t({ en: 'Generating...', ar: 'جاري الإنشاء...' }) : t({ en: 'AI Suggestions', ar: 'اقتراحات ذكية' })}
        </Button>
      </div>

      {/* My Active Collaborations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Users className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{activeCollaborations.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'My Teams', ar: 'فرقي' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Network className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{organizations.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Network Partners', ar: 'شركاء الشبكة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-10 w-10 text-teal-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-teal-600">
              {challenges.filter(c => c.stakeholders?.length > 1).length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Multi-Stakeholder', ar: 'متعدد الأطراف' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Partnership Suggestions */}
      {suggestions && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                {t({ en: 'Recommended Partners', ar: 'الشركاء الموصى بهم' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.partner_suggestions?.map((partner, idx) => (
                <div key={idx} className="p-4 bg-white rounded-lg border border-purple-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{partner.organization}</h4>
                      <Badge className="mt-1 bg-purple-100 text-purple-700">{partner.priority} priority</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">
                    <strong>{t({ en: 'Opportunity:', ar: 'الفرصة:' })}</strong> {partner.opportunity}
                  </p>
                  <p className="text-sm text-green-700">
                    💡 <strong>{t({ en: 'Benefit:', ar: 'الفائدة:' })}</strong> {partner.benefit}
                  </p>
                  <Button size="sm" className="mt-3 bg-purple-600">
                    {t({ en: 'Initiate Partnership', ar: 'بدء الشراكة' })}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-teal-50 to-white border-2 border-teal-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-teal-600" />
                  {t({ en: 'Cross-Sector Ideas', ar: 'أفكار متعددة القطاعات' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.cross_sector_ideas?.map((idea, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold text-slate-900 mb-1">{idea.title}</h4>
                    <Badge variant="outline" className="text-xs mb-2">{idea.sectors}</Badge>
                    <p className="text-sm text-slate-700">{idea.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-600" />
                  {t({ en: 'Networking Events', ar: 'فعاليات التواصل' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.event_suggestions?.map((event, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold text-slate-900 mb-1">{event.title}</h4>
                    <p className="text-xs text-slate-600 mb-2">{event.purpose}</p>
                    <p className="text-xs text-slate-500">
                      <strong>{t({ en: 'Invite:', ar: 'دعوة:' })}</strong> {event.attendees}
                    </p>
                    <Button size="sm" variant="outline" className="mt-3 w-full">
                      {t({ en: 'Schedule Event', ar: 'جدولة الفعالية' })}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Active Teams */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t({ en: 'My Active Teams', ar: 'فرقي النشطة' })}</CardTitle>
            <Link to={createPageUrl('TeamManagement')}>
              <Button variant="outline" size="sm">
                {t({ en: 'Manage Teams', ar: 'إدارة الفرق' })}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCollaborations.map((team) => (
              <div key={team.id} className="p-4 border rounded-lg hover:border-blue-300 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">{team.name}</h4>
                    <Badge variant="outline" className="text-xs mt-1">{team.team_type?.replace(/_/g, ' ')}</Badge>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">{team.member_count} members</Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{team.description}</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {t({ en: 'Chat', ar: 'محادثة' })}
                  </Button>
                  <Button size="sm" variant="outline">
                    {t({ en: 'View', ar: 'عرض' })}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(CollaborationHub, { requiredPermissions: [] });