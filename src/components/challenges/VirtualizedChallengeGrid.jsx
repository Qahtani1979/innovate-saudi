import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useVirtualList } from '@/hooks/useVirtualList';

/**
 * Virtualized grid for challenge cards
 * Improves performance for lists with 50+ challenges
 */
export default function VirtualizedChallengeGrid({
  challenges = [],
  statusColors,
  priorityColors,
  language,
  t,
  hasPermission
}) {
  const { parentRef, virtualItems, totalSize, isVirtualized } = useVirtualList(challenges, {
    estimatedSize: 380, // Estimated card height
    overscan: 3
  });

  // For smaller lists, render normally without virtualization
  if (!isVirtualized) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            statusColors={statusColors}
            priorityColors={priorityColors}
            language={language}
            t={t}
            hasPermission={hasPermission}
          />
        ))}
      </div>
    );
  }

  // For larger lists, use virtualization
  return (
    <div
      ref={parentRef}
      className="h-[800px] overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 absolute top-0 left-0 right-0">
          {virtualItems.map(({ item: challenge, index }) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              statusColors={statusColors}
              priorityColors={priorityColors}
              language={language}
              t={t}
              hasPermission={hasPermission}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Extracted Challenge Card component for reusability
function ChallengeCard({
  challenge,
  statusColors,
  priorityColors,
  language,
  t,
  hasPermission
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {challenge.image_url && (
        <div className="h-48 overflow-hidden">
          <img 
            src={challenge.image_url} 
            alt={challenge.title_en} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline" className="font-mono text-xs">
            {challenge.code}
          </Badge>
          <Badge className={statusColors[challenge.status]}>
            {challenge.status?.replace(/_/g, ' ')}
          </Badge>
        </div>
        <CardTitle className="text-lg">
          {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 line-clamp-2">
          {language === 'ar' && challenge.description_ar ? challenge.description_ar : challenge.description_en}
        </p>
        
        <div className="flex items-center gap-2">
          <Badge className={priorityColors[challenge.priority]}>
            {challenge.priority?.replace('tier_', 'T')}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {challenge.sector?.replace(/_/g, ' ')}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">{t({ en: 'Score', ar: 'النقاط' })}</span>
          <span className="font-bold text-blue-600">{challenge.overall_score || 0}</span>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)} className="flex-1">
            <Button variant="outline" className="w-full">
              {t({ en: 'View', ar: 'عرض' })}
            </Button>
          </Link>
          {hasPermission('challenge_edit') && (
            <Link to={createPageUrl(`ChallengeEdit?id=${challenge.id}`)}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
