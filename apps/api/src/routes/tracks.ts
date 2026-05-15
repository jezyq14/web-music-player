import { Hono } from 'hono';
import { albums, artists, db, tracks } from '@repo/shared';
import { eq, ilike, or } from 'drizzle-orm';
import { stream } from 'hono/streaming';
import { statSync, createReadStream } from 'fs';

export const tracksRouter = new Hono()
    .get('/:id/stream', async (c) => {
        const id = c.req.param('id');

        const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
        if (!track) return c.json({ error: 'Track not found' }, 404);

        const filePath = track.filePath;
        const stats = statSync(filePath);
        const fileSize = stats.size;
        const range = c.req.header('range');

        c.header('Accept-Ranges', 'bytes');
        c.header('Content-Type', 'audio/mpeg');

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;

            const fileStream = createReadStream(filePath, { start, end });

            c.status(206);
            c.header('Content-Range', `bytes ${start}-${end}/${fileSize}`);
            c.header('Content-Length', chunksize.toString());

            return stream(c, async (st) => {
                st.onAbort(() => {
                    fileStream.destroy();
                });

                try {
                    for await (const chunk of fileStream) {
                        await st.write(chunk);
                    }
                } catch (e: any) {
                    if (e.code === 'ERR_STREAM_PREMATURE_CLOSE' || e.code === 'ECONNRESET') {
                        return;
                    }
                    console.error('Błąd streamingu:', e);
                }
            });
        } else {
            const fileStream = createReadStream(filePath);
            c.header('Content-Length', fileSize.toString());

            return stream(c, async (st) => {
                st.onAbort(() => {
                    fileStream.destroy();
                });

                for await (const chunk of fileStream) {
                    await st.write(chunk);
                }
            });
        }
    })
    // GET /v1/tracks/search?q=...
    .get('/search', async (c) => {
        const q = c.req.query('q') || '';

        const results = await db.select({
            id: tracks.id,
            title: tracks.title,
            duration: tracks.duration,
            artistName: artists.name,
            albumTitle: albums.title,
            coverUrl: albums.coverUrl,
            replayGain: tracks.replayGain,
            albumId: albums.id,
            artistId: artists.id,
        })
            .from(tracks)
            .leftJoin(albums, eq(tracks.albumId, albums.id))
            .leftJoin(artists, eq(albums.artistId, artists.id))
            .where(
                or(
                    ilike(tracks.title, `%${q}%`),
                    ilike(artists.name, `%${q}%`)
                )
            )
            .limit(20);

        return c.json(results);
    })
    // GET /v1/tracks/:id
    .get('/:id', async (c) => {
        const id = c.req.param('id');
        const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
        return c.json(track);
    })