import { useMatchmakerStats } from '@/hooks/useMatchmakerStats';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { Network, TrendingUp, Handshake, CheckCircle2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function MatchmakerExecutiveWidget() {
    const { t, isRTL } = useLanguage();

    const { data: stats } = useMatchmakerStats();

    const chartData = [
        { name: 'Applications', value: stats?.total || 0 },
        { name: 'Active Matches', value: stats?.active || 0 },
        { name: 'Partnerships', value: stats?.partnerships || 0 },
        { name: 'Pilots', value: stats?.pilots || 0 },
    ];

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Network className="h-5 w-5 text-purple-600" />
                    {t({ en: 'Matchmaker Overview', ar: 'نظرة عامة على التوفيق' })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">{t({ en: 'Engagement Rate', ar: 'معدل المشاركة' })}</span>
                        </div>
                        <p className="text-2xl font-bold">{stats ? Math.round((stats.active / stats.total) * 100) : 0}%</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <Handshake className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">{t({ en: 'Partnerships', ar: 'الشراكات' })}</span>
                        </div>
                        <p className="text-2xl font-bold">{stats?.partnerships || 0}</p>
                    </div>
                </div>

                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={10} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
