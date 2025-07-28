import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SupportTicketDetails } from "@/types/domains/support_ticket";
import {
  Eye,
  MoreHorizontal,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* === Local Utility Functions === */

const getInitials = (name: string) =>
  name ? name.split(" ").map((n) => n[0]).join("").toUpperCase() : "U";

const getTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const ticketDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - ticketDate.getTime()) / (1000 * 60));

  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

const formatDate = (date: Date | string): string =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getStatusVariant = (status: string) =>
  ["open", "in-progress", "resolved", "closed"].includes(status) ? status : "default";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "open":
      return <AlertCircle className="h-3 w-3" />;
    case "in-progress":
      return <RefreshCw className="h-3 w-3" />;
    case "resolved":
      return <CheckCircle className="h-3 w-3" />;
    case "closed":
      return <XCircle className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

const getAvailableStatusTransitions = (currentStatus: string) => {
  const transitions = [];
  if (currentStatus !== "in-progress") {
    transitions.push({ status: "in-progress", label: "Mark In Progress", icon: RefreshCw });
  }
  if (currentStatus !== "resolved" && currentStatus !== "closed") {
    transitions.push({ status: "resolved", label: "Mark Resolved", icon: CheckCircle });
  }
  if (currentStatus !== "closed") {
    transitions.push({ status: "closed", label: "Close Ticket", icon: XCircle });
  }
  if (currentStatus === "closed" || currentStatus === "resolved") {
    transitions.push({ status: "open", label: "Reopen Ticket", icon: AlertCircle });
  }
  return transitions;
};

/* === Component === */

interface TicketsTableProps {
  tickets: SupportTicketDetails[];
  onViewTicket?: (ticketId: number) => void;
  onUpdateStatus?: (ticketId: number, status: string) => void;
}

export const TicketsTable = ({
  tickets,
  onViewTicket,
  onUpdateStatus,
}: TicketsTableProps) => {
  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">Ticket ID</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Created</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-8 w-8" />
                  <p>No tickets found</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            tickets.map((ticket) => (
              <TableRow
                key={ticket.ticketId}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-mono font-medium">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="cursor-help">#{ticket.ticketId || "N/A"}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ticket ID: {ticket.ticketId || "Not assigned"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>

                <TableCell className="max-w-xs">
                  <div className="space-y-1">
                    <div className="font-medium truncate">
                      {ticket.subject || "No Subject"}
                    </div>
                    <div className="text-xs text-muted-foreground lg:hidden">
                      {ticket.createdAt ? getTimeAgo(ticket.createdAt) : "No date"}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {ticket.customer ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {getInitials(ticket.customer.customerName || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {ticket.customer.customerName || "Unknown Customer"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {ticket.customer.email || ""}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          ?
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">Unknown Customer</span>
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={getStatusVariant(ticket.status) as any}
                    className="capitalize flex items-center gap-1"
                  >
                    {getStatusIcon(ticket.status)}
                    {ticket.status.replace("-", " ")}
                  </Badge>
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  {ticket.createdAt ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <div>
                        <div>{formatDate(ticket.createdAt)}</div>
                        <div className="text-xs">{getTimeAgo(ticket.createdAt)}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No date</span>
                  )}
                </TableCell>

                <TableCell className="hidden md:table-cell max-w-md">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="truncate text-sm text-muted-foreground cursor-help">
                          {ticket.description || "No description available"}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{ticket.description || "No description available"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => onViewTicket?.(ticket.ticketId || 0)}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>

                      {ticket.ticketId &&
                        getAvailableStatusTransitions(ticket.status).map(
                          ({ status, label, icon: Icon }) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => onUpdateStatus?.(ticket.ticketId, status)}
                              className="cursor-pointer"
                            >
                              <Icon className="h-4 w-4 mr-2" />
                              {label}
                            </DropdownMenuItem>
                          )
                        )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
