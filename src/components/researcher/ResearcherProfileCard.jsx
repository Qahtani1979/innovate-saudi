/**
 * Researcher Profile Card Component
 * Displays researcher profile summary with actions
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from '@/components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  GraduationCap, Building2, BookOpen, Award, ExternalLink, 
  Mail, Link2, CheckCircle2, Clock
} from 'lucide-react';

export default function ResearcherProfileCard({ researcher, showActions = true, compact = false }) {
  const { language, t } = useLanguage();
  
  if (!researcher) return null;

  const name = language === 'ar' && researcher.name_ar 
    ? researcher.name_ar 
    : researcher.name_en || researcher.full_name_en || 'Unknown Researcher';

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Card className={`hover:shadow-md transition-shadow ${compact ? 'p-3' : ''}`}>
      {!compact && (
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={researcher.photo_url} alt={name} />
              <AvatarFallback className="bg-teal-100 text-teal-700 text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{name}</CardTitle>
                {researcher.is_verified && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
              {researcher.title_en && (
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' && researcher.title_ar ? researcher.title_ar : researcher.title_en}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{researcher.institution || t({ en: 'Independent', ar: 'مستقل' })}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className={compact ? 'p-0' : ''}>
        {compact && (
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={researcher.photo_url} alt={name} />
              <AvatarFallback className="bg-teal-100 text-teal-700 text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-sm">{name}</span>
                {researcher.is_verified && <CheckCircle2 className="h-3 w-3 text-green-500" />}
              </div>
              <span className="text-xs text-muted-foreground">{researcher.institution}</span>
            </div>
          </div>
        )}

        {/* Research Areas */}
        {researcher.research_areas?.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {researcher.research_areas.slice(0, compact ? 3 : 5).map((area, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
              {researcher.research_areas.length > (compact ? 3 : 5) && (
                <Badge variant="outline" className="text-xs">
                  +{researcher.research_areas.length - (compact ? 3 : 5)}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        {!compact && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 bg-muted rounded-lg">
              <BookOpen className="h-4 w-4 mx-auto mb-1 text-teal-600" />
              <p className="text-lg font-bold">{researcher.publication_count || 0}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Publications', ar: 'منشورات' })}</p>
            </div>
            <div className="text-center p-2 bg-muted rounded-lg">
              <Award className="h-4 w-4 mx-auto mb-1 text-amber-600" />
              <p className="text-lg font-bold">{researcher.h_index || '-'}</p>
              <p className="text-xs text-muted-foreground">H-Index</p>
            </div>
            <div className="text-center p-2 bg-muted rounded-lg">
              <GraduationCap className="h-4 w-4 mx-auto mb-1 text-purple-600" />
              <p className="text-lg font-bold">{researcher.citation_count || 0}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Citations', ar: 'اقتباسات' })}</p>
            </div>
          </div>
        )}

        {/* External Links */}
        {!compact && (researcher.orcid_id || researcher.google_scholar_url) && (
          <div className="flex gap-2 mb-4">
            {researcher.orcid_id && (
              <a 
                href={`https://orcid.org/${researcher.orcid_id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Link2 className="h-3 w-3" /> ORCID
              </a>
            )}
            {researcher.google_scholar_url && (
              <a 
                href={researcher.google_scholar_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" /> Scholar
              </a>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Link to={createPageUrl(`ResearcherProfile?id=${researcher.id}`)} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                {t({ en: 'View Profile', ar: 'عرض الملف' })}
              </Button>
            </Link>
            <Button variant="ghost" size="sm">
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
