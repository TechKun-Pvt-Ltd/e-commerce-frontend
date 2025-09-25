"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { OrderCreatePayload } from "@/types/domains/order";
import { ProductPreview } from "@/types/domains/product";
import { ShippingMethod } from "@/types/domains/shipping_method";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CartItemPreview } from "@/types/domains/cart";

const checkoutSchema = z.object({
  nameOnCard: z.string().min(1, "Name on card is required"),
  cardNumber: z.string().min(16, "Card number must be at least 16 digits").max(19, "Card number is too long"),
  validOn: z.string().min(5, "Valid date is required (MM/YY)"),
  cvvCode: z.string().min(3, "CVV must be at least 3 digits").max(4, "CVV is too long"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.number().min(10000, "Pincode must be 5 digits").max(999999, "Invalid pincode"),
  country: z.string().min(1, "Country is required"),
  shippingMethodId: z.number().min(1, "Shipping method is required"),
  items: z.array(
    z.object({
      orderItemId: z.number(),
      productVariantId: z.number(),
      estimatedDeliveryDate: z.date(),
      price: z.number().min(0),
      shippingMethodId: z.number(),
      quantity: z.number().min(1),
      personalization: z.any().optional()
    })
  ).min(1, "At least one item is required"),
  paymentMethodId: z.string().min(1, "Payment method is required"),
  saveCard: z.boolean().default(false)
});

type FieldValues = z.infer<typeof checkoutSchema>;

const countries = ["US","CA","UK","NZ","JP","AU","IN","BR","MX","DE","FR","IT","ES","NL","SE","NO","DK","FI"];

interface CheckoutFormProps {
  cartItems: CartItemPreview[];
  shippingMethods: Record<number, ShippingMethod>;
  loading: boolean;
  onSubmit: (data: OrderCreatePayload) => void;
}

export default function CheckoutForm({ cartItems, shippingMethods, loading, onSubmit }: CheckoutFormProps) {
  const [showAddCard, setShowAddCard] = useState(false);

  // Payment methods data
  const paymentMethods = [
    {
      id: "1",
      name: "Visa **** 0912",
      description: "Wrap your items",
      iconBg: "bg-blue-600",
      icon: <span className="text-white font-bold text-xs">VISA</span>
    },
    {
      id: "2", 
      name: "Mastercard **** 0912",
      description: "Wrap your items for",
      iconBg: "",
      icon: (
        <div className="flex">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <div className="w-4 h-4 bg-yellow-500 rounded-full -ml-2"></div>
        </div>
      )
    },
    {
      id: "3",
      name: "Pay with Tabby", 
      description: "Wrap your items for",
      iconBg: "bg-black",
      icon: <span className="text-white font-bold text-xs">T</span>
    }
  ];

  const defaultValues: Partial<FieldValues> = {
    nameOnCard: "",
    cardNumber: "",
    validOn: "",
    cvvCode: "",
    street: "",
    city: "",
    pincode: undefined,
    country: "",
    shippingMethodId: shippingMethods[0]?.shippingMethodId ?? 1,
    items: cartItems.map((item, index) => ({
      orderItemId: index + 1,
      productVariantId: item.productVariantId,
      estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      price: item.price,
      shippingMethodId: item.shippingMethodId ?? shippingMethods[0]?.shippingMethodId ?? 1,
      quantity: item.quantity,
      personalization: undefined
    })),
    paymentMethodId: "1",
    saveCard: false
  };

  const checkoutForm = useForm<FieldValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues
  });

  // Totals
  const itemTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxesAndCharges = itemTotal * 0.08;
  const deliveryFee = 10;
  const discount = 0;
  const billTotal = itemTotal + taxesAndCharges + deliveryFee - discount;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatValidOn = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) return v.substring(0, 2) + '/' + v.substring(2, 4);
    return v;
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
                items: data.items.map(item => ({
                  orderItemId: item.orderItemId,
                  productVariantId: item.productVariantId,
                  estimatedDeliveryDate: item.estimatedDeliveryDate,
                  personalization: item.personalization,
                  price: item.price,
                  shippingMethodId: item.shippingMethodId, // Use the shippingMethodId from each item
                  quantity: item.quantity
                })),
                shippingAddressId: 0,
                shippingAddress: {
                  street: data.street,
                  city: data.city,
                  pincode: data.pincode,
                  country: data.country
                },
                paymentMethodId: parseInt(data.paymentMethodId)
              };
              onSubmit(orderPayload);
            })}
            className="space-y-6"
          >
           
            {/* Shipping Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Shipping Address</h3>
              
              <FormField
                control={checkoutForm.control}
                name="street"
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
                  control={checkoutForm.control}
                  name="city"
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
                  control={checkoutForm.control}
                  name="pincode"
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={checkoutForm.control}
                  name="country"
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

                <FormField
                  control={checkoutForm.control}
                  name="shippingMethodId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Method</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value?.toString()} 
                          onValueChange={(value) => {
                            const selectedMethodId = Number(value);
                            field.onChange(selectedMethodId);
                            
                            // Update all items with the selected shipping method
                            const currentItems = checkoutForm.getValues("items");
                            const updatedItems = currentItems.map(item => ({
                              ...item,
                              shippingMethodId: selectedMethodId
                            }));
                            checkoutForm.setValue("items", updatedItems);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select shipping method" />
                          </SelectTrigger>
                          <SelectContent>
                            {shippingMethods?.map((method) => (
                              <SelectItem 
                                key={method.shippingMethodId} 
                                value={method.shippingMethodId.toString()}
                              >
                                {method.name}
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
            </div>

            {/* Choose Payment */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Choose how to pay</h3>
                <Button 
                  type="button"
                  variant="ghost" 
                  className="text-black text-sm p-0 h-auto"
                  onClick={() => setShowAddCard(!showAddCard)}
                >
                  + Add new method
                </Button>
              </div>

              {/* Payment Options with RadioGroup */}
              <FormField
                control={checkoutForm.control}
                name="paymentMethodId"
                render={({ field }) => (
                  <FormItem className="w- ">
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="space-y-3 "
                      >
                        {paymentMethods.map((method) => (
                          <div 
                            key={method.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-all ${
                              field.value === method.id
                                ? "border-black bg-gray-50" 
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <label 
                              htmlFor={`payment-${method.id}`} 
                              className="flex  items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                {/* Dynamic Icon */}
                                <div className={`w-12 h-8 rounded flex items-center justify-center ${method.iconBg}`}>
                                  {method.icon}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{method.name}</p>
                                  <p className="text-xs text-gray-500">{method.description}</p>
                                </div>
                              </div>
                              <RadioGroupItem 
                                id={`payment-${method.id}`}
                                value={method.id} 
                                className="border-black data-[state=checked]:bg-black data-[state=checked]:border-black" 
                              />
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Add Card Fields (toggle) */}
              <div className={showAddCard ? "block space-y-4" : "hidden"}>
                <FormField
                  control={checkoutForm.control}
                  name="nameOnCard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name On Card</FormLabel>
                      <FormControl><Input placeholder="Harvey Olson" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={checkoutForm.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="3787-3449-3626-0712"
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={checkoutForm.control}
                    name="validOn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valid On</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="04/24"
                            {...field}
                            onChange={(e) => {
                              const formatted = formatValidOn(e.target.value);
                              field.onChange(formatted);
                            }}
                            maxLength={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={checkoutForm.control}
                    name="cvvCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV Code</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="***" {...field} maxLength={4}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg font-semibold"
            >
              {loading && <Spinner />}
              Pay ${billTotal.toFixed(2)}
            </Button>
          </form>
        </Form>
      </div>

      {/* Right Side Summary */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="space-y-3">
            <div className="flex justify-between"><span>Item Total</span><span>${itemTotal.toFixed(0)}</span></div>
            <div className="flex justify-between"><span>Taxes and Charges</span><span>${taxesAndCharges.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Delivery Fee</span><span>${deliveryFee}</span></div>
            <Separator />
            <div className="flex justify-between font-bold text-lg"><span>TOTAL</span><span>${billTotal.toFixed(1)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}