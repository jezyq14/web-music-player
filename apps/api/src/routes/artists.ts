import { Hono } from 'hono';
import { db, artists, tracks, albums } from '@repo/shared';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { apiUrl } from '..';

export const artistsRouter = new Hono()
    .get('/', async (c) => {
        const data = await db.select().from(artists).orderBy(asc(artists.name));
        return c.json(data);
    })
    .get('/:id', async (c) => {
        const id = c.req.param('id');
        const [artist] = await db.select().from(artists).where(eq(artists.id, id));
        if (!artist) return c.json({ error: 'Not found' }, 404);
        return c.json(artist);
    })
    .get('/:id/top-tracks', async (c) => {
        const id = c.req.param('id');

        const topTracks = await db.select({
            id: tracks.id, title: tracks.title, number: tracks.number, discNumber: tracks.discNumber,
            duration: tracks.duration, playCount: tracks.playCount,
            artistName: artists.name, artistId: artists.id, albumTitle: albums.title, albumId: albums.id,
            coverUrl: sql<string>`CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl} ELSE ${apiUrl} || '/v1/tracks/' || ${tracks.id} || '/cover' END`.as('coverUrl'),
        })
            .from(tracks).leftJoin(albums, eq(tracks.albumId, albums.id)).leftJoin(artists, eq(albums.artistId, artists.id))
            .where(eq(albums.artistId, id))
            .orderBy(desc(tracks.playCount), asc(tracks.title))
            .limit(5);

        return c.json(topTracks);
    });