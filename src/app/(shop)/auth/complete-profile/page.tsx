'use client';

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PhoneInput from '@/components/ui/phone-input';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaInstagram, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import Spinner from '@/components/ui/spinner';

const completeProfileSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phoneNo: z.string().min(7, 'Please enter a valid phone number'),
    address: z.object({
        street: z.string().min(2, 'Street address is required'),
        city: z.string().min(2, 'City is required'),
        state: z.string().min(2, 'State / Province is required'),
        zipCode: z.string().min(3, 'ZIP / Postal Code is required'),
        country: z.string().min(2, 'Country is required'),
    }),
});

type CompleteProfileValues = z.infer<typeof completeProfileSchema>;

function CompleteProfileContent() {
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [submitting, setSubmitting] = useState(false);

    const providerParam = (searchParams.get('provider') || 'google').toLowerCase();
    const emailParam = searchParams.get('email') || '';
    const nameParam = searchParams.get('name') || '';
    const avatarParam = searchParams.get('avatar') || '';
    const notice = searchParams.get('notice');
    const returnUrl = searchParams.get('returnUrl') || '/';
    const isSimulated = searchParams.get('simulated') === 'true';

    // Try reading cookie fallback if params missing
    const [socialData, setSocialData] = useState<{
        provider: string;
        email: string;
        fullName: string;
        providerId?: string;
        avatarUrl?: string;
    }>({
        provider: providerParam,
        email: emailParam,
        fullName: nameParam,
        avatarUrl: avatarParam,
    });

    useEffect(() => {
        if (!socialData.email) {
            try {
                const match = document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('social_onboarding='));
                if (match) {
                    const rawVal = match.split('=')[1];
                    const decoded = JSON.parse(atob(rawVal));
                    setSocialData({
                        provider: decoded.provider || providerParam,
                        email: decoded.email || '',
                        fullName: decoded.fullName || '',
                        providerId: decoded.providerId,
                        avatarUrl: decoded.avatarUrl,
                    });
                }
            } catch {
                // Keep current state
            }
        }
    }, [socialData.email, providerParam]);

    const form = useForm<CompleteProfileValues>({
        resolver: zodResolver(completeProfileSchema),
        defaultValues: {
            fullName: socialData.fullName || nameParam || (isSimulated ? 'Sample Customer' : ''),
            email: socialData.email || emailParam || (isSimulated ? `demo.${providerParam}@kavengo.com` : ''),
            phoneNo: '+1',
            address: {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'United States',
            },
        },
    });

    // Update form when socialData resolves
    useEffect(() => {
        if (socialData.fullName && !form.getValues('fullName')) {
            form.setValue('fullName', socialData.fullName);
        }
        if (socialData.email && !form.getValues('email')) {
            form.setValue('email', socialData.email);
        }
    }, [socialData, form]);

    const onSubmit = async (values: CompleteProfileValues) => {
        try {
            setSubmitting(true);
            const payload = {
                provider: socialData.provider || providerParam,
                providerId: socialData.providerId || values.email,
                email: values.email,
                fullName: values.fullName,
                avatarUrl: socialData.avatarUrl || avatarParam || undefined,
                phoneNo: values.phoneNo,
                address: values.address,
                returnUrl,
            };

            const response = await axios.post('/api/auth/complete-social-registration', payload);

            if (response.data?.success) {
                toast.success('Registration completed! Welcome to Kavengo.', { richColors: true });
                startTransition(() => {
                    const target = response.data.redirectUrl || returnUrl;
                    window.location.href = target;
                });
            } else {
                toast.error(response.data?.message || 'Failed to complete registration.');
            }
        } catch (err: unknown) {
            console.error('Registration completion error:', err);
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.message || err.message
                : 'Failed to complete registration. Please try again.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const renderProviderBadge = () => {
        const p = (socialData.provider || providerParam).toLowerCase();
        let icon = <FcGoogle className="h-6 w-6 shrink-0" />;
        let label = 'Google';
        let bgClass = 'bg-blue-50/50 border-blue-200 text-blue-900';

        if (p === 'facebook') {
            icon = <FaFacebook className="h-6 w-6 text-[#1877F2] shrink-0" />;
            label = 'Facebook';
            bgClass = 'bg-blue-50/60 border-blue-200 text-blue-900';
        } else if (p === 'instagram') {
            icon = <FaInstagram className="h-6 w-6 text-[#E4405F] shrink-0" />;
            label = 'Instagram';
            bgClass = 'bg-pink-50/60 border-pink-200 text-pink-900';
        }

        return (
            <div className={`p-4 rounded-xl border flex items-center justify-between ${bgClass}`}>
                <div className="flex items-center gap-3">
                    {icon}
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <span>Connected with {label}</span>
                            <FaCheckCircle className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <div className="font-medium text-sm text-foreground">
                            {form.watch('email') || socialData.email || 'Verified Account'}
                        </div>
                    </div>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white shadow-2xs border text-gray-700">
                    Verified
                </span>
            </div>
        );
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <Card className="max-w-xl mx-auto shadow-md border-gray-200">
                <CardHeader className="text-center space-y-2 pb-4">
                    <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
                    <CardDescription className="text-sm">
                        Just a few details are needed to finalize your Kavengo account and enable instant 1-click checkout.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {notice === 'no_account' && (
                        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                            <FaInfoCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                            <span>
                                No existing Kavengo account was found with this social login. Please complete your phone and delivery address below to finish setting up your account.
                            </span>
                        </div>
                    )}

                    {isSimulated && (
                        <div className="p-3.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start gap-2.5">
                            <FaInfoCircle className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                            <span>
                                <strong>Social Registration Simulation:</strong> Testing social profile completion. Provide your phone and shipping details to complete registration.
                            </span>
                        </div>
                    )}

                    {renderProviderBadge()}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            {/* Full Name */}
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                readOnly
                                                className="bg-gray-50/80 text-gray-600 cursor-not-allowed"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Phone Number with US (+1) default */}
                            <FormField
                                control={form.control}
                                name="phoneNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">
                                            Phone Number <span className="text-xs text-muted-foreground">(Default: US +1 🇺🇸)</span>
                                        </FormLabel>
                                        <FormControl>
                                            <PhoneInput
                                                value={field.value}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                placeholder="555 123 4567"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Address Section */}
                            <div className="pt-2 border-t border-gray-100 space-y-3.5">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900">Delivery Address</h4>
                                    <p className="text-xs text-muted-foreground">Required for shipping your orders within the United States.</p>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="address.street"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium text-gray-700">Street Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Ocean Ave, Apt 4B" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="address.city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-medium text-gray-700">City</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Miami" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address.state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-medium text-gray-700">State / Region</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="FL" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="address.zipCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-medium text-gray-700">ZIP Code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="33101" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address.country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-medium text-gray-700">Country</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="United States" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={submitting || isPending}
                                className="w-full py-5 text-sm font-semibold rounded-lg shadow-sm"
                            >
                                {submitting || isPending ? (
                                    <span className="flex items-center gap-2">
                                        <Spinner className="h-4 w-4" /> Finalizing Account...
                                    </span>
                                ) : (
                                    'Complete Registration & Continue'
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function CompleteProfilePage() {
    return (
        <Suspense
            fallback={
                <div className="container mx-auto py-16 flex justify-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-3.5 h-3.5 rounded-full animate-pulse bg-primary"></div>
                        <div className="w-3.5 h-3.5 rounded-full animate-pulse bg-primary" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3.5 h-3.5 rounded-full animate-pulse bg-primary" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            }
        >
            <CompleteProfileContent />
        </Suspense>
    );
}
