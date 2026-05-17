import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';

import { artistsRouter } from './routes/artists';
import { albumsRouter } from './routes/albums';
import { tracksRouter } from './routes/tracks';
import { searchRouter } from './routes/search';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// v1 API
const routes = app
    .basePath('/v1')
    .route('/artists', artistsRouter)
    .route('/albums', albumsRouter)
    .route('/tracks', tracksRouter)
    .route('/search', searchRouter);

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
