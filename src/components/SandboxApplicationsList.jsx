import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from './LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Shield, Search, FileText, Calendar, Users } from 'lucide-react';

export default function SandboxApplicationsList({ sandbox }) {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: applications = [] } = useQuery({
    queryKey: ['sandbox-applications', sandbox.id],
    queryFn: async () => {
      const all = await base44.entities.SandboxApplication.list();
      return all.filter(a => a.sandbox_id === sandbox.id).sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      );
    }
  });

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    technical_review: 'bg-purple-100 text-purple-700',
    legal_review: 'bg-indigo-100 text-indigo-700',
    safety_review: 'bg-orange-100 text-orange-700',
    approved: 'bg-green-100 text-green-700',
    active: 'bg-teal-100 text-teal-700',
    completed: 'bg-slate-100 text-slate-700',
    rejected: 'bg-red-100 text-red-700',
    withdrawn: 'bg-gray-100 text-gray-700'
  };

  const filteredApps = applications.filter(app =>
    app.project_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.applicant_organization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusGroups = {
    pending: filteredApps.filter(a => ['submitted', 'under_review', 'technical_review', 'legal_review', 'safety_review'].includes(a.status)),
    approved: filteredApps.filter(a => ['approved', 'active'].includes(a.status)),
    completed: filteredApps.filter(a => a.status === 'completed'),
    rejected: filteredApps.filter(a => ['rejected', 'withdrawn'].includes(a.status))
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pending', ar: 'معلق' })}</p>
                <p className="text-3xl font-bold text-yellow-600">{statusGroups.pending.length}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Approved', ar: 'موافق عليه' })}</p>
                <p className="text-3xl font-bold text-green-600">{statusGroups.approved.length}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
                <p className="text-3xl font-bold text-blue-600">{statusGroups.completed.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
                <p className="text-3xl font-bold text-slate-600">{applications.length}</p>
              </div>
              <Users className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
            <Input
              placeholder={t({ en: 'Search applications...', ar: 'البحث في الطلبات...' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'All Applications', ar: 'جميع الطلبات' })} ({filteredApps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApps.length > 0 ? (
            <div className="space-y-3">
              {filteredApps.map((app) => (
                <Link
                  key={app.id}
                  to={createPageUrl(`SandboxApplicationDetail?id=${app.id}`)}
                  className="block p-4 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{app.project_title}</h3>
                        <Badge className={statusColors[app.status]}>
                          {app.status?.replace(/_/g, ' ')}
                        </Badge>
                        {app.current_review_stage && (
                          <Badge variant="outline" className="text-xs">
                            {app.current_review_stage} review
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{app.applicant_organization}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {app.start_date}
                        </span>
                        <span>{app.duration_months} months</span>
                        {app.team_members?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {app.team_members.length} members
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {t({ en: 'View', ar: 'عرض' })}
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {t({ en: 'No applications found', ar: 'لم يتم العثور على طلبات' })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}