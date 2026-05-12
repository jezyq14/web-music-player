import { Hono } from 'hono';
import { db, albums, tracks } from '@repo/shared';
import { asc, eq } from 'drizzle-orm';

export const albumsRouter = new Hono()
    // GET /v1/albums/by-artist/:artistId
    .get('/by-artist/:artistId', async (c) => {
        const artistId = c.req.param('artistId');
        const data = await db.select()
            .from(albums)
            .where(eq(albums.artistId, artistId))
            .orderBy(asc(albums.year));
        return c.json(data);
    })
    // GET /v1/albums/:id/tracks
    .get('/:id/tracks', async (c) => {
        const id = c.req.param('id');
        const data = await db.select()
            .from(tracks)
            .where(eq(tracks.albumId, id))
            .orderBy(asc(tracks.discNumber), asc(tracks.number));
        return c.json(data);
    });