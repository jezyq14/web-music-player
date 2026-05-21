<script lang="ts">
    import { player } from '$lib/player.svelte';
    import TrackListItem from '$lib/components/search/track-list-item.svelte';
    import Play from '@lucide/svelte/icons/play';

    let { data } = $props();
    let feed = $derived(data.feed);

    let greeting = $derived.by(() => {
        const hour = new Date().getHours();
        if (hour < 5) return 'Dobrej nocy';
        if (hour < 18) return 'Dzień dobry';
        return 'Dobry wieczór';
    });
</script>

<div class="w-full pb-28">
    <div class="mx-auto flex w-full max-w-[1400px] flex-col gap-12 px-2 pt-6 md:px-4 lg:pt-10">
        <h1 class="text-foreground text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {greeting}
        </h1>

        {#if player.recentlyPlayed.length > 0}
            <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {#each player.recentlyPlayed as track}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                        class="group bg-muted/40 hover:bg-muted/80 border-border/30 relative flex h-14 cursor-pointer items-center overflow-hidden rounded-md border shadow-sm transition-colors md:h-20"
                        onclick={() => player.play(track)}
                    >
                        <img
                            src={track.coverUrl}
                            alt=""
                            class="h-full w-14 object-cover shadow-[4px_0_12px_rgba(0,0,0,0.2)] md:w-20"
                        />
                        <div
                            class="text-foreground flex-1 truncate px-4 text-sm font-bold md:text-base"
                        >
                            {track.title}
                        </div>
                        <div
                            class="bg-primary text-primary-foreground absolute right-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full opacity-0 shadow-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105 md:h-12 md:w-12"
                        >
                            <Play class="ml-1 size-5 fill-current md:size-6" />
                        </div>
                    </div>
                {/each}
            </div>
        {/if}

        <div class="grid grid-cols-1 gap-12 xl:grid-cols-[1fr_400px] xl:gap-16">
            <div class="flex flex-col gap-12">
                {#if feed.recommendedAlbums.length > 0}
                    <section class="flex flex-col gap-5">
                        <h2
                            class="cursor-pointer text-2xl font-bold tracking-tight hover:underline"
                        >
                            Polecane albumy
                        </h2>
                        <div
                            class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4"
                        >
                            {#each feed.recommendedAlbums as album}
                                <a
                                    href={`/album/${album.id}`}
                                    class="group bg-card hover:bg-muted/50 flex cursor-pointer flex-col gap-4 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md"
                                >
                                    <div
                                        class="relative w-full overflow-hidden rounded-md shadow-lg"
                                    >
                                        <img
                                            src={album.coverUrl}
                                            alt=""
                                            class="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div class="flex min-w-0 flex-col">
                                        <span class="text-foreground truncate text-base font-bold"
                                            >{album.title}</span
                                        >
                                        <span
                                            class="text-muted-foreground mt-0.5 truncate text-sm font-medium"
                                            >{album.artistName}</span
                                        >
                                    </div>
                                </a>
                            {/each}
                        </div>
                    </section>
                {/if}

                {#if feed.popularArtists.length > 0}
                    <section class="flex flex-col gap-5">
                        <h2
                            class="cursor-pointer text-2xl font-bold tracking-tight hover:underline"
                        >
                            Popularni wykonawcy
                        </h2>
                        <div
                            class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4"
                        >
                            {#each feed.popularArtists.slice(0, 4) as artist}
                                <a
                                    href={`/artist/${artist.id}`}
                                    class="group bg-card hover:bg-muted/50 flex cursor-pointer flex-col items-center gap-4 rounded-xl border p-4 text-center shadow-sm transition-all hover:shadow-md"
                                >
                                    <div
                                        class="relative w-full overflow-hidden rounded-full shadow-lg"
                                    >
                                        <img
                                            src={artist.imageUrl || '/placeholder.jpg'}
                                            alt=""
                                            class="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <span
                                        class="text-foreground w-full truncate text-base font-bold"
                                        >{artist.name}</span
                                    >
                                </a>
                            {/each}
                        </div>
                    </section>
                {/if}
            </div>

            {#if feed.discoverTracks.length > 0}
                <div class="flex flex-col gap-5">
                    <h2 class="cursor-pointer text-2xl font-bold tracking-tight hover:underline">
                        Poznaj nowe utwory
                    </h2>
                    <div class="bg-card flex flex-col gap-1 rounded-xl border p-2 shadow-sm">
                        {#each feed.discoverTracks as track}
                            <TrackListItem track={track as any} />
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
