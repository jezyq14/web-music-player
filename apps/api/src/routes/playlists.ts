import { Hono } from 'hono';
import { db, playlists, playlistTracks, tracks, albums, artists } from '@repo/shared';
import { eq, sql, asc } from 'drizzle-orm';
import { apiUrl } from '..';

export const playlistsRouter = new Hono()
    .get('/:id', async (c) => {
        const id = c.req.param('id');

        if (id.startsWith('genre-')) {
            const genreName = decodeURIComponent(id.replace('genre-', ''));

            const pTracks = await db.select({
                id: tracks.id, title: tracks.title, duration: tracks.duration, number: tracks.number, discNumber: tracks.discNumber, playCount: tracks.playCount,
                artistName: artists.name, albumTitle: albums.title, artistId: artists.id, albumId: albums.id,
                coverUrl: sql<string>`CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl} ELSE ${apiUrl} || '/v1/tracks/' || ${tracks.id} || '/cover' END`.as('coverUrl')
            })
                .from(tracks).leftJoin(albums, eq(tracks.albumId, albums.id)).leftJoin(artists, eq(albums.artistId, artists.id))
                .where(eq(tracks.genre, genreName))
                .orderBy(sql`RANDOM()`)
                .limit(30);

            if (!pTracks.length) return c.json({ error: 'Nie znaleziono utworów w tym gatunku' }, 404);

            return c.json({
                id: id,
                name: genreName,
                description: `Skomponowana automatycznie playlista bazująca na gatunku: ${genreName}.`,
                isAiGenerated: true,
                coverUrl: pTracks[0].coverUrl,
                tracks: pTracks
            });
        }

        const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
        if (!playlist) return c.json({ error: 'Nie znaleziono playlisty' }, 404);

        const pTracks = await db.select({
            id: tracks.id, title: tracks.title, duration: tracks.duration, number: tracks.number, discNumber: tracks.discNumber, playCount: tracks.playCount,
            artistName: artists.name, albumTitle: albums.title, artistId: artists.id, albumId: albums.id,
            coverUrl: sql<string>`CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl} ELSE ${apiUrl} || '/v1/tracks/' || ${tracks.id} || '/cover' END`.as('coverUrl')
        })
            .from(playlistTracks)
            .innerJoin(tracks, eq(playlistTracks.trackId, tracks.id))
            .leftJoin(albums, eq(tracks.albumId, albums.id))
            .leftJoin(artists, eq(albums.artistId, artists.id))
            .where(eq(playlistTracks.playlistId, id))
            .orderBy(asc(playlistTracks.order));

        return c.json({
            ...playlist,
            coverUrl: pTracks.length > 0 ? pTracks[0].coverUrl : '/placeholder.jpg',
            tracks: pTracks
        });
    });