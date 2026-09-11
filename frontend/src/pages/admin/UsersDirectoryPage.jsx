import React, { useState, useEffect, useMemo } from "react"
import { AdminLayout } from "../../components/AdminLayout"
import { PageHeader } from "../../components/PageHeader"
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription } from "../../components/ui/Empty"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "../../components/ui/InputGroup"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "../../components/ui/Pagination"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/Tabs"
import { Badge } from "../../components/ui/Badge"
import { Skeleton } from "../../components/ui/Skeleton"
import { 
  Dialog, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "../../components/ui/Dialog"
import { api } from "../../lib/api"
import { toast } from "sonner"
import { 
  Users, 
  Truck, 
  Search, 
  MapPin, 
  ShieldCheck, 
  Power, 
  RefreshCw,
  X 
} from "lucide-react"

export function UsersDirectoryPage() {
  const [data, setData] = useState({ customers: [], employees: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("customers")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const pageSize = 8

  // Toggle modal state
  const [selectedUser, setSelectedUser] = useState(null)
  const [toggleModalOpen, setToggleModalOpen] = useState(false)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await api.getUsersDirectory()
      if (res && res.success) {
        setData(res.data || { customers: [], employees: [] })
      }
    } catch (err) {
      toast.error("Failed to load user directory: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenToggle = (u) => {
    setSelectedUser(u)
    setToggleModalOpen(true)
  }

  const handleConfirmToggle = async () => {
    if (!selectedUser) return
    setToggling(true)

    try {
      const res = await api.toggleUserStatus(selectedUser.id)
      if (res && res.success) {
        toast.success(`Updated status for ${selectedUser.fullName}!`)
        setToggleModalOpen(false)
        loadUsers()
      } else {
        toast.error(res?.message || "Failed to update user status.")
      }
    } catch (err) {
      toast.error(err.message || "Failed to update user status.")
    } finally {
      setToggling(false)
    }
  }

  const currentList = activeTab === "customers" ? data.customers : data.employees

  const filteredUsers = useMemo(() => {
    return currentList.filter((u) => {
      const term = searchTerm.toLowerCase()
      return (
        !searchTerm ||
        u.fullName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phone?.toLowerCase().includes(term) ||
        u.assignedZone?.toLowerCase().includes(term)
      )
    })
  }, [currentList, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  return (
    <AdminLayout>
      <PageHeader
        title="Enterprise Accounts Directory"
        description="Monitor registered senders and authorized delivery personnel with role management and status toggling."
        badge="Directory Service"
        actions={
          <Button variant="outline" size="sm" onClick={loadUsers} className="gap-2 border-[#E3DACC] bg-white text-[#4A4744] hover:text-[#181716] hover:bg-[#F0EEE6]">
            <RefreshCw className="h-4 w-4 text-[#7D7972]" />
            <span>Sync Accounts</span>
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setCurrentPage(1); }}>
          <TabsList className="bg-[#F0EEE6] border border-[#E3DACC]">
            <TabsTrigger value="customers" className="gap-2">
              <Users className="h-4 w-4" />
              <span>Customers ({data.customers.length})</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="gap-2">
              <Truck className="h-4 w-4" />
              <span>Delivery Fleet ({data.employees.length})</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* InputGroup Search */}
        <div className="w-full sm:w-80">
          <InputGroup>
            <InputGroupAddon>
              <Search className="h-4 w-4 text-[#7D7972]" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by name, email, zone..."
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

      <Card className="border-[#E3DACC] bg-white shadow-xs">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="p-8">
              <Empty>
                <EmptyIcon icon={Users} />
                <EmptyTitle>No accounts matched your search</EmptyTitle>
                <EmptyDescription>
                  Try refining your query or switching between the Customers and Delivery Fleet tabs.
                </EmptyDescription>
              </Empty>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#E3DACC]">
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    {activeTab === "employees" && <TableHead>Operational Hub</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((u) => (
                    <TableRow key={u.id} className="border-b border-[#E3DACC] hover:bg-[#FAF9F5]">
                      <TableCell className="font-bold text-[#181716]">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-[#E8E6DC] border border-[#E3DACC] flex items-center justify-center font-bold text-[#181716] text-xs shrink-0">
                            {u.fullName?.charAt(0) || "U"}
                          </div>
                          <span>{u.fullName}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs text-[#4A4744] font-mono-code">{u.email}</span>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs text-[#4A4744]">{u.phone}</span>
                      </TableCell>

                      {activeTab === "employees" && (
                        <TableCell>
                          <Badge variant="default" className="border-[#E3DACC] bg-[#F0EEE6] text-[#181716] gap-1 font-medium">
                            <MapPin className="h-3 w-3 text-[#7D7972]" />
                            <span>{u.assignedZone || "General Hub"}</span>
                          </Badge>
                        </TableCell>
                      )}

                      <TableCell>
                        {u.active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Suspended</Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant={u.active ? "outline" : "emerald"}
                          size="sm"
                          onClick={() => handleOpenToggle(u)}
                          className={`text-xs gap-1.5 ${u.active ? "border-rose-200 text-rose-700 hover:bg-rose-50" : ""}`}
                        >
                          <Power className="h-3.5 w-3.5" />
                          <span>{u.active ? "Suspend" : "Activate"}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Shadcn Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#E3DACC] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#7D7972]">
                Showing <span className="font-bold text-[#181716]">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                <span className="font-bold text-[#181716]">{Math.min(currentPage * pageSize, filteredUsers.length)}</span> of{" "}
                <span className="font-bold text-[#181716]">{filteredUsers.length}</span> accounts
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

      {/* Confirmation Dialog */}
      <Dialog open={toggleModalOpen} onOpenChange={setToggleModalOpen}>
        <DialogHeader>
          <DialogTitle>
            {selectedUser?.active ? "Suspend User Account?" : "Reactivate User Account?"}
          </DialogTitle>
          <DialogDescription>
            {selectedUser?.active
              ? `Suspending ${selectedUser?.fullName} will revoke active portal access and prevent dispatch bookings.`
              : `Reactivating ${selectedUser?.fullName} will restore full system privileges and dispatch credentials.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setToggleModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={selectedUser?.active ? "destructive" : "emerald"}
            onClick={handleConfirmToggle}
            loading={toggling}
          >
            {selectedUser?.active ? "Confirm Suspension" : "Confirm Reactivation"}
          </Button>
        </DialogFooter>
      </Dialog>
    </AdminLayout>
  )
}
