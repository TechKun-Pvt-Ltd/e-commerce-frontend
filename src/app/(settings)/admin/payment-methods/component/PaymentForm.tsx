"use client";

import { Button } from "@/components/ui/button";
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

const paymentFormSchema = z.object({
  paymentType: z.string().min(1, "Payment type is required."),
  disabled: z.boolean().default(false),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

export function PaymentForm({
  mode = "create",
  loading,
  onSubmit,
  onCancel,
  paymentData,
}: {
  mode: "create" | "edit";
  loading: boolean;
  onSubmit: (data: PaymentFormData) => void;
  onCancel: () => void;
  paymentData?: PaymentFormData;
}) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentType: "",
      disabled: false,
    },
  });

  useEffect(() => {
    if (paymentData && mode === "edit") {
      form.reset({
        paymentType: paymentData.paymentType || "",
        disabled: paymentData.disabled || false,
      });
    } else if (mode === "create") {
      form.reset({
        paymentType: "",
        disabled: false,
      });
    }
  }, [paymentData, form, mode]);

  const handleFormSubmit = (data: PaymentFormData) => {
    try {
      onSubmit(data);
      // Reset form after successful submission only in create mode
      if (mode === "create") {
        form.reset({
          paymentType: "",
          disabled: false,
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const paymentTypes = [
    "Credit Card",
    "Debit Card", 
    "PayPal",
    "Stripe",
    "Razorpay",
    "Cash on Delivery",
    "Bank Transfer",
    "UPI",
    "Net Banking"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="paymentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Type</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTypes.map((type, index) => (
                        <SelectItem key={index} value={type}>
                          {type}
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
            name="disabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Disable Payment Method</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    When disabled, this payment method won't be available to customers
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button 
            type="submit"
            disabled={loading}
          >
            {loading ? "Processing..." : mode === "create" ? "Create Payment Method" : "Update Payment Method"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
