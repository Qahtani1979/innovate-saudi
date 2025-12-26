import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Lightbulb, ThumbsUp, MapPin, Search } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { useCitizenIdeas } from '@/hooks/useCitizenIdeas';
import { useMunicipalitiesWithVisibility } from '@/hooks/useMunicipalitiesWithVisibility';

function MunicipalityIdeasView() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  // Get user's municipality
  const { data: municipalities = [] } = useMunicipalitiesWithVisibility();
  const myMunicipality = municipalities.find(m => m.contact_email === user?.email);

  const { data: ideas = [], isLoading } = useCitizenIdeas({
    municipalityId: myMunicipality?.id,
    status: null // Fetch all statuses
  });

  const filteredIdeas = ideas.filter(i =>
    i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: filteredIdeas.length,
    highVotes: filteredIdeas.filter(i => (i.vote_count || 0) > 10).length,
    converted: filteredIdeas.filter(i => i.status === 'converted_to_challenge').length,
    trending: filteredIdeas.filter(i => (i.vote_count || 0) > 5).length
  };

  return (
    <PageLayout>
      <PageHeader
        title={{ en: 'Ideas from My Municipality', ar: 'أفكار من بلديتي' }}
        subtitle={{ en: 'Citizen ideas specific to your municipality', ar: 'أفكار المواطنين الخاصة ببلديتك' }}
        icon={<Lightbulb className="h-6 w-6 text-white" />}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Total Ideas', ar: 'إجمالي الأفكار' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.highVotes}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'High Votes', ar: 'أصوات عالية' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.converted}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Converted', ar: 'محول' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.trending}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Trending', ar: 'رائج' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
        <Input
          placeholder={t({ en: 'Search ideas...', ar: 'بحث...' })}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={isRTL ? 'pr-10' : 'pl-10'}
        />
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIdeas.map((idea) => (
          <Link key={idea.id} to={createPageUrl(`IdeaDetail?id=${idea.id}`)}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{idea.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{idea.category?.replace(/_/g, ' ')}</Badge>
                      <Badge className={
                        idea.status === 'converted_to_challenge' ? 'bg-purple-100 text-purple-700' :
                          idea.status === 'approved' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                      }>
                        {idea.status?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <ThumbsUp className="h-4 w-4" />
                    <span className="font-bold">{/** @type {any} */(idea).votes_count || 0}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 line-clamp-2">{idea.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  {/** @type {any} */(idea).submitter_name && <span>By: {/** @type {any} */(idea).submitter_name}</span>}
                  {idea.municipality_id && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {idea.municipality_id.substring(0, 20)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(MunicipalityIdeasView, { requiredPermissions: [] });
