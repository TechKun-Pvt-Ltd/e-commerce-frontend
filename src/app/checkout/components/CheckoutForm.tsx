/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ShippingMethod } from "@/types/domains/shipping_method";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CartItemPreview } from "@/types/domains/cart";
import { Address } from "@/types/domains/address";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { COUNTRY_OPTIONS } from "@/lib/countries";
import { CreditCard, Truck, MapPin, Home, ShieldCheck } from "lucide-react";
import { PaymentInitiateRequest } from "@/services/iyzico";

// ─── Validation schema ────────────────────────────────────────────────────────

const checkoutSchema = z.object({
    addressType: z.enum(["current", "custom"]),
    shippingAddress: z.object({
        street: z.string(),
        city: z.string(),
        pincode: z.string(),
        country: z.string(),
    }).optional(),
    cardHolderName: z.string().min(2, "Cardholder name is required"),
    cardNumber: z.string()
        .min(13, "Card number must be at least 13 digits")
        .max(19, "Card number too long")
        .regex(/^[\d\s]+$/, "Card number must contain only digits"),
    expireMonth: z.string()
        .length(2, "Enter 2-digit month")
        .regex(/^(0[1-9]|1[0-2])$/, "Invalid month (01-12)"),
    expireYear: z.string()
        .length(2, "Enter 2-digit year")
        .regex(/^\d{2}$/, "Invalid year"),
    cvc: z.string()
        .min(3, "CVV must be 3-4 digits")
        .max(4, "CVV must be 3-4 digits")
        .regex(/^\d+$/, "CVV must contain only digits"),
    installment: z.number().default(1),
});

type FieldValues = z.infer<typeof checkoutSchema>;

// ─── Card type detection ──────────────────────────────────────────────────────

function detectCardType(cardNumber: string): { label: string; color: string } | null {
    const num = cardNumber.replace(/\s/g, "");
    if (/^4/.test(num)) return { label: "Visa", color: "text-blue-600" };
    if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return { label: "Mastercard", color: "text-orange-600" };
    if (/^3[47]/.test(num)) return { label: "Amex", color: "text-green-600" };
    if (/^6(?:011|5)/.test(num)) return { label: "Discover", color: "text-yellow-600" };
    if (/^9[0-9]/.test(num)) return { label: "Troy", color: "text-red-600" };
    return null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CheckoutFormProps {
    cartItems: CartItemPreview[];
    shippingMethods: Record<number, ShippingMethod>;
    loading: boolean;
    subtotalAmount: number;
    onSubmit: (data: PaymentInitiateRequest) => void;
    currentAddress?: Address;
}

export default function CheckoutForm({
    cartItems,
    shippingMethods,
    loading,
    onSubmit,
    subtotalAmount,
    currentAddress,
}: CheckoutFormProps) {
    function calculateShipping(): number {
        let total = 0;
        cartItems.forEach((item) => {
            const method = shippingMethods[item.cartItemId];
            if (!method) return;
            const option = method.shippingOptions[0];
            if (!option) return;
            let charge = option.costFirstItem;
            if (option.costAdditionalItem > 0 && item.quantity > 1) {
                charge += (item.quantity - 1) * option.costAdditionalItem;
            }
            total += charge;
        });
        return total;
    }

    const shippingAmount = calculateShipping();
    const taxAmount = 0;
    const discountAmount = 0;
    const billTotal = subtotalAmount + shippingAmount + taxAmount - discountAmount;

    const form = useForm<FieldValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(checkoutSchema) as any,
        defaultValues: {
            addressType: "current",
            shippingAddress: { street: "", city: "", pincode: "", country: "" },
            cardHolderName: "",
            cardNumber: "",
            expireMonth: "",
            expireYear: "",
            cvc: "",
            installment: 1,
        },
    });

    const cardNumber = form.watch("cardNumber");
    const cardType = detectCardType(cardNumber);

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\D/g, "").slice(0, 16);
        const parts: string[] = [];
        for (let i = 0; i < v.length; i += 4) parts.push(v.slice(i, i + 4));
        return parts.join(" ");
    };

    const handleSubmit = (data: FieldValues) => {
        console.log("=== PAY CLICKED — form data:", data);
        console.log("=== cartItems:", cartItems);
        console.log("=== shippingMethods map:", shippingMethods);

        if (data.addressType === "custom") {
            const s = data.shippingAddress;
            const missing: string[] = [];
            if (!s?.street?.trim()) missing.push("Street");
            if (!s?.city?.trim()) missing.push("City");
            if (!s?.pincode?.trim() || isNaN(Number(s.pincode))) missing.push("Pincode");
            if (!s?.country?.trim()) missing.push("Country");
            if (missing.length > 0) {
                toast.error(`Please fill: ${missing.join(", ")}`);
                return;
            }
        }

        const missingShipping = cartItems.filter(
            (item) => !shippingMethods[item.cartItemId]?.shippingMethodId
        );
        console.log("=== missingShipping:", missingShipping);
        if (missingShipping.length > 0) {
            toast.error("Shipping method not loaded yet. Please wait and try again.");
            return;
        }

        let shippingAddressId: number | undefined;
        let shippingAddressObj: { street: string; city: string; pincode: number; country: string } | undefined;

        if (data.addressType === "current" && currentAddress) {
            if (currentAddress.addressId) {
                shippingAddressId = currentAddress.addressId;
            } else {
                shippingAddressObj = {
                    street: currentAddress.street ?? "",
                    city: currentAddress.city ?? "",
                    pincode: Number(currentAddress.pincode),
                    country: currentAddress.country ?? "",
                };
            }
        } else if (data.addressType === "custom" && data.shippingAddress) {
            shippingAddressObj = {
                street: data.shippingAddress.street,
                city: data.shippingAddress.city,
                pincode: Number(data.shippingAddress.pincode),
                country: data.shippingAddress.country,
            };
        }

        const payload: PaymentInitiateRequest = {
            cardHolderName: data.cardHolderName,
            cardNumber: data.cardNumber.replace(/\s/g, ""),
            expireMonth: data.expireMonth,
            expireYear: data.expireYear,
            cvc: data.cvc,
            installment: data.installment,
            items: cartItems.map((item) => ({
                productVariantId: item.productVariantId,
                shippingMethodId: shippingMethods[item.cartItemId]!.shippingMethodId,
                price: item.price,
                quantity: item.quantity,
                productName: (item as { productName?: string }).productName ?? "Product",
                categoryName: "General",
            })),
            shippingAddressId,
            shippingAddress: shippingAddressObj,
            subtotalAmount,
            shippingAmount,
            taxAmount,
            discountAmount,
            totalAmount: billTotal,
        };

        onSubmit(payload);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" autoComplete="off">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* ── Left Side ── */}
                    <div className="lg:col-span-2 space-y-6">
                        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

                        {/* Shipping Address */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Shipping Address</h3>
                            <RadioGroup
                                value={form.watch("addressType")}
                                onValueChange={(v: "current" | "custom") => form.setValue("addressType", v)}
                                className="flex space-x-4"
                            >
                                <Label
                                    htmlFor="current"
                                    className={`flex items-center justify-center space-x-3 p-4 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer flex-1 transition-colors ${
                                        form.watch("addressType") === "current" ? "border-black bg-gray-50" : "border-gray-200"
                                    }`}
                                >
                                    <RadioGroupItem value="current" id="current" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 font-medium">
                                            <Home className="h-4 w-4" />
                                            Current Address
                                        </div>
                                        {currentAddress && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                {currentAddress.street}, {currentAddress.city}
                                            </p>
                                        )}
                                    </div>
                                </Label>

                                <Label
                                    htmlFor="custom"
                                    className={`flex items-center justify-center space-x-3 p-4 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer flex-1 transition-colors ${
                                        form.watch("addressType") === "custom" ? "border-black bg-gray-50" : "border-gray-200"
                                    }`}
                                >
                                    <RadioGroupItem value="custom" id="custom" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 font-medium">
                                            <MapPin className="h-4 w-4" />
                                            Different Address
                                        </div>
                                    </div>
                                </Label>
                            </RadioGroup>

                            {form.watch("addressType") === "custom" && (
                                <div className="p-4 border rounded-xl bg-white space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="shippingAddress.street"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Street Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter your street address" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="shippingAddress.city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>City</FormLabel>
                                                    <FormControl><Input placeholder="City" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="shippingAddress.pincode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Pincode</FormLabel>
                                                    <FormControl><Input type="number" placeholder="Pincode" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="shippingAddress.country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country</FormLabel>
                                                <FormControl>
                                                    <Select value={field.value || ""} onValueChange={field.onChange}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select country" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {COUNTRY_OPTIONS.map(({ value, label }) => (
                                                                <SelectItem key={value} value={value}>{label}</SelectItem>
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

                        {/* Payment Card */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Payment Details</h3>
                            <div className="p-6 border rounded-xl shadow-sm bg-white space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-gray-600" />
                                        <h4 className="font-medium text-gray-900">Card Information</h4>
                                    </div>
                                    {cardType && (
                                        <span className={`text-sm font-bold ${cardType.color}`}>
                                            {cardType.label}
                                        </span>
                                    )}
                                </div>

                                <FormField
                                    control={form.control}
                                    name="cardHolderName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cardholder Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Name on card" autoComplete="off" {...field} />
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
                                                <Input
                                                    placeholder="•••• •••• •••• ••••"
                                                    inputMode="numeric"
                                                    autoComplete="off"
                                                    className="font-mono tracking-widest"
                                                    value={field.value}
                                                    onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                                                    maxLength={19}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="expireMonth"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Month</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="MM" inputMode="numeric" autoComplete="off" className="font-mono" maxLength={2} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="expireYear"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Year</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="YY" inputMode="numeric" autoComplete="off" className="font-mono" maxLength={2} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="cvc"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>CVV</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="•••" inputMode="numeric" autoComplete="off" className="font-mono" maxLength={4} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="installment"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Installments</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={String(field.value)}
                                                    onValueChange={(v) => field.onChange(Number(v))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Single payment" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">Single payment</SelectItem>
                                                        <SelectItem value="2">2 installments</SelectItem>
                                                        <SelectItem value="3">3 installments</SelectItem>
                                                        <SelectItem value="6">6 installments</SelectItem>
                                                        <SelectItem value="9">9 installments</SelectItem>
                                                        <SelectItem value="12">12 installments</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex items-center gap-2 pt-2 text-xs text-gray-500 border-t">
                                    <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    Your card details are securely encrypted and processed by iyzico.
                                    They are never stored on our servers.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Side Summary ── */}
                    <div className="space-y-6">
                        <Card className="sticky top-20">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
                                <div className="mt-4 p-4 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Truck className="h-4 w-4 text-primary" />
                                        <span className="font-medium text-sm">Estimated Delivery</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">5-7 business days</p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>${subtotalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span>${shippingAmount.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total</span>
                                    <span>${billTotal.toFixed(2)}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg font-semibold rounded-xl transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner className="mr-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="mr-2 h-5 w-5" />
                                            Pay ${billTotal.toFixed(2)}
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
}
