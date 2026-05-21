import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const res = await locals.api.v1.feed.$get();

    if (res.ok) {
        return { feed: await res.json() };
    }

    return { feed: { recommendedAlbums: [], popularArtists: [], discoverTracks: [] } };
};