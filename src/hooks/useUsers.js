import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import usersClient from '../api/usersClient';

export const usePendingUsersQuery = () =>
    useQuery({
        queryKey: ['users', 'pending'],
        queryFn: async () => {
            const res = await usersClient.getPending();
            return res.data;
        },
        keepPreviousData: true,
    });

export const useApproveUserMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (userId) => usersClient.approve(userId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['users', 'pending'] });
        },
    });
};

export const useRejectUserMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (userId) => usersClient.reject(userId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['users', 'pending'] });
        },
    });
};

