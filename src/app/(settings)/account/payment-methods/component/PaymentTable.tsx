import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, CreditCard } from "lucide-react";
import { PaymentMethod, PaymentType } from "@/types/domains/payment_method";

interface PaymentTableProps {
   paymentData: PaymentMethod[];
   onEdit?: (payment: PaymentMethod) => void;
   onDelete?: (paymentMethodId: number) => void;
   onSetDefault?: (paymentMethodId: number) => void;
}
const data: PaymentMethod[] = [
   {
      paymentMethodId: 201,
      type: PaymentType.CREDIT_CARD,
      providerToken: "tok_abc123xyz",
      last4: "4242",
      expiryMonth: "10",
      expiryYear: "2026",
      isDefault: true,
      cardHolderName: "Salman Usman Kachchhi",
   },
   {
      paymentMethodId: 202,
      type: PaymentType.CREDIT_CARD,
      providerToken: "tok_def456uvw",
      last4: "2107",
      expiryMonth: "12",
      expiryYear: "2025",
      isDefault: false,
      cardHolderName: "Ayesha Rahman",
   },
   {
      paymentMethodId: 203,
      type: PaymentType.CREDIT_CARD,
      providerToken: "tok_ghi789rst",
      last4: "5689",
      expiryMonth: "08",
      expiryYear: "2027",
      isDefault: false,
      cardHolderName: "Mohammed Ali",
   },
   {
      paymentMethodId: 204,
      type: PaymentType.CREDIT_CARD,
      providerToken: "tok_jkl012mno",
      last4: "3471",
      expiryMonth: "06",
      expiryYear: "2024",
      isDefault: false,
      cardHolderName: "Fatima Noor",
   },
];

export function PaymentTable({ paymentData, onEdit, onDelete, onSetDefault }: PaymentTableProps) {
   const handleEdit = (payment: PaymentMethod) => {
      if (onEdit) {
         onEdit(payment);
      }
   };

   const handleDefaultChange = (paymentMethodId: number) => {
      if (onSetDefault) {
         onSetDefault(paymentMethodId);
      }
   };

   const getPaymentIcon = (paymentType: string) => {
      switch (paymentType.toLowerCase()) {
         case "credit card":
         case "debit card":
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
                        <TableHead></TableHead>
                        <TableHead>Default</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {data.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={3} className="text-center py-8">
                              <div className="flex flex-col items-center gap-2">
                                 <CreditCard className="h-8 w-8 text-muted-foreground" />
                                 <p className="text-muted-foreground">No payment methods configured</p>
                              </div>
                           </TableCell>
                        </TableRow>
                     ) : (
                        data.map((payment) => (
                           <TableRow key={payment.paymentMethodId}>
                              <TableCell className="font-medium">
                                 <div className="flex items-center gap-4">
                                    {getPaymentIcon("credit card")}
                                    <div>
                                       <div>{payment.cardHolderName}</div>
                                       <div className="text-gray-400">
                                          XXXX XXXX XXXX {payment.last4} <span className="mx-1">|</span> {payment.expiryMonth}/
                                          {payment.expiryYear}
                                       </div>
                                    </div>
                                 </div>
                              </TableCell>
                              <TableCell>
                                 <div className="flex items-center gap-2">
                                    <Switch
                                       className="cursor-pointer"
                                       checked={payment.isDefault}
                                       onCheckedChange={() => handleDefaultChange(payment.paymentMethodId)}
                                    />
                                    {payment.isDefault ? (
                                       <Badge variant={"default"}>{payment.isDefault ? "Default" : "Set as default"}</Badge>
                                    ) : null}
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
