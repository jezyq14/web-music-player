import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, locals }) => {
    const token = cookies.get('session_token');
    if (!token) throw redirect(303, '/login');

    const res = await locals.api.v1.favorites.tracks.$get();

    return { tracks: res.ok ? await res.json() : [] };
};