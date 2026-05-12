import {
    pgTable,
    uuid,
    text,
    integer,
    timestamp,
    boolean,
    real,
    unique,
    primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- TABLES ---
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    username: text('username').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const artists = pgTable('artists', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull().unique(),
    bio: text('bio'),
    imageUrl: text('image_url'),
});

export const albums = pgTable(
    'albums',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        title: text('title').notNull(),
        year: integer('year'),
        coverUrl: text('cover_url'),
        artistId: uuid('artist_id')
            .references(() => artists.id, { onDelete: 'cascade' })
            .notNull(),
    },
    (t) => [
        unique('albums_title_artist_id_idx').on(t.title, t.artistId),
    ],
);

export const tracks = pgTable('tracks', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    number: integer('number'),
    discNumber: integer('disc_number').default(1),
    duration: real('duration').notNull(),
    filePath: text('file_path').notNull(),
    bpm: integer('bpm'),
    genre: text('genre'),
    albumId: uuid('album_id')
        .references(() => albums.id, { onDelete: 'cascade' })
        .notNull(),
});

export const lyrics = pgTable('lyrics', {
    id: uuid('id').defaultRandom().primaryKey(),
    trackId: uuid('track_id')
        .references(() => tracks.id, { onDelete: 'cascade' })
        .notNull()
        .unique(),
    plainText: text('plain_text'),
    syncedLyrics: text('synced_lyrics'),
});

export const playlists = pgTable('playlists', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    isAiGenerated: boolean('is_ai_generated').default(false),
    ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
});

export const playlistTracks = pgTable(
    'playlist_tracks',
    {
        playlistId: uuid('playlist_id')
            .references(() => playlists.id, { onDelete: 'cascade' })
            .notNull(),
        trackId: uuid('track_id')
            .references(() => tracks.id, { onDelete: 'cascade' })
            .notNull(),
        order: integer('order').notNull(),
    },
    (t) => [
        primaryKey({ columns: [t.playlistId, t.trackId] }),
    ],
);

export const jamRooms = pgTable('jam_rooms', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    hostId: uuid('host_id').references(() => users.id, { onDelete: 'cascade' }),
    currentTrackId: uuid('current_track_id').references(() => tracks.id),
    isPlaying: boolean('is_playing').default(false).notNull(),
    serverStartTime: timestamp('server_start_time', { withTimezone: true, precision: 3 }),
    lastPosition: real('last_position').default(0).notNull(),
});

// --- RELATIONS ---
export const artistsRelations = relations(artists, ({ many }) => ({
    albums: many(albums),
}));

export const albumsRelations = relations(albums, ({ one, many }) => ({
    artist: one(artists, { fields: [albums.artistId], references: [artists.id] }),
    tracks: many(tracks),
}));

export const tracksRelations = relations(tracks, ({ one }) => ({
    album: one(albums, { fields: [tracks.albumId], references: [albums.id] }),
    lyrics: one(lyrics, { fields: [tracks.id], references: [lyrics.trackId] }),
}));