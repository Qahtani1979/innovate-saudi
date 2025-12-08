import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageSquare, MapPin, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { toast } from 'sonner';

export default function PublicIdeaBoard({ municipalityId }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('trending');

  const { data: ideas = [] } = useQuery({
    queryKey: ['citizen-ideas', municipalityId, filter],
    queryFn: async () => {
      const all = await base44.entities.CitizenIdea.list();
      let filtered = municipalityId ? all.filter(i => i.municipality_id === municipalityId) : all;
      
      if (filter === 'trending') {
        filtered.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
      } else if (filter === 'recent') {
        filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      }
      
      return filtered.slice(0, 20);
    },
    initialData: []
  });

  const voteMutation = useMutation({
    mutationFn: async (ideaId) => {
      const idea = ideas.find(i => i.id === ideaId);
      return base44.entities.CitizenIdea.update(ideaId, {
        vote_count: (idea.vote_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['citizen-ideas']);
      toast.success('Vote counted!');
    }
  });

  const getCategoryColor = (category) => {
    const colors = {
      transport: 'bg-blue-100 text-blue-700',
      infrastructure: 'bg-slate-100 text-slate-700',
      environment: 'bg-green-100 text-green-700',
      digital_services: 'bg-purple-100 text-purple-700',
      parks: 'bg-emerald-100 text-emerald-700',
      safety: 'bg-red-100 text-red-700'
    };
    return colors[category] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Button
          variant={filter === 'trending' ? 'default' : 'outline'}
          onClick={() => setFilter('trending')}
          size="sm"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Trending
        </Button>
        <Button
          variant={filter === 'recent' ? 'default' : 'outline'}
          onClick={() => setFilter('recent')}
          size="sm"
        >
          Recent
        </Button>
      </div>

      {ideas.map((idea, i) => (
        <Card key={idea.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => voteMutation.mutate(idea.id)}
                  disabled={voteMutation.isPending}
                  className="flex flex-col h-auto py-2"
                >
                  <ThumbsUp className="h-4 w-4 mb-1" />
                  <span className="text-xs font-bold">{idea.vote_count || 0}</span>
                </Button>
                {i < 3 && filter === 'trending' && (
                  <Badge className="bg-amber-500">#{i + 1}</Badge>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">{idea.title}</h3>
                  <Badge className={getCategoryColor(idea.category)}>
                    {idea.category?.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {idea.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  {idea.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {idea.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {idea.comment_count || 0} comments
                  </div>
                  <div>
                    {new Date(idea.created_date).toLocaleDateString()}
                  </div>
                  {idea.status === 'converted_to_challenge' && (
                    <Badge className="bg-green-600 text-xs">
                      ✓ Converted to Challenge
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {ideas.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-slate-600">No ideas found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}