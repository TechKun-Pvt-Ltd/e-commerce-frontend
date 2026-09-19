import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            provider,
            providerId,
            email,
            fullName,
            avatarUrl,
            phoneNo,
            address,
            returnUrl = '/',
        } = body;

        if (!email || !provider) {
            return NextResponse.json(
                { success: false, message: 'Email and provider are required.' },
                { status: 400 }
            );
        }

        if (!phoneNo || phoneNo.trim().length < 7) {
            return NextResponse.json(
                { success: false, message: 'A valid phone number is required.' },
                { status: 400 }
            );
        }

        const backendUrl = process.env.SERVER_URL || 'http://localhost:8080';

        const backendRes = await axios.post(
            `${backendUrl}/auth/social-login`,
            {
                provider: provider.toLowerCase(),
                providerId: providerId || email,
                email: email.toLowerCase().trim(),
                fullName: fullName || email.split('@')[0],
                avatarUrl: avatarUrl || undefined,
                phoneNo: phoneNo.trim(),
                address: address
                    ? {
                          street: address.street || '',
                          city: address.city || '',
                          state: address.state || '',
                          pincode: address.zipCode || address.pincode || '',
                          country: address.country || 'United States',
                      }
                    : undefined,
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000,
            }
        );

        const authData = backendRes.data;
        const cookieStore = await cookies();

        const maxAge = authData.expiresAt
            ? Math.max(0, Math.floor((authData.expiresAt - Date.now()) / 1000))
            : 60 * 60 * 24 * 7;

        cookieStore.set({
            name: 'token',
            value: authData.token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge,
            path: '/',
        });

        if (authData.refreshToken) {
            cookieStore.set({
                name: 'refresh_token',
                value: authData.refreshToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
            });
        }

        if (authData.user?.roleName) {
            cookieStore.set({
                name: 'user_role',
                value: authData.user.roleName,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge,
                path: '/',
            });
        }

        cookieStore.delete('social_onboarding');
        cookieStore.delete('oauth_state');

        return NextResponse.json({
            success: true,
            redirectUrl: returnUrl,
            user: authData.user,
        });
    } catch (err: unknown) {
        console.error('Complete social registration error:', err);
        const errMsg = axios.isAxiosError(err)
            ? err.response?.data?.message || err.message
            : 'Registration completion failed';
        return NextResponse.json(
            { success: false, message: errMsg },
            { status: 500 }
        );
    }
}
