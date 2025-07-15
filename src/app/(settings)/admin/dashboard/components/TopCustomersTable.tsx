import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Customer {
  userId: number;
  fullName: string;
  totalSpent: number;
  orderedItems: number;
  phoneNo: string;
  email: string;
}

interface TopCustomersTableProps {
  customers: Customer[];
}

export function TopCustomersTable({ customers }: TopCustomersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.userId}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-medium">{customer.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {customer.phoneNo}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {customer.email}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {customer.orderedItems}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${customer.totalSpent.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}