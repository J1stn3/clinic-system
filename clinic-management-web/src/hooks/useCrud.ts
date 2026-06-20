import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

/** Extract a human-readable message from an API error (ProblemDetails or plain text). */
function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{
    title?: string
    detail?: string
    message?: string
    errors?: Record<string, string[]>
  }>
  const data = axiosError?.response?.data
  if (!data) return fallback

  // FluentValidation returns an 'errors' dict — show each field's first error
  if (data.errors && typeof data.errors === 'object') {
    const msgs = Object.entries(data.errors)
      .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs[0] : errs}`)
      .join(' · ')
    if (msgs) return msgs
  }

  return data.detail ?? data.title ?? data.message ?? fallback
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
    onError: (error) => toast.error(getApiErrorMessage(error, 'Create failed')),
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
    onError: (error) => toast.error(getApiErrorMessage(error, 'Update failed')),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/${resource}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] })
      toast.success('Deleted successfully')
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Delete failed')),
  })

  return { listQuery, createMutation, updateMutation, deleteMutation }
}
