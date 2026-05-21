import { player, type Track } from '$lib/player.svelte';
import { favorites } from '$lib/favorites.svelte';
import { page } from '$app/state';
import { goto } from '$app/navigation';

import ListPlus from '@lucide/svelte/icons/list-plus';
import ArrowRightToLine from '@lucide/svelte/icons/arrow-right-to-line';
import Disc from '@lucide/svelte/icons/disc';
import User from '@lucide/svelte/icons/user';
import Heart from '@lucide/svelte/icons/heart';

export const getTrackMenuOptions = (track: Track) => {
    const isLiked = favorites.tracks.has(track.id || '');

    return [
        {
            label: isLiked ? 'Usuń z polubionych' : 'Dodaj do polubionych',
            icon: Heart,
            action: () => {
                if (!page.data.user) {
                    goto('/login');
                    return;
                }
                favorites.toggleTrack(track.id!);
            },
        },
        {
            label: 'Dodaj do kolejki',
            icon: ListPlus,
            action: () => player.addToQueue(track)
        },
        {
            label: 'Odtwórz jako następny',
            icon: ArrowRightToLine,
            action: () => player.playNext(track)
        },
        {
            label: 'Przejdź do wykonawcy',
            icon: User,
            action: () => goto(`/artist/${track.artistId}`)
        },
        {
            label: 'Przejdź do albumu',
            icon: Disc,
            action: () => goto(`/album/${track.albumId}`)
        },
    ];
};