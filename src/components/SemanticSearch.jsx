import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useLanguage } from './LanguageContext';
import { useVisibilityAwareSearch } from '@/hooks/useVisibilityAwareSearch';

export default function SemanticSearch({ placeholder }) {
  const [query, setQuery] = useState('');
  const { language, t } = useLanguage();
  const { search, results, searching } = useVisibilityAwareSearch();

  const handleSearch = async () => {
    if (!query.trim()) return;
    await search(query, { limit: 10 });
  };

  const getResultUrl = (result) => {
    const typeUrls = {
      'challenge': `ChallengeDetail?id=${result.id}`,
      'pilot': `PilotDetail?id=${result.id}`,
      'solution': `SolutionDetail?id=${result.id}`,
      'rd-project': `RDProjectDetail?id=${result.id}`,
      'program': `ProgramDetail?id=${result.id}`,
      'event': `EventDetail?id=${result.id}`
    };
    return typeUrls[result.type] || '#';
  };

  const typeColors = {
    challenge: 'bg-red-100 text-red-700',
    pilot: 'bg-purple-100 text-purple-700',
    solution: 'bg-green-100 text-green-700',
    'rd-project': 'bg-blue-100 text-blue-700',
    program: 'bg-orange-100 text-orange-700',
    event: 'bg-teal-100 text-teal-700'
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={placeholder || t({ en: 'AI-powered semantic search...', ar: 'بحث دلالي ذكي...' })}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={searching} className="bg-gradient-to-r from-blue-600 to-teal-600">
          {searching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {t({ en: 'Search', ar: 'بحث' })}
            </>
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            {results.map((result, idx) => (
              <Link key={idx} to={createPageUrl(getResultUrl(result))} className="block p-3 border rounded-lg hover:bg-blue-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={typeColors[result.type]} variant="outline">
                        {result.type.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(result.relevance * 100)}% match
                      </Badge>
                    </div>
                    <p className="font-medium text-slate-900">{result.title}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
