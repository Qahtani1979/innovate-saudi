import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/LanguageContext';
import {
  FileText, Send, CheckCircle2, Activity, TestTube, Microscope,
  Clock, Award, MapPin, Target, BarChart3, Archive
} from 'lucide-react';
import SmartActionButton from '@/components/SmartActionButton';

const statusConfig = {
  draft: { color: 'bg-slate-100 text-slate-700', icon: FileText },
  submitted: { color: 'bg-blue-100 text-blue-700', icon: Send },
  under_review: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  in_treatment: { color: 'bg-purple-100 text-purple-700', icon: Activity },
  resolved: { color: 'bg-teal-100 text-teal-700', icon: CheckCircle2 },
  archived: { color: 'bg-gray-100 text-gray-700', icon: Archive }
};

const priorityColors = {
  tier_1: 'bg-red-100 text-red-700',
  tier_2: 'bg-orange-100 text-orange-700',
  tier_3: 'bg-yellow-100 text-yellow-700',
  tier_4: 'bg-green-100 text-green-700'
};

export default function ChallengeHero({ 
  challenge, 
  onShowSubmission, 
  onShowReview, 
  onShowTreatment, 
  onShowRDConversion,
  onShowArchive 
}) {
  const { language, isRTL, t } = useLanguage();
  
  const statusInfo = statusConfig[challenge.status] || statusConfig.draft;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 p-8 text-white">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {challenge.code && (
                <Badge variant="outline" className="bg-white/20 text-white border-white/40 font-mono">
                  {challenge.code}
                </Badge>
              )}
              <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                <StatusIcon className="h-3 w-3" />
                {challenge.status?.replace(/_/g, ' ')}
              </Badge>
              <Badge className={priorityColors[challenge.priority]}>
                {challenge.priority}
              </Badge>
              {challenge.is_featured && (
                <Badge className="bg-amber-500 text-white">
                  <Award className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <h1 className="text-5xl font-bold mb-2">
              {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
            </h1>
            {(challenge.tagline_en || challenge.tagline_ar) && (
              <p className="text-xl text-white/90">
                {language === 'ar' && challenge.tagline_ar ? challenge.tagline_ar : challenge.tagline_en}
              </p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{challenge.municipality_id}</span>
              </div>
              {challenge.sector && (
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{challenge.sector.replace(/_/g, ' ')}</span>
                </div>
              )}
              {challenge.overall_score && (
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>Score: {challenge.overall_score}/100</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {challenge.status === 'draft' && (
              <Button onClick={onShowSubmission} className="bg-blue-600 hover:bg-blue-700">
                <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Submit', ar: 'تقديم' })}
              </Button>
            )}
            {challenge.status === 'submitted' && (
              <Button onClick={onShowReview} className="bg-yellow-600 hover:bg-yellow-700">
                <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Review', ar: 'مراجعة' })}
              </Button>
            )}
            {challenge.status === 'approved' && (
              <>
                <Button onClick={onShowTreatment} className="bg-purple-600 hover:bg-purple-700">
                  <Activity className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Plan Treatment', ar: 'تخطيط المعالجة' })}
                </Button>
                <SmartActionButton 
                  context="challenge_to_pilot"
                  entity={{ ...challenge, entity_type: 'challenge' }}
                  icon={TestTube}
                  label={t({ en: 'Design Pilot', ar: 'تصميم تجربة' })}
                  variant="default"
                />
                {challenge.track === 'r_and_d' && (
                  <Button onClick={onShowRDConversion} className="bg-blue-600 hover:bg-blue-700">
                    <Microscope className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t({ en: 'Create R&D', ar: 'إنشاء بحث' })}
                  </Button>
                )}
              </>
            )}
            {(challenge.status === 'resolved' || challenge.status === 'in_treatment') && (
              <Button onClick={onShowArchive} variant="outline" className="text-white border-white hover:bg-white/20">
                <Archive className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Archive', ar: 'أرشفة' })}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
