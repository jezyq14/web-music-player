import { Hono } from 'hono';
import { db, tracks, albums, artists } from '@repo/shared';
import { eq, sql, desc } from 'drizzle-orm';
import { apiUrl } from '..';

export const feedRouter = new Hono()
    .get('/', async (c) => {

        const recommendedAlbums = await db.select({
            id: albums.id, title: albums.title, year: albums.year, artistName: artists.name,
            coverUrl: sql<string>`CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl} ELSE ${apiUrl} || '/v1/tracks/' || (SELECT id FROM tracks WHERE album_id = albums.id LIMIT 1) || '/cover' END`.as('coverUrl')
        })
            .from(albums).leftJoin(artists, eq(albums.artistId, artists.id))
            .orderBy(sql`RANDOM()`).limit(4);

        const popularArtists = await db.select().from(artists).orderBy(sql`RANDOM()`).limit(4);

        const discoverTracks = await db.select({
            id: tracks.id, title: tracks.title, duration: tracks.duration,
            number: tracks.number, discNumber: tracks.discNumber,
            artistName: artists.name, albumTitle: albums.title, artistId: artists.id, albumId: albums.id,
            coverUrl: sql<string>`CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl} ELSE ${apiUrl} || '/v1/tracks/' || ${tracks.id} || '/cover' END`.as('coverUrl')
        })
            .from(tracks).leftJoin(albums, eq(tracks.albumId, albums.id)).leftJoin(artists, eq(albums.artistId, artists.id))
            .orderBy(desc(tracks.playCount)).limit(5);

        return c.json({ recommendedAlbums, popularArtists, discoverTracks });
    });