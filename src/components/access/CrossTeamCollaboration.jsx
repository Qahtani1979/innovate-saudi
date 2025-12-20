import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Network, Users, MessageSquare, Share2 } from 'lucide-react';

export default function CrossTeamCollaboration({ currentTeam, allTeams = [] }) {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const otherTeams = allTeams.filter(t => t.id !== currentTeam?.id);
  const filteredTeams = otherTeams.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="border-2 border-teal-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-teal-600" />
          {t({ en: 'Cross-Team Collaboration', ar: 'التعاون بين الفرق' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder={t({ en: 'Search teams...', ar: 'بحث عن الفرق...' })}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredTeams.map((team) => (
            <div key={team.id} className="p-4 bg-slate-50 rounded-lg border hover:border-teal-300 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">{team.name}</h4>
                  <p className="text-xs text-slate-600 mt-1">{team.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-teal-100 text-teal-700 text-xs">
                      {team.team_type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {team.member_count || 0}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            {t({ en: 'No teams found', ar: 'لم يتم العثور على فرق' })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}