import React, { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { AdminLayout } from "../../components/AdminLayout"
import { PageHeader } from "../../components/PageHeader"
import { StatCard } from "../../components/StatCard"
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription } from "../../components/ui/Empty"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "../../components/ui/InputGroup"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "../../components/ui/Pagination"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Skeleton } from "../../components/ui/Skeleton"
import { api } from "../../lib/api"
import { formatCurrency, formatDate } from "../../lib/utils"
import { toast } from "sonner"
import { 
  DollarSign, 
  Coins, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  ExternalLink,
  Search,
  X 
} from "lucide-react"

export function TransactionsPage() {
  const [data, setData] = useState({ transactions: [], totalRevenue: 0, totalCOD: 0, totalVolume: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const pageSize = 8

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const res = await api.getTransactions()
      if (res && res.success) {
        setData(res.data || { transactions: [], totalRevenue: 0, totalCOD: 0, totalVolume: 0 })
      }
    } catch (err) {
      toast.error("Failed to load transactions: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const transactions = data.transactions || []

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesStatus = statusFilter === "ALL" || tx.paymentStatus === statusFilter
      const term = searchTerm.toLowerCase()
      const matchesSearch = 
        !searchTerm ||
        tx.trackingNumber?.toLowerCase().includes(term) ||
        tx.paymentMethod?.toLowerCase().includes(term) ||
        tx.id?.toString().includes(term)
      return matchesStatus && matchesSearch
    })
  }, [transactions, statusFilter, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize))
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredTransactions.slice(start, start + pageSize)
  }, [filteredTransactions, currentPage, pageSize])

  return (
    <AdminLayout>
      <PageHeader
        title="Financial Ledger & Transactions"
        description="Reconcile Cash on Delivery and delivery fee payments across all regional deliveries."
        badge="Audit Ledger"
        actions={
          <Button variant="outline" size="sm" onClick={loadTransactions} className="gap-2 border-[#E3DACC] bg-white text-[#4A4744] hover:text-[#181716] hover:bg-[#F0EEE6]">
            <RefreshCw className="h-4 w-4 text-[#7D7972]" />
            <span>Refresh Ledger</span>
          </Button>
        }
      />

      {/* Top Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {loading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard
              title="Delivery Fee Revenue"
              value={formatCurrency(data.totalRevenue)}
              icon={DollarSign}
              color="violet"
              description="Platform fee collections"
            />
            <StatCard
              title="COD Volume Settled"
              value={formatCurrency(data.totalCOD)}
              icon={Coins}
              color="emerald"
              description="Recipient cash collected"
            />
            <StatCard
              title="Gross Transaction Volume"
              value={formatCurrency(data.totalVolume)}
              icon={CreditCard}
              color="indigo"
              description="Total pipeline throughput"
            />
          </>
        )}
      </div>

      {/* Filter Tabs & InputGroup Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {["ALL", "PAID", "PENDING"].map((filter) => (
            <button
              key={filter}
              onClick={() => { setStatusFilter(filter); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                statusFilter === filter
                  ? "bg-[#181716] border-[#181716] text-[#FAF9F5] shadow-xs"
                  : "bg-white border-[#E3DACC] text-[#4A4744] hover:text-[#181716] hover:bg-[#E8E6DC]"
              }`}
            >
              {filter === "ALL" ? "All Transactions" : filter}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <InputGroup>
            <InputGroupAddon>
              <Search className="h-4 w-4 text-[#7D7972]" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search tracking, method, ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
            {searchTerm && (
              <InputGroupButton onClick={() => { setSearchTerm(""); setCurrentPage(1); }}>
                <X className="h-3.5 w-3.5 text-[#7D7972]" />
              </InputGroupButton>
            )}
          </InputGroup>
        </div>
      </div>

      {/* Transactions Table */}
      <Card className="border-[#E3DACC] bg-white shadow-xs">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : paginatedTransactions.length === 0 ? (
            <div className="p-8">
              <Empty>
                <EmptyIcon icon={CreditCard} />
                <EmptyTitle>No transactions recorded</EmptyTitle>
                <EmptyDescription>
                  Transactions are logged automatically when customer shipments are booked.
                </EmptyDescription>
              </Empty>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#E3DACC]">
                    <TableHead>Tx ID</TableHead>
                    <TableHead>Tracking Code</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Transaction Date</TableHead>
                    <th className="p-4 text-right text-xs font-semibold text-[#4A4744]">View</th>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((tx) => (
                    <TableRow key={tx.id} className="border-b border-[#E3DACC] hover:bg-[#FAF9F5]">
                      <TableCell className="font-mono-code font-bold text-[#7D7972]">
                        TXN-{tx.id.toString().padStart(5, "0")}
                      </TableCell>
                      <TableCell className="font-mono-code font-bold text-[#181716]">
                        {tx.trackingNumber}
                      </TableCell>
                      <TableCell className="font-semibold text-[#181716]">
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-[#E3DACC] bg-[#F0EEE6] text-[#181716]">
                          {tx.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tx.paymentStatus === "PAID" ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Paid</span>
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Pending</span>
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-[#7D7972]">
                        {formatDate(tx.createdAt)}
                      </TableCell>
                      <td className="p-4 text-right">
                        <Link to={`/track?trackingNumber=${tx.trackingNumber}`} target="_blank">
                          <Button variant="ghost" size="icon" title="View Shipment" className="text-[#7D7972] hover:text-[#181716]">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#E3DACC] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#7D7972]">
                Showing <span className="font-bold text-[#181716]">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                <span className="font-bold text-[#181716]">{Math.min(currentPage * pageSize, filteredTransactions.length)}</span> of{" "}
                <span className="font-bold text-[#181716]">{filteredTransactions.length}</span> transactions
              </span>

              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === currentPage}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
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
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
