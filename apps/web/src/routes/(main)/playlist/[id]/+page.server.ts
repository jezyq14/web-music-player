import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
    const res = await locals.api.v1.playlists[':id'].$get({ param: { id: params.id } });

    if (!res.ok) {
        error(404, 'Nie znaleziono playlisty');
    }

    return { playlist: await res.json() };
};