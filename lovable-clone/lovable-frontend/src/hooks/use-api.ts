import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import type { Dashboard, Message, Project } from '@/types/api'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiRequest<Dashboard>('/api/dashboard'),
  })
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiRequest<Project[]>('/api/projects'),
  })
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => apiRequest<Project>(`/api/projects/${projectId}`),
    enabled: Boolean(projectId),
  })
}

export function useMessages(projectId: string) {
  return useQuery({
    queryKey: ['messages', projectId],
    queryFn: () => apiRequest<Message[]>(`/api/projects/${projectId}/messages`),
    enabled: Boolean(projectId),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) =>
      apiRequest<Project>('/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) =>
      apiRequest<void>(`/api/projects/${projectId}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useCreateFragment(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      messageId,
      sandboxUrl,
      title,
      files,
    }: {
      messageId: string
      sandboxUrl: string
      title: string
      files: Record<string, string>
    }) =>
      apiRequest(`/api/projects/${projectId}/messages/${messageId}/fragment`, {
        method: 'POST',
        body: JSON.stringify({ sandboxUrl, title, files }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['messages', projectId] })
    },
  })
}
