import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/LanguageContext';
import { Loader2, Beaker } from 'lucide-react';

export default function CitizenLivingLabParticipation() {
    const { t } = useLanguage();

    const { data: labs = [], isLoading } = useQuery({
        queryKey: ['living-labs'],
        queryFn: async () => {
            const { data, error } = await supabase.from('living_labs').select('*');
            if (error) throw error;
            return data;
        }
    });

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">{t({ en: 'Living Labs', ar: 'المختبرات الحية' })}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {labs.map(lab => (
                    <Card key={lab.id} className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Beaker className="h-5 w-5 text-purple-600" />
                                {lab.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-4">
                            <p className="text-slate-600 flex-1">{lab.description}</p>
                            <Button className="w-full mt-auto" variant="outline">View Details</Button>
                        </CardContent>
                    </Card>
                ))}
                {labs.length === 0 && <p className="col-span-full text-center">No Living Labs found.</p>}
            </div>
        </div>
    );
}
