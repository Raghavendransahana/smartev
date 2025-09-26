import React, { useMemo, useState } from 'react'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

export interface Column<T> {
  key: keyof T
  header: string
  sortable?: boolean
  searchable?: boolean
  render?: (value: unknown, item: T) => React.ReactNode
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  sortable?: boolean
  selectable?: boolean
  pagination?: boolean
  pageSize?: number
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
  onSelectionChange?: (selected: T[]) => void
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchable = true,
  sortable = true,
  selectable = false,
  pagination = true,
  pageSize = 10,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  onSelectionChange,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set())

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data

    return data.filter(item =>
      columns.some(column => {
        if (!column.searchable) return false
        const value = item[column.key]
        return String(value).toLowerCase().includes(searchTerm.toLowerCase())
      })
    )
  }, [data, searchTerm, columns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortable) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.localeCompare(bValue)
        return sortDirection === 'asc' ? result : -result
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const result = aValue - bValue
        return sortDirection === 'asc' ? result : -result
      }

      return 0
    })
  }, [filteredData, sortColumn, sortDirection, sortable])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  // Handle sorting
  const handleSort = (columnKey: keyof T) => {
    if (!sortable) return

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedData.map(item => item.id))
      setSelectedItems(allIds)
      onSelectionChange?.(paginatedData)
    } else {
      setSelectedItems(new Set())
      onSelectionChange?.([])
    }
  }

  const handleSelectItem = (item: T, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(item.id)
    } else {
      newSelected.delete(item.id)
    }
    setSelectedItems(newSelected)
    onSelectionChange?.(data.filter(d => newSelected.has(d.id)))
  }

  const isAllSelected = paginatedData.length > 0 && paginatedData.every(item => selectedItems.has(item.id))
  const isPartiallySelected = paginatedData.some(item => selectedItems.has(item.id)) && !isAllSelected

  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" />
            <p className="mt-4 text-sm text-neutral-500">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Search and filters */}
      {searchable && (
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          {selectedItems.size > 0 && (
            <Badge variant="default">
              {selectedItems.size} selected
            </Badge>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                {selectable && (
                  <th className="w-12 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isPartiallySelected
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider',
                      column.sortable && sortable && 'cursor-pointer hover:bg-neutral-100',
                      column.width
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{column.header}</span>
                      {column.sortable && sortable && (
                        <div className="flex flex-col">
                          <ChevronUpIcon
                            className={cn(
                              'h-3 w-3',
                              sortColumn === column.key && sortDirection === 'asc'
                                ? 'text-primary-600'
                                : 'text-neutral-400'
                            )}
                          />
                          <ChevronDownIcon
                            className={cn(
                              'h-3 w-3 -mt-1',
                              sortColumn === column.key && sortDirection === 'desc'
                                ? 'text-primary-600'
                                : 'text-neutral-400'
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-8 text-center text-neutral-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      'hover:bg-neutral-50 transition-colors',
                      onRowClick && 'cursor-pointer',
                      selectedItems.has(item.id) && 'bg-primary-50'
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleSelectItem(item, e.target.checked)
                          }}
                          className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => {
                      const value = item[column.key]
                      return (
                        <td key={String(column.key)} className="px-4 py-3 text-sm">
                          {column.render ? column.render(value, item) : String(value)}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-sm text-neutral-700">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}