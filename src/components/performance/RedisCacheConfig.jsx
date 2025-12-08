import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { Zap, Database, Clock, AlertCircle } from 'lucide-react';

export default function RedisCacheConfig() {
  const { t } = useLanguage();

  const cacheStrategies = [
    {
      name: 'Entity Lists',
      description: 'Cache frequently accessed entity lists',
      ttl: '5 minutes',
      enabled: false
    },
    {
      name: 'User Sessions',
      description: 'Store user session data in Redis',
      ttl: '30 minutes',
      enabled: false
    },
    {
      name: 'API Responses',
      description: 'Cache GET API responses',
      ttl: '2 minutes',
      enabled: false
    },
    {
      name: 'Search Results',
      description: 'Cache search query results',
      ttl: '10 minutes',
      enabled: false
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-600" />
          {t({ en: 'Redis Caching Layer', ar: 'طبقة تخزين Redis' })}
          <Badge className="ml-auto bg-red-600">
            {t({ en: 'Not Implemented', ar: 'غير منفذ' })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-xs text-red-800">
              <p className="font-medium mb-1">Infrastructure Required</p>
              <p>Redis server setup and integration with backend API needed</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {cacheStrategies.map((strategy, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">{strategy.name}</p>
                <p className="text-xs text-slate-600">{strategy.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-500">TTL: {strategy.ttl}</span>
                </div>
              </div>
              <Switch checked={strategy.enabled} disabled />
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Expected benefits:</p>
          <ul className="space-y-1 ml-4">
            <li>• 60-80% reduction in database queries</li>
            <li>• Faster page load times</li>
            <li>• Better scalability</li>
            <li>• Reduced API latency</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}