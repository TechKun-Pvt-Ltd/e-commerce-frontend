import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DiscountsTableProps {
  discounts: {
    discountCode: string;
    timesUsed: number;
    revenueInfluenced: number;
    averageOrderValue: number;
  }[];
}

export function DiscountsTable({ discounts }: DiscountsTableProps) {
  const getUsageBadgeVariant = (timesUsed: number) => {
    if (timesUsed >= 200) return "default";
    if (timesUsed >= 100) return "secondary";
    return "outline";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discount Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Discount Code</TableHead>
              <TableHead>Times Used</TableHead>
              <TableHead>Revenue Influenced</TableHead>
              <TableHead>Avg Order Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.map((discount) => (
              <TableRow key={discount.discountCode}>
                <TableCell className="font-medium">
                  <Badge variant="outline">{discount.discountCode}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getUsageBadgeVariant(discount.timesUsed)}>
                    {discount.timesUsed}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  ${discount.revenueInfluenced.toLocaleString()}
                </TableCell>
                <TableCell>
                  ${discount.averageOrderValue.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}