import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Sparkles, Loader2, Target, Lightbulb, Send, CheckCircle2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ChallengeSolutionMatching() {
  const { language, isRTL, t } = useLanguage();
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [notifying, setNotifying] = useState(false);
  const queryClient = useQueryClient();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-for-matching'],
    queryFn: async () => {
      const all = await base44.entities.Challenge.list();
      return all.filter(c => c.status === 'approved' || c.status === 'in_treatment');
    }
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions-for-matching'],
    queryFn: async () => {
      const all = await base44.entities.Solution.list();
      return all.filter(s => s.is_verified && s.is_published);
    }
  });

  const createMatchMutation = useMutation({
    mutationFn: (data) => base44.entities.ChallengeSolutionMatch.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['matches']);
      toast.success(t({ en: 'Match saved', ar: 'تم حفظ المطابقة' }));
    }
  });

  const runMatching = async () => {
    if (!selectedChallenge) return;
    
    setMatching(true);
    try {
      const result = await base44.functions.invoke('semanticSearch', {
        challenge_id: selectedChallenge.id,
        limit: 10
      });

      setMatches(result.data || []);
      toast.success(t({ en: 'Matching complete', ar: 'اكتملت المطابقة' }));
    } catch (error) {
      toast.error(t({ en: 'Matching failed', ar: 'فشلت المطابقة' }));
    } finally {
      setMatching(false);
    }
  };

  const notifyProviders = async () => {
    setNotifying(true);
    try {
      const topMatches = matches.slice(0, 5);
      
      for (const match of topMatches) {
        const solution = solutions.find(s => s.id === match.solution_id);
        if (!solution?.contact_email) continue;

        await supabase.functions.invoke('email-trigger-hub', {
          body: {
            trigger: 'challenge.match_found',
            recipient_email: solution.contact_email,
            entity_type: 'solution',
            entity_id: solution.id,
            variables: {
              providerName: solution.provider_name,
              solutionName: solution.name_en,
              challengeTitle: selectedChallenge.title_en,
              challengeCode: selectedChallenge.code,
              municipalityId: selectedChallenge.municipality_id,
              sector: selectedChallenge.sector,
              matchScore: match.similarity_score,
              challengeDescription: selectedChallenge.description_en?.substring(0, 300)
            }
          }
        });

        // Create notification record
        await base44.entities.Notification.create({
          user_email: solution.contact_email,
          type: 'solution_match',
          title: `New Challenge Match: ${selectedChallenge.code}`,
          message: `Your solution matched with ${selectedChallenge.title_en} (${match.similarity_score}% match)`,
          entity_type: 'challenge',
          entity_id: selectedChallenge.id,
          is_read: false
        });
      }

      toast.success(t({ 
        en: `Notified ${topMatches.length} providers`, 
        ar: `تم إشعار ${topMatches.length} مزودين` 
      }));
    } catch (error) {
      toast.error(t({ en: 'Notification failed', ar: 'فشل الإشعار' }));
    } finally {
      setNotifying(false);
    }
  };

  const saveMatch = (match) => {
    createMatchMutation.mutate({
      challenge_id: selectedChallenge.id,
      solution_id: match.solution_id,
      similarity_score: match.similarity_score,
      match_method: 'ai_semantic',
      status: 'discovered'
    });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
          {t({ en: 'AI Challenge-Solution Matching', ar: 'مطابقة التحديات والحلول الذكية' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Semantic matching engine to discover solutions for challenges', ar: 'محرك المطابقة الدلالي لاكتشاف الحلول للتحديات' })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Challenge Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              {t({ en: 'Select Challenge', ar: 'اختر التحدي' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {challenges.map((challenge) => (
              <button
                key={challenge.id}
                onClick={() => setSelectedChallenge(challenge)}
                className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                  selectedChallenge?.id === challenge.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs font-mono">{challenge.code}</Badge>
                  <Badge className={
                    challenge.priority === 'tier_1' ? 'bg-red-100 text-red-700 text-xs' :
                    challenge.priority === 'tier_2' ? 'bg-orange-100 text-orange-700 text-xs' :
                    'bg-blue-100 text-blue-700 text-xs'
                  }>{challenge.priority}</Badge>
                </div>
                <p className="text-sm font-medium text-slate-900 line-clamp-2">
                  {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                </p>
                <p className="text-xs text-slate-600 mt-1">{challenge.sector?.replace(/_/g, ' ')}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Matching Controls */}
        <div className="lg:col-span-2 space-y-6">
          {selectedChallenge && (
            <Card className="border-2 border-blue-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  {language === 'ar' && selectedChallenge.title_ar ? selectedChallenge.title_ar : selectedChallenge.title_en}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-700">
                  {language === 'ar' && selectedChallenge.description_ar 
                    ? selectedChallenge.description_ar.substring(0, 200) 
                    : selectedChallenge.description_en?.substring(0, 200)}...
                </p>

                <div className="flex gap-3">
                  <Button
                    onClick={runMatching}
                    disabled={matching}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {matching ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t({ en: 'Matching...', ar: 'جاري المطابقة...' })}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {t({ en: 'Run AI Matching', ar: 'تشغيل المطابقة' })}
                      </>
                    )}
                  </Button>

                  {matches.length > 0 && (
                    <Button
                      onClick={notifyProviders}
                      disabled={notifying}
                      className="bg-green-600"
                    >
                      {notifying ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4 mr-2" />
                      )}
                      {t({ en: 'Notify Top 5', ar: 'إشعار أفضل 5' })}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Matching Results */}
          {matches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-green-600" />
                  {t({ en: 'Matched Solutions', ar: 'الحلول المطابقة' })} ({matches.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {matches.map((match, idx) => {
                  const solution = solutions.find(s => s.id === match.solution_id);
                  if (!solution) return null;

                  return (
                    <div key={match.solution_id} className="p-4 border-2 rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              #{idx + 1}
                            </Badge>
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              {match.similarity_score}% match
                            </Badge>
                            {solution.is_verified && (
                              <Badge className="bg-blue-100 text-blue-700 text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-slate-900 mb-1">{solution.name_en}</h3>
                          <p className="text-sm text-slate-600">{solution.provider_name}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span>{solution.maturity_level?.replace(/_/g, ' ')}</span>
                            <span>• TRL {solution.trl || 'N/A'}</span>
                            <span>• {solution.deployment_count || 0} deployments</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link to={createPageUrl(`SolutionDetail?id=${solution.id}`)}>
                            <Button size="sm" variant="outline">
                              {t({ en: 'View', ar: 'عرض' })}
                            </Button>
                          </Link>
                          <Button size="sm" onClick={() => saveMatch(match)} className="bg-blue-600">
                            {t({ en: 'Save Match', ar: 'حفظ' })}
                          </Button>
                        </div>
                      </div>
                      <Progress value={match.similarity_score} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProtectedPage(ChallengeSolutionMatching, { requireAdmin: true });