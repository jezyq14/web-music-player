import { Hono } from 'hono';
import { albums, artists, db, tracks, playHistory } from '@repo/shared';
import { eq, ilike, or, sql } from 'drizzle-orm';
import { stream } from 'hono/streaming';
import { statSync, createReadStream, existsSync, readFileSync } from 'fs';
import path from 'path';

export const tracksRouter = new Hono()
    .get('/:id/stream', async (c) => {
        const id = c.req.param('id');

        const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
        if (!track) return c.json({ error: 'Track not found' }, 404);

        const filePath = track.filePath;
        const stats = statSync(filePath);
        const fileSize = stats.size;
        const range = c.req.header('range');

        const isInitialPlay = !range || range.startsWith('bytes=0-');

        if (isInitialPlay) {
            Promise.all([
                db.insert(playHistory).values({ trackId: id }),
                db.update(tracks)
                    .set({ playCount: sql`${tracks.playCount} + 1` })
                    .where(eq(tracks.id, id))
            ]).catch((err) => {
                console.error(`Failed to record play stats for track ${id}:`, err);
            });
        }

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
                    console.error('Streaming error:', e);
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
    // GET /v1/tracks/:id
    .get('/:id', async (c) => {
        const id = c.req.param('id');
        const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
        return c.json(track);
    })
    .get('/:id/cover', async (c) => {
        const id = c.req.param('id');
        const [track] = await db.select({
            coverUrl: albums.coverUrl,
            albumId: albums.id
        })
            .from(tracks)
            .leftJoin(albums, eq(tracks.albumId, albums.id))
            .where(eq(tracks.id, id));

        if (!track || !track.coverUrl) return c.json({ error: 'Cover not found' }, 404);

        if (track.coverUrl.startsWith('http')) {
            return c.redirect(track.coverUrl);
        }

        const absolutePath = path.join(process.env.MUSIC_LIBRARY_PATH || '', track.coverUrl);

        if (existsSync(absolutePath)) {
            c.header('Content-Type', 'image/jpeg');
            return c.body(readFileSync(absolutePath));
        }

        return c.json({ error: 'File not found' }, 404);
    })