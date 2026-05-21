<script lang="ts">
    import { player, type Track } from '$lib/player.svelte';
    import { Button } from '$lib/components/ui/button';
    import Play from '@lucide/svelte/icons/play';
    import Pause from '@lucide/svelte/icons/pause';
    import DiscIcon from '@lucide/svelte/icons/disc-3';
    import TrackTableRow from '$lib/components/track-table-row.svelte';
    import LikeButton from '$lib/components/like-button.svelte';

    let { data } = $props();
    let album = $derived(data.album);

    let isPlayingContext = $derived(
        player.playbackContext?.id === album.id && player.playbackContext?.type === 'album',
    );
    let isPlaying = $derived(isPlayingContext && player.isPlaying);

    function handleMainPlay() {
        if (isPlayingContext) {
            player.togglePlay();
        } else {
            player.playContext(album.tracks, 0, { type: 'album', id: album.id });
        }
    }

    function handleTrackPlay(track: Track, index: number) {
        if (isPlayingContext) {
            player.play(track);
        } else {
            player.playContext(album.tracks, index, { type: 'album', id: album.id });
        }
    }

    function formatTotalTime(seconds: number) {
        return `${Math.floor(seconds / 60)} min`;
    }

    let discs = $derived.by(() => {
        if (!album?.tracks) return [];
        const map = new Map<number, Track[]>();
        album.tracks.forEach((t: Track) => {
            const disc = t.discNumber || 1;
            if (!map.has(disc)) map.set(disc, []);
            map.get(disc)!.push(t);
        });
        return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
    });
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-28">
    <div class="flex flex-col items-center gap-6 md:flex-row md:items-end md:gap-8">
        <img
            src={album.coverUrl}
            alt=""
            class="h-56 w-56 rounded-md object-cover shadow-2xl md:h-64 md:w-64"
        />
        <div class="flex flex-col text-center md:text-left">
            <span class="text-muted-foreground text-xs font-bold tracking-wider uppercase"
                >Album</span
            >
            <h1 class="mt-2 text-4xl font-black tracking-tight md:text-6xl lg:text-7xl">
                {album.title}
            </h1>
            <div
                class="text-muted-foreground mt-4 flex items-center justify-center gap-2 text-sm font-medium md:justify-start"
            >
                <img src={album.coverUrl} class="h-6 w-6 rounded-full object-cover" alt="" />
                <a
                    href={`/artist/${album.artistId}`}
                    class="text-foreground font-bold hover:underline">{album.artistName}</a
                >
                <span>•</span>
                <span>{album.year}</span>
                <span>•</span>
                <span
                    >{album.tracks.length} utworów, {formatTotalTime(
                        album.tracks.reduce((a: number, t: Track) => a + t.duration, 0),
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

        <LikeButton
            type="album"
            id={album.id}
            data={{ title: album.title, coverUrl: album.coverUrl }}
        />
    </div>

    <div class="flex flex-col">
        <div
            class="border-border/50 text-muted-foreground grid grid-cols-[40px_1fr_50px] gap-2 border-b px-2 pb-2 text-sm font-medium md:grid-cols-[40px_1fr_100px_80px_50px]"
        >
            <div class="text-center">#</div>
            <div>Tytuł</div>
            <div class="hidden text-right md:block">Odtworzenia</div>
            <div class="hidden text-right md:block">Czas</div>
            <div></div>
        </div>
        <div class="mt-2 flex flex-col gap-1">
            {#each discs as [discNumber, tracks]}
                {#if discs.length > 1}
                    <div
                        class="text-foreground mt-6 mb-2 flex items-center gap-2 px-2 text-lg font-bold"
                    >
                        <DiscIcon size={20} class="text-muted-foreground" /> Płyta {discNumber}
                    </div>
                {/if}
                {#each tracks as track, i}
                    <TrackTableRow
                        {track}
                        index={track.number || i + 1}
                        onPlay={() =>
                            handleTrackPlay(
                                track,
                                album.tracks.findIndex((t: Track) => t.id === track.id),
                            )}
                    />
                {/each}
            {/each}
        </div>
    </div>
</div>
