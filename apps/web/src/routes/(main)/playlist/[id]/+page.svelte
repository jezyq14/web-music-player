<script lang="ts">
    import { player, type Track } from '$lib/player.svelte';
    import { Button } from '$lib/components/ui/button';
    import Play from '@lucide/svelte/icons/play';
    import Pause from '@lucide/svelte/icons/pause';
    import TrackTableRow from '$lib/components/track-table-row.svelte';

    let { data } = $props();
    let playlist = $derived(data.playlist);

    let isPlayingContext = $derived(
        player.playbackContext?.id === playlist.id && player.playbackContext?.type === 'playlist',
    );
    let isPlaying = $derived(isPlayingContext && player.isPlaying);

    function handleMainPlay() {
        if (!playlist.tracks.length) return;
        if (isPlayingContext) {
            player.togglePlay();
        } else {
            player.playContext(playlist.tracks, 0, { type: 'playlist', id: playlist.id });
        }
    }

    function handleTrackPlay(track: Track, index: number) {
        if (isPlayingContext) {
            player.play(track);
        } else {
            player.playContext(playlist.tracks, index, { type: 'playlist', id: playlist.id });
        }
    }

    function formatTotalTime(seconds: number) {
        const mins = Math.floor(seconds / 60);
        return `${mins} min`;
    }
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-28">
    <div class="flex flex-col items-center gap-6 md:flex-row md:items-end md:gap-8">
        <img
            src={playlist.coverUrl || '/placeholder.jpg'}
            alt=""
            class="h-48 w-48 rounded-md object-cover shadow-2xl md:h-64 md:w-64"
        />
        <div class="flex flex-col text-center md:text-left">
            <span class="text-muted-foreground text-xs font-bold tracking-wider uppercase"
                >Playlista</span
            >
            <h1 class="mt-2 text-4xl font-black tracking-tight md:text-6xl lg:text-7xl">
                {playlist.name}
            </h1>
            {#if playlist.description}
                <p class="text-muted-foreground mt-4 max-w-2xl text-sm">{playlist.description}</p>
            {/if}
            <div
                class="text-muted-foreground mt-4 flex items-center justify-center gap-2 text-sm font-medium md:justify-start"
            >
                <span class="text-foreground font-bold">Michael's Music</span>
                <span>•</span>
                <span
                    >{playlist.tracks.length} utworów, {formatTotalTime(
                        playlist.tracks.reduce((a: number, t: Track) => a + t.duration, 0),
                    )}</span
                >
            </div>
        </div>
    </div>

    <div class="flex items-center gap-6">
        <Button
            size="icon"
            class="h-16 w-16 rounded-full shadow-lg transition-transform hover:scale-105"
            onclick={handleMainPlay}
        >
            {#if isPlaying}
                <Pause class="size-8 fill-current" />
            {:else}
                <Play class="ml-1 size-8 fill-current" />
            {/if}
        </Button>
    </div>

    <div class="mt-4 flex flex-col">
        <div
            class="border-border/50 text-muted-foreground grid grid-cols-[40px_1fr_50px] gap-2 border-b px-2 pb-2 text-sm font-medium md:grid-cols-[40px_1fr_100px_80px_50px]"
        >
            <div class="text-center">#</div>
            <div>Tytuł</div>
            <div class="hidden text-right md:block">Odtworzenia</div>
            <div class="hidden text-right md:block">Czas</div>
            <div></div>
            <div></div>
        </div>

        <div class="mt-4 flex flex-col gap-1">
            {#each playlist.tracks as track, i}
                <TrackTableRow
                    {track}
                    index={i + 1}
                    showCover={true}
                    onPlay={() => handleTrackPlay(track, i)}
                />
            {/each}
        </div>
    </div>
</div>
