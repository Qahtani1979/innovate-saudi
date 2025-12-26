import { useState } from 'react';
import { usePublicChallenges } from '@/hooks/usePublicData';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Target, Calendar, ArrowRight, Building2 } from 'lucide-react';

export default function PublicChallenges() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');

  const { data: challenges = [], isLoading } = usePublicChallenges();

  const sectors = [...new Set(challenges.map(c => c.sector).filter(Boolean))];

  const filteredChallenges = challenges.filter(c => {
    const sectorMatch = selectedSector === 'all' || c.sector === selectedSector;
    const searchMatch = !searchTerm ||
      c.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title_ar?.includes(searchTerm) ||
      c.description_en?.toLowerCase().includes(searchTerm.toLowerCase());
    return sectorMatch && searchMatch;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  return (
    <>

      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 via-background to-muted/30">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t({ en: 'Municipal Challenges', ar: 'التحديات البلدية' })}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t({
              en: 'Explore the challenges facing municipalities and discover opportunities for innovation.',
              ar: 'استكشف التحديات التي تواجه البلديات واكتشف فرص الابتكار.'
            })}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-4 border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={t({ en: 'Search challenges...', ar: 'ابحث عن التحديات...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background"
            >
              <option value="all">{t({ en: 'All Sectors', ar: 'جميع القطاعات' })}</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Challenges Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                    <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="text-center py-16">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t({ en: 'No challenges found', ar: 'لم يتم العثور على تحديات' })}
              </h3>
              <p className="text-muted-foreground">
                {t({ en: 'Try adjusting your search or filters.', ar: 'حاول تعديل البحث أو الفلاتر.' })}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map(challenge => (
                <Card key={challenge.id} className="hover:shadow-lg transition-shadow group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      {challenge.priority && (
                        <Badge className={getPriorityColor(challenge.priority)}>
                          {challenge.priority}
                        </Badge>
                      )}
                      {challenge.sector && (
                        <Badge variant="outline">{challenge.sector}</Badge>
                      )}
                    </div>

                    <h3 className="font-bold text-lg text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                    </h3>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {language === 'ar' && challenge.description_ar ? challenge.description_ar : challenge.description_en}
                    </p>

                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      {challenge.municipalities && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>
                            {language === 'ar' && challenge.municipalities.name_ar
                              ? challenge.municipalities.name_ar
                              : challenge.municipalities.name_en}
                          </span>
                        </div>
                      )}
                      {challenge.created_at && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(challenge.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                        </div>
                      )}
                    </div>

                    <Link to="/auth">
                      <Button variant="outline" className="w-full gap-2">
                        {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t({ en: 'Have a Solution?', ar: 'لديك حل؟' })}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t({
              en: 'Join our platform to submit your innovative solutions and connect with municipalities.',
              ar: 'انضم إلى منصتنا لتقديم حلولك المبتكرة والتواصل مع البلديات.'
            })}
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              {t({ en: 'Get Started', ar: 'ابدأ الآن' })}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
