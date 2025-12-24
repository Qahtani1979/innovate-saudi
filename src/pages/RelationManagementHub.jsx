import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import {
  Network,
  Sparkles,
  CheckCircle2,
  XCircle,
  Play,
  Loader2,
  AlertCircle,
  Lightbulb,
  TestTube,
  Microscope,
  Calendar,
  TrendingUp,
  Building2,
  Filter,
  Grid3x3,
  List,
  Trash2,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import RelationManager from '../components/RelationManager';
import { useRelationManagement } from '@/hooks/useRelationManagement';

function RelationManagementHub() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('run');
  const [selectedMatcher, setSelectedMatcher] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchProgress, setMatchProgress] = useState({ current: 0, total: 0 });
  const [showRelationManager, setShowRelationManager] = useState(false);

  // Filters and view
  const [reviewFilter, setReviewFilter] = useState('all');
  const [browseFilter, setBrowseFilter] = useState({ type: 'all', status: 'all', source: 'all' });
  const [browseView, setBrowseView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    useAllRelations,
    useAllChallenges,
    useAllSolutions,
    useAllPilots,
    useAllRDProjects,
    useAllPrograms,
    useAllRDCalls,
    reviewRelation,
    deleteRelation,
    createMatch
  } = useRelationManagement();

  // Fetch all relations
  const { data: relations = [], isLoading: relationsLoading } = useAllRelations();

  // Fetch pending AI suggestions
  const pendingMatches = relations.filter(r => r.status === 'pending');

  // Fetch entities for matching
  const { data: challenges = [] } = useAllChallenges();
  const { data: solutions = [] } = useAllSolutions();
  const { data: pilots = [] } = useAllPilots();
  const { data: rdProjects = [] } = useAllRDProjects();
  const { data: programs = [] } = useAllPrograms();
  const { data: rdCalls = [] } = useAllRDCalls();

  // Aliases for mutations to match usage
  const reviewMutation = reviewRelation;
  const deleteMutation = deleteRelation;

  // Matcher configurations
  const matchers = [
    {
      id: 'challenge-solution',
      name: { en: 'Challenge → Solution', ar: 'تحدي ← حل' },
      icon: Lightbulb,
      color: 'blue',
      bgColor: 'bg-blue-600',
      sourceType: 'challenge',
      targetType: 'solution',
      role: 'solved_by'
    },
    {
      id: 'challenge-rdcall',
      name: { en: 'Challenge → R&D Call', ar: 'تحدي ← دعوة بحث' },
      icon: Microscope,
      color: 'purple',
      bgColor: 'bg-purple-600',
      sourceType: 'challenge',
      targetType: 'rd_call',
      role: 'informed_by'
    },
    {
      id: 'pilot-challenge',
      name: { en: 'Pilot → Challenges (Scaling)', ar: 'تجربة ← تحديات (توسع)' },
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-600',
      sourceType: 'pilot',
      targetType: 'challenge',
      role: 'solved_by'
    },
    {
      id: 'rd-challenge',
      name: { en: 'R&D Project → Challenges (Pilot)', ar: 'مشروع بحث ← تحديات (تجريب)' },
      icon: TestTube,
      color: 'indigo',
      bgColor: 'bg-indigo-600',
      sourceType: 'rd_project',
      targetType: 'challenge',
      role: 'informed_by'
    },
    {
      id: 'solution-challenge',
      name: { en: 'Solution → Challenges', ar: 'حل ← تحديات' },
      icon: AlertCircle,
      color: 'red',
      bgColor: 'bg-red-600',
      sourceType: 'solution',
      targetType: 'challenge',
      role: 'solved_by'
    },
    {
      id: 'program-challenge',
      name: { en: 'Program → Challenges', ar: 'برنامج ← تحديات' },
      icon: Calendar,
      color: 'pink',
      bgColor: 'bg-pink-600',
      sourceType: 'program',
      targetType: 'challenge',
      role: 'informed_by'
    },
    {
      id: 'challenge-peers',
      name: { en: 'Similar Challenges', ar: 'تحديات مماثلة' },
      icon: Building2,
      color: 'teal',
      bgColor: 'bg-teal-600',
      sourceType: 'challenge',
      targetType: 'challenge',
      role: 'similar_to'
    }
  ];

  // Run AI Matching
  const runMatching = async (matcherConfig) => {
    console.log('🚀 Starting matcher:', matcherConfig.id);
    setIsMatching(true);
    setSelectedMatcher(matcherConfig.id);

    try {
      let sourceEntities = getEntitiesByType(matcherConfig.sourceType);
      let targetEntities = getEntitiesByType(matcherConfig.targetType);

      console.log(`📊 Raw counts - Source (${matcherConfig.sourceType}): ${sourceEntities.length}, Target (${matcherConfig.targetType}): ${targetEntities.length}`);

      // Filter entities with embeddings only
      sourceEntities = sourceEntities.filter(e => e.embedding && e.embedding.length > 0);
      targetEntities = targetEntities.filter(e => e.embedding && e.embedding.length > 0);

      console.log(`🎯 With embeddings - Source: ${sourceEntities.length}, Target: ${targetEntities.length}`);

      if (sourceEntities.length === 0 || targetEntities.length === 0) {
        toast.error(t({
          en: `No entities with embeddings. Source: ${sourceEntities.length}, Target: ${targetEntities.length}`,
          ar: `لا توجد كيانات. المصدر: ${sourceEntities.length}، الهدف: ${targetEntities.length}`
        }));
        setIsMatching(false);
        setSelectedMatcher(null);
        return;
      }

      toast.info(t({
        en: `Matching ${sourceEntities.length} × ${targetEntities.length}...`,
        ar: `مطابقة ${sourceEntities.length} × ${targetEntities.length}...`
      }));

      setMatchProgress({ current: 0, total: sourceEntities.length });
      let matchesCreated = 0;

      for (let i = 0; i < sourceEntities.length; i++) {
        const source = sourceEntities[i];
        setMatchProgress({ current: i + 1, total: sourceEntities.length });

        for (const target of targetEntities) {
          if (matcherConfig.sourceType === matcherConfig.targetType && source.id === target.id) {
            continue;
          }

          // Calculate cosine similarity
          const similarity = cosineSimilarity(source.embedding, target.embedding);
          const matchScore = Math.round(similarity * 100);

          if (matchScore >= 70) {
            // Determine challenge_id based on matcher type
            let challengeId, relatedEntityType, relatedEntityId;

            if (matcherConfig.sourceType === 'challenge') {
              challengeId = source.id;
              relatedEntityType = matcherConfig.targetType;
              relatedEntityId = target.id;
            } else if (matcherConfig.targetType === 'challenge') {
              challengeId = target.id;
              relatedEntityType = matcherConfig.sourceType;
              relatedEntityId = source.id;
            } else {
              continue;
            }

            // Check if relation already exists
            const existingRelation = relations.find(r =>
              r.challenge_id === challengeId &&
              r.related_entity_type === relatedEntityType &&
              r.related_entity_id === relatedEntityId
            );

            if (!existingRelation) {
              await createMatch.mutateAsync({
                challenge_id: challengeId,
                related_entity_type: relatedEntityType,
                related_entity_id: relatedEntityId,
                relation_role: matcherConfig.role,
                strength: matchScore,
                created_via: 'ai',
                status: 'pending',
                reviewed: false,
                notes: `AI-generated match (${matchScore}% similarity)`
              });

              matchesCreated++;
              console.log(`✅ Created match for ${challengeId}`);
            } else {
              console.log(`⏭️ Match exists: ${challengeId} → ${relatedEntityId}`);
            }
          }
        }
      }

      await queryClient.invalidateQueries(['all-relations']);
      await queryClient.refetchQueries(['all-relations']);

      console.log(`🎯 Matching complete: ${matchesCreated} new matches created`);

      if (matchesCreated === 0) {
        toast.info(t({
          en: '⚠️ No new matches found. All existing or below 70% similarity threshold.',
          ar: '⚠️ لم يتم العثور على مطابقات جديدة. جميعها موجودة أو أقل من 70٪ تشابه.'
        }), { duration: 5000 });
      } else {
        toast.success(t({
          en: `✅ Created ${matchesCreated} new matches! Check Review Suggestions tab →`,
          ar: `✅ تم إنشاء ${matchesCreated} مطابقة جديدة! راجع تبويب الاقتراحات ←`
        }), { duration: 5000 });
        setTimeout(() => setActiveTab('review'), 500);
      }
    } catch (error) {
      toast.error(t({
        en: `Error: ${error.message}`,
        ar: `خطأ: ${error.message}`
      }));
      console.error('Matching error:', error);
    } finally {
      setIsMatching(false);
      setSelectedMatcher(null);
      setMatchProgress({ current: 0, total: 0 });
    }
  };

  const getEntitiesByType = (type) => {
    switch (type) {
      case 'challenge': return challenges;
      case 'solution': return solutions;
      case 'pilot': return pilots;
      case 'rd_project': return rdProjects;
      case 'program': return programs;
      case 'rd_call': return rdCalls;
      default: return [];
    }
  };

  const cosineSimilarity = (a, b) => {
    if (!a || !b || a.length !== b.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  const getEntityName = (entityType, entityId) => {
    const entities = getEntitiesByType(entityType);
    const entity = entities.find(e => e.id === entityId);
    if (!entity) return entityId;

    return entity.title_ar || entity.name_ar || entity.title_en || entity.name_en || entity.code || entityId;
  };

  // Filter pending matches
  const filteredPendingMatches = pendingMatches.filter(r => {
    if (reviewFilter === 'all') return true;
    if (reviewFilter === 'high') return r.strength >= 85;
    if (reviewFilter === 'medium') return r.strength >= 70 && r.strength < 85;
    return true;
  });

  // Filter browse relations
  const filteredBrowseRelations = relations.filter(r => {
    if (browseFilter.type !== 'all' && r.related_entity_type !== browseFilter.type) return false;
    if (browseFilter.status !== 'all' && r.status !== browseFilter.status) return false;
    if (browseFilter.source !== 'all' && r.created_via !== browseFilter.source) return false;
    if (searchQuery) {
      const challenge = challenges.find(c => c.id === r.challenge_id);
      const targetName = getEntityName(r.related_entity_type, r.related_entity_id);
      const searchLower = searchQuery.toLowerCase();
      return (
        challenge?.code?.toLowerCase().includes(searchLower) ||
        challenge?.title_ar?.toLowerCase().includes(searchLower) ||
        challenge?.title_en?.toLowerCase().includes(searchLower) ||
        targetName?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          {t({ en: 'Relation Management Hub', ar: 'مركز إدارة العلاقات' })}
        </h1>
        <p className="text-slate-600">
          {t({ en: 'Run AI matching, review suggestions, and manage all entity relations', ar: 'تشغيل المطابقة الذكية ومراجعة الاقتراحات وإدارة جميع العلاقات' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-600">{pendingMatches.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pending Review', ar: 'قيد المراجعة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {relations.filter(r => r.status === 'approved').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Approved', ar: 'موافق عليها' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Network className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{relations.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Relations', ar: 'إجمالي العلاقات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">
              {relations.filter(r => r.status === 'rejected').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Rejected', ar: 'مرفوضة' })}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="run">
            <Play className="h-4 w-4 mr-2" />
            {t({ en: 'Run AI Matching', ar: 'تشغيل المطابقة' })}
          </TabsTrigger>
          <TabsTrigger value="review">
            <Sparkles className="h-4 w-4 mr-2" />
            {t({ en: 'Review Suggestions', ar: 'مراجعة الاقتراحات' })} ({pendingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="browse">
            <Network className="h-4 w-4 mr-2" />
            {t({ en: 'Browse Relations', ar: 'تصفح العلاقات' })} ({relations.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Run AI Matching */}
        <TabsContent value="run" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t({ en: 'AI Matchers', ar: 'المطابقات الذكية' })}</span>
                {isMatching && (
                  <Badge className="bg-blue-600 text-white">
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    {t({ en: 'Running...', ar: 'جاري التشغيل...' })} {matchProgress.current}/{matchProgress.total}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchers.map((matcher) => {
                  const Icon = matcher.icon;
                  const isRunning = isMatching && selectedMatcher === matcher.id;

                  return (
                    <Card key={matcher.id} className="border-2 hover:shadow-lg transition-all">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-3">
                          <Icon className={`h-12 w-12 text-${matcher.color}-600`} />
                          <p className="font-semibold text-slate-900">{matcher.name[language]}</p>
                          <Button
                            onClick={() => runMatching(matcher)}
                            disabled={isMatching}
                            className={`w-full ${matcher.bgColor} hover:opacity-90`}
                          >
                            {isRunning ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {matchProgress.current}/{matchProgress.total}
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                {t({ en: 'Run', ar: 'تشغيل' })}
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Review AI Suggestions */}
        <TabsContent value="review" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={reviewFilter} onValueChange={setReviewFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t({ en: 'All Matches', ar: 'كل المطابقات' })}</SelectItem>
                    <SelectItem value="high">{t({ en: 'High (≥85%)', ar: 'عالية (≥85٪)' })}</SelectItem>
                    <SelectItem value="medium">{t({ en: 'Medium (70-84%)', ar: 'متوسطة (70-84٪)' })}</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline">
                  {filteredPendingMatches.length} {t({ en: 'results', ar: 'نتيجة' })}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {filteredPendingMatches.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-slate-700 font-medium">
                  {t({ en: 'No pending suggestions', ar: 'لا توجد اقتراحات قيد الانتظار' })}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPendingMatches.map((relation) => {
              const challenge = challenges.find(c => c.id === relation.challenge_id);
              const targetName = getEntityName(relation.related_entity_type, relation.related_entity_id);

              return (
                <Card key={relation.id} className="border-2 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="text-lg px-4 py-1 bg-purple-600">
                        {relation.strength}% {t({ en: 'Match', ar: 'مطابقة' })}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            console.log('🟢 Approving relation:', relation.id);
                            reviewMutation.mutate({ relationId: relation.id, decision: 'approved' });
                          }}
                          disabled={reviewMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {reviewMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                          )}
                          {t({ en: 'Approve', ar: 'موافقة' })}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            console.log('🔴 Rejecting relation:', relation.id);
                            reviewMutation.mutate({ relationId: relation.id, decision: 'rejected' });
                          }}
                          disabled={reviewMutation.isPending}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          {reviewMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          {t({ en: 'Reject', ar: 'رفض' })}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-xs text-red-600 font-semibold mb-1">CHALLENGE</p>
                        <Link to={createPageUrl(`ChallengeDetail?id=${challenge?.id}`)}>
                          <p className="text-sm font-medium hover:text-blue-600">
                            {challenge?.code || relation.challenge_id}
                          </p>
                        </Link>
                      </div>

                      <div className="text-center">
                        <Badge variant="outline">{relation.relation_role}</Badge>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-600 font-semibold mb-1">
                          {relation.related_entity_type.toUpperCase()}
                        </p>
                        <p className="text-sm font-medium">{targetName}</p>
                      </div>
                    </div>

                    {relation.notes && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-slate-700">{relation.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Tab 3: Browse All Relations */}
        <TabsContent value="browse" className="space-y-4">
          {/* Filters and View Controls */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <Select value={browseFilter.type} onValueChange={(v) => setBrowseFilter({ ...browseFilter, type: v })}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t({ en: 'All Types', ar: 'كل الأنواع' })}</SelectItem>
                      <SelectItem value="solution">{t({ en: 'Solutions', ar: 'الحلول' })}</SelectItem>
                      <SelectItem value="pilot">{t({ en: 'Pilots', ar: 'التجارب' })}</SelectItem>
                      <SelectItem value="rd_project">{t({ en: 'R&D', ar: 'البحث' })}</SelectItem>
                      <SelectItem value="program">{t({ en: 'Programs', ar: 'البرامج' })}</SelectItem>
                      <SelectItem value="rd_call">{t({ en: 'R&D Calls', ar: 'دعوات البحث' })}</SelectItem>
                      <SelectItem value="challenge">{t({ en: 'Challenges', ar: 'التحديات' })}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={browseFilter.status} onValueChange={(v) => setBrowseFilter({ ...browseFilter, status: v })}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t({ en: 'All Status', ar: 'كل الحالات' })}</SelectItem>
                      <SelectItem value="pending">{t({ en: 'Pending', ar: 'قيد الانتظار' })}</SelectItem>
                      <SelectItem value="approved">{t({ en: 'Approved', ar: 'موافق عليها' })}</SelectItem>
                      <SelectItem value="rejected">{t({ en: 'Rejected', ar: 'مرفوضة' })}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={browseFilter.source} onValueChange={(v) => setBrowseFilter({ ...browseFilter, source: v })}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t({ en: 'All Sources', ar: 'كل المصادر' })}</SelectItem>
                      <SelectItem value="ai">{t({ en: 'AI-Generated', ar: 'من الذكاء' })}</SelectItem>
                      <SelectItem value="manual">{t({ en: 'Manual', ar: 'يدوي' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder={t({ en: 'Search...', ar: 'بحث...' })}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2 ml-auto">
                  <Button
                    variant={browseView === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBrowseView('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={browseView === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBrowseView('grid')}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => setShowRelationManager(true)}>
                    <Network className="h-4 w-4 mr-2" />
                    {t({ en: 'Add', ar: 'إضافة' })}
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                <Badge variant="outline">
                  {filteredBrowseRelations.length} {t({ en: 'results', ar: 'نتيجة' })}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {relationsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredBrowseRelations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Network className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  {t({ en: 'No relations found', ar: 'لم يتم العثور على علاقات' })}
                </p>
              </CardContent>
            </Card>
          ) : browseView === 'list' ? (
            <div className="space-y-2">
              {filteredBrowseRelations.map((relation) => {
                const challenge = challenges.find(c => c.id === relation.challenge_id);
                const targetName = getEntityName(relation.related_entity_type, relation.related_entity_id);

                return (
                  <Card key={relation.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Challenge</p>
                            <Link to={createPageUrl(`ChallengeDetail?id=${challenge?.id}`)}>
                              <p className="text-sm font-medium hover:text-blue-600">
                                {challenge?.code || relation.challenge_id}
                              </p>
                            </Link>
                          </div>

                          <div className="text-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {relation.relation_role}
                            </Badge>
                            {relation.created_via === 'ai' && (
                              <Badge className="text-xs bg-purple-100 text-purple-700">AI</Badge>
                            )}
                            {relation.status && (
                              <Badge className={`text-xs ${relation.status === 'approved' ? 'bg-green-100 text-green-700' :
                                relation.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                {relation.status}
                              </Badge>
                            )}
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 mb-1">
                              {relation.related_entity_type}
                            </p>
                            <p className="text-sm font-medium">{targetName}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          {relation.strength && (
                            <Badge className="bg-blue-100 text-blue-700">
                              {relation.strength}%
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(relation.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBrowseRelations.map((relation) => {
                const challenge = challenges.find(c => c.id === relation.challenge_id);
                const targetName = getEntityName(relation.related_entity_type, relation.related_entity_id);

                return (
                  <Card key={relation.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{relation.relation_role}</Badge>
                          <div className="flex gap-1">
                            {relation.created_via === 'ai' && (
                              <Badge className="text-xs bg-purple-100 text-purple-700">AI</Badge>
                            )}
                            {relation.strength && (
                              <Badge className="text-xs bg-blue-100 text-blue-700">
                                {relation.strength}%
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-xs text-red-600 font-semibold mb-1">CHALLENGE</p>
                          <Link to={createPageUrl(`ChallengeDetail?id=${challenge?.id}`)}>
                            <p className="text-sm font-medium hover:text-blue-600">
                              {challenge?.code || relation.challenge_id}
                            </p>
                          </Link>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-blue-600 font-semibold mb-1">
                            {relation.related_entity_type.toUpperCase()}
                          </p>
                          <p className="text-sm font-medium">{targetName}</p>
                        </div>

                        {relation.status && (
                          <Badge className={`w-full justify-center ${relation.status === 'approved' ? 'bg-green-100 text-green-700' :
                            relation.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                            {relation.status}
                          </Badge>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(relation.id)}
                          className="w-full text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t({ en: 'Delete', ar: 'حذف' })}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Relation Manager Modal */}
      {showRelationManager && (
        <RelationManager
          entityType="challenge"
          entityId={null}
          open={showRelationManager}
          onClose={() => setShowRelationManager(false)}
        />
      )}
    </div>
  );
}

export default ProtectedPage(RelationManagementHub, { requireAdmin: true });