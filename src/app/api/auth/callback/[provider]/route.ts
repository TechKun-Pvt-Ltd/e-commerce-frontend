import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

interface RouteContext {
    params: Promise<{ provider: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
    const { provider } = await context.params;
    const url = new URL(req.url);
    const origin = process.env.NEXT_PUBLIC_FRONTEND_URL || url.origin || 'http://localhost:3000';
    const backendUrl = process.env.SERVER_URL || 'http://localhost:8080';
    const callbackUrl = `${origin}/api/auth/callback/${provider}`;

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const oauthError = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    let returnUrl = '/';
    if (state) {
        try {
            const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
            if (decoded.returnUrl) returnUrl = decoded.returnUrl;
        } catch {
            // Keep default returnUrl
        }
    }

    if (oauthError || !code) {
        const errorMsg = errorDescription || oauthError || 'Authentication was cancelled or failed';
        return NextResponse.redirect(
            new URL(`/auth/login?error=${encodeURIComponent(errorMsg)}`, origin)
        );
    }

    const normalizedProvider = provider.toLowerCase();

    try {
        let email = '';
        let fullName = '';
        let providerId = '';
        let avatarUrl: string | undefined = undefined;

        if (normalizedProvider === 'google') {
            const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

            const tokenRes = await axios.post(
                'https://oauth2.googleapis.com/token',
                new URLSearchParams({
                    code,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: callbackUrl,
                    grant_type: 'authorization_code',
                }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            const { access_token } = tokenRes.data;
            const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` },
            });

            const userInfo = userInfoRes.data;
            email = userInfo.email;
            fullName = userInfo.name || userInfo.email.split('@')[0];
            providerId = userInfo.sub;
            avatarUrl = userInfo.picture;
        } else if (normalizedProvider === 'facebook') {
            const clientId = process.env.FACEBOOK_CLIENT_ID || '';
            const clientSecret = process.env.FACEBOOK_CLIENT_SECRET || '';

            const tokenRes = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
                params: {
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: callbackUrl,
                    code,
                },
            });

            const { access_token } = tokenRes.data;
            const userInfoRes = await axios.get('https://graph.facebook.com/me', {
                params: {
                    fields: 'id,name,email,picture.type(large)',
                    access_token,
                },
            });

            const userInfo = userInfoRes.data;
            email = userInfo.email || `${userInfo.id}@facebook.user`;
            fullName = userInfo.name || 'Facebook User';
            providerId = userInfo.id;
            avatarUrl = userInfo.picture?.data?.url;
        } else if (normalizedProvider === 'instagram') {
            const clientId = process.env.INSTAGRAM_CLIENT_ID || '';
            const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET || '';

            const tokenRes = await axios.post(
                'https://api.instagram.com/oauth/access_token',
                new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: 'authorization_code',
                    redirect_uri: callbackUrl,
                    code,
                })
            );

            const { access_token, user_id } = tokenRes.data;
            const userInfoRes = await axios.get('https://graph.instagram.com/me', {
                params: {
                    fields: 'id,username',
                    access_token,
                },
            });

            const userInfo = userInfoRes.data;
            email = `${userInfo.username || user_id}@instagram.user`;
            fullName = userInfo.username || 'Instagram User';
            providerId = String(user_id || userInfo.id);
        } else {
            return NextResponse.redirect(
                new URL('/auth/login?error=unsupported_provider', origin)
            );
        }

        if (!email) {
            return NextResponse.redirect(
                new URL('/auth/login?error=email_not_provided_by_provider', origin)
            );
        }

        // Call backend social login endpoint
        const backendRes = await axios.post(
            `${backendUrl}/auth/social-login`,
            {
                provider: normalizedProvider,
                email,
                fullName,
                providerId,
                avatarUrl,
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000,
            }
        );

        const authData = backendRes.data;
        const targetRedirect = returnUrl.startsWith('http')
            ? returnUrl
            : new URL(returnUrl, origin).toString();

        const response = NextResponse.redirect(targetRedirect);
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

        cookieStore.delete('oauth_state');
        return response;
    } catch (err: unknown) {
        console.error('Social login callback error:', err);
        const errMsg = axios.isAxiosError(err)
            ? err.response?.data?.message || err.message
            : 'Social authentication failed';
        return NextResponse.redirect(
            new URL(`/auth/login?error=${encodeURIComponent(errMsg)}`, origin)
        );
    }
}
