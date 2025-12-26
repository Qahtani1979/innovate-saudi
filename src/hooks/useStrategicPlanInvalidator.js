import { useAppQueryClient } from '@/hooks/useAppQueryClient';

export function useStrategicPlanInvalidator() {
    const queryClient = useAppQueryClient();

    const invalidateStrategicPlans = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['strategic-plans'] }),
            queryClient.invalidateQueries({ queryKey: ['programs-gap'] }),
            queryClient.invalidateQueries({ queryKey: ['active-plan'] }),
        ]);
    };

    return {
        invalidateStrategicPlans
    };
}

