"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SupportTicketDetails,
  SupportTicketQueryOptions,
} from "@/types/domains/support_ticket";
import {
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Users,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { TicketFilters } from "./components/TicketsFilters";
import { TicketsTable } from "./components/TicketsTable";
import { TicketCard } from "./components/TicketCards";
import * as supportTicketServices from "@/services/supportTicket";
import useDataFetch from "@/hooks/use-data-fetch";
import { toast } from "sonner";

export default function SupportTicketsPage() {
  const [filteredTickets, setFilteredTickets] = useState<SupportTicketDetails[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [currentFilters, setCurrentFilters] = useState<SupportTicketQueryOptions>({
    status: "all",
    customerName: "",
    fromDate: new Date(),
    toDate: new Date(),
  });

  const supportTicketsData = useDataFetch(supportTicketServices.getAllSupportTickets);
  const updateTicketStatus = useDataFetch(supportTicketServices.updateSupportTicket);

  useEffect(() => {
    supportTicketsData.request();
  }, []);

  useEffect(() => {
    if (supportTicketsData.data) {
      applyFilters(currentFilters);
    }
  }, [supportTicketsData.data]);

  const applyFilters = (filters: SupportTicketQueryOptions) => {
    if (!supportTicketsData.data) return;

    const processedData = supportTicketsData.data.map((ticket, index) => ({
      ...ticket,
      ticketId: ticket.ticketId || Date.now() + index,
    }));

    let filtered = processedData;

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === filters.status);
    }

    if (filters.customerName) {
      filtered = filtered.filter((ticket) =>
        ticket.customer?.customerName
          ?.toLowerCase()
          .includes(filters.customerName!.toLowerCase()) ||
        ticket.customer?.email?.toLowerCase().includes(filters.customerName!.toLowerCase())
      );
    }

    if (filters.fromDate && filtered.length > 0) {
      filtered = filtered.filter((ticket) => {
        if (!ticket.createdAt) return true;
        const ticketDate = new Date(ticket.createdAt);
        return ticketDate >= filters.fromDate!;
      });
    }

    if (filters.toDate && filtered.length > 0) {
      filtered = filtered.filter((ticket) => {
        if (!ticket.createdAt) return true;
        const ticketDate = new Date(ticket.createdAt);
        return ticketDate <= filters.toDate!;
      });
    }

    setFilteredTickets(filtered);
  };

  const handleFiltersChange = (filters: SupportTicketQueryOptions) => {
    setCurrentFilters(filters);
  };

  const handleStatusUpdate = async (ticketId: number, newStatus: string) => {
    updateTicketStatus
      .request(ticketId, newStatus)
      .onSuccess(() => {
        toast.success("Ticket status updated successfully");
        supportTicketsData.request();
      })
      .onError((error) => {
        toast.error("Failed to update ticket status: " + error);
      });
  };

  const handleViewTicket = (ticketId: number) => {
    console.log("Viewing ticket:", ticketId);
  };

  const handleRefresh = () => {
    supportTicketsData.request();
  };

  const statusCounts = useMemo(() => {
    if (!supportTicketsData.data) {
      return {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
      };
    }

    const tickets = supportTicketsData.data;
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      inProgress: tickets.filter((t) => t.status === "in-progress").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
      closed: tickets.filter((t) => t.status === "closed").length,
    };
  }, [supportTicketsData.data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Support Tickets</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={supportTicketsData.isLoading || updateTicketStatus.isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  supportTicketsData.isLoading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total" value={statusCounts.total} icon={<Users />} />
          <StatCard label="Open" value={statusCounts.open} icon={<Clock />} className="text-status-open" />
          <StatCard label="In Progress" value={statusCounts.inProgress} icon={<RefreshCw />} className="text-status-in-progress" />
          <StatCard label="Resolved" value={statusCounts.resolved} icon={<CheckCircle />} className="text-status-resolved" />
          <StatCard label="Closed" value={statusCounts.closed} icon={<XCircle />} className="text-status-closed" />
        </div>

        <TicketFilters onFiltersChange={handleFiltersChange} />

        {(supportTicketsData.isLoading || updateTicketStatus.isLoading) && (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">
                {supportTicketsData.isLoading ? "Loading tickets..." : "Updating ticket..."}
              </p>
            </CardContent>
          </Card>
        )}

        {(supportTicketsData.hasError || updateTicketStatus.hasError) && (
          <Card>
            <CardContent className="p-8 text-center">
              <XCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
              <p className="text-muted-foreground">
                {supportTicketsData.hasError ? "Failed to load tickets" : "Failed to update ticket"}
              </p>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {!supportTicketsData.isLoading && !supportTicketsData.hasError && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Support Tickets
                  <Badge variant="secondary">{filteredTickets.length}</Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "cards" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("cards")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {viewMode === "table" ? (
                <TicketsTable
                  tickets={filteredTickets}
                  onViewTicket={handleViewTicket}
                  onUpdateStatus={handleStatusUpdate}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.ticketId}
                      ticket={ticket}
                      onViewTicket={handleViewTicket}
                      onUpdateStatus={handleStatusUpdate}
                    />
                  ))}
                </div>
              )}

              {filteredTickets.length === 0 && !supportTicketsData.isLoading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tickets found matching your filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, className = "" }: { label: string; value: number; icon: React.ReactNode; className?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold ${className}`}>{value}</p>
          </div>
          <div className={`h-8 w-8 ${className}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
