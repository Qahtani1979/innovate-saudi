import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Users, Plus, TrendingUp, CheckCircle2, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';

function MentorshipHub() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState('active');

  const { data: mentorships = [], isLoading } = useQuery({
    queryKey: ['mentorships'],
    queryFn: () => base44.entities.ProgramMentorship.list('-created_date')
  });

  const activeMentorships = mentorships.filter(m => m.status === 'active');
  const completedMentorships = mentorships.filter(m => m.status === 'completed');

  const stats = {
    total: mentorships.length,
    active: activeMentorships.length,
    completed: completedMentorships.length,
    avg_duration: mentorships.filter(m => m.actual_duration_weeks).reduce((sum, m) => sum + m.actual_duration_weeks, 0) / (mentorships.filter(m => m.actual_duration_weeks).length || 1)
  };

  const statusColors = {
    proposed: 'bg-slate-200 text-slate-700',
    matched: 'bg-blue-200 text-blue-700',
    active: 'bg-green-200 text-green-700',
    on_hold: 'bg-amber-200 text-amber-700',
    completed: 'bg-purple-200 text-purple-700',
    terminated: 'bg-red-200 text-red-700'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Mentorship Hub', ar: 'مركز الإرشاد' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Program mentorship tracking and engagement', ar: 'تتبع إرشاد البرامج والمشاركة' })}
          </p>
        </div>
        <Link to={createPageUrl('MentorDashboard')}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Create Match', ar: 'إنشاء مطابقة' })}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Avg Duration', ar: 'متوسط المدة' })}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.avg_duration.toFixed(0)}w</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'active' ? 'default' : 'outline'}
              onClick={() => setViewMode('active')}
            >
              {t({ en: 'Active', ar: 'نشط' })} ({activeMentorships.length})
            </Button>
            <Button
              variant={viewMode === 'completed' ? 'default' : 'outline'}
              onClick={() => setViewMode('completed')}
            >
              {t({ en: 'Completed', ar: 'مكتمل' })} ({completedMentorships.length})
            </Button>
            <Button
              variant={viewMode === 'all' ? 'default' : 'outline'}
              onClick={() => setViewMode('all')}
            >
              {t({ en: 'All', ar: 'الكل' })} ({mentorships.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mentorships List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(viewMode === 'active' ? activeMentorships : viewMode === 'completed' ? completedMentorships : mentorships).map(mentorship => (
          <Card key={mentorship.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className={`${statusColors[mentorship.status]} mb-2`}>
                      {mentorship.status?.replace(/_/g, ' ')}
                    </Badge>
                    <h3 className="font-semibold text-slate-900">
                      {mentorship.mentor_email} → {mentorship.mentee_email}
                    </h3>
                  </div>
                  {mentorship.mentee_satisfaction_score && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium">{mentorship.mentee_satisfaction_score.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  {mentorship.program_id && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">{t({ en: 'Program:', ar: 'البرنامج:' })}</span>
                      <Badge variant="outline" className="text-xs">
                        {mentorship.program_id}
                      </Badge>
                    </div>
                  )}
                  {mentorship.focus_areas && mentorship.focus_areas.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-600 mb-1">{t({ en: 'Focus Areas:', ar: 'مجالات التركيز:' })}</p>
                      <div className="flex flex-wrap gap-1">
                        {mentorship.focus_areas.slice(0, 3).map((area, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {mentorship.sessions_completed !== undefined && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>{t({ en: 'Sessions:', ar: 'الجلسات:' })}</span>
                      <span className="font-medium">{mentorship.sessions_completed} / {mentorship.sessions_planned || '?'}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(viewMode === 'active' ? activeMentorships : viewMode === 'completed' ? completedMentorships : mentorships).length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'No mentorships found', ar: 'لا توجد إرشادات' })}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ProtectedPage(MentorshipHub, { requiredPermissions: [] });