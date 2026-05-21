import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const res = await locals.api.v1.discover.$get();

    if (res.ok) {
        return { data: await res.json() };
    }

    return { data: { randomAlbums: [], randomTracks: [], genrePlaylists: [] } };
};