"use client";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";

const shippingFormSchema = z.object({
  shippingMethodId: z.number().optional(),
  service: z.string().nonempty("Service name is required."),
  country: z.string().nonempty("Country is required."),
  price: z.number().gt(0, "Price must be greater than 0."),
  disabled: z.boolean().optional(),
});

type ShippingFormData = z.infer<typeof shippingFormSchema>;

export function ShippingForm({
  mode = "create",
  loading,
  onSubmit,
  serviceData,
  showTrigger = true,
  useDialogContent = true,
}: {
  mode: "create" | "edit";
  loading: boolean;
  onSubmit: (data: ShippingFormData) => void;
  serviceData?: ShippingFormData;
  showTrigger?: boolean;
  useDialogContent?: boolean;
}) {
  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      service: "",
      country: "",
      price: 0,
      disabled: false,
    },
  });


  useEffect(() => {
    if (serviceData) {
      form.reset({
        service: serviceData.service || "",
        country: serviceData.country || "",
        price: serviceData.price || 0,
        disabled: serviceData.disabled || false,
      });
    } else {
      form.reset({
        service: "",
        country: "",
        price: 0,
        disabled: false,
      });
    }
  }, [serviceData, form]);

  const handleFormSubmit = (data: ShippingFormData) => {
    onSubmit(data);
    // Reset form after successful submission only in create mode
    if (mode === "create") {
      form.reset();
    }
  };

  const countries = [
    "US", "CA", "UK", "NZ", "JP",
    "AU", "IN", "BR", "MX"
  ];

  const formContent = (
    <>
      <DialogHeader className="mb-4">
        <DialogTitle>{mode === "create" ? "Create Shipping Service" : "Edit Shipping Service"}</DialogTitle>
        <DialogDescription>
          {mode === "create" 
            ? "Add a new shipping method for your store" 
            : "Update the shipping method details"
          }
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="service"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter service name (e.g., Standard Shipping)" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country, index) => (
                        <SelectItem key={index} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    value={field.value === 0 ? '' : field.value}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                    placeholder="Enter price"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="disabled"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Disable Service</FormLabel>
                <div className="text-sm text-muted-foreground">
                  When disabled, this shipping method won't be available to customers
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button 
          type="submit" 
          onClick={form.handleSubmit(handleFormSubmit)} 
          disabled={loading}
        >
          {loading ? "Processing..." : mode === "create" ? "Create Service" : "Update Service"}
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Form {...form}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="default">
            {mode === "create" ? "Add Shipping Method" : "Update Shipping Method"}
          </Button>
        </DialogTrigger>
      )}
      {useDialogContent ? (
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          {formContent}
        </DialogContent>
      ) : (
        formContent
      )}
    </Form>
  );
}