import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { 
  Users, Building2, Lightbulb, MessageSquare, Share2, Award,
  TrendingUp, Target, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';

function CrossCityLearningHub() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);
  const [shareDialog, setShareDialog] = useState(null);
  const [learningNote, setLearningNote] = useState('');

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: myMunicipality } = useQuery({
    queryKey: ['my-municipality-learning', user?.email],
    queryFn: async () => {
      const all = await base44.entities.Municipality.list();
      return all.find(m => m.contact_email === user?.email);
    },
    enabled: !!user
  });

  const { data: allMunicipalities = [] } = useQuery({
    queryKey: ['all-municipalities-learning'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-learning'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-learning'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const shareLearningMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.KnowledgeDocument.create({
        title_en: `Learning from ${shareDialog.code}`,
        content_en: data.learning,
        document_type: 'best_practice',
        source_entity_type: shareDialog.type,
        source_entity_id: shareDialog.id,
        municipality_id: myMunicipality?.id,
        tags: ['cross_city_learning', shareDialog.sector],
        is_public: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      toast.success(t({ en: 'Learning shared with network', ar: 'تم مشاركة التعلم مع الشبكة' }));
      setShareDialog(null);
      setLearningNote('');
    }
  });

  // Find similar municipalities
  const peerMunicipalities = myMunicipality 
    ? allMunicipalities.filter(m => 
        m.id !== myMunicipality.id &&
        (Math.abs((m.population || 0) - (myMunicipality.population || 0)) < myMunicipality.population * 0.5 ||
         m.city_type === myMunicipality.city_type)
      )
    : [];

  // Success stories from peers
  const peerSuccesses = pilots.filter(p => 
    p.stage === 'completed' && 
    p.recommendation === 'scale' &&
    peerMunicipalities.some(m => m.id === p.municipality_id)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: '🤝 Cross-City Learning Hub', ar: '🤝 مركز التعلم بين المدن' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Share and learn from peer municipalities', ar: 'شارك وتعلم من البلديات النظيرة' })}
        </p>
      </div>

      {/* My Peers */}
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            {t({ en: 'Peer Municipalities', ar: 'البلديات النظيرة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {peerMunicipalities.slice(0, 6).map((peer) => {
              const peerChallenges = challenges.filter(c => c.municipality_id === peer.id);
              const peerPilots = pilots.filter(p => p.municipality_id === peer.id);

              return (
                <Link key={peer.id} to={createPageUrl(`MunicipalityProfile?id=${peer.id}`)}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-8 w-8 text-blue-600" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 text-sm">
                            {language === 'ar' && peer.name_ar ? peer.name_ar : peer.name_en}
                          </h3>
                          <p className="text-xs text-slate-500">{peer.region}</p>
                          {peer.mii_score && (
                            <div className="mt-2">
                              <Badge className="bg-blue-600 text-white text-xs">
                                MII: {peer.mii_score}
                              </Badge>
                            </div>
                          )}
                          <div className="flex gap-2 mt-2 text-xs">
                            <Badge variant="outline">{peerChallenges.length} challenges</Badge>
                            <Badge variant="outline">{peerPilots.length} pilots</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Success Stories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            {t({ en: 'Success Stories from Peers', ar: 'قصص نجاح من النظراء' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {peerSuccesses.slice(0, 5).map((pilot) => {
              const municipality = allMunicipalities.find(m => m.id === pilot.municipality_id);
              
              return (
                <div key={pilot.id} className="p-4 border-2 rounded-lg border-green-200 bg-gradient-to-r from-green-50 to-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-green-600 text-white">{t({ en: 'Scaled', ar: 'تم التوسع' })}</Badge>
                        <Badge variant="outline">{pilot.code}</Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900">
                        {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {municipality ? (language === 'ar' && municipality.name_ar ? municipality.name_ar : municipality.name_en) : ''}
                      </p>
                    </div>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => setShareDialog({ ...pilot, type: 'pilot' })}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      {t({ en: 'Share Learning', ar: 'شارك التعلم' })}
                    </Button>
                  </div>

                  {pilot.lessons_learned?.length > 0 && (
                    <div className="mt-3 p-3 bg-green-100 rounded">
                      <p className="text-xs font-semibold text-green-900 mb-1">
                        {t({ en: 'Lessons Learned:', ar: 'الدروس المستفادة:' })}
                      </p>
                      {pilot.lessons_learned.slice(0, 2).map((lesson, i) => (
                        <p key={i} className="text-xs text-green-800">• {lesson.lesson}</p>
                      ))}
                    </div>
                  )}

                  <Link to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                    <Button size="sm" variant="outline" className="w-full mt-3">
                      {t({ en: 'View Full Story', ar: 'عرض القصة الكاملة' })}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      {shareDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShareDialog(null)}>
          <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>{t({ en: 'Share Your Learning', ar: 'شارك ما تعلمته' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">
                  {language === 'ar' && shareDialog.title_ar ? shareDialog.title_ar : shareDialog.title_en}
                </h4>
                <p className="text-sm text-slate-600">{shareDialog.code}</p>
              </div>

              <Textarea
                placeholder={t({ 
                  en: 'What did you learn from this pilot that could help other municipalities?',
                  ar: 'ما الذي تعلمته من هذه التجربة ويمكن أن يساعد البلديات الأخرى؟'
                })}
                value={learningNote}
                onChange={(e) => setLearningNote(e.target.value)}
                className="min-h-32"
              />

              <div className="flex gap-2">
                <Button
                  onClick={() => shareLearningMutation.mutate({ learning: learningNote })}
                  disabled={!learningNote || shareLearningMutation.isPending}
                  className="flex-1 bg-green-600"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {t({ en: 'Share with Network', ar: 'مشاركة مع الشبكة' })}
                </Button>
                <Button
                  onClick={() => setShareDialog(null)}
                  variant="outline"
                  className="flex-1"
                >
                  {t({ en: 'Cancel', ar: 'إلغاء' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ProtectedPage(CrossCityLearningHub, { requiredPermissions: [] });