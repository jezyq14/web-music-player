import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    const userFavorites = await (await locals.api.v1.favorites.$get()).json();

    return {
        user: locals.user,
        userFavorites,

    };
};