import { createApi } from '$lib/api';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const token = event.cookies.get('session_token');
    event.locals.user = null;

    event.locals.api = createApi(token);

    const res = await event.locals.api.v1.auth.me.$get();

    if (res.ok) {
        const data = await res.json();
        event.locals.user = {
            id: data.user.id as string,
            username: data.user.username as string
        };
    } else {
        event.cookies.delete('session_token', { path: '/' });
    }

    return resolve(event);
};