import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { BookOpen, Clock, Award, CheckCircle2, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function MunicipalityTrainingEnrollment({ municipalityId }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedProgram, setSelectedProgram] = useState(null);

  const trainingPrograms = [
    {
      id: 'challenge-design',
      title_en: 'Challenge Design Workshop',
      title_ar: 'ورشة تصميم التحديات',
      duration: '2 days',
      level: 'beginner',
      description_en: 'Learn to identify and articulate municipal challenges effectively',
      description_ar: 'تعلم كيفية تحديد وصياغة التحديات البلدية بفعالية'
    },
    {
      id: 'pilot-management',
      title_en: 'Pilot Management Fundamentals',
      title_ar: 'أساسيات إدارة التجارب',
      duration: '3 days',
      level: 'intermediate',
      description_en: 'Master the lifecycle of innovation pilots from design to evaluation',
      description_ar: 'إتقان دورة حياة التجارب الابتكارية من التصميم إلى التقييم'
    },
    {
      id: 'data-driven-decisions',
      title_en: 'Data-Driven Decision Making',
      title_ar: 'اتخاذ القرارات المبنية على البيانات',
      duration: '1 day',
      level: 'intermediate',
      description_en: 'Use data and KPIs to drive innovation decisions',
      description_ar: 'استخدام البيانات ومؤشرات الأداء لتوجيه قرارات الابتكار'
    },
    {
      id: 'partnership-building',
      title_en: 'Partnership & Collaboration',
      title_ar: 'بناء الشراكات والتعاون',
      duration: '2 days',
      level: 'beginner',
      description_en: 'Build effective partnerships with startups and research institutions',
      description_ar: 'بناء شراكات فعالة مع الشركات الناشئة والمؤسسات البحثية'
    }
  ];

  const enrollMutation = useMutation({
    mutationFn: async (programId) => {
      const response = await base44.functions.invoke('enrollMunicipalityTraining', {
        municipalityId,
        programId,
        enrollmentDate: new Date().toISOString()
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['municipality', municipalityId] });
      toast.success(t({ en: 'Enrolled successfully!', ar: 'تم التسجيل بنجاح!' }));
      setSelectedProgram(null);
    },
    onError: () => {
      toast.error(t({ en: 'Enrollment failed', ar: 'فشل التسجيل' }));
    }
  });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t({ en: 'Available Training Programs', ar: 'البرامج التدريبية المتاحة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainingPrograms.map((program) => (
              <Card key={program.id} className="border-2 hover:border-blue-300 transition-colors">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-lg">{language === 'ar' ? program.title_ar : program.title_en}</h3>
                      <p className="text-sm text-slate-600 mt-1">{language === 'ar' ? program.description_ar : program.description_en}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {program.duration}
                      </Badge>
                      <Badge className={
                        program.level === 'beginner' ? 'bg-green-100 text-green-700' :
                        program.level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }>
                        {program.level}
                      </Badge>
                    </div>

                    <Button 
                      onClick={() => enrollMutation.mutate(program.id)}
                      disabled={enrollMutation.isPending}
                      className="w-full"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {t({ en: 'Enroll Now', ar: 'التسجيل الآن' })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            {t({ en: 'Training Benefits', ar: 'فوائد التدريب' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { en: 'Certificate of completion', ar: 'شهادة إتمام' },
              { en: 'Access to expert mentors', ar: 'الوصول إلى الخبراء' },
              { en: 'Peer learning opportunities', ar: 'فرص التعلم من الأقران' },
              { en: 'Practical tools and templates', ar: 'أدوات وقوالب عملية' }
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">{t(benefit)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}