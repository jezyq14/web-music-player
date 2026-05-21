import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request, cookies, locals }) => {
        const data = await request.formData();
        const username = data.get('username');
        const password = data.get('password');

        if (!username || !password) {
            return fail(400, { error: 'Wypełnij wszystkie pola' });
        }

        const res = await locals.api.v1.auth.login.$post({
            json: { username, password }
        });

        if (!res.ok) {
            const err = await res.json();
            return fail(400, { error: (err as any).error || 'Błąd logowania' });
        }

        const { token } = await res.json();

        cookies.set('session_token', token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30
        });

        redirect(303, '/');
    }
};