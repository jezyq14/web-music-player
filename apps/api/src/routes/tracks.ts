import { Hono } from 'hono';
import { db, tracks } from '@repo/shared';
import { eq } from 'drizzle-orm';
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

                for await (const chunk of fileStream) {
                    await st.write(chunk);
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
    });