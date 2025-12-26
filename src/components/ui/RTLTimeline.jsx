import { useLanguage } from '../LanguageContext';
import { CheckCircle2, Circle } from 'lucide-react';

/**
 * RTL-optimized timeline component
 */
export default function RTLTimeline({ events }) {
  const { isRTL, language } = useLanguage();

  return (
    <div className={`space-y-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {events.map((event, idx) => (
        <div key={idx} className="flex items-start gap-4">
          <div className={`flex flex-col items-center ${isRTL ? 'order-2' : 'order-1'}`}>
            {event.completed ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <Circle className="h-6 w-6 text-slate-300" />
            )}
            {idx < events.length - 1 && (
              <div className={`w-0.5 h-12 ${event.completed ? 'bg-green-600' : 'bg-slate-300'}`} />
            )}
          </div>
          <div className={`flex-1 pb-8 ${isRTL ? 'order-1 text-right' : 'order-2 text-left'}`}>
            <p className="font-semibold text-slate-900">{event.title}</p>
            <p className="text-sm text-slate-600">{event.description}</p>
            <p className="text-xs text-slate-500 mt-1">
              {new Date(event.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
