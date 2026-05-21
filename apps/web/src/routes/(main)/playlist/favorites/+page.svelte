<script lang="ts">
    import { player, type Track } from '$lib/player.svelte';
    import { Button } from '$lib/components/ui/button';
    import Heart from '@lucide/svelte/icons/heart';
    import Play from '@lucide/svelte/icons/play';
    import Pause from '@lucide/svelte/icons/pause';
    import TrackTableRow from '$lib/components/track-table-row.svelte';

    let { data } = $props();
    let tracks = $derived(data.tracks);

    let isPlayingContext = $derived(
        player.playbackContext?.id === 'favorites' && player.playbackContext?.type === 'playlist',
    );
    let isPlaying = $derived(isPlayingContext && player.isPlaying);

    function togglePlayback() {
        if (!tracks.length) return;
        if (isPlayingContext) player.togglePlay();
        else player.playContext(tracks, 0, { type: 'playlist', id: 'favorites' });
    }

    function playTrack(track: Track, index: number) {
        if (isPlayingContext) player.play(track);
        else player.playContext(tracks, index, { type: 'playlist', id: 'favorites' });
    }
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-28">
    <div class="flex flex-col items-center gap-6 md:flex-row md:items-end md:gap-8">
        <div
            class="flex h-48 w-48 items-center justify-center rounded-md bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-2xl md:h-64 md:w-64"
        >
            <Heart class="h-24 w-24 fill-current drop-shadow-lg" />
        </div>

        <div class="flex flex-col text-center md:text-left">
            <span class="text-muted-foreground text-xs font-bold tracking-wider uppercase"
                >Playlista</span
            >
            <h1 class="mt-2 text-4xl font-black tracking-tight md:text-6xl lg:text-7xl">
                Polubione utwory
            </h1>
            <div
                class="text-muted-foreground mt-4 flex items-center justify-center gap-2 text-sm font-medium md:justify-start"
            >
                <span class="text-foreground font-bold">Twoja Biblioteka</span>
                <span>•</span>
                <span>{tracks.length} utworów</span>
            </div>
        </div>
    </div>

    <div class="flex items-center gap-6">
        <Button
            size="icon"
            disabled={!tracks.length}
            class="h-16 w-16 rounded-full shadow-lg transition-transform hover:scale-105"
            onclick={togglePlayback}
        >
            {#if isPlaying}
                <Pause class="size-8 fill-current" />
            {:else}
                <Play class="ml-1 size-8 fill-current" />
            {/if}
        </Button>
    </div>

    {#if tracks.length === 0}
        <div class="text-muted-foreground mt-12 flex flex-col items-center justify-center">
            <Heart size={48} class="mb-4 opacity-20" />
            <p class="text-xl font-medium">Jeszcze nie masz ulubionych utworów.</p>
            <p class="mt-2 text-sm">Klikaj na serduszka obok utworów, aby dodać je do tej listy.</p>
        </div>
    {:else}
        <div class="mt-4 flex flex-col">
            <div
                class="border-border/50 text-muted-foreground grid grid-cols-[40px_1fr_50px] gap-2 border-b px-2 pb-2 text-sm font-medium md:grid-cols-[40px_1fr_100px_80px_50px]"
            >
                <div class="text-center">#</div>
                <div>Tytuł</div>
                <div class="hidden text-right md:block">Odtworzenia</div>
                <div class="hidden text-right md:block">Czas</div>
                <div></div>
            </div>

            <div class="mt-4 flex flex-col gap-1">
                {#each tracks as track, i}
                    <TrackTableRow
                        {track}
                        index={i + 1}
                        showCover={true}
                        onPlay={() => playTrack(track, i)}
                    />
                {/each}
            </div>
        </div>
    {/if}
</div>
