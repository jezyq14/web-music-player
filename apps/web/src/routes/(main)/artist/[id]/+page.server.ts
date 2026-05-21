import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
    const [artRes, trkRes, albRes] = await Promise.all([
        locals.api.v1.artists[':id'].$get({ param: { id: params.id } }),
        locals.api.v1.artists[':id']['top-tracks'].$get({ param: { id: params.id } }),
        locals.api.v1.albums['by-artist'][':artistId'].$get({ param: { artistId: params.id } })
    ]);

    if (!artRes.ok) error(404, 'Nie znaleziono wykonawcy');

    return {
        artist: await artRes.json(),
        topTracks: await trkRes.json(),
        albums: await albRes.json()
    };
};