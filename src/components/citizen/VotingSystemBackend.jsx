import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { ThumbsUp, AlertCircle } from 'lucide-react';

export default function VotingSystemBackend() {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ThumbsUp className="h-5 w-5 text-blue-600" />
          {t({ en: 'Citizen Voting System', ar: 'نظام تصويت المواطنين' })}
          <Badge className="ml-auto bg-red-600">Not Implemented</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">Voting Backend Missing</p>
              <p>CitizenIdea voting is UI-only, no backend logic</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 border rounded-lg">
            <p className="text-sm font-medium mb-2">Required Features</p>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• One vote per user per idea</li>
              <li>• Vote count tracking</li>
              <li>• Upvote/downvote support</li>
              <li>• Vote history per user</li>
              <li>• Anonymous vs authenticated voting</li>
              <li>• Fraud detection (duplicate voting)</li>
            </ul>
          </div>

          <div className="p-3 border rounded-lg">
            <p className="text-sm font-medium mb-2">Gamification</p>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• Leaderboard for top ideas</li>
              <li>• Badges for active voters</li>
              <li>• Points for submitting popular ideas</li>
              <li>• Achievements for engagement</li>
            </ul>
          </div>
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Implementation plan:</p>
          <ul className="space-y-1 ml-4">
            <li>• Create CitizenVote entity</li>
            <li>• Backend voting API endpoints</li>
            <li>• Rate limiting (prevent spam)</li>
            <li>• Real-time vote count updates</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}