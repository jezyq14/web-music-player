// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { AppType } from '@repo/api';
import type { hc } from 'hono/client';

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            api: ReturnType<typeof hc<AppType>>;
            user: { id: string; username: string } | null;
        }
        // interface PageData {}
        // interface Platform {}
    }
}

export { };


