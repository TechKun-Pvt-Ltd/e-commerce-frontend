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

interface Product {
  productId: number;
  productTitle: string;
  views: number;
  purchases: number;
  conversionRate: number;
  returnRate: number;
  unitsSold: number;
  revenue: number;
}

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const getConversionBadge = (rate: number) => {
    if (rate >= 15) return <Badge variant="default">Excellent</Badge>;
    if (rate >= 10) return <Badge variant="secondary">Good</Badge>;
    if (rate >= 5) return <Badge variant="outline">Average</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Purchases</TableHead>
              <TableHead className="text-right">Conversion</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.productId}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-medium">{product.productTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.unitsSold} units sold
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {product.views.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {product.purchases.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span>{product.conversionRate.toFixed(1)}%</span>
                    {getConversionBadge(product.conversionRate)}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${product.revenue.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}