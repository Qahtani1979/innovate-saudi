/**
 * Challenge Related Entities
 * Implements: dc-2 (related entities visible)
 */

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Lightbulb, Rocket, FolderKanban, FlaskConical,
  FileText, Building2, ExternalLink, Link2Off
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChallengeIntegrations } from '@/hooks/useChallengeIntegrations';

function EntityCard({ entity, type, language, onClick }) {
  const title = language === 'ar' ? entity.title_ar : entity.title_en;
  const name = language === 'ar' ? entity.name_ar : entity.name_en;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{title || name}</h4>
            {entity.status && (
              <Badge variant="outline" className="mt-1 text-xs">
                {entity.status}
              </Badge>
            )}
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ type, language }) {
  const messages = {
    solutions: { en: 'No solutions linked yet', ar: 'لا توجد حلول مرتبطة بعد' },
    pilots: { en: 'No pilots linked yet', ar: 'لا توجد تجارب مرتبطة بعد' },
    programs: { en: 'No programs linked yet', ar: 'لا توجد برامج مرتبطة بعد' },
    rd_projects: { en: 'No R&D projects linked yet', ar: 'لا توجد مشاريع بحثية مرتبطة بعد' },
    proposals: { en: 'No proposals submitted yet', ar: 'لا توجد مقترحات مقدمة بعد' }
  };

  return (
    <div className="text-center py-8">
      <Link2Off className="h-12 w-12 mx-auto text-muted-foreground/50" />
      <p className="mt-2 text-muted-foreground">
        {messages[type]?.[language] || messages[type]?.en}
      </p>
    </div>
  );
}

export function ChallengeRelatedEntities({ challengeId, challenge }) {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const {
    linkedSolutions,
    linkedPilots: pilots,
    linkedPrograms: programs,
    linkedRDProjects: rdProjects,
    proposals,
    isLoading
  } = useChallengeIntegrations(challengeId);

  // Map matched solutions to flat structure expected by UI
  const solutions = linkedSolutions?.map(m => ({
    ...m.solution,
    match_score: m.match_score
  })).filter(s => s && s.id) || [];

  // Count items for badges
  const counts = {
    solutions: solutions?.length || 0,
    pilots: pilots?.length || 0,
    programs: programs?.length || 0,
    rd_projects: rdProjects?.length || 0,
    proposals: proposals?.length || 0
  };

  const totalRelated = Object.values(counts).reduce((a, b) => a + b, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'الكيانات المرتبطة' : 'Related Entities'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {language === 'ar' ? 'الكيانات المرتبطة' : 'Related Entities'}
          <Badge variant="secondary">{totalRelated}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="solutions" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto mb-4">
            <TabsTrigger value="solutions" className="flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              {language === 'ar' ? 'الحلول' : 'Solutions'}
              {counts.solutions > 0 && (
                <Badge variant="secondary" className="ml-1">{counts.solutions}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pilots" className="flex items-center gap-1">
              <Rocket className="h-4 w-4" />
              {language === 'ar' ? 'التجارب' : 'Pilots'}
              {counts.pilots > 0 && (
                <Badge variant="secondary" className="ml-1">{counts.pilots}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-1">
              <FolderKanban className="h-4 w-4" />
              {language === 'ar' ? 'البرامج' : 'Programs'}
              {counts.programs > 0 && (
                <Badge variant="secondary" className="ml-1">{counts.programs}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rd" className="flex items-center gap-1">
              <FlaskConical className="h-4 w-4" />
              {language === 'ar' ? 'البحث والتطوير' : 'R&D'}
              {counts.rd_projects > 0 && (
                <Badge variant="secondary" className="ml-1">{counts.rd_projects}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="proposals" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {language === 'ar' ? 'المقترحات' : 'Proposals'}
              {counts.proposals > 0 && (
                <Badge variant="secondary" className="ml-1">{counts.proposals}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Solutions Tab */}
          <TabsContent value="solutions">
            {solutions?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {solutions.map(solution => (
                  <EntityCard
                    key={solution.id}
                    entity={solution}
                    type="solution"
                    language={language}
                    onClick={() => navigate(`/solutions/${solution.id}`)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState type="solutions" language={language} />
            )}
          </TabsContent>

          {/* Pilots Tab */}
          <TabsContent value="pilots">
            {pilots?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pilots.map(pilot => (
                  <EntityCard
                    key={pilot.id}
                    entity={pilot}
                    type="pilot"
                    language={language}
                    onClick={() => navigate(`/pilots/${pilot.id}`)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState type="pilots" language={language} />
            )}
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs">
            {programs?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {programs.map(program => (
                  <EntityCard
                    key={program.id}
                    entity={{ ...program, title_en: program.name_en, title_ar: program.name_ar }}
                    type="program"
                    language={language}
                    onClick={() => navigate(`/programs/${program.id}`)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState type="programs" language={language} />
            )}
          </TabsContent>

          {/* R&D Tab */}
          <TabsContent value="rd">
            {rdProjects?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rdProjects.map(project => (
                  <EntityCard
                    key={project.id}
                    entity={project}
                    type="rd_project"
                    language={language}
                    onClick={() => navigate(`/rd-projects/${project.id}`)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState type="rd_projects" language={language} />
            )}
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals">
            {proposals?.length > 0 ? (
              <div className="space-y-3">
                {proposals.map(proposal => (
                  <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{proposal.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span>
                              {language === 'ar'
                                ? proposal.organizations?.name_ar
                                : proposal.organizations?.name_en}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {proposal.score && (
                            <Badge variant="outline">
                              {language === 'ar' ? 'النتيجة' : 'Score'}: {proposal.score}
                            </Badge>
                          )}
                          <Badge variant={proposal.status === 'accepted' ? 'default' : 'secondary'}>
                            {proposal.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState type="proposals" language={language} />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ChallengeRelatedEntities;
