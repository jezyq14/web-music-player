import { Hono } from 'hono';
import { db, tracks, albums, artists } from '@repo/shared';
import { ilike, or, eq, sql, inArray, desc } from 'drizzle-orm';
import { apiUrl } from '..';

export const searchRouter = new Hono()
    .get('/', async (c) => {
        const q = c.req.query('q')?.trim() || '';
        if (!q) return c.json({ topResult: null, tracks: [], albums: [], artists: [] });

        const searchPattern = `%${q}%`;

        const matchScore = (col: any) => sql`CASE WHEN ${col} ILIKE ${q} THEN 0 WHEN ${col} ILIKE ${q + '%'} THEN 1 ELSE 2 END`;

        let directTracks = await db.select({
            id: tracks.id, title: tracks.title, duration: tracks.duration, artistName: artists.name, albumTitle: albums.title,
            coverUrl: sql<string>`CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl} ELSE ${apiUrl} || '/v1/tracks/' || ${tracks.id} || '/cover' END`.as('coverUrl'),
            albumId: albums.id, artistId: artists.id, playCount: tracks.playCount
        })
            .from(tracks).leftJoin(albums, eq(tracks.albumId, albums.id)).leftJoin(artists, eq(albums.artistId, artists.id))
            .where(or(ilike(tracks.title, searchPattern), ilike(artists.name, searchPattern)))
            .orderBy(matchScore(tracks.title), desc(tracks.playCount))
            .limit(10);

        let directAlbums = await db.select({
            id: albums.id, title: albums.title, year: albums.year, artistName: artists.name, artistId: artists.id,
            coverUrl: sql<string>`CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl} ELSE ${apiUrl} || '/v1/tracks/' || (SELECT id FROM tracks WHERE album_id = albums.id LIMIT 1) || '/cover' END`.as('coverUrl'),
        })
            .from(albums).leftJoin(artists, eq(albums.artistId, artists.id))
            .where(or(ilike(albums.title, searchPattern), ilike(artists.name, searchPattern)))
            .orderBy(matchScore(albums.title))
            .limit(10);

        let directArtists = await db.select().from(artists)
            .where(ilike(artists.name, searchPattern))
            .orderBy(matchScore(artists.name))
            .limit(10);

        let topResult = null;
        const qLower = q.toLowerCase();

        const getTopMatch = () => {
            const exactArtist = directArtists.find(a => a.name.toLowerCase() === qLower);
            if (exactArtist) return { type: 'artist', data: exactArtist };
            const exactTrack = directTracks.find(t => t.title.toLowerCase() === qLower);
            if (exactTrack) return { type: 'track', data: exactTrack };
            const exactAlbum = directAlbums.find(a => a.title.toLowerCase() === qLower);
            if (exactAlbum) return { type: 'album', data: exactAlbum };

            const startsArtist = directArtists.find(a => a.name.toLowerCase().startsWith(qLower));
            if (startsArtist) return { type: 'artist', data: startsArtist };
            const startsTrack = directTracks.find(t => t.title.toLowerCase().startsWith(qLower));
            if (startsTrack) return { type: 'track', data: startsTrack };
            const startsAlbum = directAlbums.find(a => a.title.toLowerCase().startsWith(qLower));
            if (startsAlbum) return { type: 'album', data: startsAlbum };

            if (directTracks.length > 0) return { type: 'track', data: directTracks[0] };
            if (directArtists.length > 0) return { type: 'artist', data: directArtists[0] };
            if (directAlbums.length > 0) return { type: 'album', data: directAlbums[0] };
            return null;
        };
        topResult = getTopMatch();

        const artistIds = new Set<string>(directArtists.map(a => a.id));
        directTracks.forEach(t => t.artistId && artistIds.add(t.artistId));
        directAlbums.forEach(a => a.artistId && artistIds.add(a.artistId));

        let finalArtists = [...directArtists];
        let finalAlbums = [...directAlbums];

        if (artistIds.size > 0) {
            const existingArtistIds = new Set(finalArtists.map(a => a.id));
            const missingArtists = Array.from(artistIds).filter(id => !existingArtistIds.has(id));
            if (missingArtists.length > 0) {
                const extraArtists = await db.select().from(artists).where(inArray(artists.id, missingArtists)).limit(6);
                finalArtists.push(...extraArtists);
            }

            const extraAlbums = await db.select({
                id: albums.id, title: albums.title, year: albums.year, artistName: artists.name, artistId: artists.id,
                coverUrl: sql<string>`CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl} ELSE ${apiUrl} || '/v1/tracks/' || (SELECT id FROM tracks WHERE album_id = albums.id LIMIT 1) || '/cover' END`.as('coverUrl'),
            }).from(albums).leftJoin(artists, eq(albums.artistId, artists.id))
                .where(inArray(albums.artistId, Array.from(artistIds))).limit(12);

            const existingAlbumIds = new Set(finalAlbums.map(a => a.id));
            for (const ea of extraAlbums) {
                if (!existingAlbumIds.has(ea.id)) {
                    finalAlbums.push(ea);
                    existingAlbumIds.add(ea.id);
                }
            }
        }

        return c.json({
            topResult,
            tracks: directTracks.slice(0, 5),
            albums: finalAlbums.slice(0, 6),
            artists: finalArtists.slice(0, 6)
        });
    });