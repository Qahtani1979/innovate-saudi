import { useLanguage } from './LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TestTube, FileText, Lightbulb, 
  Calendar, Users, Zap, Download, Shield, Search 
} from 'lucide-react';

export default function QuickActionsWidget({ userRole = 'user', contextData = {} }) {
  const { language, isRTL, t } = useLanguage();

  const actionsByRole = {
    admin: [
      { 
        icon: AlertCircle, 
        label: { en: 'Add Challenge', ar: 'إضافة تحدي' }, 
        link: 'ChallengeCreate', 
        color: 'red',
        badge: contextData.pendingChallenges
      },
      { 
        icon: TestTube, 
        label: { en: 'Create Pilot', ar: 'إنشاء تجربة' }, 
        link: 'PilotCreate', 
        color: 'blue' 
      },
      { 
        icon: Lightbulb, 
        label: { en: 'Add Solution', ar: 'إضافة حل' }, 
        link: 'SolutionCreate', 
        color: 'amber' 
      },
      { 
        icon: Calendar, 
        label: { en: 'Launch Program', ar: 'إطلاق برنامج' }, 
        link: 'ProgramCreate', 
        color: 'purple' 
      },
      { 
        icon: FileText, 
        label: { en: 'Create R&D Call', ar: 'إنشاء دعوة بحث' }, 
        link: 'RDCallCreate', 
        color: 'green' 
      },
      { 
        icon: Users, 
        label: { en: 'Invite User', ar: 'دعوة مستخدم' }, 
        link: 'UserInvitationManager', 
        color: 'indigo' 
      },
      { 
        icon: Shield, 
        label: { en: 'Approvals', ar: 'الموافقات' }, 
        link: 'MyApprovals', 
        color: 'emerald',
        badge: contextData.pendingApprovals
      },
      { 
        icon: Download, 
        label: { en: 'Generate Report', ar: 'إنشاء تقرير' }, 
        link: 'ReportsBuilder', 
        color: 'slate' 
      },
    ],
    user: [
      { 
        icon: AlertCircle, 
        label: { en: 'Submit Challenge', ar: 'تقديم تحدي' }, 
        link: 'ChallengeCreate', 
        color: 'red' 
      },
      { 
        icon: Search, 
        label: { en: 'Browse Solutions', ar: 'تصفح الحلول' }, 
        link: 'Solutions', 
        color: 'amber' 
      },
      { 
        icon: FileText, 
        label: { en: 'Apply to Program', ar: 'التقدم لبرنامج' }, 
        link: 'Programs', 
        color: 'purple' 
      },
      { 
        icon: Lightbulb, 
        label: { en: 'Propose Solution', ar: 'اقتراح حل' }, 
        link: 'SolutionCreate', 
        color: 'amber' 
      },
      { 
        icon: TestTube, 
        label: { en: 'Design Pilot', ar: 'تصميم تجربة' }, 
        link: 'PilotCreate', 
        color: 'blue' 
      },
      { 
        icon: Calendar, 
        label: { en: 'View Opportunities', ar: 'عرض الفرص' }, 
        link: 'OpportunityFeed', 
        color: 'green' 
      },
    ]
  };

  const userActions = actionsByRole[userRole] || actionsByRole.user;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          {t({ en: 'Quick Actions', ar: 'إجراءات سريعة' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {userActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link key={i} to={createPageUrl(action.link)}>
                <button className={`relative w-full p-4 bg-gradient-to-br from-${action.color}-50 to-white rounded-lg border-2 border-${action.color}-200 hover:border-${action.color}-400 hover:shadow-lg transition-all group`}>
                  {action.badge && action.badge > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                      {action.badge}
                    </Badge>
                  )}
                  <Icon className={`h-6 w-6 text-${action.color}-600 mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                  <p className="text-sm font-medium text-slate-900">{action.label[language]}</p>
                </button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
