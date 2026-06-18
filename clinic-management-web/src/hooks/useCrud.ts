import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { toast } from 'sonner'

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

export function useCrud<T extends { id: string }>(resource: string, page = 1, pageSize = 10) {
  const queryClient = useQueryClient()
  const key = [resource, page, pageSize]

  const listQuery = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get<PagedResult<T>>(`/${resource}`, { params: { page, pageSize } })
      return data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<T>) => {
      const { data } = await api.post<T>(`/${resource}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] })
      toast.success('Created successfully')
    },
    onError: () => toast.error('Create failed'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<T> }) => {
      const { data } = await api.put<T>(`/${resource}/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] })
      toast.success('Updated successfully')
    },
    onError: () => toast.error('Update failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/${resource}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] })
      toast.success('Deleted successfully')
    },
    onError: () => toast.error('Delete failed'),
  })

  return { listQuery, createMutation, updateMutation, deleteMutation }
}
