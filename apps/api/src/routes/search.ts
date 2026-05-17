import { Hono } from 'hono';
import { db, tracks, albums, artists } from '@repo/shared';
import { ilike, or, eq, sql, inArray, desc } from 'drizzle-orm';

export const searchRouter = new Hono()
    .get('/', async (c) => {
        const q = c.req.query('q')?.trim() || '';

        if (!q) {
            return c.json({ topResult: null, tracks: [], albums: [], artists: [] });
        }

        const searchPattern = `%${q}%`;
        const apiUrl = process.env.PUBLIC_API_URL || 'http://localhost:3000';

        // Scoring system
        const matchScore = (col: any) => sql`CASE WHEN ${col} ILIKE ${q} THEN 0 WHEN ${col} ILIKE ${q + '%'} THEN 1 ELSE 2 END`;

        // Searching for track, albums, artists
        let foundTracks = await db.select({
            id: tracks.id, title: tracks.title, duration: tracks.duration,
            artistName: artists.name, albumTitle: albums.title,
            coverUrl: sql<string>`
                CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl}
                ELSE ${apiUrl} || '/v1/tracks/' || ${tracks.id} || '/cover' END`.as('coverUrl'),
            albumId: albums.id, artistId: artists.id, playCount: tracks.playCount
        })
            .from(tracks).leftJoin(albums, eq(tracks.albumId, albums.id)).leftJoin(artists, eq(albums.artistId, artists.id))
            .where(or(ilike(tracks.title, searchPattern), ilike(artists.name, searchPattern)))
            .orderBy(matchScore(tracks.title), desc(tracks.playCount))
            .limit(6);

        let foundAlbums = await db.select({
            id: albums.id, title: albums.title, year: albums.year, artistName: artists.name, artistId: artists.id,
            coverUrl: sql<string>`
                CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl}
                ELSE ${apiUrl} || '/v1/tracks/' || (SELECT id FROM tracks WHERE album_id = albums.id LIMIT 1) || '/cover' END`.as('coverUrl'),
        })
            .from(albums).leftJoin(artists, eq(albums.artistId, artists.id))
            .where(or(ilike(albums.title, searchPattern), ilike(artists.name, searchPattern)))
            .orderBy(matchScore(albums.title))
            .limit(6);

        let foundArtists = await db.select().from(artists)
            .where(ilike(artists.name, searchPattern))
            .orderBy(matchScore(artists.name))
            .limit(6);

        // Best match
        let topResult = null;
        const qLower = q.toLowerCase();

        const exactArtist = foundArtists.find(a => a.name.toLowerCase() === qLower);
        const exactTrack = foundTracks.find(t => t.title.toLowerCase() === qLower);
        const exactAlbum = foundAlbums.find(a => a.title.toLowerCase() === qLower);
        const startsArtist = foundArtists.find(a => a.name.toLowerCase().startsWith(qLower));
        const startsTrack = foundTracks.find(t => t.title.toLowerCase().startsWith(qLower));
        const startsAlbum = foundAlbums.find(a => a.title.toLowerCase().startsWith(qLower));

        if (exactTrack) topResult = { type: 'track', data: exactTrack };
        else if (exactAlbum) topResult = { type: 'album', data: exactAlbum };
        else if (exactArtist) topResult = { type: 'artist', data: exactArtist };
        else if (startsTrack) topResult = { type: 'track', data: startsTrack };
        else if (startsAlbum) topResult = { type: 'album', data: startsAlbum };
        else if (startsArtist) topResult = { type: 'artist', data: startsArtist };
        else if (foundTracks.length > 0) topResult = { type: 'track', data: foundTracks[0] };
        else if (foundArtists.length > 0) topResult = { type: 'artist', data: foundArtists[0] };
        else if (foundAlbums.length > 0) topResult = { type: 'album', data: foundAlbums[0] };

        // Find more items
        const artistIds = new Set<string>();
        foundArtists.forEach(a => artistIds.add(a.id));
        foundTracks.forEach(t => t.artistId && artistIds.add(t.artistId));
        foundAlbums.forEach(a => a.artistId && artistIds.add(a.artistId));

        if (artistIds.size > 0) {
            // Fetch missing artists
            const currentArtistIds = new Set(foundArtists.map(a => a.id));
            const missingIds = Array.from(artistIds).filter(id => !currentArtistIds.has(id));

            if (missingIds.length > 0) {
                const extraArtists = await db.select().from(artists).where(inArray(artists.id, missingIds)).limit(6);
                foundArtists = [...foundArtists, ...extraArtists].slice(0, 6);
            }

            // Fetch other albums
            const extraAlbums = await db.select({
                id: albums.id, title: albums.title, year: albums.year, artistName: artists.name, artistId: artists.id,
                coverUrl: sql<string>`
                CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl}
                ELSE ${apiUrl} || '/v1/tracks/' || (SELECT id FROM tracks WHERE album_id = albums.id LIMIT 1) || '/cover' END`.as('coverUrl'),
            }).from(albums).leftJoin(artists, eq(albums.artistId, artists.id))
                .where(inArray(albums.artistId, Array.from(artistIds)))
                .limit(10);

            // Merge with no duplicates
            const mergedAlbums = [...foundAlbums];
            for (const ea of extraAlbums) {
                if (!mergedAlbums.find(a => a.id === ea.id)) mergedAlbums.push(ea);
            }
            foundAlbums = mergedAlbums.slice(0, 6);
        }

        return c.json({ topResult, tracks: foundTracks.slice(0, 5), albums: foundAlbums, artists: foundArtists });
    });