import { useState } from 'react';
import {
  usePublicMunicipalities,
  usePublicPilots,
  usePublicMapChallenges,
  usePublicSolutions
} from '@/hooks/usePublicData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, AlertCircle, TestTube, Lightbulb, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function PublicGeographicMap() {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const { data: municipalities = [] } = usePublicMunicipalities();

  const { data: challenges = [] } = usePublicMapChallenges();

  const { data: pilots = [] } = usePublicPilots();

  const { data: solutions = [] } = usePublicSolutions();

  const regions = [...new Set(municipalities.map(m => m.region))].filter(Boolean);

  const filteredMunicipalities = selectedRegion === 'all'
    ? municipalities
    : municipalities.filter(m => m.region === selectedRegion);

  const mapItems = [
    ...challenges.map(c => ({ ...c, type: 'challenge', icon: AlertCircle, color: 'red' })),
    ...pilots.map(p => ({ ...p, type: 'pilot', icon: TestTube, color: 'blue' })),
    ...filteredMunicipalities.filter(m => m.coordinates).map(m => ({ ...m, type: 'municipality', icon: Building2, color: 'green' }))
  ].filter(item => filter === 'all' || item.type === filter);

  const saudiCenter = { lat: 24.7136, lng: 46.6753 }; // Riyadh

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          {t({ en: '🗺️ National Innovation Map', ar: '🗺️ خريطة الابتكار الوطنية' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Explore innovation initiatives across Saudi Arabia', ar: 'استكشف مبادرات الابتكار في جميع أنحاء المملكة' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Building2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{municipalities.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Municipalities', ar: 'بلديات' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{challenges.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Challenges', ar: 'تحديات' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TestTube className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{pilots.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Pilots', ar: 'تجارب' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Lightbulb className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{solutions.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Solutions', ar: 'حلول' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3 flex-wrap">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              {t({ en: 'All', ar: 'الكل' })}
            </Button>
            <Button
              size="sm"
              variant={filter === 'municipality' ? 'default' : 'outline'}
              onClick={() => setFilter('municipality')}
            >
              <Building2 className="h-4 w-4 mr-2" />
              {t({ en: 'Municipalities', ar: 'بلديات' })}
            </Button>
            <Button
              size="sm"
              variant={filter === 'challenge' ? 'default' : 'outline'}
              onClick={() => setFilter('challenge')}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              {t({ en: 'Challenges', ar: 'تحديات' })}
            </Button>
            <Button
              size="sm"
              variant={filter === 'pilot' ? 'default' : 'outline'}
              onClick={() => setFilter('pilot')}
            >
              <TestTube className="h-4 w-4 mr-2" />
              {t({ en: 'Pilots', ar: 'تجارب' })}
            </Button>

            <div className="border-l pl-3 flex gap-2">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="all">{t({ en: 'All Regions', ar: 'جميع المناطق' })}</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            {t({ en: 'Interactive Map', ar: 'خريطة تفاعلية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] rounded-lg overflow-hidden">
            <MapContainer
              center={[saudiCenter.lat, saudiCenter.lng]}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {mapItems.map((item, idx) => {
                if (!item.coordinates?.latitude || !item.coordinates?.longitude) return null;

                const Icon = item.icon;

                return (
                  <CircleMarker
                    key={`${item.type}-${item.id}`}
                    center={[item.coordinates.latitude, item.coordinates.longitude]}
                    radius={item.type === 'municipality' ? 8 : 6}
                    pathOptions={{
                      color: item.color === 'red' ? '#dc2626' :
                        item.color === 'blue' ? '#2563eb' :
                          item.color === 'green' ? '#16a34a' : '#6b7280',
                      fillColor: item.color === 'red' ? '#dc2626' :
                        item.color === 'blue' ? '#2563eb' :
                          item.color === 'green' ? '#16a34a' : '#6b7280',
                      fillOpacity: 0.7
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-4 w-4" />
                          <Badge className="text-xs">{item.type}</Badge>
                        </div>
                        <h4 className="font-semibold text-sm">
                          {item.type === 'municipality'
                            ? (language === 'ar' && item.name_ar ? item.name_ar : item.name_en)
                            : (language === 'ar' && item.title_ar ? item.title_ar : item.title_en || item.name_en)}
                        </h4>
                        {item.code && <p className="text-xs text-slate-500 mt-1">{item.code}</p>}
                        {item.mii_score && (
                          <p className="text-sm text-blue-600 mt-2">MII: {item.mii_score}</p>
                        )}
                        <Link
                          to={createPageUrl(
                            item.type === 'challenge' ? 'ChallengeDetail' :
                              item.type === 'pilot' ? 'PilotDetail' :
                                item.type === 'municipality' ? 'MunicipalityProfile' : 'Home'
                          ) + `?id=${item.id}`}
                        >
                          <Button size="sm" className="w-full mt-2">
                            {t({ en: 'View', ar: 'عرض' })}
                          </Button>
                        </Link>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}