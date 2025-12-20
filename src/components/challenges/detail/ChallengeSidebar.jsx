import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  User, Globe, Shield, Users, Clock, AlertTriangle
} from 'lucide-react';

export default function ChallengeSidebar({ challenge, citizenIdea }) {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t({ en: 'Quick Info', ar: 'معلومات سريعة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Citizen Origin Badge */}
          {challenge.citizen_origin_idea_id && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-semibold text-blue-900">{t({ en: 'Citizen-Originated', ar: 'من أصل مواطن' })}</p>
              </div>
              {citizenIdea ? (
                <Link to={createPageUrl(`IdeaDetail?id=${citizenIdea.id}`)} className="text-xs text-blue-600 hover:underline">
                  💡 {t({ en: 'View original idea', ar: 'عرض الفكرة الأصلية' })}: {citizenIdea.title}
                </Link>
              ) : (
                <p className="text-xs text-blue-600">💡 Idea #{challenge.citizen_origin_idea_id}</p>
              )}
            </div>
          )}

          {/* Public Visibility Status */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t({ en: 'Visibility', ar: 'الرؤية' })}</p>
            <div className="flex items-center gap-2">
              {challenge.is_published ? (
                <Badge className="bg-green-100 text-green-700">
                  <Globe className="h-3 w-3 mr-1" />
                  {t({ en: 'Published', ar: 'منشور' })}
                </Badge>
              ) : (
                <Badge variant="outline">{t({ en: 'Internal Only', ar: 'داخلي فقط' })}</Badge>
              )}
              {challenge.is_confidential && (
                <Badge className="bg-red-100 text-red-700">
                  <Shield className="h-3 w-3 mr-1" />
                  {t({ en: 'Confidential', ar: 'سري' })}
                </Badge>
              )}
            </div>
          </div>

          {/* Citizen Votes */}
          {challenge.citizen_votes_count > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t({ en: 'Citizen Votes', ar: 'أصوات المواطنين' })}</p>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="font-bold text-purple-600">{challenge.citizen_votes_count}</span>
                <span className="text-xs text-muted-foreground">{t({ en: 'votes', ar: 'صوت' })}</span>
              </div>
            </div>
          )}

          {/* SLA & Escalation Status */}
          {challenge.sla_due_date && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-900">{t({ en: 'SLA Due Date', ar: 'الموعد النهائي للاتفاقية' })}</p>
              </div>
              <p className="text-xs text-amber-800">{new Date(challenge.sla_due_date).toLocaleDateString()}</p>
              {challenge.escalation_level > 0 && (
                <Badge className={challenge.escalation_level === 2 ? 'bg-red-600 text-white mt-2' : 'bg-orange-600 text-white mt-2'}>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {challenge.escalation_level === 2 ? t({ en: 'CRITICAL', ar: 'حرج' }) : t({ en: 'WARNING', ar: 'تحذير' })}
                </Badge>
              )}
            </div>
          )}

          {/* Sector */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t({ en: 'Sector', ar: 'القطاع' })}</p>
            <p className="font-medium capitalize text-sm">{challenge.sector?.replace(/_/g, ' ')}</p>
          </div>

          {/* Sub-sector */}
          {challenge.sub_sector && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t({ en: 'Sub-Sector', ar: 'المجال الفرعي' })}</p>
              <p className="font-medium text-sm">{challenge.sub_sector}</p>
            </div>
          )}

          {/* Municipality */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t({ en: 'Municipality', ar: 'البلدية' })}</p>
            <p className="font-medium text-sm">{challenge.municipality_id?.substring(0, 20)}</p>
          </div>

          {/* Affected Population */}
          {challenge.affected_population_size && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t({ en: 'Affected Population', ar: 'السكان المتأثرون' })}</p>
              <p className="font-medium text-sm">{challenge.affected_population_size.toLocaleString()}</p>
            </div>
          )}

          {/* Challenge Owner */}
          {challenge.challenge_owner && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t({ en: 'Challenge Owner', ar: 'مالك التحدي' })}</p>
              <p className="font-medium text-sm">{challenge.challenge_owner}</p>
            </div>
          )}

          {/* Key Dates */}
          <div className="pt-4 border-t space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">{t({ en: 'Key Dates', ar: 'التواريخ الرئيسية' })}</p>
            {challenge.entry_date && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t({ en: 'Entry', ar: 'الإدخال' })}</span>
                <span>{new Date(challenge.entry_date).toLocaleDateString()}</span>
              </div>
            )}
            {challenge.submission_date && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t({ en: 'Submitted', ar: 'التقديم' })}</span>
                <span>{new Date(challenge.submission_date).toLocaleDateString()}</span>
              </div>
            )}
            {challenge.approval_date && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t({ en: 'Approved', ar: 'الموافقة' })}</span>
                <span>{new Date(challenge.approval_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {challenge.tags?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Tags', ar: 'الوسوم' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {challenge.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keywords */}
      {challenge.keywords?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Keywords', ar: 'الكلمات المفتاحية' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {challenge.keywords.map((keyword, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
