import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Award, Search, Lightbulb, TestTube, Building2, TrendingUp,
  Calendar, Users, Sparkles, MapPin, Briefcase
} from 'lucide-react';

export default function AlumniShowcase() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');

  const { data: applications = [] } = useQuery({
    queryKey: ['program-applications-alumni'],
    queryFn: async () => {
      const all = await base44.entities.ProgramApplication.list('-created_date');
      return all.filter(app => app.status === 'accepted' && app.graduation_status === 'graduated');
    }
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list()
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => base44.entities.Solution.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const filteredAlumni = applications.filter(app => {
    const matchesSearch = !searchTerm || 
      app.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant_org_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = filterProgram === 'all' || app.program_id === filterProgram;
    return matchesSearch && matchesProgram;
  });

  const getAlumniAchievements = (app) => {
    const achievements = [];
    const alumniSolutions = solutions.filter(s => s.created_by === app.applicant_email);
    const alumniPilots = pilots.filter(p => p.created_by === app.applicant_email);
    
    if (alumniSolutions.length > 0) {
      achievements.push({ type: 'solution', count: alumniSolutions.length, icon: Lightbulb });
    }
    if (alumniPilots.length > 0) {
      achievements.push({ type: 'pilot', count: alumniPilots.length, icon: TestTube });
    }
    return achievements;
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: '🎓 Alumni Showcase', ar: '🎓 واجهة الخريجين' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Celebrating graduates and their impact', ar: 'احتفاء بالخريجين وتأثيرهم' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Alumni', ar: 'إجمالي الخريجين' })}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{applications.length}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Solutions Launched', ar: 'الحلول المطلقة' })}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {solutions.filter(s => applications.some(a => a.applicant_email === s.created_by)).length}
                </p>
              </div>
              <Lightbulb className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pilots Running', ar: 'التجارب الجارية' })}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {pilots.filter(p => applications.some(a => a.applicant_email === p.created_by)).length}
                </p>
              </div>
              <TestTube className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Mentors', ar: 'الموجهون' })}</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">
                  {applications.filter(a => a.is_mentor).length}
                </p>
              </div>
              <Users className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search alumni...', ar: 'ابحث عن خريجين...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alumni Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlumni.map((alumni) => {
          const program = programs.find(p => p.id === alumni.program_id);
          const achievements = getAlumniAchievements(alumni);

          return (
            <Card key={alumni.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{alumni.applicant_name}</CardTitle>
                      <p className="text-xs text-slate-500">{alumni.applicant_org_name}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <p className="text-sm text-slate-600">
                    {language === 'ar' && program?.name_ar ? program.name_ar : program?.name_en}
                  </p>
                </div>

                {achievements.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {achievements.map((ach, idx) => {
                      const Icon = ach.icon;
                      return (
                        <Badge key={idx} className="gap-1">
                          <Icon className="h-3 w-3" />
                          {ach.count} {ach.type}s
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {alumni.is_mentor && (
                  <Badge className="bg-amber-100 text-amber-700">
                    {t({ en: '🎓 Mentor', ar: '🎓 موجه' })}
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAlumni.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">{t({ en: 'No alumni found', ar: 'لا يوجد خريجون' })}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}