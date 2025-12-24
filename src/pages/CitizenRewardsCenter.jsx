import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/LanguageContext';
import { Loader2, Gift, Award } from 'lucide-react';
import { useRewards } from '@/hooks/useRewards';
import { useCitizenStats } from '@/hooks/useCitizenData';

export default function CitizenRewardsCenter() {
    const { t } = useLanguage();
    const { data: rewards = [], isLoading } = useRewards();
    const { data: stats } = useCitizenStats();

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t({ en: 'Rewards Center', ar: 'مركز المكافآت' })}</h1>
                <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span className="font-bold text-yellow-800">{stats?.points || 0} Points</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : rewards.length === 0 ? (
                    <div className="col-span-full text-center p-8 bg-slate-50 rounded-lg">
                        <Gift className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                        <p>No rewards currently available.</p>
                    </div>
                ) : (
                    rewards.map(reward => (
                        <Card key={reward.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle>{reward.title}</CardTitle>
                                    <Badge variant="secondary">{reward.points_cost} pts</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-slate-600">{reward.description}</p>
                                <Button className="w-full">Redeem</Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
