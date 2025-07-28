import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Filter, Search, X } from "lucide-react";
import { SupportTicketQueryOptions } from "@/types/domains/support_ticket";

interface TicketFiltersProps {
  onFiltersChange: (filters: SupportTicketQueryOptions) => void;
}

export const TicketFilters = ({ onFiltersChange }: TicketFiltersProps) => {
  const [filters, setFilters] = useState<SupportTicketQueryOptions>({
    status: 'all', 
    customerName: '',
    fromDate: new Date(),
    toDate: new Date(),
  });

  const handleFilterChange = (key: keyof SupportTicketQueryOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };



  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
 

  return (
    <Card className="p-6 mb-6 bg-gradient-to-r from-background to-muted/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Filter Tickets</h3>
        </div>
 
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="customerName"
              placeholder="Search customer..."
              value={filters.customerName}
              onChange={(e) => handleFilterChange('customerName', e.target.value)}
              className="pl-10"
            />
            {filters.customerName && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => handleFilterChange('customerName', '')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor="fromDate">From Date</Label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="fromDate"
              type="date"
              value={formatDateForInput(filters.fromDate)}
              onChange={(e) => handleFilterChange('fromDate', new Date(e.target.value))}
              className="pl-10"
            />
          </div>
        </div> */}

        {/* <div className="space-y-2">
          <Label htmlFor="toDate">To Date</Label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="toDate"
              type="date"
              value={formatDateForInput(filters.toDate)}
              onChange={(e) => handleFilterChange('toDate', new Date(e.target.value))}
              className="pl-10"
            />
          </div>
        </div> */}
      </div>
   
     
    </Card>
  );
};