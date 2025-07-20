import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, CreditCard } from "lucide-react";
import { PaymentMethod } from "@/types/domains/payment_method";

interface PaymentTableProps {
  paymentData: PaymentMethod[];
  onEdit?: (payment: PaymentMethod) => void;
  onDelete?: (paymentMethodId: number) => void;
  onToggleStatus?: (paymentMethodId: number) => void;
}

export function PaymentTable({
  paymentData,
  onEdit,
  onDelete,
  onToggleStatus
}: PaymentTableProps) {

  const handleEdit = (payment: PaymentMethod) => {
    if (onEdit) {
      onEdit(payment);
    }
  };

  const toggleStatus = (paymentMethodId: number) => {
    if (onToggleStatus) {
      onToggleStatus(paymentMethodId);
    }
  };

  const getPaymentIcon = (paymentType: string) => {
    switch (paymentType.toLowerCase()) {
      case 'credit card':
      case 'debit card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment Type</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No payment methods configured</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paymentData.map((payment) => (
                  <TableRow key={payment.paymentMethodId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getPaymentIcon(payment.paymentType)}
                        {payment.paymentType}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          className="cursor-pointer"
                          checked={!payment.disabled}
                          onCheckedChange={() => toggleStatus(payment.paymentMethodId)}
                        />
                        <Badge variant={payment.disabled ? "secondary" : "default"}>
                          {payment.disabled ? "Disabled" : "Active"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(payment)}
                          title="Edit payment method"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => onDelete?.(payment.paymentMethodId)}
                          title="Delete payment method"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}