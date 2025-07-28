import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SupportTicketDetails } from "@/types/domains/support_ticket";
import {
  Clock,
  Eye,
  MoreHorizontal,
  User,
  Mail,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Calendar,
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

interface TicketCardProps {
  ticket: SupportTicketDetails;
  onViewTicket?: (ticketId: number) => void;
  onUpdateStatus?: (ticketId: number, status: string) => void;
}

/* === Local Utility Functions === */

const getInitials = (name: string) =>
  name ? name.split(" ").map((n) => n[0]).join("").toUpperCase() : "U";

const getTimeAgo = (date: Date | string) => {
  const now = new Date();
  const ticketDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - ticketDate.getTime()) / (1000 * 60));

  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  return `${Math.floor(diffInMinutes / 1440)} days ago`;
};

const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

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

const getStatusVariant = (status: string) =>
  ["open", "in-progress", "resolved", "closed"].includes(status) ? status : "default";

const getCardBorderColor = (status: string) => {
  switch (status) {
    case "open":
      return "border-l-red-500";
    case "in-progress":
      return "border-l-amber-500";
    case "resolved":
      return "border-l-green-500";
    case "closed":
      return "border-l-gray-400";
    default:
      return "border-l-gray-300";
  }
};

/* === Component === */

export const TicketCard = ({ ticket, onViewTicket, onUpdateStatus }: TicketCardProps) => {
  return (
    <Card
      className={`transition-all duration-300 hover:shadow-lg border border-border/40 hover:border-primary/30 bg-card/50 backdrop-blur-sm ${getCardBorderColor(ticket.status)} border-l-4`}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {ticket.customer ? getInitials(ticket.customer.customerName || "") : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-semibold text-card-foreground truncate">
                {ticket.customer?.customerName || "Unknown Customer"}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {ticket.createdAt ? getTimeAgo(ticket.createdAt) : "No date"}
              </p>
            </div>
          </div>

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
                getAvailableStatusTransitions(ticket.status).map(({ status, label, icon: Icon }) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onUpdateStatus?.(ticket.ticketId, status)}
                    className="cursor-pointer"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Ticket ID and Subject */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-xs font-mono text-muted-foreground cursor-help">
                    #{ticket.ticketId || "N/A"}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ticket ID: {ticket.ticketId || "Not assigned"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Badge
              variant={getStatusVariant(ticket.status) as any}
              className="text-xs capitalize flex items-center gap-1"
            >
              {getStatusIcon(ticket.status)}
              {ticket.status.replace("-", " ")}
            </Badge>
          </div>
          <h4 className="font-medium text-card-foreground line-clamp-2">
            {ticket.subject || "No Subject"}
          </h4>
        </div>

        {/* Description */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3 cursor-help">
                {ticket.description || "No description available"}
              </p>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{ticket.description || "No description available"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Customer Info */}
        {ticket.customer && (
          <div className="space-y-2 pt-3 border-t border-border/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate">{ticket.customer.customerName}</span>
            </div>
            {ticket.customer.email && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{ticket.customer.email}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{ticket.createdAt }</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewTicket?.(ticket.ticketId || 0)}
            className="text-xs h-7"
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
