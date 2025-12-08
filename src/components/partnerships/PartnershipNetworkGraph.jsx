import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Network, Users } from 'lucide-react';

export default function PartnershipNetworkGraph() {
  const { language, t } = useLanguage();

  const { data: partnerships = [] } = useQuery({
    queryKey: ['partnerships'],
    queryFn: () => base44.entities.Partnership.list(),
    initialData: []
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list(),
    initialData: []
  });

  const networkData = useMemo(() => {
    const orgConnections = {};
    
    partnerships.forEach(p => {
      p.parties?.forEach(party => {
        const orgId = party.organization_id;
        if (!orgConnections[orgId]) {
          orgConnections[orgId] = {
            name: party.organization_name,
            partnerships: 0,
            connections: new Set()
          };
        }
        orgConnections[orgId].partnerships++;
        
        // Add connections to other parties
        p.parties.forEach(otherParty => {
          if (otherParty.organization_id !== orgId) {
            orgConnections[orgId].connections.add(otherParty.organization_id);
          }
        });
      });
    });

    const nodes = Object.entries(orgConnections).map(([id, data]) => ({
      id,
      name: data.name,
      partnerships: data.partnerships,
      connections: data.connections.size
    }));

    return nodes.sort((a, b) => b.partnerships - a.partnerships);
  }, [partnerships]);

  const topConnectors = networkData.slice(0, 5);
  const totalConnections = partnerships.length;

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Partnership Network', ar: 'شبكة الشراكات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{networkData.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Organizations', ar: 'منظمات' })}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300 text-center">
            <Network className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{totalConnections}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Partnerships', ar: 'شراكات' })}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-slate-700 mb-3">
            {t({ en: 'Top Network Connectors', ar: 'أفضل موصلي الشبكة' })}
          </h4>
          <div className="space-y-2">
            {topConnectors.map((node, i) => (
              <div key={node.id} className="p-3 bg-white rounded border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-indigo-600">#{i + 1}</Badge>
                    <span className="text-sm font-medium text-slate-900">{node.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-600">
                      {node.partnerships} {t({ en: 'partnerships', ar: 'شراكات' })}
                    </span>
                    <span className="text-slate-600">
                      {node.connections} {t({ en: 'connections', ar: 'اتصالات' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-indigo-50 rounded border border-indigo-300">
          <p className="text-xs text-slate-600">
            {t({ 
              en: 'Network analysis reveals key connectors and collaboration opportunities across the ecosystem', 
              ar: 'تحليل الشبكة يكشف الموصلات الرئيسية وفرص التعاون عبر النظام البيئي' 
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}