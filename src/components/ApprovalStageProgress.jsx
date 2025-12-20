import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function ApprovalStageProgress({ application }) {
  const { language, isRTL, t } = useLanguage();

  const stages = [
    { key: 'submitted', label: { en: 'Submitted', ar: 'مقدم' } },
    { key: 'technical_review', label: { en: 'Technical', ar: 'فني' } },
    { key: 'legal_review', label: { en: 'Legal', ar: 'قانوني' } },
    { key: 'safety_review', label: { en: 'Safety', ar: 'سلامة' } },
    { key: 'approved', label: { en: 'Approved', ar: 'موافق عليه' } }
  ];

  const stageOrder = ['submitted', 'technical_review', 'legal_review', 'safety_review', 'approved', 'rejected'];
  const currentIndex = stageOrder.indexOf(application.status);

  const getStageStatus = (index) => {
    if (application.status === 'rejected') {
      return index <= currentIndex ? 'rejected' : 'pending';
    }
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  const statusConfig = {
    completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' },
    current: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-300' },
    pending: { icon: Circle, color: 'text-slate-300', bg: 'bg-slate-50', border: 'border-slate-200' },
    rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300' }
  };

  return (
    <div className="bg-white rounded-lg border p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <h3 className="text-lg font-semibold text-slate-900 mb-6">
        {t({ en: 'Review Progress', ar: 'تقدم المراجعة' })}
      </h3>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200" style={{ zIndex: 0 }} />
        <div 
          className="absolute top-5 left-0 h-0.5 bg-green-500 transition-all duration-500"
          style={{ 
            width: `${(currentIndex / (stages.length - 1)) * 100}%`,
            zIndex: 1
          }}
        />

        {/* Stages */}
        <div className="relative flex justify-between" style={{ zIndex: 2 }}>
          {stages.map((stage, index) => {
            const status = getStageStatus(index);
            const config = statusConfig[status];
            const Icon = config.icon;

            return (
              <div key={stage.key} className="flex flex-col items-center" style={{ minWidth: '100px' }}>
                <div className={`h-10 w-10 rounded-full border-2 ${config.border} ${config.bg} flex items-center justify-center mb-2`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
                <p className={`text-xs font-medium text-center ${status === 'current' ? 'text-blue-600' : 'text-slate-600'}`}>
                  {stage.label[language]}
                </p>
                {status === 'current' && (
                  <Badge className="mt-2 bg-blue-100 text-blue-700">
                    {t({ en: 'In Progress', ar: 'قيد التنفيذ' })}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Stage Info */}
      {application.current_review_stage && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-900">
            {t({ en: 'Current Stage:', ar: 'المرحلة الحالية:' })}{' '}
            <span className="capitalize">{application.current_review_stage.replace(/_/g, ' ')}</span>
          </p>
          {application.review_comments && application.review_comments.length > 0 && (
            <div className="mt-2 space-y-2">
              {application.review_comments.slice(-2).map((comment, idx) => (
                <div key={idx} className="text-xs text-slate-700 bg-white p-2 rounded">
                  <span className="font-medium">{comment.reviewer}:</span> {comment.comment}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}