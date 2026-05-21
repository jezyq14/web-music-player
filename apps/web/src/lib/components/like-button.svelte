<script lang="ts">
    import Heart from '@lucide/svelte/icons/heart';
    import { Button } from '$lib/components/ui/button';
    import { favorites } from '$lib/favorites.svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';

    let {
        type,
        id,
        data = null,
        class: className = '',
    } = $props<{ type: 'track' | 'album' | 'artist'; id: string; data?: any; class?: string }>();

    let isLiked = $derived(
        type === 'track'
            ? favorites.tracks.has(id)
            : type === 'album'
              ? favorites.albums.some((a) => a.id === id)
              : favorites.artists.some((a) => a.id === id),
    );

    function toggle(e: Event) {
        e.stopPropagation();
        if (!page.data.user) {
            goto('/login');
            return;
        }
        if (type === 'track') favorites.toggleTrack(id);
        else if (type === 'album') favorites.toggleAlbum({ id, ...data });
        else if (type === 'artist') favorites.toggleArtist({ id, ...data });
    }
</script>

<Button
    variant="ghost"
    size="icon"
    class="text-muted-foreground hover:text-foreground transition-all active:scale-75 {className}"
    onclick={toggle}
>
    <Heart size={20} class={isLiked ? 'fill-primary text-primary' : ''} />
</Button>
