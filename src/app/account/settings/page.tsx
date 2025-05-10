'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useDataFetch from '@/hooks/use-data-fetch';
import { changePassword, deleteAccount } from '@/services/auth';
import { RootState } from '@/store/store';
import type { UserUpdatePayload } from '@/types/domains/user';

const profileSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    phoneNo: z.string().min(10, 'Phone number must be at least 10 characters'),
    address: z.object({
        street: z.string().min(1, 'Street is required'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        country: z.string().min(1, 'Country is required'),
        zipCode: z.string().min(1, 'Zip code is required')
    })
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

const deleteAccountSchema = z.object({
    password: z.string().min(1, 'Password is required')
});

export default function AccountSettingsPage() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);
    const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'delete'>('profile');

    const { request: changePasswordRequest, isLoading: isChangingPassword } = useDataFetch(changePassword);
    const { request: deleteAccountRequest, isLoading: isDeletingAccount } = useDataFetch(deleteAccount, {
        onResponseReceived: () => {
            router.push('/auth/login');
        }
    });

    const profileForm = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: user?.fullName || '',
            phoneNo: user?.phoneNo || '',
            address: {
                street: user?.address?.street || '',
                city: user?.address?.city || '',
                state: user?.address?.state || '',
                country: user?.address?.country || '',
                zipCode: user?.address?.zipCode || ''
            }
        }
    });

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: ''
        }
    });

    const deleteForm = useForm<z.infer<typeof deleteAccountSchema>>({
        resolver: zodResolver(deleteAccountSchema),
        defaultValues: {
            password: ''
        }
    });

    const onUpdateProfile = async (values: z.infer<typeof profileSchema>) => {
        try {
            const payload: UserUpdatePayload = {
                fullName: values.fullName,
                address: {
                    ...values.address,
                    addressId: user?.address?.addressId || 0
                }
            };
            // TODO: Implement update profile service
            console.log('Update profile:', payload);
        } catch (error) {
            profileForm.setError('root', {
                type: 'manual',
                message: 'Failed to update profile. Please try again.'
            });
        }
    };

    const onChangePassword = async (values: z.infer<typeof passwordSchema>) => {
        try {
            await changePasswordRequest(values);
            passwordForm.reset();
            setActiveSection('profile');
        } catch (error) {
            passwordForm.setError('root', {
                type: 'manual',
                message: 'Failed to change password. Please try again.'
            });
        }
    };

    const onDeleteAccount = async (values: z.infer<typeof deleteAccountSchema>) => {
        try {
            await deleteAccountRequest(values);
        } catch (error) {
            deleteForm.setError('root', {
                type: 'manual',
                message: 'Failed to delete account. Please try again.'
            });
        }
    };

    return (
        <div className="container mx-auto py-10">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex space-x-4 mb-6">
                    <Button
                        variant={activeSection === 'profile' ? 'default' : 'ghost'}
                        onClick={() => setActiveSection('profile')}
                    >
                        Profile Settings
                    </Button>
                    <Button
                        variant={activeSection === 'password' ? 'default' : 'ghost'}
                        onClick={() => setActiveSection('password')}
                    >
                        Change Password
                    </Button>
                    <Button
                        variant={activeSection === 'delete' ? 'destructive' : 'ghost'}
                        onClick={() => setActiveSection('delete')}
                    >
                        Delete Account
                    </Button>
                </div>

                {activeSection === 'profile' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Settings</CardTitle>
                            <CardDescription>Update your personal information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...profileForm}>
                                <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                                    <FormField
                                        control={profileForm.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={profileForm.control}
                                        name="phoneNo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+1234567890" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Address</h3>
                                        <FormField
                                            control={profileForm.control}
                                            name="address.street"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Street</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="123 Main St" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={profileForm.control}
                                                name="address.city"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>City</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="New York" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="address.state"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>State</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="NY" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={profileForm.control}
                                                name="address.country"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Country</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="United States" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="address.zipCode"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Zip Code</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="10001" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {profileForm.formState.errors.root && (
                                        <div className="text-sm font-medium text-destructive">
                                            {profileForm.formState.errors.root.message}
                                        </div>
                                    )}

                                    <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                                        {profileForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                )}

                {activeSection === 'password' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your account password</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                                    <FormField
                                        control={passwordForm.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="********" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={passwordForm.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="********" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {passwordForm.formState.errors.root && (
                                        <div className="text-sm font-medium text-destructive">
                                            {passwordForm.formState.errors.root.message}
                                        </div>
                                    )}

                                    <Button type="submit" disabled={isChangingPassword}>
                                        {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                )}

                {activeSection === 'delete' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Delete Account</CardTitle>
                            <CardDescription className="text-destructive">
                                Warning: This action cannot be undone. Your account will be permanently deleted.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...deleteForm}>
                                <form onSubmit={deleteForm.handleSubmit(onDeleteAccount)} className="space-y-4">
                                    <FormField
                                        control={deleteForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="********" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {deleteForm.formState.errors.root && (
                                        <div className="text-sm font-medium text-destructive">
                                            {deleteForm.formState.errors.root.message}
                                        </div>
                                    )}

                                    <Button type="submit" variant="destructive" disabled={isDeletingAccount}>
                                        {isDeletingAccount ? 'Deleting Account...' : 'Delete Account'}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}