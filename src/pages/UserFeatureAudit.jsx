import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { 
  CheckCircle2, Clock, XCircle
} from 'lucide-react';

export default function UserFeatureAudit() {
  const { t, isRTL } = useLanguage();

  const featureAudit = {
    core_pages: {
      category: 'Core User Pages',
      items: [
        { name: 'UserProfile', status: 'complete', issues: ['Added visibility controls'], priority: 'low' },
        { name: 'UserManagementHub', status: 'complete', issues: [], priority: 'none' },
        { name: 'Settings', status: 'complete', issues: [], priority: 'none' },
        { name: 'UserDirectory (migrated to Hub)', status: 'complete', issues: [], priority: 'none' },
        { name: 'PersonalizedDashboard', status: 'complete', issues: [], priority: 'none' },
      ]
    },
    onboarding: {
      category: 'Onboarding',
      items: [
        { name: 'OnboardingWizard', status: 'complete', issues: [], priority: 'none' },
        { name: 'OnboardingChecklist', status: 'complete', issues: [], priority: 'none' },
        { name: 'AIConnectionsSuggester', status: 'complete', issues: [], priority: 'none' },
      ]
    },
    gamification: {
      category: 'Gamification',
      items: [
        { name: 'UserGamification', status: 'complete', issues: [], priority: 'none' },
        { name: 'Achievement Entity', status: 'complete', issues: [], priority: 'none' },
        { name: 'Auto Achievement Logic', status: 'missing', issues: ['Need backend'], priority: 'high' },
      ]
    },
    notifications: {
      category: 'Notifications',
      items: [
        { name: 'NotificationPreferences', status: 'complete', issues: [], priority: 'none' },
        { name: 'Smart Filtering', status: 'missing', issues: ['AI filtering needed'], priority: 'medium' },
      ]
    },
    delegation: {
      category: 'Delegation',
      items: [
        { name: 'DelegationManager', status: 'complete', issues: [], priority: 'none' },
        { name: 'Enforcement Logic', status: 'missing', issues: ['Backend needed'], priority: 'high' },
      ]
    }
  };

  const allItems = Object.values(featureAudit).flatMap(cat => cat.items);
  const completed = allItems.filter(i => i.status === 'complete').length;
  const totalProgress = (completed / allItems.length) * 100;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'missing': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 via-gray-800 to-zinc-800 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: 'User Features Audit', ar: 'تدقيق ميزات المستخدمين' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Comprehensive review', ar: 'مراجعة شاملة' })}
        </p>
      </div>

      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle>{t({ en: 'Overall Progress', ar: 'التقدم الإجمالي' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-purple-600">{Math.round(totalProgress)}%</span>
            <span className="text-sm text-slate-600">{completed} / {allItems.length}</span>
          </div>
          <Progress value={totalProgress} className="h-3" />
        </CardContent>
      </Card>

      {Object.entries(featureAudit).map(([key, category]) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle>{category.category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {category.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    item.status === 'complete' ? 'bg-green-50 border-green-200' :
                    'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <Badge className={item.priority === 'high' ? 'bg-red-600' : item.priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'}>
                      {item.priority}
                    </Badge>
                  </div>
                  {item.issues.length > 0 && (
                    <ul className="mt-2 text-xs text-slate-600 ml-8">
                      {item.issues.map((issue, i) => (
                        <li key={i}>• {issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}