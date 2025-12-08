import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Microscope, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function ResearchChallengesView() {
  const { data: rdChallenges = [] } = useQuery({
    queryKey: ['rd-challenges'],
    queryFn: async () => {
      return base44.entities.Challenge.filter({ track: 'r_and_d' });
    }
  });

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Microscope className="h-5 w-5 text-indigo-600" />
          Challenges Requiring Research ({rdChallenges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rdChallenges.length > 0 ? (
          <div className="space-y-3">
            {rdChallenges.map(challenge => (
              <div key={challenge.id} className="p-4 border rounded-lg hover:border-indigo-300 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="font-mono text-xs">{challenge.code}</Badge>
                      <Badge className="bg-indigo-100 text-indigo-700">R&D Track</Badge>
                    </div>
                    <h4 className="font-semibold text-slate-900">{challenge.title_en}</h4>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{challenge.description_en}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">{challenge.impact_score || 0}</div>
                    <div className="text-xs text-slate-500">Impact</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                    <Button size="sm" variant="outline">View Challenge</Button>
                  </Link>
                  <Link to={createPageUrl(`RDCallCreate?challenge_id=${challenge.id}`)}>
                    <Button size="sm" className="bg-indigo-600">Create R&D Call</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-8">No research challenges yet</p>
        )}
      </CardContent>
    </Card>
  );
}