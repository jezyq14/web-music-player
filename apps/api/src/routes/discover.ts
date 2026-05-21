import { Hono } from 'hono';
import { db, tracks, albums, artists } from '@repo/shared';
import { eq, sql, isNotNull, and, ne } from 'drizzle-orm';
import { apiUrl } from '..';

export const discoverRouter = new Hono()
    .get('/', async (c) => {

        const randomAlbums = await db.select({
            id: albums.id, title: albums.title, year: albums.year, artistName: artists.name,
            coverUrl: sql<string>`CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl} ELSE ${apiUrl} || '/v1/tracks/' || (SELECT id FROM tracks WHERE album_id = albums.id LIMIT 1) || '/cover' END`.as('coverUrl')
        })
            .from(albums).leftJoin(artists, eq(albums.artistId, artists.id))
            .orderBy(sql`RANDOM()`).limit(8);

        const randomTracks = await db.select({
            id: tracks.id, title: tracks.title, duration: tracks.duration,
            artistName: artists.name, albumTitle: albums.title, artistId: artists.id, albumId: albums.id,
            coverUrl: sql<string>`CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl} ELSE ${apiUrl} || '/v1/tracks/' || ${tracks.id} || '/cover' END`.as('coverUrl')
        })
            .from(tracks).leftJoin(albums, eq(tracks.albumId, albums.id)).leftJoin(artists, eq(albums.artistId, artists.id))
            .orderBy(sql`RANDOM()`).limit(6);

        const allGenres = await db.selectDistinct({ genre: tracks.genre })
            .from(tracks)
            .where(and(isNotNull(tracks.genre), ne(tracks.genre, 'Unknown')));

        for (let i = allGenres.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allGenres[i], allGenres[j]] = [allGenres[j], allGenres[i]];
        }
        const topGenres = allGenres.slice(0, 6);

        const genrePlaylists = await Promise.all(topGenres.map(async (g) => {
            const gTracks = await db.select({
                id: tracks.id, title: tracks.title, duration: tracks.duration,
                artistName: artists.name, albumTitle: albums.title, artistId: artists.id, albumId: albums.id,
                coverUrl: sql<string>`CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl} ELSE ${apiUrl} || '/v1/tracks/' || ${tracks.id} || '/cover' END`.as('coverUrl')
            })
                .from(tracks).leftJoin(albums, eq(tracks.albumId, albums.id)).leftJoin(artists, eq(albums.artistId, artists.id))
                .where(eq(tracks.genre, g.genre!))
                .orderBy(sql`RANDOM()`)
                .limit(15);

            return { genre: g.genre, tracks: gTracks };
        }));

        return c.json({ randomAlbums, randomTracks, genrePlaylists });
    });