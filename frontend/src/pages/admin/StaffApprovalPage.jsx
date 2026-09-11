import React, { useState, useEffect } from "react"
import { AdminLayout } from "../../components/AdminLayout"
import { PageHeader } from "../../components/PageHeader"
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription } from "../../components/ui/Empty"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Skeleton } from "../../components/ui/Skeleton"
import { api } from "../../lib/api"
import { toast } from "sonner"
import { 
  UserCheck, 
  MapPin, 
  Mail, 
  Phone, 
  CheckCircle2, 
  RefreshCw 
} from "lucide-react"

export function StaffApprovalPage() {
  const [pendingStaff, setPendingStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [approvingId, setApprovingId] = useState(null)

  useEffect(() => {
    loadPendingStaff()
  }, [])

  const loadPendingStaff = async () => {
    try {
      setLoading(true)
      const res = await api.getPendingStaff()
      if (res && res.success) {
        setPendingStaff(res.data || [])
      }
    } catch (err) {
      toast.error("Failed to load staff requests: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id, fullName) => {
    setApprovingId(id)
    try {
      const res = await api.approveStaff(id)
      if (res && res.success) {
        toast.success(`Approved staff account for ${fullName}!`)
        setPendingStaff((prev) => prev.filter((u) => u.id !== id))
      } else {
        toast.error(res?.message || "Failed to approve staff.")
      }
    } catch (err) {
      toast.error(err.message || "Failed to approve staff.")
    } finally {
      setApprovingId(null)
    }
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Delivery Personnel Authorization"
        description="Verify and grant operational hub dispatch clearance to newly registered delivery staff."
        badge={`${pendingStaff.length} Pending Authorization`}
        actions={
          <Button variant="outline" size="sm" onClick={loadPendingStaff} className="gap-2 border-[#E3DACC] bg-white text-[#4A4744] hover:text-[#181716] hover:bg-[#F0EEE6]">
            <RefreshCw className="h-4 w-4 text-[#7D7972]" />
            <span>Refresh Roster</span>
          </Button>
        }
      />

      <Card className="border-[#E3DACC] bg-white shadow-xs">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : pendingStaff.length === 0 ? (
            <div className="p-8">
              <Empty>
                <EmptyIcon icon={UserCheck} />
                <EmptyTitle>All staff applications authorized</EmptyTitle>
                <EmptyDescription>
                  There are no delivery agent registrations currently pending security clearance.
                </EmptyDescription>
              </Empty>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#E3DACC]">
                  <TableHead>Candidate</TableHead>
                  <TableHead>Official Email</TableHead>
                  <TableHead>Contact Phone</TableHead>
                  <TableHead>Requested Hub Zone</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingStaff.map((staff) => (
                  <TableRow key={staff.id} className="border-b border-[#E3DACC] hover:bg-[#FAF9F5]">
                    <TableCell className="font-bold text-[#181716]">
                      {staff.fullName}
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-[#4A4744]">{staff.email}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-[#4A4744]">{staff.phone}</span>
                    </TableCell>

                    <TableCell>
                      <Badge variant="default" className="border-[#E3DACC] bg-[#F0EEE6] text-[#181716] gap-1 font-medium">
                        <MapPin className="h-3 w-3 text-[#7D7972]" />
                        <span>{staff.assignedZone || "General Hub"}</span>
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant="warning">
                        Pending Clearance
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="emerald"
                        size="sm"
                        onClick={() => handleApprove(staff.id, staff.fullName)}
                        loading={approvingId === staff.id}
                        className="gap-1.5 font-semibold text-xs shadow-xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Authorize Access</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
