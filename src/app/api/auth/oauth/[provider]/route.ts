import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

interface RouteContext {
    params: Promise<{ provider: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
    const { provider } = await context.params;
    const url = new URL(req.url);
    const returnUrl = url.searchParams.get('returnUrl') || '/';
    const origin = process.env.NEXT_PUBLIC_FRONTEND_URL || url.origin || 'http://localhost:3000';
    const callbackUrl = `${origin}/api/auth/callback/${provider}`;

    const normalizedProvider = provider.toLowerCase();

    // Check configuration
    let clientId = '';
    let authUrl = '';

    const statePayload = JSON.stringify({
        nonce: crypto.randomBytes(16).toString('hex'),
        returnUrl,
    });
    const state = Buffer.from(statePayload).toString('base64url');

    if (normalizedProvider === 'google') {
        clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
        if (!clientId) {
            return NextResponse.redirect(
                new URL(`/auth/login?error=oauth_not_configured&provider=Google`, origin)
            );
        }
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: callbackUrl,
            response_type: 'code',
            scope: 'openid email profile',
            state,
            access_type: 'offline',
            prompt: 'select_account',
        });
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    } else if (normalizedProvider === 'facebook') {
        clientId = process.env.FACEBOOK_CLIENT_ID || '';
        if (!clientId) {
            return NextResponse.redirect(
                new URL(`/auth/login?error=oauth_not_configured&provider=Facebook`, origin)
            );
        }
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: callbackUrl,
            scope: 'email,public_profile',
            state,
            response_type: 'code',
        });
        authUrl = `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
    } else if (normalizedProvider === 'instagram') {
        clientId = process.env.INSTAGRAM_CLIENT_ID || '';
        if (!clientId) {
            return NextResponse.redirect(
                new URL(`/auth/login?error=oauth_not_configured&provider=Instagram`, origin)
            );
        }
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: callbackUrl,
            scope: 'user_profile',
            response_type: 'code',
            state,
        });
        authUrl = `https://api.instagram.com/oauth/authorize?${params.toString()}`;
    } else {
        return NextResponse.redirect(new URL('/auth/login?error=invalid_provider', origin));
    }

    const response = NextResponse.redirect(authUrl);
    const cookieStore = await cookies();
    cookieStore.set({
        name: 'oauth_state',
        value: state,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 10, // 10 minutes
        path: '/',
    });

    return response;
}
