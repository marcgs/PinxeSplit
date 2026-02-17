import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

// Types for group data
export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
  };
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  createdById: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  members: GroupMember[];
  createdBy: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
  };
  _count?: {
    members: number;
    expenses?: number;
  };
}

interface CreateGroupData {
  name: string;
  description?: string;
  currency?: string;
}

interface UpdateGroupData {
  name?: string;
  description?: string;
  currency?: string;
}

interface AddMemberData {
  email: string;
}

// Query keys
export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  list: () => [...groupKeys.lists()] as const,
  details: () => [...groupKeys.all, 'detail'] as const,
  detail: (id: string) => [...groupKeys.details(), id] as const,
};

/**
 * Hook to fetch all groups for the authenticated user
 */
export function useGroups() {
  return useQuery({
    queryKey: groupKeys.list(),
    queryFn: async () => {
      const data = await apiClient<Group[]>('/api/v1/groups');
      return data;
    },
  });
}

/**
 * Hook to fetch a specific group by ID
 */
export function useGroup(id: string) {
  return useQuery({
    queryKey: groupKeys.detail(id),
    queryFn: async () => {
      const data = await apiClient<Group>(`/api/v1/groups/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new group
 */
export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGroupData) => {
      return await apiClient<Group>('/api/v1/groups', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate and refetch groups list
      queryClient.invalidateQueries({ queryKey: groupKeys.list() });
    },
  });
}

/**
 * Hook to update a group
 */
export function useUpdateGroup(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateGroupData) => {
      return await apiClient<Group>(`/api/v1/groups/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      // Update the cached group data
      queryClient.setQueryData(groupKeys.detail(id), data);
      // Invalidate the list to reflect changes
      queryClient.invalidateQueries({ queryKey: groupKeys.list() });
    },
  });
}

/**
 * Hook to delete a group (soft delete)
 */
export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient(`/api/v1/groups/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      // Invalidate groups list
      queryClient.invalidateQueries({ queryKey: groupKeys.list() });
    },
  });
}

/**
 * Hook to add a member to a group
 */
export function useAddMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddMemberData) => {
      return await apiClient<Group>(`/api/v1/groups/${groupId}/members`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      // Update the cached group data
      queryClient.setQueryData(groupKeys.detail(groupId), data);
      // Invalidate the list to reflect member count changes
      queryClient.invalidateQueries({ queryKey: groupKeys.list() });
    },
  });
}

/**
 * Hook to remove a member from a group
 */
export function useRemoveMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await apiClient(`/api/v1/groups/${groupId}/members/${userId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      // Invalidate the group detail to refetch members
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      // Invalidate the list to reflect member count changes
      queryClient.invalidateQueries({ queryKey: groupKeys.list() });
    },
  });
}
