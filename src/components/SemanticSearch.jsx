import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useLanguage } from './LanguageContext';

export default function SemanticSearch({ placeholder }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const { language, t } = useLanguage();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setSearching(true);
    try {
      const [challengesRes, pilotsRes, solutionsRes, rdProjectsRes, programsRes] = await Promise.all([
        supabase.from('challenges').select('*').eq('is_deleted', false),
        supabase.from('pilots').select('*').eq('is_deleted', false),
        supabase.from('solutions').select('*').eq('is_deleted', false),
        supabase.from('rd_projects').select('*').eq('is_deleted', false),
        supabase.from('programs').select('*').eq('is_deleted', false)
      ]);

      const challenges = challengesRes.data || [];
      const pilots = pilotsRes.data || [];
      const solutions = solutionsRes.data || [];
      const rdProjects = rdProjectsRes.data || [];
      const programs = programsRes.data || [];

      const searchResults = [];
      
      challenges.forEach(c => {
        const relevance = calculateRelevance(query, c.title_en + ' ' + c.description_en);
        if (relevance > 0.3) {
          searchResults.push({
            type: 'challenge',
            entity: c,
            relevance,
            title: c.title_en,
            url: `ChallengeDetail?id=${c.id}`
          });
        }
      });

      pilots.forEach(p => {
        const relevance = calculateRelevance(query, p.title_en + ' ' + p.description_en);
        if (relevance > 0.3) {
          searchResults.push({
            type: 'pilot',
            entity: p,
            relevance,
            title: p.title_en,
            url: `PilotDetail?id=${p.id}`
          });
        }
      });

      solutions.forEach(s => {
        const relevance = calculateRelevance(query, s.name_en + ' ' + s.description_en);
        if (relevance > 0.3) {
          searchResults.push({
            type: 'solution',
            entity: s,
            relevance,
            title: s.name_en,
            url: `SolutionDetail?id=${s.id}`
          });
        }
      });

      rdProjects.forEach(r => {
        const relevance = calculateRelevance(query, r.title_en + ' ' + r.description_en);
        if (relevance > 0.3) {
          searchResults.push({
            type: 'rd_project',
            entity: r,
            relevance,
            title: r.title_en,
            url: `RDProjectDetail?id=${r.id}`
          });
        }
      });

      programs.forEach(pr => {
        const relevance = calculateRelevance(query, pr.name_en + ' ' + pr.description_en);
        if (relevance > 0.3) {
          searchResults.push({
            type: 'program',
            entity: pr,
            relevance,
            title: pr.name_en,
            url: `ProgramDetail?id=${pr.id}`
          });
        }
      });

      setResults(searchResults.sort((a, b) => b.relevance - a.relevance).slice(0, 10));
    } finally {
      setSearching(false);
    }
  };

  const calculateRelevance = (query, text) => {
    if (!text) return 0;
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    if (textLower.includes(queryLower)) return 1.0;
    
    const queryWords = queryLower.split(/\s+/);
    const textWords = textLower.split(/\s+/);
    const overlap = queryWords.filter(w => textWords.some(tw => tw.includes(w) || w.includes(tw)));
    
    return overlap.length / queryWords.length;
  };

  const typeColors = {
    challenge: 'bg-red-100 text-red-700',
    pilot: 'bg-purple-100 text-purple-700',
    solution: 'bg-green-100 text-green-700',
    rd_project: 'bg-blue-100 text-blue-700',
    program: 'bg-orange-100 text-orange-700'
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
              <Link key={idx} to={createPageUrl(result.url)} className="block p-3 border rounded-lg hover:bg-blue-50 transition-colors">
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
