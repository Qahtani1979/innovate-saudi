import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { CheckCircle, Circle, Target, TrendingUp } from 'lucide-react';

export default function UserJourneyMapper({ userEmail }) {
  const { t } = useLanguage();

  const { data: user } = useQuery({
    queryKey: ['user-journey', userEmail],
    queryFn: async () => {
      const users = await base44.entities.User.list();
      return users.find(u => u.email === userEmail);
    }
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list()
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['user-activities', userEmail],
    queryFn: () => base44.entities.UserActivity.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  // Define journey stages per role
  const journeyStages = {
    'Municipality Director': [
      { id: 1, name: 'Profile Setup', completed: true, description: 'Complete profile and organization details' },
      { id: 2, name: 'Challenge Creation', completed: activities.some(a => a.action_type === 'create' && a.entity_type === 'Challenge'), description: 'Submit first challenge' },
      { id: 3, name: 'Pilot Launch', completed: activities.some(a => a.action_type === 'create' && a.entity_type === 'Pilot'), description: 'Launch first pilot project' },
      { id: 4, name: 'Dashboard Mastery', completed: activities.length > 50, description: 'Regular platform engagement' },
      { id: 5, name: 'Innovation Leader', completed: false, description: 'Scale successful pilot' }
    ],
    'Startup/Provider': [
      { id: 1, name: 'Profile Setup', completed: true, description: 'Complete company profile' },
      { id: 2, name: 'Solution Registration', completed: activities.some(a => a.action_type === 'create' && a.entity_type === 'Solution'), description: 'Register first solution' },
      { id: 3, name: 'Challenge Response', completed: activities.some(a => a.entity_type === 'Challenge' && a.action_type === 'view'), description: 'Respond to challenge' },
      { id: 4, name: 'Pilot Participation', completed: activities.some(a => a.entity_type === 'Pilot'), description: 'Participate in pilot' },
      { id: 5, name: 'Trusted Partner', completed: false, description: 'Multiple successful deployments' }
    ],
    'Researcher/Academic': [
      { id: 1, name: 'Profile Setup', completed: true, description: 'Complete academic profile' },
      { id: 2, name: 'Proposal Submission', completed: activities.some(a => a.action_type === 'create' && a.entity_type === 'RDProject'), description: 'Submit R&D proposal' },
      { id: 3, name: 'Project Award', completed: false, description: 'Receive project award' },
      { id: 4, name: 'Research Output', completed: false, description: 'Publish research output' },
      { id: 5, name: 'Pilot Integration', completed: false, description: 'Connect research to pilot' }
    ]
  };

  // Get user's primary role
  const userRoleIds = user?.assigned_roles || [];
  const userRoles = roles.filter(r => userRoleIds.includes(r.id));
  const primaryRole = userRoles[0]?.name || 'Municipality Director';
  const journey = journeyStages[primaryRole] || journeyStages['Municipality Director'];

  const completedSteps = journey.filter(s => s.completed).length;
  const progress = Math.round((completedSteps / journey.length) * 100);

  // Suggest next step
  const nextStep = journey.find(s => !s.completed);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Your Innovation Journey', ar: 'رحلة الابتكار الخاصة بك' })}
          </div>
          <Badge className="bg-indigo-600">{progress}%</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-900">
              {t({ en: 'Journey Progress', ar: 'تقدم الرحلة' })}
            </span>
            <span className="text-xs text-indigo-600">
              {completedSteps} / {journey.length} {t({ en: 'steps', ar: 'خطوة' })}
            </span>
          </div>
          <div className="h-2 bg-indigo-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Journey Steps */}
        <div className="space-y-4">
          {journey.map((step, idx) => (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                {step.completed ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <Circle className={`h-8 w-8 ${idx === completedSteps ? 'text-indigo-600 animate-pulse' : 'text-slate-300'}`} />
                )}
                {idx < journey.length - 1 && (
                  <div className={`w-0.5 h-12 mt-2 ${step.completed ? 'bg-green-600' : 'bg-slate-200'}`} />
                )}
              </div>
              
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-medium ${step.completed ? 'text-slate-900' : 'text-slate-600'}`}>
                    {step.name}
                  </h4>
                  {idx === completedSteps && (
                    <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-300">
                      {t({ en: 'Next', ar: 'التالي' })}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Next Step Suggestion */}
        {nextStep && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 mb-1">
                  {t({ en: 'Recommended Next Step', ar: 'الخطوة التالية الموصى بها' })}
                </p>
                <p className="text-sm text-blue-700">{nextStep.description}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}