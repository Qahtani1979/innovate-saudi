import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/components/LanguageContext';
import { 
  Target, Eye, Calendar, Users, TrendingUp, 
  CheckCircle2, ArrowRight, MessageSquare, Send
} from 'lucide-react';

export default function StrategyPublicView() {
  const { t, language } = useLanguage();
  const [feedback, setFeedback] = React.useState('');

  const strategy = {
    title: language === 'ar' ? 'استراتيجية الابتكار الوطني 2024-2030' : 'National Innovation Strategy 2024-2030',
    vision: language === 'ar' 
      ? 'أن نكون رائدين عالمياً في الابتكار البلدي وتقديم الخدمات الذكية'
      : 'To be global leaders in municipal innovation and smart service delivery',
    mission: language === 'ar'
      ? 'تمكين البلديات من خلال الابتكار والتقنية والشراكات الاستراتيجية'
      : 'Empowering municipalities through innovation, technology, and strategic partnerships',
    pillars: [
      { name: language === 'ar' ? 'التحول الرقمي' : 'Digital Transformation', progress: 65, icon: '🚀' },
      { name: language === 'ar' ? 'الاستدامة' : 'Sustainability', progress: 48, icon: '🌱' },
      { name: language === 'ar' ? 'تجربة المواطن' : 'Citizen Experience', progress: 72, icon: '👥' },
      { name: language === 'ar' ? 'الشراكات' : 'Partnerships', progress: 55, icon: '🤝' }
    ],
    keyObjectives: [
      { title: language === 'ar' ? 'رقمنة 100% من الخدمات البلدية' : '100% Digital Municipal Services', status: 'in_progress' },
      { title: language === 'ar' ? 'إطلاق 50 مشروع تجريبي' : 'Launch 50 Pilot Projects', status: 'in_progress' },
      { title: language === 'ar' ? 'إنشاء 10 مختبرات حية' : 'Establish 10 Living Labs', status: 'completed' },
      { title: language === 'ar' ? 'تدريب 5000 موظف' : 'Train 5,000 Staff', status: 'in_progress' }
    ],
    achievements: [
      { title: language === 'ar' ? '25 تحدي ابتكار تم حله' : '25 Innovation Challenges Solved', value: '25' },
      { title: language === 'ar' ? '150+ شراكة نشطة' : '150+ Active Partnerships', value: '150+' },
      { title: language === 'ar' ? '3 ملايين مواطن مستفيد' : '3M Citizens Benefited', value: '3M' }
    ],
    upcomingInitiatives: [
      { name: language === 'ar' ? 'هاكاثون المدن الذكية' : 'Smart Cities Hackathon', date: '2024-03-15' },
      { name: language === 'ar' ? 'برنامج تسريع الابتكار' : 'Innovation Accelerator Program', date: '2024-04-01' },
      { name: language === 'ar' ? 'قمة الابتكار البلدي' : 'Municipal Innovation Summit', date: '2024-05-20' }
    ]
  };

  const handleSubmitFeedback = () => {
    if (feedback.trim()) {
      // In real implementation, this would submit to the backend
      setFeedback('');
      alert(t({ en: 'Thank you for your feedback!', ar: 'شكراً لملاحظاتك!' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <Badge variant="secondary" className="mb-4">
            {t({ en: 'Strategic Plan 2024-2030', ar: 'الخطة الاستراتيجية 2024-2030' })}
          </Badge>
          <h1 className="text-4xl font-bold mb-4">{strategy.title}</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">{strategy.vision}</p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl py-12 px-4 space-y-12">
        {/* Mission */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">{t({ en: 'Our Mission', ar: 'مهمتنا' })}</h2>
                <p className="text-muted-foreground">{strategy.mission}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Pillars */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            {t({ en: 'Strategic Pillars', ar: 'الركائز الاستراتيجية' })}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {strategy.pillars.map((pillar, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{pillar.icon}</span>
                    <h3 className="font-semibold">{pillar.name}</h3>
                  </div>
                  <Progress value={pillar.progress} className="h-2 mb-2" />
                  <p className="text-sm text-muted-foreground text-right">{pillar.progress}%</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Key Objectives */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            {t({ en: 'Key Objectives', ar: 'الأهداف الرئيسية' })}
          </h2>
          <div className="grid gap-3">
            {strategy.keyObjectives.map((objective, index) => (
              <Card key={index}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`h-5 w-5 ${objective.status === 'completed' ? 'text-green-600' : 'text-muted-foreground'}`} />
                    <span>{objective.title}</span>
                  </div>
                  <Badge variant={objective.status === 'completed' ? 'default' : 'secondary'}>
                    {objective.status === 'completed' 
                      ? t({ en: 'Completed', ar: 'مكتمل' })
                      : t({ en: 'In Progress', ar: 'قيد التنفيذ' })
                    }
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            {t({ en: 'Key Achievements', ar: 'الإنجازات الرئيسية' })}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {strategy.achievements.map((achievement, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold text-primary mb-2">{achievement.value}</p>
                  <p className="text-sm text-muted-foreground">{achievement.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Initiatives */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            {t({ en: 'Upcoming Initiatives', ar: 'المبادرات القادمة' })}
          </h2>
          <div className="space-y-3">
            {strategy.upcomingInitiatives.map((initiative, index) => (
              <Card key={index}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span>{initiative.name}</span>
                  </div>
                  <Badge variant="outline">{initiative.date}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feedback Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              {t({ en: 'Share Your Feedback', ar: 'شاركنا رأيك' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t({ en: 'We value your input on our strategic direction...', ar: 'نقدر مساهمتك في توجهنا الاستراتيجي...' })}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
            <Button onClick={handleSubmitFeedback} disabled={!feedback.trim()}>
              <Send className="h-4 w-4 mr-2" />
              {t({ en: 'Submit Feedback', ar: 'إرسال الملاحظات' })}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
