import { useQueryClient } from '@tanstack/react-query';

export function useStrategicPlanInvalidator() {
    const queryClient = useQueryClient();

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
