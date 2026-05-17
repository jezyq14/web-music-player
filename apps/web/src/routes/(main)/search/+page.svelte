<script lang="ts">
    import { page } from '$app/state';

    import SearchIcon from '@lucide/svelte/icons/search';
    import Play from '@lucide/svelte/icons/play';

    import TrackListItem from '$lib/components/search/track-list-item.svelte';
    import { Button } from '$lib/components/ui/button';

    import { api } from '$lib/api';
    import { player, type Track } from '$lib/player.svelte';

    let q = $derived(page.url.searchParams.get('q') || '');
    let isLoading = $state(false);
    let results = $state({
        topResult: null as any,
        tracks: [] as Track[],
        albums: [] as any[],
        artists: [] as any[],
    });

    $effect(() => {
        if (q) fetchResults(q);
        else results = { topResult: null, tracks: [], albums: [], artists: [] };
    });

    async function fetchResults(query: string) {
        isLoading = true;
        try {
            const res = await api.v1.search.$get({ query: { q: query } });
            if (res.ok) results = await res.json();
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="mx-auto flex w-full max-w-[1400px] flex-col gap-10 pb-28">
    {#if !q}
        <div class="text-muted-foreground flex h-[50vh] flex-col items-center justify-center">
            <SearchIcon size={64} class="mb-6 opacity-20" />
            <h2 class="text-foreground text-2xl font-bold">Czego chcesz posłuchać?</h2>
            <p class="mt-2 text-base">Wyszukaj utwory, albumy lub wykonawców.</p>
        </div>
    {:else if isLoading}
        <div class="text-muted-foreground flex h-32 animate-pulse items-center justify-center">
            Szukam...
        </div>
    {:else if !results.topResult && results.tracks.length === 0}
        <div class="text-muted-foreground flex h-32 items-center justify-center text-lg">
            Brak wyników dla "{q}"
        </div>
    {:else}
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr]">
            <!-- Best match section -->
            {#if results.topResult}
                <section class="flex flex-col gap-4">
                    <h2 class="text-2xl font-bold tracking-tight">Najlepsze dopasowanie</h2>

                    {#if results.topResult.type === 'track'}
                        <div
                            class="group bg-card hover:bg-muted/80 relative flex cursor-pointer flex-col gap-5 overflow-hidden rounded-xl border p-5 shadow-sm transition-colors"
                            onclick={() => player.play(results.topResult.data)}
                            tabindex={0}
                            role="button"
                            onkeydown={() => null}
                        >
                            <img
                                src={results.topResult.data.coverUrl || '/placeholder.jpg'}
                                alt=""
                                class="aspect-square w-full rounded-md object-cover shadow-lg"
                            />
                            <div class="flex min-w-0 flex-col pb-2">
                                <h3 class="truncate pb-1 text-3xl font-bold">
                                    {results.topResult.data.title}
                                </h3>
                                <div
                                    class="text-muted-foreground flex items-center gap-1.5 truncate text-sm font-semibold"
                                >
                                    <span class="capitalize">Utwór</span><span class="text-xs"
                                        >•</span
                                    >
                                    <span class="hover:text-foreground truncate hover:underline"
                                        >{results.topResult.data.artistName}</span
                                    >
                                </div>
                            </div>
                            <Button
                                size="icon"
                                class="absolute right-6 bottom-6 size-12 translate-y-2 rounded-full opacity-0 shadow-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105"
                            >
                                <Play class="ml-1 size-6 fill-current text-white" />
                            </Button>
                        </div>
                    {:else}
                        <a
                            href={results.topResult.type === 'artist'
                                ? `/artist/${results.topResult.data.id}`
                                : `/album/${results.topResult.data.id}`}
                            class="group bg-card hover:bg-muted/80 relative flex cursor-pointer flex-col gap-5 overflow-hidden rounded-xl border p-5 shadow-sm transition-colors"
                        >
                            <img
                                src={results.topResult.type === 'artist'
                                    ? results.topResult.data.imageUrl || '/placeholder.jpg'
                                    : results.topResult.data.coverUrl || '/placeholder.jpg'}
                                alt=""
                                class="aspect-square w-full object-cover shadow-lg {results
                                    .topResult.type === 'artist'
                                    ? 'rounded-full'
                                    : 'rounded-md'}"
                            />
                            <div class="flex min-w-0 flex-col pb-2">
                                <h3 class="truncate pb-1 text-3xl font-bold">
                                    {results.topResult.type === 'artist'
                                        ? results.topResult.data.name
                                        : results.topResult.data.title}
                                </h3>
                                <div
                                    class="text-muted-foreground flex items-center gap-1.5 truncate text-sm font-semibold"
                                >
                                    <span class="capitalize"
                                        >{results.topResult.type === 'album'
                                            ? 'Album'
                                            : 'Wykonawca'}</span
                                    >
                                    {#if results.topResult.type === 'album'}<span class="text-xs"
                                            >•</span
                                        ><span
                                            class="hover:text-foreground truncate hover:underline"
                                            >{results.topResult.data.artistName}</span
                                        >{/if}
                                </div>
                            </div>
                        </a>
                    {/if}
                </section>
            {/if}

            <!-- Tracks -->
            {#if results.tracks.length > 0}
                <section class="flex flex-col gap-4">
                    <h2 class="text-2xl font-bold tracking-tight">Utwory</h2>
                    <div class="flex flex-col gap-1">
                        {#each results.tracks as track}
                            <TrackListItem {track} />
                        {/each}
                    </div>
                </section>
            {/if}
        </div>

        <!-- Albums -->
        {#if results.albums.length > 0}
            <section class="mt-8 flex flex-col gap-4">
                <h2 class="text-2xl font-bold tracking-tight">Albumy</h2>
                <div
                    class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                >
                    {#each results.albums as album}
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
                                <span
                                    class="text-muted-foreground mt-0.5 truncate text-sm font-medium"
                                    >{album.year} • {album.artistName}</span
                                >
                            </div>
                        </a>
                    {/each}
                </div>
            </section>
        {/if}

        <!-- Artists -->
        {#if results.artists.length > 0}
            <section class="mt-8 flex flex-col gap-4">
                <h2 class="text-2xl font-bold tracking-tight">Wykonawcy</h2>
                <div
                    class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                >
                    {#each results.artists as artist}
                        <a
                            href={`/artist/${artist.id}`}
                            class="group hover:bg-muted/50 flex cursor-pointer flex-col items-center gap-4 rounded-lg p-4 text-center transition-colors"
                        >
                            <img
                                src={artist.imageUrl || '/placeholder.jpg'}
                                alt="artist"
                                class="aspect-square w-full rounded-full object-cover shadow-sm transition-shadow group-hover:shadow-lg"
                            />
                            <span class="text-foreground w-full truncate text-base font-bold"
                                >{artist.name}</span
                            >
                        </a>
                    {/each}
                </div>
            </section>
        {/if}
    {/if}
</div>
