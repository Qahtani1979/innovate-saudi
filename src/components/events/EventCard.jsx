import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/LanguageContext';
import { MapPin, Users, Clock, Video, ArrowRight, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const eventTypeColors = {
  workshop: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  conference: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  hackathon: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  webinar: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  training: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  networking: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  meetup: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  demo_day: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
};

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  registration_open: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  registration_closed: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  in_progress: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

export default function EventCard({ 
  event, 
  showActions = false, 
  onEdit, 
  onDelete,
  compact = false 
}) {
  const { t, isRTL, language } = useLanguage();

  const title = language === 'ar' ? (event.title_ar || event.title_en) : (event.title_en || event.title_ar);
  const description = language === 'ar' ? (event.description_ar || event.description_en) : (event.description_en || event.description_ar);
  const location = language === 'ar' ? (event.location_ar || event.location) : (event.location || event.location_ar);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (compact) {
    return (
      <Link to={createPageUrl('EventDetail') + `?id=${event.id}`}>
        <div className="group p-3 border border-border/50 rounded-lg hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer bg-card">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-center p-2 bg-primary/10 rounded-lg min-w-[50px]">
              <p className="text-lg font-bold text-primary">
                {event.start_date ? new Date(event.start_date).getDate() : '?'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {event.start_date ? new Date(event.start_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short' }) : ''}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                {title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                {event.is_virtual ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                <span className="truncate">{event.is_virtual ? t({ en: 'Virtual', ar: 'افتراضي' }) : (location || t({ en: 'TBD', ar: 'يحدد لاحقاً' }))}</span>
              </div>
            </div>
            {event.event_type && (
              <Badge className={`${eventTypeColors[event.event_type] || 'bg-muted'} text-[10px] px-1.5`}>
                {event.event_type.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
      {event.image_url && (
        <div className="h-40 overflow-hidden">
          <img 
            src={event.image_url} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardContent className={event.image_url ? 'pt-4' : 'pt-6'}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 text-center p-3 bg-primary/10 rounded-lg min-w-[70px]">
            <p className="text-2xl font-bold text-primary">
              {event.start_date ? new Date(event.start_date).getDate() : '?'}
            </p>
            <p className="text-xs text-muted-foreground">
              {event.start_date ? new Date(event.start_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short' }) : ''}
            </p>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Link to={createPageUrl('EventDetail') + `?id=${event.id}`}>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer">
                  {title}
                </h3>
              </Link>
              {event.event_type && (
                <Badge className={eventTypeColors[event.event_type] || 'bg-muted'}>
                  {event.event_type.replace(/_/g, ' ')}
                </Badge>
              )}
              {event.status && (
                <Badge variant="outline" className={statusColors[event.status] || ''}>
                  {event.status.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
            
            {description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              {event.start_date && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(event.start_date)}
                </div>
              )}
              {(location || event.is_virtual) && (
                <div className="flex items-center gap-1">
                  {event.is_virtual ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                  {event.is_virtual ? t({ en: 'Virtual', ar: 'افتراضي' }) : location}
                </div>
              )}
              {event.max_participants && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {event.registered_count || 0}/{event.max_participants}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showActions && (
              <>
                {onEdit && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={(e) => { e.preventDefault(); onEdit(event); }}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={(e) => { e.preventDefault(); onDelete(event); }}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
            <Link to={createPageUrl('EventDetail') + `?id=${event.id}`}>
              <ArrowRight className={`h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
