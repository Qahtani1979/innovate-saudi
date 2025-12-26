import { useState, useMemo } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { toast } from 'sonner';
import {
  Microscope,
  Target,
  Link2,
  CheckCircle2,
  AlertTriangle,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { useRDCallsWithVisibility } from '@/hooks/useRDCallsWithVisibility';
import { useLinkChallengeToRDCall } from '@/hooks/useChallengeMutations';

function ChallengeRDCallMatcher() {
  const { t, isRTL, language } = useLanguage();
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const [selectedRDCall, setSelectedRDCall] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch approved challenges without R&D linkage
  const { data: challenges = [], isLoading: challengesLoading } = useChallengesWithVisibility({
    status: ['approved', 'in_treatment'],
    includeDeleted: false,
    limit: 100 // Adjust limit as needed
  });

  // Fetch active R&D calls
  const { data: rdCalls = [], isLoading: rdCallsLoading } = useRDCallsWithVisibility({
    status: 'open',
    includeDeleted: false
  });

  // Link mutation
  const linkMutation = useLinkChallengeToRDCall();

  // Filter challenges
  const filteredChallenges = useMemo(() => {
    if (!searchQuery) return challenges;
    const query = searchQuery.toLowerCase();
    return challenges.filter(c =>
      c.title_en?.toLowerCase().includes(query) ||
      c.title_ar?.includes(query) ||
      c.code?.toLowerCase().includes(query)
    );
  }, [challenges, searchQuery]);

  // Challenges needing R&D
  const challengesNeedingRD = useMemo(() => {
    return filteredChallenges.filter(c =>
      !c.linked_rd_ids?.length &&
      (c.tracks?.includes('r_and_d') || c.challenge_type === 'research_needed')
    );
  }, [filteredChallenges]);

  const handleToggleChallenge = (challengeId) => {
    setSelectedChallenges(prev =>
      prev.includes(challengeId)
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  const handleLink = () => {
    if (!selectedChallenges.length || !selectedRDCall) {
      toast.error(t({ en: 'Select challenges and an R&D call', ar: 'حدد التحديات ودعوة البحث والتطوير' }));
      return;
    }

    linkMutation.mutate({
      challengeIds: selectedChallenges,
      rdCallId: selectedRDCall
    }, {
      onSuccess: () => {
        setSelectedChallenges([]);
        setSelectedRDCall(null);
      }
    });
  };

  return (
    <PageLayout>
      <PageHeader
        icon={Microscope}
        title={{ en: 'Challenge-R&D Call Matcher', ar: 'مطابق التحديات ودعوات البحث والتطوير' }}
        description={{ en: 'Match challenges with R&D calls for research-based solutions', ar: 'مطابقة التحديات مع دعوات البحث والتطوير للحلول القائمة على البحث' }}
      />

      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{challengesNeedingRD.length}</p>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Needing R&D', ar: 'تحتاج بحث' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Microscope className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{rdCalls.length}</p>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Open Calls', ar: 'دعوات مفتوحة' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{selectedChallenges.length}</p>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Selected', ar: 'محددة' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Link2 className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{challenges.filter(c => c.linked_rd_ids?.length > 0).length}</p>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Linked', ar: 'مرتبطة' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Challenges Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t({ en: 'Challenges Needing R&D', ar: 'التحديات التي تحتاج البحث والتطوير' })}
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t({ en: 'Search challenges...', ar: 'بحث في التحديات...' })}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              {challengesLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t({ en: 'Loading...', ar: 'جاري التحميل...' })}
                </div>
              ) : challengesNeedingRD.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>{t({ en: 'All challenges are linked to R&D', ar: 'جميع التحديات مرتبطة بالبحث والتطوير' })}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {challengesNeedingRD.map((challenge) => (
                    <div
                      key={challenge.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedChallenges.includes(challenge.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                      onClick={() => handleToggleChallenge(challenge.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedChallenges.includes(challenge.id)}
                          onCheckedChange={() => handleToggleChallenge(challenge.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{challenge.code}</Badge>
                            <Badge className="bg-purple-100 text-purple-700">
                              {t({ en: 'Needs R&D', ar: 'يحتاج بحث' })}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm truncate">
                            {language === 'ar' ? challenge.title_ar : challenge.title_en}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {challenge.sector?.[language === 'ar' ? 'name_ar' : 'name_en']}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* R&D Calls Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="h-5 w-5" />
                {t({ en: 'Open R&D Calls', ar: 'دعوات البحث والتطوير المفتوحة' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rdCallsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t({ en: 'Loading...', ar: 'جاري التحميل...' })}
                </div>
              ) : rdCalls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                  <p>{t({ en: 'No open R&D calls', ar: 'لا توجد دعوات بحث وتطوير مفتوحة' })}</p>
                  <Link to={createPageUrl('RDCallCreate')}>
                    <Button variant="outline" size="sm" className="mt-2">
                      {t({ en: 'Create R&D Call', ar: 'إنشاء دعوة بحث وتطوير' })}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {rdCalls.map((call) => (
                    <div
                      key={call.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedRDCall === call.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                      onClick={() => setSelectedRDCall(call.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${selectedRDCall === call.id ? 'border-primary bg-primary' : 'border-muted-foreground'
                          }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{call.code}</Badge>
                            <Badge className="bg-green-100 text-green-700">{call.status}</Badge>
                          </div>
                          <h4 className="font-medium text-sm truncate">
                            {language === 'ar' ? call.title_ar : call.title_en}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t({ en: 'Deadline:', ar: 'الموعد النهائي:' })} {call.deadline ? new Date(call.deadline).toLocaleDateString() : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        {selectedChallenges.length > 0 && selectedRDCall && (
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link2 className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="font-medium">
                      {t({ en: `Link ${selectedChallenges.length} challenge(s) to R&D Call`, ar: `ربط ${selectedChallenges.length} تحدي(ات) بدعوة البحث والتطوير` })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t({ en: 'This will add the R&D track to selected challenges', ar: 'سيضيف هذا مسار البحث والتطوير للتحديات المحددة' })}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleLink}
                  disabled={linkMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Link2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {linkMutation.isPending ? t({ en: 'Linking...', ar: 'جاري الربط...' }) : t({ en: 'Link Now', ar: 'ربط الآن' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(ChallengeRDCallMatcher, { requiredPermissions: ['rd_manage'] });
