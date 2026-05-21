import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';

import { artistsRouter } from './routes/artists';
import { albumsRouter } from './routes/albums';
import { tracksRouter } from './routes/tracks';
import { searchRouter } from './routes/search';
import { feedRouter } from './routes/feed';
import { discoverRouter } from './routes/discover';
import { playlistsRouter } from './routes/playlists';
import { authRouter } from './routes/auth';
import { favoritesRouter } from './routes/favorites';

type User = {
    id: string;
    username: string;
}

export type Variables = {
    user: User;
}

export const apiUrl = process.env.PUBLIC_API_URL || "http://localhost:3000";

const app = new Hono<{ Variables: Variables }>()

// Middleware
app.use('*', logger());
app.use('*', cors({
    origin: process.env.WEB_URL || "http://localhost:5173",
    credentials: true,
}));

// v1 API
const routes = app
    .basePath('/v1')
    .route('/artists', artistsRouter)
    .route('/albums', albumsRouter)
    .route('/tracks', tracksRouter)
    .route('/search', searchRouter)
    .route('/feed', feedRouter)
    .route('/discover', discoverRouter)
    .route("/playlists", playlistsRouter)
    .route("/auth", authRouter)
    .route("/favorites", favoritesRouter);

export type AppType = typeof routes;

serve(
    {
        fetch: app.fetch,
        port: 3000,
    },
    (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    },
);
