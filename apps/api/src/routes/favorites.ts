import { Hono } from 'hono';
import { db, userFavoriteTracks, userFavoriteAlbums, userFavoriteArtists, tracks, albums, artists } from '@repo/shared';
import { eq, and, sql, desc } from 'drizzle-orm';
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import type { Context, Next } from 'hono';

import { apiUrl, type Variables } from '../index';

const JWT_SECRET = process.env.JWT_SECRET || 'super-tajne-haslo-123';

const authMiddleware = async (c: Context, next: Next) => {
    let token: string | undefined;

    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        token = getCookie(c, 'session_token');
    }

    if (!token) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
        const payload = await verify(token, JWT_SECRET, {
            alg: 'HS256'
        });
        c.set('user', payload);
        await next();
    } catch {
        return c.json({ error: 'Invalid token' }, 401);
    }
};

export const favoritesRouter = new Hono<{ Variables: Variables }>()
    .use('*', authMiddleware)
    // GET /v1/favorites
    .get('/', async (c) => {
        const user = c.get('user');

        const fTracks = await db.select({ trackId: userFavoriteTracks.trackId })
            .from(userFavoriteTracks).where(eq(userFavoriteTracks.userId, user.id));

        const fAlbums = await db.select({
            id: albums.id, title: albums.title,
            coverUrl: sql<string>`CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl} ELSE ${apiUrl} || '/v1/tracks/' || (SELECT id FROM tracks WHERE album_id = albums.id LIMIT 1) || '/cover' END`.as('coverUrl')
        }).from(userFavoriteAlbums).innerJoin(albums, eq(userFavoriteAlbums.albumId, albums.id))
            .where(eq(userFavoriteAlbums.userId, user.id)).orderBy(desc(userFavoriteAlbums.createdAt));

        const fArtists = await db.select({
            id: artists.id, name: artists.name, imageUrl: artists.imageUrl
        }).from(userFavoriteArtists).innerJoin(artists, eq(userFavoriteArtists.artistId, artists.id))
            .where(eq(userFavoriteArtists.userId, user.id)).orderBy(desc(userFavoriteArtists.createdAt));

        return c.json({ tracks: fTracks.map(t => t.trackId), albums: fAlbums, artists: fArtists });
    })
    // GET /v1/favorites/tracks
    .get('/tracks', async (c) => {
        const user = c.get('user');

        const favTracks = await db.select({
            id: tracks.id, title: tracks.title, duration: tracks.duration, number: tracks.number, discNumber: tracks.discNumber, playCount: tracks.playCount,
            artistName: artists.name, albumTitle: albums.title, artistId: artists.id, albumId: albums.id,
            coverUrl: sql<string>`CASE WHEN ${albums.coverUrl} LIKE 'http%' THEN ${albums.coverUrl} ELSE ${apiUrl} || '/v1/tracks/' || ${tracks.id} || '/cover' END`.as('coverUrl')
        })
            .from(userFavoriteTracks).innerJoin(tracks, eq(userFavoriteTracks.trackId, tracks.id))
            .leftJoin(albums, eq(tracks.albumId, albums.id)).leftJoin(artists, eq(albums.artistId, artists.id))
            .where(eq(userFavoriteTracks.userId, user.id))
            .orderBy(desc(userFavoriteTracks.createdAt));

        return c.json(favTracks);
    })
    // POST /v1/favorites/toggle
    .post('/toggle', async (c) => {
        const user = c.get('user');
        const { type, id } = await c.req.json();

        if (type === 'track') {
            const existing = await db.select().from(userFavoriteTracks)
                .where(and(eq(userFavoriteTracks.userId, user.id), eq(userFavoriteTracks.trackId, id)));

            if (existing.length > 0) {
                await db.delete(userFavoriteTracks)
                    .where(and(eq(userFavoriteTracks.userId, user.id), eq(userFavoriteTracks.trackId, id)));
            } else {
                await db.insert(userFavoriteTracks).values({ userId: user.id, trackId: id });
            }
        }
        else if (type === 'album') {
            const existing = await db.select().from(userFavoriteAlbums)
                .where(and(eq(userFavoriteAlbums.userId, user.id), eq(userFavoriteAlbums.albumId, id)));

            if (existing.length > 0) {
                await db.delete(userFavoriteAlbums)
                    .where(and(eq(userFavoriteAlbums.userId, user.id), eq(userFavoriteAlbums.albumId, id)));
            } else {
                await db.insert(userFavoriteAlbums).values({ userId: user.id, albumId: id });
            }
        }
        else if (type === 'artist') {
            const existing = await db.select().from(userFavoriteArtists)
                .where(and(eq(userFavoriteArtists.userId, user.id), eq(userFavoriteArtists.artistId, id)));

            if (existing.length > 0) {
                await db.delete(userFavoriteArtists)
                    .where(and(eq(userFavoriteArtists.userId, user.id), eq(userFavoriteArtists.artistId, id)));
            } else {
                await db.insert(userFavoriteArtists).values({ userId: user.id, artistId: id });
            }
        }

        return c.json({ success: true });
    });