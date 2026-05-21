<script lang="ts">
    import { player, type Track } from '$lib/player.svelte';
    import { Button } from '$lib/components/ui/button';
    import Play from '@lucide/svelte/icons/play';
    import Pause from '@lucide/svelte/icons/pause';
    import TrackTableRow from '$lib/components/track-table-row.svelte';
    import LikeButton from '$lib/components/like-button.svelte';

    let { data } = $props();
    let artist = $derived(data.artist);
    let topTracks = $derived(data.topTracks);
    let albums = $derived(data.albums);

    let isPlayingContext = $derived(
        player.playbackContext?.id === artist.id && player.playbackContext?.type === 'artist',
    );
    let isPlaying = $derived(isPlayingContext && player.isPlaying);
    let showFullBio = $state(false);

    function handleMainPlay() {
        if (!topTracks.length) return;
        if (isPlayingContext) {
            player.togglePlay();
        } else {
            player.playContext(topTracks, 0, { type: 'artist', id: artist.id });
        }
    }

    function handleTrackPlay(track: Track, index: number) {
        if (isPlayingContext) {
            player.play(track);
        } else {
            player.playContext(topTracks, index, { type: 'artist', id: artist.id });
        }
    }
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col pb-28">
    <div class="flex items-center gap-6 p-6 md:gap-10 md:p-8">
        <img
            src={artist.imageUrl || '/placeholder.jpg'}
            alt=""
            class="h-40 w-40 shrink-0 rounded-full object-cover shadow-xl md:h-56 md:w-56"
        />
        <div class="flex flex-col">
            <span class="text-muted-foreground text-sm font-semibold tracking-wider uppercase"
                >Wykonawca</span
            >
            <h1
                class="text-foreground mt-1 text-4xl font-black tracking-tight md:text-6xl lg:text-7xl"
            >
                {artist.name}
            </h1>
        </div>
    </div>

    <div class="mb-4 flex items-center gap-4 px-6">
        <Button
            size="icon"
            class="h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105"
            onclick={handleMainPlay}
        >
            {#if isPlaying}
                <Pause class="size-7 fill-current" />
            {:else}
                <Play class="ml-1 size-7 fill-current" />
            {/if}
        </Button>
        <LikeButton
            type="artist"
            id={artist.id}
            data={{ name: artist.name, imageUrl: artist.imageUrl }}
            class="h-12 w-12 [&>svg]:size-8"
        />
    </div>

    {#if artist.bio}
        <div class="px-6 pb-4 text-sm md:px-8">
            <p
                class="text-muted-foreground transition-all {showFullBio
                    ? ''
                    : 'line-clamp-2 md:line-clamp-1'}"
            >
                {artist.bio}
            </p>
            <button
                class="hover:text-foreground text-muted-foreground mt-1 font-semibold"
                onclick={() => (showFullBio = !showFullBio)}
            >
                {showFullBio ? 'Zwiń' : 'Pokaż więcej'}
            </button>
        </div>
    {/if}

    <div class="px-6 md:px-8">
        <h2 class="mb-4 text-2xl font-bold tracking-tight">Najpopularniejsze</h2>
        {#if topTracks.length > 0}
            <div class="flex flex-col gap-1">
                {#each topTracks as track, i}
                    <TrackTableRow
                        {track}
                        index={i + 1}
                        showCover={true}
                        onPlay={() => handleTrackPlay(track, i)}
                    />
                {/each}
            </div>
        {:else}
            <p class="text-muted-foreground">Brak utworów</p>
        {/if}
    </div>

    {#if albums.length > 0}
        <div class="mt-10 px-6 md:px-8">
            <h2 class="mb-4 text-2xl font-bold tracking-tight">Dyskografia</h2>
            <div
                class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            >
                {#each albums as album}
                    <a
                        href={`/album/${album.id}`}
                        class="group hover:bg-muted/50 flex cursor-pointer flex-col gap-3 rounded-lg p-4 transition-colors"
                    >
                        <img
                            src={album.coverUrl}
                            alt=""
                            class="aspect-square w-full rounded-md object-cover shadow-sm transition-shadow group-hover:shadow-lg"
                        />
                        <div class="flex flex-col">
                            <span class="text-foreground truncate text-base font-bold"
                                >{album.title}</span
                            >
                            <span class="text-muted-foreground mt-0.5 truncate text-sm font-medium"
                                >{album.year}</span
                            >
                        </div>
                    </a>
                {/each}
            </div>
        </div>
    {/if}
</div>
