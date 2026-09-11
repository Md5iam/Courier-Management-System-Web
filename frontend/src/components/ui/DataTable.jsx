import React, { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./Table"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "./InputGroup"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "./Pagination"
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription } from "./Empty"
import { Search, ArrowUpDown, ArrowUp, ArrowDown, X, Layers } from "lucide-react"
import { cn } from "../../lib/utils"

export function DataTable({
  columns,
  data = [],
  searchKey,
  searchPlaceholder = "Search records...",
  pageSize = 10,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search criteria or filters.",
  className,
  filterComponent,
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchKey) return data

    const lower = searchTerm.toLowerCase()
    return data.filter((item) => {
      const val = item[searchKey]
      if (val === null || val === undefined) return false
      return String(val).toLowerCase().includes(lower)
    })
  }, [data, searchTerm, searchKey])

  // Sort
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData

    return [...filteredData].sort((a, b) => {
      const valA = a[sortColumn]
      const valB = b[sortColumn]

      if (valA === valB) return 0
      if (valA === null || valA === undefined) return 1
      if (valB === null || valB === undefined) return -1

      let comp = 0
      if (typeof valA === "number" && typeof valB === "number") {
        comp = valA - valB
      } else {
        comp = String(valA).localeCompare(String(valB))
      }

      return sortDirection === "asc" ? comp : -comp
    })
  }, [filteredData, sortColumn, sortDirection])

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else {
        setSortColumn(null)
        setSortDirection("asc")
      }
    } else {
      setSortColumn(columnKey)
      setSortDirection("asc")
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search & Actions Bar */}
      {(searchKey || filterComponent) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {searchKey && (
            <div className="max-w-md w-full">
              <InputGroup>
                <InputGroupAddon>
                  <Search className="h-4 w-4 text-slate-400" />
                </InputGroupAddon>
                <InputGroupInput
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder={searchPlaceholder}
                />
                {searchTerm && (
                  <InputGroupButton
                    onClick={() => {
                      setSearchTerm("")
                      setCurrentPage(1)
                    }}
                  >
                    <X className="h-3.5 w-3.5 text-slate-400" />
                  </InputGroupButton>
                )}
              </InputGroup>
            </div>
          )}

          {filterComponent && (
            <div className="flex items-center gap-2 shrink-0">
              {filterComponent}
            </div>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-2xl border border-[#E3DACC] bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#E3DACC] bg-[#F0EEE6] hover:bg-transparent">
              {columns.map((col) => {
                const isSortable = col.sortable
                const isSorted = sortColumn === col.accessorKey

                return (
                  <TableHead
                    key={col.accessorKey || col.header}
                    className={cn(
                      "text-[#4A4744] font-bold text-xs uppercase tracking-wider py-3.5",
                      col.headerClassName
                    )}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.accessorKey)}
                        className="flex items-center gap-1.5 hover:text-[#181716] transition-colors focus:outline-none"
                      >
                        <span>{col.header}</span>
                        {isSorted ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5 text-[#C85A17]" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-[#C85A17]" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-[#7D7972] opacity-60" />
                        )}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <Empty className="py-12 border-none">
                    <EmptyIcon icon={Layers} />
                    <EmptyTitle>{emptyTitle}</EmptyTitle>
                    <EmptyDescription>{emptyDescription}</EmptyDescription>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, idx) => (
                <TableRow
                  key={row.id || idx}
                  className="border-b border-[#E3DACC] hover:bg-[#FAF9F5] transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.accessorKey || col.header}
                      className={cn("py-3.5 text-xs text-[#181716]", col.cellClassName)}
                    >
                      {col.cell ? col.cell(row) : row[col.accessorKey]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
          <p className="text-xs text-[#7D7972]">
            Showing <span className="font-bold text-[#181716]">{(currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-bold text-[#181716]">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{" "}
            of <span className="font-bold text-[#181716]">{sortedData.length}</span> results
          </p>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, i, arr) => {
                  const prev = arr[i - 1]
                  return (
                    <React.Fragment key={p}>
                      {prev && p - prev > 1 && (
                        <PaginationItem>
                          <span className="px-2 text-slate-600">...</span>
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          isActive={p === currentPage}
                          onClick={() => setCurrentPage(p)}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    </React.Fragment>
                  )
                })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
