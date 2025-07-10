"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Package, MapPin, DollarSign } from "lucide-react";
import { ShippingMethod } from "@/types/domains/shipping_method";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";


interface ShippingTableProps {
  shippingData: ShippingMethod[];
  onEdit?: (shipping: ShippingMethod) => void;
  onDelete?: (shippingMethodId: number) => void;
  onToggleStatus?: (shippingMethodId: number) => void;
}

export default function ShippingTable({
  shippingData,
  onEdit,
  onDelete,
  onToggleStatus
}: ShippingTableProps) {

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null);
  const handleEdit = (shipping: ShippingMethod) => {
    if (onEdit) {
      onEdit(shipping);
    }
  };


  const toggleStatus = (shippingMethodId: number) => {
    if (onToggleStatus) {
      onToggleStatus(shippingMethodId);
    }
  };

  return (
    <div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shippingData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No shipping methods configured</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                shippingData.map((shipping) => (
                  <TableRow key={shipping.shippingMethodId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {shipping.service}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {shipping.country}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {shipping.price.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          className="cursor-pointer"
                          checked={shipping.disabled}
                          onCheckedChange={() => toggleStatus(shipping.shippingMethodId)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(shipping)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              title="Delete shipping method"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>

                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Shipping Method</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete "{shipping.service}"? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>

                            <DialogFooter className="mt-4">
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                onClick={() => onDelete?.(shipping.shippingMethodId)}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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
  )
}
