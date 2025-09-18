"use client";

import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";

const paymentFormSchema = z.object({
   cardHolderName: z.string().min(1, "Card holder name is required."),
   cardNumber: z.string().min(16, "Card number must be 16 digits."),
   expiryMonth: z
      .string()
      .length(2, "Expiry month must be 2 digits.")
      .regex(/^(0[1-9]|1[0-2])$/, "Invalid month"),
   expiryYear: z
      .string()
      .length(2, "Expiry year must be 2 digits.")
      .regex(/^\d{2}$/, "Invalid year"),
   isDefault: z.boolean(),
   last4: z.string().optional(),
   providerToken: z.string().optional(),
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
         cardHolderName: "",
         cardNumber: "",
         expiryMonth: "",
         expiryYear: "",
         isDefault: false,
         last4: "",
         providerToken: "",
      },
   });

   useEffect(() => {
      if (paymentData && mode === "edit") {
         form.reset({
            cardHolderName: paymentData.cardHolderName || "",
            cardNumber: paymentData.cardNumber || "",
            expiryMonth: paymentData.expiryMonth || "",
            expiryYear: paymentData.expiryYear || "",
            isDefault: paymentData.isDefault || false,
            last4: paymentData.last4 || "",
            providerToken: paymentData.providerToken || "",
         });
      } else if (mode === "create") {
         form.reset({
            cardHolderName: "",
            cardNumber: "",
            expiryMonth: "",
            expiryYear: "",
            isDefault: false,
            last4: "",
            providerToken: "",
         });
      }
   }, [paymentData, form, mode]);

   const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      form.setValue("cardNumber", value);
      if (value.length === 16) {
         setTimeout(() => {
            const last4 = value.slice(-4);
            form.setValue("last4", last4);
            form.setValue("providerToken", "dummy-token-" + last4);
         }, 1500);
      } else {
         form.setValue("last4", "");
         form.setValue("providerToken", "");
      }
   };

   const handleFormSubmit = (data: PaymentFormData) => {
      try {
         const transformedData = {
            ...data,
            last4: data.last4,
            providerToken: data.providerToken,
            expiryMonth: data.expiryMonth, // keep as string
            expiryYear: data.expiryYear, // keep as string
         };
         onSubmit(transformedData);
         // Reset form after successful submission only in create mode
         if (mode === "create") {
            form.reset({
               cardHolderName: "",
               cardNumber: "",
               expiryMonth: "",
               expiryYear: "",
               isDefault: false,
               last4: "",
               providerToken: "",
            });
         }
      } catch (error) {
         console.error("Form submission error:", error);
      }
   };

   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="space-y-6">
               <FormField
                  control={form.control}
                  name="cardHolderName"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Card Holder Name</FormLabel>
                        <FormControl>
                           <input
                              type="text"
                              placeholder="Enter card holder name"
                              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              {...field}
                           />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />

               <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                           <input
                              type="text"
                              inputMode="numeric"
                              maxLength={16}
                              placeholder="Enter 16-digit card number"
                              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={field.value}
                              onChange={handleCardNumberChange}
                           />
                        </FormControl>
                        <input type="hidden" {...form.register("last4")} />
                        <input type="hidden" {...form.register("providerToken")} />
                        <FormMessage />
                     </FormItem>
                  )}
               />

               <div className="flex space-x-4">
                  <FormField
                     control={form.control}
                     name="expiryMonth"
                     render={({ field }) => (
                        <FormItem className="flex-1">
                           <FormLabel>Expiry Month</FormLabel>
                           <FormControl>
                              <input
                                 type="text"
                                 inputMode="numeric"
                                 maxLength={2}
                                 placeholder="MM"
                                 className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={form.control}
                     name="expiryYear"
                     render={({ field }) => (
                        <FormItem className="flex-1">
                           <FormLabel>Expiry Year</FormLabel>
                           <FormControl>
                              <input
                                 type="text"
                                 inputMode="numeric"
                                 maxLength={4}
                                 placeholder="YY"
                                 className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>

               <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                     <FormItem className="flex items-center gap-3">
                        <FormControl>
                           <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="text-base">Set as Default</FormLabel>
                     </FormItem>
                  )}
               />
            </div>

            <div className="flex justify-end gap-2">
               <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
               </Button>
               <Button type="submit" disabled={loading}>
                  {loading ? "Processing..." : mode === "create" ? "Create Payment Method" : "Update Payment Method"}
               </Button>
            </div>
         </form>
      </Form>
   );
}
