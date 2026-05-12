import { Hono } from 'hono';
import { db, artists } from '@repo/shared';
import { asc, eq } from 'drizzle-orm';

export const artistsRouter = new Hono()
    // GET /v1/artists
    .get('/', async (c) => {
        const data = await db.select().from(artists).orderBy(asc(artists.name));
        return c.json(data);
    })
    // GET /v1/artists/:id
    .get('/:id', async (c) => {
        const id = c.req.param('id');
        const [artist] = await db.select().from(artists).where(eq(artists.id, id));
        if (!artist) return c.json({ error: 'Not found' }, 404);
        return c.json(artist);
    });