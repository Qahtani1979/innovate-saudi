import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TreePine, BarChart3, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

export default function TaxonomyVisualization({ sectors, subsectors, services }) {
  const { language, isRTL, t } = useLanguage();

  const sectorStats = sectors.map(sector => ({
    name: language === 'ar' ? sector.name_ar : sector.name_en,
    subsectors: subsectors.filter(ss => ss.sector_id === sector.id).length,
    services: subsectors
      .filter(ss => ss.sector_id === sector.id)
      .reduce((sum, ss) => sum + services.filter(srv => srv.subsector_id === ss.id).length, 0)
  }));

  const digitalStats = [
    { name: t({ en: 'Digital', ar: 'رقمية' }), value: services.filter(s => s.is_digital).length, color: '#10b981' },
    { name: t({ en: 'Traditional', ar: 'تقليدية' }), value: services.filter(s => !s.is_digital).length, color: '#94a3b8' }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Tree View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5 text-green-600" />
            {t({ en: 'Taxonomy Tree', ar: 'شجرة التصنيف' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sectors.map(sector => {
              const sectorSubsectors = subsectors.filter(ss => ss.sector_id === sector.id);
              return (
                <div key={sector.id} className="border-2 rounded-lg overflow-hidden">
                  <div className="p-3 bg-blue-50 border-b-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-600">{sector.code}</Badge>
                      <p className="font-semibold text-blue-900">
                        {language === 'ar' ? sector.name_ar : sector.name_en}
                      </p>
                    </div>
                    <Badge variant="outline">{sectorSubsectors.length} subsectors</Badge>
                  </div>
                  
                  <div className="p-2 bg-white">
                    {sectorSubsectors.map(subsector => {
                      const subsectorServices = services.filter(srv => srv.subsector_id === subsector.id);
                      return (
                        <div key={subsector.id} className="ml-6 border-l-2 border-purple-200 pl-4 py-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-mono text-xs">{subsector.code}</Badge>
                            <p className="text-sm font-medium text-slate-900">
                              {language === 'ar' ? subsector.name_ar : subsector.name_en}
                            </p>
                            <Badge className="bg-purple-100 text-purple-700 text-xs">{subsectorServices.length} services</Badge>
                          </div>
                          
                          {subsectorServices.length > 0 && (
                            <div className="ml-6 space-y-1">
                              {subsectorServices.map(service => (
                                <div key={service.id} className="flex items-center gap-2 text-xs text-slate-600">
                                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                  <span>{language === 'ar' ? service.name_ar : service.name_en}</span>
                                  {service.is_digital && <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Digital</Badge>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t({ en: 'Services by Sector', ar: 'الخدمات حسب القطاع' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectorStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="services" fill="#3b82f6" name={t({ en: 'Services', ar: 'خدمات' })} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t({ en: 'Digital vs Traditional', ar: 'رقمية مقابل تقليدية' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie data={digitalStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {digitalStats.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
