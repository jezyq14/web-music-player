import { hc } from 'hono/client';
import type { AppType } from '@repo/api';
import { PUBLIC_API_URL } from '$env/static/public';

const baseUrl = PUBLIC_API_URL || 'http://localhost:3000';

export const api = hc<AppType>(baseUrl);

export const createApi = (sessionToken?: string) => {
    return hc<AppType>(baseUrl, {
        headers: {
            ...(sessionToken ? { Cookie: `auth_session=${sessionToken}` } : {}),
        },
    });
};