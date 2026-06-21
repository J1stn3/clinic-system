import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Table } from 'antd'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useCrud } from '../../hooks/useCrud'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { api } from '../../services/api'
import { Button } from './button'
import { DialogContent, DialogRoot, DialogTitle } from './dialog'
import { Input, Label } from './input'
import { Card, EmptyState, PageShell } from './PageShell'
import { TableSkeleton } from './skeleton'

export type FieldConfig = {
  name: string
  label: string
  type?: 'text' | 'password' | 'number' | 'date' | 'datetime-local' | 'select' | 'checkbox'
  options?: { value: string; label: string }[]
}

type CrudPageProps<T extends { id: string }> = {
  title: string
  description: string
  resource: string
  columns: { title: string; dataIndex: string; render?: (value: unknown, record: T) => React.ReactNode }[]
  /** Fields shown when EDITING a record. */
  fields?: FieldConfig[]
  /** Fields shown when CREATING a new record (defaults to fields if not provided). */
  createFields?: FieldConfig[]
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  extraActions?: React.ReactNode
  headerAction?: React.ReactNode
  metrics?: React.ReactNode
  createLabel?: string
  embedded?: boolean
  anchorId?: string
  hideTable?: boolean
  /** Optional external row filter applied after search (e.g. for tab-based filtering). */
  filterRows?: (items: T[]) => T[]
}

export function CrudPage<T extends { id: string }>({
  title,
  description,
  resource,
  columns,
  fields = [],
  createFields,
  canCreate = false,
  canEdit = false,
  canDelete = false,
  extraActions,
  headerAction,
  metrics,
  createLabel = 'Add New',
  embedded = false,
  anchorId,
  hideTable = false,
  filterRows,
}: CrudPageProps<T>) {
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})

  const { listQuery, createMutation, updateMutation, deleteMutation } = useCrud<T>(resource, page)

  const activeFields = (isCreating: boolean) => isCreating ? (createFields ?? fields) : fields

  const openCreate = () => {
    setEditing(null)
    setForm({})
    setFormOpen(true)
  }

  const openEdit = (record: T) => {
    setEditing(record)
    const initial: Record<string, string> = {}
    fields.forEach((f) => {
      const val = (record as Record<string, unknown>)[f.name]
      if (f.type === 'checkbox') initial[f.name] = val ? 'true' : 'false'
      else initial[f.name] = val != null ? String(val) : ''
    })
    setForm(initial)
    setFormOpen(true)
  }

  const submit = async () => {
    const currentFields = activeFields(!editing)
    const payload: Record<string, unknown> = {}
    currentFields.forEach((f) => {
      const raw = form[f.name]
      if (f.type === 'number') payload[f.name] = Number(raw)
      else if (f.type === 'checkbox') payload[f.name] = raw === 'true'
      else if (raw !== '' && raw != null) payload[f.name] = raw
      // empty strings are omitted — backend treats missing optional fields as null
    })
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, payload: payload as Partial<T> })
    } else {
      await createMutation.mutateAsync(payload as Partial<T>)
    }
    await queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    setFormOpen(false)
  }

  const tableColumns = [
    ...columns,
    ...(canEdit || canDelete
      ? [
          {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: T) => (
              <div className="flex flex-wrap gap-2">
                {canEdit && (
                  <Button size="sm" variant="outline" onClick={() => openEdit(record)}>
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(record.id)}>
                    Delete
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ]

  const items = (listQuery.data?.items ?? []) as T[]
  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    let result = items
    if (term) {
      result = result.filter((record) =>
        columns.some((col) => {
          const value = (record as Record<string, unknown>)[col.dataIndex]
          if (value == null) return false
          return String(value).toLowerCase().includes(term)
        }),
      )
    }
    if (filterRows) result = filterRows(result)
    return result
  }, [items, columns, search, filterRows])

  const primaryAction =
    headerAction ??
    (canCreate && (createFields ?? fields).length > 0 ? (
      <Button variant="accent" onClick={openCreate}>
        + {createLabel}
      </Button>
    ) : null)

  const content = (
    <div id={anchorId}>
      {metrics}
      {!hideTable && (
        <>
      <div className="aicare-toolbar">
        <div className="aicare-search-wrap w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
          />
        </div>
        <div className="aicare-toolbar-actions w-full sm:w-auto">
        <Button variant="outline" onClick={() => listQuery.refetch()} disabled={listQuery.isFetching}>
          {listQuery.isFetching ? 'Refreshing...' : 'Refresh'}
        </Button>
        {!headerAction && canCreate && fields.length > 0 && embedded && (
          <Button variant="accent" onClick={openCreate}>
            + {createLabel}
          </Button>
        )}
        {extraActions}
        </div>
      </div>
      <p className="mb-2 text-xs text-slate-500">
        Showing {filteredItems.length} of {listQuery.data?.totalCount ?? filteredItems.length} records
      </p>
      <Card className="!p-0 overflow-hidden hover:translate-y-0 hover:shadow-card">
        {listQuery.isLoading ? (
          <div className="p-5">
            <TableSkeleton />
          </div>
        ) : listQuery.isError ? (
          <div className="m-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            Failed to load data. Please retry.
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title={search ? 'No matching records' : 'No records yet'}
              description={search ? 'Try a different search term.' : 'Create a new record to get started.'}
            />
          </div>
        ) : (
          <div className="aicare-table-scroll">
          <Table
            className="aicare-table"
            rowKey="id"
            dataSource={filteredItems}
            columns={tableColumns}
            scroll={{ x: 'max-content' }}
            pagination={{
              current: page,
              pageSize: listQuery.data?.pageSize ?? 10,
              total: listQuery.data?.totalCount ?? 0,
              onChange: setPage,
              showSizeChanger: false,
              size: 'small',
              responsive: true,
              simple: isMobile,
            }}
          />
          </div>
        )}
      </Card>
        </>
      )}

      <DialogRoot open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogTitle>
            {editing ? 'Edit' : 'Create'} {title}
          </DialogTitle>
          <div className="mt-4 space-y-3">
            {activeFields(!editing).map((f) => (
              <div key={f.name}>
                <Label>{f.label}</Label>
                {f.type === 'select' ? (
                  <select
                    className="aicare-input"
                    value={form[f.name] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === 'checkbox' ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form[f.name] === 'true'}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.checked ? 'true' : 'false' })}
                    />
                    Yes
                  </label>
                ) : (
                  <Input
                    type={f.type === 'number' ? 'number' : f.type ?? 'text'}
                    value={form[f.name] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="aicare-page-actions mt-4">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>Save</Button>
          </div>
        </DialogContent>
      </DialogRoot>
    </div>
  )

  if (embedded) return content

  return (
    <PageShell
      title={title}
      description={description}
      action={primaryAction ? <div className="aicare-page-actions">{primaryAction}</div> : undefined}
    >
      {content}
    </PageShell>
  )
}

export function useSummary() {
  return useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: async () => {
      const { data } = await api.get('/reports/summary')
      return data
    },
    retry: false,
  })
}
