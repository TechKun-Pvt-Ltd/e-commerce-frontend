"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { OrderCreatePayload } from "@/types/domains/order";
import { ShippingMethod } from "@/types/domains/shipping_method";
import { PaymentMethod, PaymentMethodDTO } from "@/types/domains/payment_method";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CartItemPreview } from "@/types/domains/cart";
import { Address } from "@/types/domains/address";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Truck, MapPin, Home } from "lucide-react";

const checkoutSchema = z.object({
   addressType: z.enum(["current", "custom"]),
   shippingAddress: z
      .object({
         street: z.string().min(1, "Street address is required"),
         city: z.string().min(1, "City is required"),
         pincode: z.number().min(10000, "Pincode must be 5 digits").max(999999, "Invalid pincode"),
         country: z.string().min(1, "Country is required"),
      })
      .optional(),
   paymentMethodId: z.string().optional(),
   paymentMethod: z
      .object({
         cardNumber: z.string().length(4),
         providerToken: z.string().min(1),
         expiryMonth: z.string().min(1),
         expiryYear: z.string().min(1),
         isDefault: z.boolean().default(false),
         cardHolderName: z.string().min(1, "Cardholder name is required"),
         cvvCode: z.string().min(3, "CVV must be at least 3 digits").max(4, "CVV can't be more than 4 digits"),
      })
      .optional(),
   shippingMethodId: z.number().min(1, "Shipping method is required"),
});

type FieldValues = z.infer<typeof checkoutSchema>;

const countries = ["US", "CA", "UK", "NZ", "JP", "AU", "IN", "BR", "MX", "DE", "FR", "IT", "ES", "NL", "SE", "NO", "DK", "FI"];

interface CheckoutFormProps {
   cartItems: CartItemPreview[];
   shippingMethods: Record<number, ShippingMethod>;
   loading: boolean;
   subtotalAmount: number;
   onSubmit: (data: OrderCreatePayload) => void;
   paymentMethods: PaymentMethod[];
   paymentMethodsLoading: boolean;
   createPaymentMethodLoading: boolean;
   onAddPaymentMethod: (paymentMethod: PaymentMethodDTO) => Promise<PaymentMethod>;
   currentAddress?: Address;
}

interface ShippingCalculationResult {
   deliveryTimeMin: number;
   deliveryTimeMax: number;
   totalShippingCharges: number;
}

export default function CheckoutForm({
   cartItems,
   shippingMethods,
   loading,
   onSubmit,
   subtotalAmount,
   paymentMethods,
   paymentMethodsLoading,
   createPaymentMethodLoading,
   onAddPaymentMethod,
   currentAddress,
}: CheckoutFormProps) {
   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
   const [paymentTab, setPaymentTab] = useState<"select" | "custom">("select");

   function calculateShippingSummary(
      cartItems: CartItemPreview[],
      shippingMethods: Record<number, ShippingMethod>
   ): ShippingCalculationResult {
      let deliveryTimeMin = Infinity;
      let deliveryTimeMax = -Infinity;
      let totalShippingCharges = 0;

      cartItems.forEach((item) => {
         const method = shippingMethods[item.cartItemId];
         if (!method) return;

         deliveryTimeMin = Math.min(deliveryTimeMin, method.processingTimeMin);
         deliveryTimeMax = Math.max(deliveryTimeMax, method.processingTimeMax);

         const option = method.shippingOptions[0];
         if (!option) return;

         let itemCharge = option.costFirstItem;
         if (option.costAdditionalItem > 0 && item.quantity > 1) {
            itemCharge += (item.quantity - 1) * option.costAdditionalItem;
         }
         totalShippingCharges += itemCharge;
      });

      return {
         deliveryTimeMin: deliveryTimeMin === Infinity ? 0 : deliveryTimeMin,
         deliveryTimeMax: deliveryTimeMax === -Infinity ? 0 : deliveryTimeMax,
         totalShippingCharges,
      };
   }
   const shippingSummary = calculateShippingSummary(cartItems, shippingMethods);
   const taxesAndCharges = 0;
   const shippingAmount = shippingSummary.totalShippingCharges;
   const discount = 0;
   const billTotal = subtotalAmount + taxesAndCharges + shippingAmount - discount;
   const defaultValues: Partial<FieldValues> = {
      addressType: "current",
      paymentMethodId: "",
   };

   const checkoutForm = useForm<FieldValues>({
      defaultValues,
   });

   const formControl = checkoutForm.control;

   useEffect(() => {
      if (paymentMethods.length > 0 && !selectedPaymentMethod) {
         setSelectedPaymentMethod(paymentMethods[0].paymentMethodId.toString());
         checkoutForm.setValue("paymentMethodId", paymentMethods[0].paymentMethodId.toString());
      }
   }, [paymentMethods, checkoutForm, selectedPaymentMethod]);

   const formatCardNumber = (value: string) => {
      const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
      const matches = v.match(/\d{4,16}/g);
      const match = (matches && matches[0]) || "";
      const parts = [];
      for (let i = 0, len = match.length; i < len; i += 4) {
         parts.push(match.substring(i, i + 4));
      }
      return parts.length ? parts.join(" ") : v;
   };

   const formatValidOn = (value: string) => {
      const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
      if (v.length >= 2) return v.substring(0, 2) + "/" + v.substring(2, 4);
      return v;
   };

   const handleAddNewCard = async () => {
      const formData = checkoutForm.getValues();

      if (
         !formData.paymentMethod?.cardHolderName ||
         !formData.paymentMethod.cardNumber ||
         !formData.paymentMethod.expiryMonth ||
         !formData.paymentMethod.expiryMonth ||
         !formData.paymentMethod.cvvCode
      ) {
         toast.error("Please fill all card details");
         return;
      }
      const month = formData.paymentMethod.expiryMonth;
      const year = formData.paymentMethod.expiryYear;
      const cardNumber = formData.paymentMethod.cardNumber.replace(/\s/g, "");

      const newPaymentMethod: PaymentMethodDTO = {
         last4: cardNumber.slice(-4),
         providerToken: `token_${Date.now()}`,
         expiryMonth: month,
         expiryYear: year,
         isDefault: formData.paymentMethod.isDefault || false,
         cardHolderName: formData.paymentMethod.cardHolderName,
      };

      try {
         const createdMethod = await onAddPaymentMethod(newPaymentMethod);
         checkoutForm.setValue("paymentMethodId", createdMethod.paymentMethodId.toString());
         setSelectedPaymentMethod(createdMethod.paymentMethodId.toString());
         setPaymentTab("select");

         checkoutForm.setValue("paymentMethod.cardHolderName", "");
         checkoutForm.setValue("paymentMethod.cardNumber", "");
         checkoutForm.setValue("paymentMethod.cvvCode", "");
         checkoutForm.setValue("paymentMethod.expiryMonth", "");
         checkoutForm.setValue("paymentMethod.expiryYear", "");
      } catch (error) {
         // Error handled in parent
      }
   };

   return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
         {/* Left Side */}
         <div className="lg:col-span-2 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

            <Form {...checkoutForm}>
               <form
                  onSubmit={checkoutForm.handleSubmit((data) => {
                     const orderPayload: OrderCreatePayload = {
                        items: cartItems.map((item) => ({
                           productVariantId: item.productVariantId,
                           price: item.price,
                           shippingMethodId: shippingMethods[item.cartItemId]?.shippingMethodId,
                           quantity: item.quantity,
                           personalization: undefined,
                        })),
                        shippingAddressId: data.addressType === "current" ? currentAddress?.addressId : undefined,
                        shippingAddress: data.addressType === "custom" ? data.shippingAddress : undefined,
                        discountAmount: 0,
                        taxAmount: taxesAndCharges,
                        shippingAmount: shippingSummary.totalShippingCharges,
                        subtotalAmount: subtotalAmount,
                        totalAmount: billTotal,
                        paymentMethodId: data.paymentMethodId ? parseInt(data.paymentMethodId) : undefined,
                     };
                     console.log("Submitting order:", orderPayload);
                     // onSubmit(orderPayload);
                  })}
                  className="space-y-6"
               >
                  <div className="space-y-4">
                     <h3 className="text-lg font-semibold text-gray-700">Shipping Address</h3>

                     <RadioGroup
                        value={checkoutForm.watch("addressType")}
                        onValueChange={(value: "current" | "custom") => {
                           checkoutForm.setValue("addressType", value);
                        }}
                        className="flex space-x-4"
                     >
                        <Label
                           htmlFor="current"
                           className={`flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex-1 transition-colors ${
                              checkoutForm.watch("addressType") === "current" ? "border-black bg-gray-50" : "border-gray-200"
                           }`}
                        >
                           <RadioGroupItem value="current" id="current" className="mt-1" />
                           <div className="flex-1">
                              <div className="flex items-center gap-2 font-medium mb-1">
                                 <Home className="h-4 w-4" />
                                 Current Address
                              </div>
                           </div>
                        </Label>

                        <Label
                           htmlFor="custom"
                           className={`flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex-1 transition-colors ${
                              checkoutForm.watch("addressType") === "custom" ? "border-black bg-gray-50" : "border-gray-200"
                           }`}
                        >
                           <RadioGroupItem value="custom" id="custom" className="mt-1" />
                           <div className="flex-1">
                              <div className="flex items-center gap-2 font-medium">
                                 <MapPin className="h-4 w-4" />
                                 Custom Address
                              </div>
                           </div>
                        </Label>
                     </RadioGroup>

                     {/* Current address display */}
                     {checkoutForm.watch("addressType") === "current" && currentAddress && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm">
                           <p className="font-medium text-gray-900 mb-1">Selected Address:</p>
                           <p className="text-sm text-gray-700 leading-relaxed">
                              {currentAddress.street}
                              <br />
                              {currentAddress.city}, {currentAddress.pincode}
                              <br />
                              {currentAddress.country}
                           </p>
                        </div>
                     )}

                     {/* Custom address form */}
                     {checkoutForm.watch("addressType") === "custom" && (
                        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                           <FormField
                              control={formControl}
                              name="shippingAddress.street"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>Street Address</FormLabel>
                                    <FormControl>
                                       <Input placeholder="4864 Layman Avenue" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />

                           <div className="grid grid-cols-2 gap-4">
                              <FormField
                                 control={formControl}
                                 name="shippingAddress.city"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>City</FormLabel>
                                       <FormControl>
                                          <Input placeholder="Fayetteville" {...field} />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={formControl}
                                 name="shippingAddress.pincode"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>Pincode</FormLabel>
                                       <FormControl>
                                          <Input
                                             type="number"
                                             placeholder="28314"
                                             {...field}
                                             onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                          />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                           </div>

                           <FormField
                              control={formControl}
                              name="shippingAddress.country"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                       <Select value={field.value} onValueChange={field.onChange}>
                                          <SelectTrigger>
                                             <SelectValue placeholder="Select country" />
                                          </SelectTrigger>
                                          <SelectContent>
                                             {countries.map((country) => (
                                                <SelectItem key={country} value={country}>
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
                        </div>
                     )}
                  </div>

                  {/* Payment Method Section */}
                  <div className="space-y-4">
                     <h3 className="text-lg font-semibold text-gray-700">Choose how to pay</h3>

                     <Tabs value={paymentTab} onValueChange={(value) => setPaymentTab(value as "select" | "custom")}>
                        <TabsList className="grid w-full grid-cols-2">
                           <TabsTrigger value="select">Select Payment Method</TabsTrigger>
                           <TabsTrigger value="custom">Add New Payment Method</TabsTrigger>
                        </TabsList>

                        {/* Existing Payment Methods Tab */}
                        <TabsContent value="select" className="space-y-4">
                           {paymentMethodsLoading ? (
                              <div className="flex items-center justify-center p-8">
                                 <Spinner />
                                 <span className="ml-2">Loading payment methods...</span>
                              </div>
                           ) : (
                              <RadioGroup
                                 value={selectedPaymentMethod}
                                 onValueChange={(value) => {
                                    setSelectedPaymentMethod(value);
                                    checkoutForm.setValue("paymentMethodId", value);
                                 }}
                                 className="space-y-4 max-h-72 overflow-y-auto"
                              >
                                 {paymentMethods.map((method) => (
                                    <Label
                                       key={method.paymentMethodId}
                                       htmlFor={`payment-${method.paymentMethodId}`}
                                       className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md block ${
                                          selectedPaymentMethod === method.paymentMethodId.toString()
                                             ? "border-black bg-gray-50 shadow-md"
                                             : "border-gray-200 bg-white hover:border-gray-300"
                                       }`}
                                    >
                                       <RadioGroupItem
                                          value={method.paymentMethodId.toString()}
                                          id={`payment-${method.paymentMethodId}`}
                                          className={`absolute right-4 top-4 ${
                                             selectedPaymentMethod === method.paymentMethodId.toString() ? "border-black" : ""
                                          }`}
                                       />

                                       <div className="flex items-center gap-4 pr-8">
                                          <div
                                             className={`flex-shrink-0 p-2 rounded-lg ${
                                                selectedPaymentMethod === method.paymentMethodId.toString()
                                                   ? "bg-gray-200"
                                                   : "bg-gray-100"
                                             }`}
                                          >
                                             <CreditCard
                                                className={`h-6 w-6 ${
                                                   selectedPaymentMethod === method.paymentMethodId.toString()
                                                      ? "text-black"
                                                      : "text-gray-600"
                                                }`}
                                             />
                                          </div>
                                          <div className="flex-1">
                                             <p className="font-semibold text-gray-900">{method.cardHolderName}</p>
                                             <p className="text-sm text-gray-600 mt-1">•••• •••• •••• {method.last4}</p>
                                             <p className="text-xs text-gray-500 mt-1">
                                                Expires {method.expiryMonth}/{method.expiryYear}
                                             </p>
                                          </div>
                                       </div>
                                    </Label>
                                 ))}
                              </RadioGroup>
                           )}
                        </TabsContent>

                        {/* Add New Payment Method Tab */}
                        <TabsContent value="custom" className="space-y-4 max-h-72 overflow-y-auto">
                           <div className="p-6 border rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
                              <div className="flex items-center gap-2 mb-4">
                                 <CreditCard className="h-5 w-5 text-gray-600" />
                                 <h4 className="font-medium text-gray-900">Add New Payment Method</h4>
                              </div>

                              <FormField
                                 control={formControl}
                                 name="paymentMethod.cardHolderName"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>Cardholder Name</FormLabel>
                                       <FormControl>
                                          <Input placeholder="Harvey Olson" className="bg-white" {...field} />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={formControl}
                                 name="paymentMethod.cardNumber"
                                 render={({ field }) => (
                                    <FormItem className="mt-4">
                                       <FormLabel>Card Number</FormLabel>
                                       <FormControl>
                                          <Input
                                             placeholder="3787 3449 3626 0712"
                                             className="bg-white font-mono"
                                             {...field}
                                             onChange={(e) => {
                                                const formatted = formatCardNumber(e.target.value);
                                                field.onChange(formatted);
                                             }}
                                             maxLength={19}
                                          />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <div className="grid grid-cols-3 gap-4 mt-4">
                                 <FormField
                                    control={formControl}
                                    name="paymentMethod.expiryMonth"
                                    render={({ field }) => (
                                       <FormItem>
                                          <FormLabel>Expiry Month</FormLabel>
                                          <FormControl>
                                             <Input placeholder="MM" className="bg-white font-mono" {...field} maxLength={2} />
                                          </FormControl>
                                          <FormMessage />
                                       </FormItem>
                                    )}
                                 />
                                 <FormField
                                    control={formControl}
                                    name="paymentMethod.expiryYear"
                                    render={({ field }) => (
                                       <FormItem>
                                          <FormLabel>Expiry Year</FormLabel>
                                          <FormControl>
                                             <Input placeholder="YY" className="bg-white font-mono" {...field} maxLength={2} />
                                          </FormControl>
                                          <FormMessage />
                                       </FormItem>
                                    )}
                                 />
                                 <FormField
                                    control={formControl}
                                    name="paymentMethod.cvvCode"
                                    render={({ field }) => (
                                       <FormItem>
                                          <FormLabel>CVV Code</FormLabel>
                                          <FormControl>
                                             <Input
                                                type="password"
                                                placeholder="***"
                                                className="bg-white font-mono"
                                                {...field}
                                                maxLength={4}
                                             />
                                          </FormControl>
                                          <FormMessage />
                                       </FormItem>
                                    )}
                                 />
                              </div>

                              <FormField
                                 control={formControl}
                                 name="paymentMethod.isDefault"
                                 render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 mt-4">
                                       <input
                                          type="checkbox"
                                          checked={field.value ?? false}
                                          onChange={(e) => field.onChange(e.target.checked)}
                                          id="isDefault"
                                       />
                                       <FormLabel htmlFor="isDefault" className="mb-0">
                                          Set as default payment method
                                       </FormLabel>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <Button
                                 type="button"
                                 variant="outline"
                                 className="w-full mt-6 bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                                 onClick={handleAddNewCard}
                                 disabled={createPaymentMethodLoading}
                              >
                                 {createPaymentMethodLoading && <Spinner className="mr-2 h-4 w-4" />}
                                 <CreditCard className="mr-2 h-4 w-4" />
                                 Add Card
                              </Button>
                           </div>
                        </TabsContent>
                     </Tabs>
                  </div>

                  <Button
                     type="submit"
                     disabled={loading || paymentMethodsLoading}
                     className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg font-semibold rounded-xl transition-colors"
                  >
                     {loading && <Spinner className="mr-2" />}
                     Pay ${billTotal.toFixed(2)}
                  </Button>
               </form>
            </Form>
         </div>

         {/* Right Side Summary */}
         <div className="space-y-6">
            <Card className="sticky top-20">
               <CardHeader>
                  <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                     <div className="flex items-center gap-2 mb-2">
                        <Truck className="h-4 w-4 text-primary" />
                        <span className="font-medium">Estimated Delivery</span>
                     </div>
                     <p className="text-sm text-muted-foreground">5-7 business days</p>
                  </div>
               </CardHeader>

               <CardContent className="space-y-4">
                  <div className="flex justify-between">
                     <span>Subtotal</span>
                     <span>${subtotalAmount.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                     <span>Delivery Fee</span>
                     <span>${shippingAmount}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                     <span>Total</span>
                     <span>${billTotal.toFixed(1)}</span>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
