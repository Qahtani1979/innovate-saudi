import { useExperts, useAllExpertAssignments, useAllExpertEvaluations } from '@/hooks/useExpertData';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  TrendingDown,
  Star,
  Clock,
  CheckCircle2,
  Award,
  Users,
  BarChart3
} from 'lucide-react';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

export default function ExpertPerformanceDashboard() {
  const { language, isRTL, t } = useLanguage();

  const { data: experts = [], isLoading } = useExperts();
  const { data: assignments = [] } = useAllExpertAssignments();
  const { data: evaluations = [] } = useAllExpertEvaluations();


  const activeExperts = experts.filter(e => e.is_active && e.is_verified);
  const avgRating = experts.length > 0
    ? (experts.reduce((sum, e) => sum + (e.expert_rating || 0), 0) / experts.length).toFixed(2)
    : 0;
  const totalEvaluations = evaluations.length;
  const avgResponseTime = experts.length > 0
    ? (experts.reduce((sum, e) => sum + (e.response_time_avg_hours || 0), 0) / experts.length).toFixed(1)
    : 0;

  const expertsWithMetrics = activeExperts.map(expert => {
    const expertAssignments = assignments.filter(a => a.expert_email === expert.user_email);
    const completedCount = expertAssignments.filter(a => a.status === 'completed').length;
    const totalCount = expertAssignments.length;
    const completionRate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(0) : 0;

    return {
      ...expert,
      total_assignments: totalCount,
      completed_assignments: completedCount,
      completion_rate: completionRate
    };
  }).sort((a, b) => (b.expert_rating || 0) - (a.expert_rating || 0));

  return (
    <PageLayout>
      <PageHeader
        icon={BarChart3}
        title={t({ en: 'Expert Performance Dashboard', ar: 'Ù„ÙˆØ­Ø© Ø£Ø¯Ø§Ø¡ Ø§Ù„Ø®Ø¨Ø±Ø§Ø¡' })}
        description={t({ en: 'Monitor expert quality, workload, and performance', ar: 'Ù…Ø±Ø§Ù‚Ø¨Ø© Ø¬ÙˆØ¯Ø© Ø§Ù„Ø®Ø¨Ø±Ø§Ø¡ØŒ Ø§Ù„Ø¹Ø¨Ø¡ØŒ ÙˆØ§Ù„Ø£Ø¯Ø§Ø¡' })}
        stats={[
          { icon: Users, value: activeExperts.length, label: t({ en: 'Active Experts', ar: 'Ø®Ø¨Ø±Ø§Ø¡ Ù†Ø´Ø·ÙˆÙ†' }) },
          { icon: Star, value: avgRating, label: t({ en: 'Avg. Rating', ar: 'Ù…ØªÙˆØ³Ø· Ø§Ù„ØªÙ‚ÙŠÙŠÙ…' }) },
          { icon: CheckCircle2, value: totalEvaluations, label: t({ en: 'Evaluations', ar: 'Ø§Ù„ØªÙ‚ÙŠÙŠÙ…Ø§Øª' }) },
        ]}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Experts', ar: 'Ø§Ù„Ø®Ø¨Ø±Ø§Ø¡ Ø§Ù„Ù†Ø´Ø·ÙˆÙ†' })}</p>
                <p className="text-3xl font-bold text-purple-600">{activeExperts.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Avg. Rating', ar: 'Ù…ØªÙˆØ³Ø· Ø§Ù„ØªÙ‚ÙŠÙŠÙ…' })}</p>
                <p className="text-3xl font-bold text-amber-600">{avgRating}</p>
              </div>
              <Star className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Evaluations', ar: 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ØªÙ‚ÙŠÙŠÙ…Ø§Øª' })}</p>
                <p className="text-3xl font-bold text-green-600">{totalEvaluations}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Avg. Response', ar: 'Ù…ØªÙˆØ³Ø· Ø§Ù„Ø±Ø¯' })}</p>
                <p className="text-3xl font-bold text-blue-600">{avgResponseTime}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            {t({ en: 'Expert Performance Rankings', ar: 'ØªØ±ØªÙŠØ¨ Ø£Ø¯Ø§Ø¡ Ø§Ù„Ø®Ø¨Ø±Ø§Ø¡' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>{t({ en: 'Rank', ar: 'Ø§Ù„ØªØ±ØªÙŠØ¨' })}</TableHead>
                <TableHead>{t({ en: 'Expert', ar: 'Ø§Ù„Ø®Ø¨ÙŠØ±' })}</TableHead>
                <TableHead>{t({ en: 'Expertise', ar: 'Ø§Ù„Ø®Ø¨Ø±Ø©' })}</TableHead>
                <TableHead>{t({ en: 'Rating', ar: 'Ø§Ù„ØªÙ‚ÙŠÙŠÙ…' })}</TableHead>
                <TableHead>{t({ en: 'Evaluations', ar: 'Ø§Ù„ØªÙ‚ÙŠÙŠÙ…Ø§Øª' })}</TableHead>
                <TableHead>{t({ en: 'Completion', ar: 'Ø§Ù„Ø¥Ù†Ø¬Ø§Ø²' })}</TableHead>
                <TableHead>{t({ en: 'Quality', ar: 'Ø§Ù„Ø¬ÙˆØ¯Ø©' })}</TableHead>
                <TableHead>{t({ en: 'Response Time', ar: 'ÙˆÙ‚Øª Ø§Ù„Ø±Ø¯' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expertsWithMetrics.map((expert, idx) => (
                <TableRow key={expert.id} className="hover:bg-slate-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">#{idx + 1}</span>
                      {idx < 3 && <Award className="h-4 w-4 text-amber-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link to={createPageUrl(`ExpertDetail?id=${expert.id}`)} className="hover:underline">
                      <div className="flex items-center gap-2">
                        {expert.is_verified && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        <span className="font-medium">{expert.user_email?.split('@')[0]}</span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {expert.expertise_areas?.slice(0, 2).map((area, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                      <span className="font-medium">{(expert.expert_rating || 0).toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{expert.evaluation_count || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{expert.completion_rate}%</span>
                      {expert.completion_rate >= 90 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : expert.completion_rate < 70 ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      (expert.evaluation_quality_score || 0) >= 80 ? 'bg-green-100 text-green-700' :
                        (expert.evaluation_quality_score || 0) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                    }>
                      {expert.evaluation_quality_score || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{expert.response_time_avg_hours || 0}h</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
