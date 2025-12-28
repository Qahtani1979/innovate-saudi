/**
 * Gamification Mutations Hook
 * Centralizes all write operations for gamification (points, badges, achievements).
 */
import { useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useLanguage } from '@/components/LanguageContext';
import { useAuditLogger, AUDIT_ACTIONS, ENTITY_TYPES } from './useAuditLogger';

export function useGamificationMutations() {
    const queryClient = useAppQueryClient();
    const { notify } = useNotificationSystem();
    const { t } = useLanguage();
    const { logCrudOperation } = useAuditLogger();

    /**
     * Update Citizen Points
     */
    const updatePoints = useMutation({
        /** @param {{ userId: string, points: number, reason: string, source?: string }} params */
        mutationFn: async ({ userId, points, reason, source }) => {
            // 1. Get current points to calculate total (simulated logic for upsert)
            // For atomic updates, an RPC is better, but here we stick to simple upsert or existing pattern
            // Assumes points is the NEW balance or Delta? 
            // Existing useOnboardingMutations implied setting 'points_balance'.
            // Let's assume input is the DELTA (points to add/remove) for a better UX, 
            // but if the table structure is just 'points_balance', we might need to fetch first.
            // Let's use an RPC if available, or fetch-then-update.

            // Checking existing pattern in useOnboardingMutations:
            // upsert({ points_balance: points }) -> implies setting the absolute value.
            // I will implement a safer "Add Points" logic here.

            const { data: current, error: fetchError } = await supabase
                .from('citizen_points')
                .select('points_balance')
                .eq('user_id', userId)
                .maybeSingle();

            if (fetchError) throw fetchError;

            const newBalance = (current?.points_balance || 0) + points;

            const { data, error } = await supabase
                .from('citizen_points')
                .upsert({
                    user_id: userId,
                    points_balance: newBalance,
                    last_updated: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return { data, added: points, reason };
        },
        onSuccess: async ({ data, added, reason }, variables) => {
            queryClient.invalidateQueries({ queryKey: ['citizen-points', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });

            const message = added > 0
                ? t({ en: `You earned ${added} points!`, ar: `لقد كسبت ${added} نقطة!` })
                : t({ en: `Points updated`, ar: `تم تحديث النقاط` });

            notify.success(message, {
                description: reason
            });

            // System Notification for the user
            await notify({
                type: 'points_earned',
                entityType: 'gamification', // generic type
                entityId: variables.userId, // linking to user
                recipientEmails: [/* User email if we had it, but usually userId is enough for internal system */],
                // We need user email to send actual email. 
                // For now, we rely on the internal notification center which uses userId if supported, 
                // or we skip email if email is missing.
                title: 'Points Earned',
                message: `You earned ${added} points for: ${reason}`,
                sendEmail: false // Usually points don't trigger emails to avoid spam
            });

            await logCrudOperation(AUDIT_ACTIONS.UPDATE, 'citizen_points', variables.userId, null, { points_added: added, reason });
        },
        onError: (error) => {
            notify.error(t({ en: 'Failed to update points', ar: 'فشل تحديث النقاط' }));
            console.error(error);
        }
    });

    /**
     * Award Badge
     */
    const awardBadge = useMutation({
        /** @param {{ userId: string, badgeSlug: string, metadata?: any }} params */
        mutationFn: async ({ userId, badgeSlug, metadata }) => {
            // 1. Fetch badge definition to get details
            const { data: badgeDef, error: defError } = await supabase
                .from('badges') // Assuming 'badges' table exists, or we use hardcoded logic if not.
                .select('*')
                .eq('slug', badgeSlug)
                .maybeSingle();

            // If no badges table, we proceed with raw insert into user_achievements if that's the design.
            // useGamification.js uses 'user_achievements'.

            const { data, error } = await supabase
                .from('user_achievements')
                .insert({
                    user_id: userId,
                    achievement_id: badgeDef?.id || badgeSlug, // Use slug if ID not found
                    achievement_category: badgeDef?.category || 'general',
                    earned_date: new Date().toISOString(),
                    metadata
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: async (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['user-achievements', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['citizen-badges', variables.userId] });

            notify.success(t({ en: 'Badge Earned!', ar: 'لقد حصلت على شارة!' }), {
                description: variables.badgeSlug
            });

            await notify({
                type: 'badge_earned',
                entityType: 'achievement',
                entityId: data.id,
                title: 'New Badge Earned',
                message: `You have earned the "${variables.badgeSlug}" badge!`,
                sendEmail: true // Badges are worth an email
            });

            await logCrudOperation(AUDIT_ACTIONS.CREATE, 'user_achievement', data.id, null, { badge: variables.badgeSlug });
        },
        onError: (error) => {
            notify.error(t({ en: 'Failed to award badge', ar: 'فشل منح الشارة' }));
        }
    });

    return {
        updatePoints,
        awardBadge
    };
}

