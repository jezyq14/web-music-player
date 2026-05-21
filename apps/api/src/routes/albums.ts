import { Hono } from 'hono';
import { db, albums, tracks, artists } from '@repo/shared';
import { asc, eq, sql } from 'drizzle-orm';
import { apiUrl } from '..';

export const albumsRouter = new Hono()
    .get('/by-artist/:artistId', async (c) => {
        const artistId = c.req.param('artistId');

        const data = await db.select({
            id: albums.id, title: albums.title, year: albums.year,
            artistName: artists.name, artistId: artists.id,
            coverUrl: sql<string>`CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl} ELSE ${apiUrl} || '/v1/tracks/' || (SELECT id FROM tracks WHERE album_id = albums.id LIMIT 1) || '/cover' END`.as('coverUrl'),
        })
            .from(albums).leftJoin(artists, eq(albums.artistId, artists.id))
            .where(eq(albums.artistId, artistId)).orderBy(asc(albums.year));

        return c.json(data);
    })
    .get('/:id', async (c) => {
        const id = c.req.param('id');

        const [albumData] = await db.select({
            id: albums.id, title: albums.title, year: albums.year,
            artistName: artists.name, artistId: artists.id,
            coverUrl: sql<string>`CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl} ELSE ${apiUrl} || '/v1/tracks/' || (SELECT id FROM tracks WHERE album_id = albums.id LIMIT 1) || '/cover' END`.as('coverUrl'),
        })
            .from(albums).leftJoin(artists, eq(albums.artistId, artists.id))
            .where(eq(albums.id, id));

        if (!albumData) return c.json({ error: 'Album not found' }, 404);

        const albumTracks = await db.select({
            id: tracks.id, title: tracks.title, number: tracks.number, discNumber: tracks.discNumber,
            duration: tracks.duration, playCount: tracks.playCount,
            artistName: artists.name, artistId: artists.id, albumTitle: albums.title, albumId: albums.id,
            coverUrl: sql<string>`CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl} ELSE ${apiUrl} || '/v1/tracks/' || ${tracks.id} || '/cover' END`.as('coverUrl'),
        })
            .from(tracks).leftJoin(albums, eq(tracks.albumId, albums.id)).leftJoin(artists, eq(albums.artistId, artists.id))
            .where(eq(tracks.albumId, id))
            .orderBy(asc(tracks.discNumber), asc(tracks.number));

        return c.json({ ...albumData, tracks: albumTracks });
    });