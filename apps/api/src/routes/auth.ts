import { Hono } from 'hono';
import { db, users } from '@repo/shared';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { sign, verify } from 'hono/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'super-tajne-haslo-123';

export const authRouter = new Hono()
    .post('/register', async (c) => {
        const body = await c.req.json();
        const { username, password } = body;

        if (!username || !password) return c.json({ error: 'Brak danych' }, 400);

        const existing = await db.select().from(users).where(eq(users.username, username));
        if (existing.length > 0) return c.json({ error: 'Nazwa użytkownika jest już zajęta' }, 400);

        const passwordHash = await bcrypt.hash(password, 10);
        const [user] = await db.insert(users).values({ username, passwordHash }).returning();

        const token = await sign({ id: user.id, username: user.username }, JWT_SECRET, 'HS256');

        return c.json({ token, user: { id: user.id, username: user.username } });
    })
    .post('/login', async (c) => {
        const body = await c.req.json();
        const { username, password } = body;

        const [user] = await db.select().from(users).where(eq(users.username, username));
        if (!user) return c.json({ error: 'Nieprawidłowy login lub hasło' }, 400);

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return c.json({ error: 'Nieprawidłowy login lub hasło' }, 400);

        const token = await sign({ id: user.id, username: user.username }, JWT_SECRET);

        return c.json({ token, user: { id: user.id, username: user.username } });
    })
    .get('/me', async (c) => {
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ error: 'Brak autoryzacji' }, 401);
        }

        const token = authHeader.split(' ')[1];
        try {
            const payload = await verify(token, JWT_SECRET, {
                alg: 'HS256'
            });
            return c.json({ user: payload });
        } catch {
            return c.json({ error: 'Nieprawidłowy token' }, 401);
        }
    });