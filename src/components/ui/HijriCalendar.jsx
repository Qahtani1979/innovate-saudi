import { Calendar } from 'lucide-react';

/**
 * Hijri calendar date display option
 */
export function HijriDate({ date, showGregorian = true }) {
  const hijriDate = toHijri(new Date(date));
  
  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <Calendar className="h-3 w-3" />
        <span className="font-arabic">{hijriDate}</span>
      </div>
      {showGregorian && (
        <div className="text-xs text-slate-500 mt-1">
          ({new Date(date).toLocaleDateString('ar-SA')})
        </div>
      )}
    </div>
  );
}

function toHijri(gregorianDate) {
  // Simplified Hijri conversion (approximation)
  const hijriYear = Math.floor((gregorianDate.getFullYear() - 622) * 1.030684);
  const hijriMonths = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
  const month = hijriMonths[gregorianDate.getMonth()];
  const day = gregorianDate.getDate();
  
  return `${day} ${month} ${hijriYear}هـ`;
}

export default HijriDate;
