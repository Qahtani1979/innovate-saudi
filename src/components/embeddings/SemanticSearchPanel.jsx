import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Search, Sparkles, Loader2, Target } from 'lucide-react';

export default function SemanticSearchPanel() {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [entityType, setEntityType] = useState('Challenge');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query || query.length < 3) {
      return;
    }

    setSearching(true);
    try {
      const result = await base44.functions.invoke('semanticSearch', {
        query: query,
        entity_name: entityType,
        limit: 10,
        threshold: 0.6
      });

      setResults(result.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const entityConfig = {
    Challenge: { page: 'ChallengeDetail', nameField: 'title_en', color: 'blue' },
    Solution: { page: 'SolutionDetail', nameField: 'name_en', color: 'purple' },
    KnowledgeDocument: { page: 'KnowledgeDocumentDetail', nameField: 'title_en', color: 'green' },
    CitizenIdea: { page: 'CitizenIdeaDetail', nameField: 'title', color: 'orange' },
    Organization: { page: 'OrganizationDetail', nameField: 'name_en', color: 'teal' }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Sparkles className="h-5 w-5" />
          {t({ en: '🔍 Semantic Search', ar: '🔍 البحث الدلالي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={t({ en: 'Describe what you\'re looking for...', ar: 'اوصف ما تبحث عنه...' })}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="Challenge">Challenges</option>
            <option value="Solution">Solutions</option>
            <option value="KnowledgeDocument">Knowledge</option>
            <option value="CitizenIdea">Ideas</option>
            <option value="Organization">Organizations</option>
          </select>
          <Button onClick={handleSearch} disabled={searching || !query}>
            {searching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Search', ar: 'بحث' })}
          </Button>
        </div>

        {results && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                {t({ en: `Found ${results.matches_found} matches`, ar: `تم العثور على ${results.matches_found} نتيجة` })}
              </span>
              <Badge variant="outline">
                {results.total_candidates} total with embeddings
              </Badge>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.results?.map((result, i) => {
                const config = entityConfig[entityType];
                return (
                  <Link
                    key={i}
                    to={createPageUrl(config.page) + `?id=${result.id}`}
                    className="block p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{result[config.nameField]}</p>
                        {result.description_en && (
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {result.description_en}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`bg-${config.color}-100 text-${config.color}-700`}>
                          {Math.round(result.similarity_score * 100)}%
                        </Badge>
                        <span className="text-xs text-slate-500">match</span>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {results.matches_found === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t({ en: 'No matches found', ar: 'لم يتم العثور على نتائج' })}</p>
                  <p className="text-xs mt-1">{t({ en: 'Try different keywords or lower threshold', ar: 'جرب كلمات مختلفة' })}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}