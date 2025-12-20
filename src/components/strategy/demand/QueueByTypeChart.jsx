import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/components/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

const ENTITY_COLORS = {
  challenge: '#3b82f6',
  pilot: '#8b5cf6',
  solution: '#10b981',
  campaign: '#f59e0b',
  event: '#ef4444',
  policy: '#06b6d4',
  partnership: '#ec4899',
  rd_call: '#6366f1',
  living_lab: '#84cc16'
};

const STATUS_COLORS = {
  pending: '#3b82f6',
  in_progress: '#f59e0b',
  accepted: '#10b981',
  review: '#8b5cf6',
  rejected: '#ef4444',
  skipped: '#6b7280'
};

/**
 * QueueByTypeChart - Visualize queue distribution by entity type and status
 */
export default function QueueByTypeChart({ queueItems = [], byType = {} }) {
  const { t, isRTL } = useLanguage();

  // Prepare data for entity type distribution
  const typeData = Object.entries(byType).map(([type, items]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    type,
    pending: items.filter(i => i.status === 'pending').length,
    in_progress: items.filter(i => i.status === 'in_progress').length,
    accepted: items.filter(i => i.status === 'accepted').length,
    review: items.filter(i => i.status === 'review').length,
    rejected: items.filter(i => i.status === 'rejected').length,
    total: items.length
  })).filter(d => d.total > 0);

  // Prepare data for status distribution
  const statusData = [
    { name: t({ en: 'Pending', ar: 'معلق' }), value: queueItems.filter(i => i.status === 'pending').length, color: STATUS_COLORS.pending },
    { name: t({ en: 'In Progress', ar: 'قيد التنفيذ' }), value: queueItems.filter(i => i.status === 'in_progress').length, color: STATUS_COLORS.in_progress },
    { name: t({ en: 'Accepted', ar: 'مقبول' }), value: queueItems.filter(i => i.status === 'accepted').length, color: STATUS_COLORS.accepted },
    { name: t({ en: 'Review', ar: 'مراجعة' }), value: queueItems.filter(i => i.status === 'review').length, color: STATUS_COLORS.review },
    { name: t({ en: 'Rejected', ar: 'مرفوض' }), value: queueItems.filter(i => i.status === 'rejected').length, color: STATUS_COLORS.rejected },
  ].filter(d => d.value > 0);

  if (queueItems.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* By Entity Type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {t({ en: 'Queue by Entity Type', ar: 'القائمة حسب نوع الكيان' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
                          <p className="font-medium mb-2">{data.name}</p>
                          <div className="space-y-1">
                            <p className="text-blue-600">Pending: {data.pending}</p>
                            <p className="text-yellow-600">In Progress: {data.in_progress}</p>
                            <p className="text-green-600">Accepted: {data.accepted}</p>
                            <p className="text-purple-600">Review: {data.review}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                  {typeData.map((entry) => (
                    <Cell key={entry.type} fill={ENTITY_COLORS[entry.type] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* By Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {t({ en: 'Queue by Status', ar: 'القائمة حسب الحالة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [value, t({ en: 'Items', ar: 'عناصر' })]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
