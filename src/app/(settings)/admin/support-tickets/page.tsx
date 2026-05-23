"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Spinner from "@/components/ui/spinner";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, HeadphonesIcon, RefreshCw } from "lucide-react";
import * as supportTicketService from "@/services/supportTicket";
import { SupportTicketDetails } from "@/types/domains/support_ticket";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
type Status = typeof STATUSES[number];

const STATUS_STYLES: Record<Status, string> = {
  OPEN:        "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  RESOLVED:    "bg-green-50 text-green-700 border-green-200",
  CLOSED:      "bg-gray-100 text-gray-500 border-gray-200",
};

const NEXT_STATUS: Record<Status, Status | null> = {
  OPEN:        "IN_PROGRESS",
  IN_PROGRESS: "RESOLVED",
  RESOLVED:    "CLOSED",
  CLOSED:      null,
};

const NEXT_LABEL: Record<Status, string> = {
  OPEN:        "Mark In Progress",
  IN_PROGRESS: "Mark Resolved",
  RESOLVED:    "Close Ticket",
  CLOSED:      "",
};

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicketDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterName, setFilterName] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const queryOptions = {
        status: filterStatus !== "ALL" ? filterStatus : undefined,
        customerName: filterName.trim() || undefined,
      } as Parameters<typeof supportTicketService.getAllSupportTickets>[1];
      const res = await supportTicketService.getAllSupportTickets(undefined, queryOptions);
      if (!res.success) { toast.error(res.error); return; }
      setTickets(res.data ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAdvance = async (ticket: SupportTicketDetails) => {
    const next = NEXT_STATUS[ticket.status as Status];
    if (!next) return;
    setUpdatingId(ticket.ticketId);
    try {
      const res = await supportTicketService.updateSupportTicket(ticket.ticketId, next);
      if (!res.success) { toast.error(res.error); return; }
      toast.success(`Ticket marked as ${next.replace("_", " ").toLowerCase()}`);
      setTickets((prev) =>
        prev.map((t) => t.ticketId === ticket.ticketId ? { ...t, status: next } : t)
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const displayedTickets = tickets.filter((t) => {
    if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
    if (filterName && !t.customer?.customerName?.toLowerCase().includes(filterName.toLowerCase())) return false;
    return true;
  });

  const countByStatus = (s: string) => tickets.filter((t) => t.status === s).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-white border flex items-center justify-center shrink-0">
            <HeadphonesIcon className="size-4 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Support Tickets</h1>
            <p className="text-xs text-muted-foreground">View and resolve customer support requests</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={load} disabled={isLoading}>
          {isLoading ? <Spinner className="size-3.5" /> : <RefreshCw className="size-3.5" />}
          Refresh
        </Button>
      </div>

      {/* Status summary chips */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? "ALL" : s)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filterStatus === s ? STATUS_STYLES[s] + " ring-1 ring-offset-1 ring-current" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            {s.replace("_", " ")}
            <span className="font-mono">{countByStatus(s)}</span>
          </button>
        ))}
        {filterStatus !== "ALL" && (
          <button
            onClick={() => setFilterStatus("ALL")}
            className="text-xs text-muted-foreground hover:text-gray-700 px-2"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Search by customer name…"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="max-w-xs h-9 text-sm"
        />
      </div>

      {/* Loading */}
      {isLoading && tickets.length === 0 && (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
          <Spinner className="size-4" /> Loading tickets…
        </div>
      )}

      {/* Empty */}
      {!isLoading && displayedTickets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-2 rounded-xl border border-dashed">
          <HeadphonesIcon className="size-8 opacity-20" />
          No tickets found
        </div>
      )}

      {/* Ticket list */}
      {displayedTickets.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{displayedTickets.length} ticket{displayedTickets.length !== 1 ? "s" : ""}</p>
          {displayedTickets.map((t) => {
            const status = t.status as Status;
            const isExpanded = expandedIds.has(t.ticketId);
            const nextStatus = NEXT_STATUS[status];

            return (
              <div key={t.ticketId} className="rounded-xl border bg-white overflow-hidden">
                {/* Main row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* ID */}
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0 w-8">#{t.ticketId}</span>

                  {/* Subject + customer */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{t.subject}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.customer?.customerName ?? "Unknown customer"}</p>
                  </div>

                  {/* Status badge */}
                  <Badge className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[status] ?? ""}`}>
                    {status.replace("_", " ")}
                  </Badge>

                  {/* Advance button */}
                  {nextStatus && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs shrink-0 hidden sm:flex"
                      disabled={updatingId === t.ticketId}
                      onClick={() => void handleAdvance(t)}
                    >
                      {updatingId === t.ticketId ? <Spinner className="size-3" /> : NEXT_LABEL[status]}
                    </Button>
                  )}
                  {status === "CLOSED" && (
                    <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">Closed</span>
                  )}

                  {/* Expand toggle */}
                  <button
                    onClick={() => toggleExpand(t.ticketId)}
                    className="shrink-0 text-gray-400 hover:text-gray-700 p-1"
                  >
                    {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>
                </div>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="border-t bg-gray-50 px-4 py-3 space-y-3">
                    <p className="text-sm text-gray-700 leading-relaxed">{t.description}</p>
                    {/* Mobile advance button */}
                    {nextStatus && (
                      <div className="sm:hidden">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          disabled={updatingId === t.ticketId}
                          onClick={() => void handleAdvance(t)}
                        >
                          {updatingId === t.ticketId ? <Spinner className="size-3" /> : NEXT_LABEL[status]}
                        </Button>
                      </div>
                    )}

                    {/* Manual status override */}
                    <div className="flex items-center gap-2 pt-1 border-t">
                      <span className="text-xs text-muted-foreground">Set status:</span>
                      <Select
                        value={status}
                        onValueChange={async (val) => {
                          if (val === status) return;
                          setUpdatingId(t.ticketId);
                          try {
                            const res = await supportTicketService.updateSupportTicket(t.ticketId, val);
                            if (!res.success) { toast.error(res.error); return; }
                            toast.success("Status updated");
                            setTickets((prev) =>
                              prev.map((x) => x.ticketId === t.ticketId ? { ...x, status: val } : x)
                            );
                          } finally {
                            setUpdatingId(null);
                          }
                        }}
                      >
                        <SelectTrigger className="h-7 w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {s.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {updatingId === t.ticketId && <Spinner className="size-3.5" />}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
