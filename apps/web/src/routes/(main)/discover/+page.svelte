<script lang="ts">
    import TrackListItem from '$lib/components/search/track-list-item.svelte';
    import { type Track } from '$lib/player.svelte.js';

    let { data: pageData } = $props();
    let discover = $derived(pageData.data);

    const gradients = [
        'from-orange-500 to-red-500',
        'from-blue-600 to-cyan-500',
        'from-emerald-500 to-teal-400',
        'from-pink-500 to-rose-500',
        'from-purple-600 to-fuchsia-500',
        'from-indigo-500 to-violet-500',
        'from-yellow-500 to-amber-500',
    ];
</script>

<div class="w-full pb-28">
    <div class="mx-auto flex w-full max-w-[1400px] flex-col gap-12 px-2 pt-6 md:px-4 lg:pt-10">
        <h1 class="text-foreground text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Odkrywaj
        </h1>

        {#if discover.genrePlaylists.length > 0}
            <section class="flex flex-col gap-5">
                <h2 class="text-2xl font-bold tracking-tight">Gatunki</h2>

                <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {#each discover.genrePlaylists as playlist, index}
                        <a
                            href={`/playlist/genre-${encodeURIComponent(playlist.genre || '')}`}
                            class="group relative aspect-video cursor-pointer overflow-hidden rounded-xl bg-linear-to-br {gradients[
                                index % gradients.length
                            ]} p-4 shadow-sm transition-transform hover:scale-[1.03] hover:shadow-xl"
                        >
                            <h3 class="text-xl font-black text-white drop-shadow-md md:text-2xl">
                                {playlist.genre}
                            </h3>
                            {#if playlist.tracks[0]?.coverUrl}
                                <img
                                    src={playlist.tracks[0].coverUrl}
                                    alt=""
                                    class="absolute -right-4 -bottom-4 h-18 w-18 rotate-25 rounded-md object-cover opacity-90 shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-15"
                                />
                            {/if}
                        </a>
                    {/each}
                </div>
            </section>
        {/if}

        <div class="grid grid-cols-1 gap-12 xl:grid-cols-[1fr_400px] xl:gap-16">
            {#if discover.randomAlbums.length > 0}
                <section class="flex flex-col gap-5">
                    <h2 class="text-2xl font-bold tracking-tight">Propozycje albumów</h2>
                    <div
                        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-3 2xl:grid-cols-4"
                    >
                        {#each discover.randomAlbums as album}
                            <a
                                href={`/album/${album.id}`}
                                class="group bg-card hover:bg-muted/60 flex cursor-pointer flex-col gap-4 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md"
                            >
                                <div class="relative w-full overflow-hidden rounded-md shadow-lg">
                                    <img
                                        src={album.coverUrl}
                                        alt=""
                                        class="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div class="flex min-w-0 flex-col">
                                    <span
                                        class="text-foreground truncate pb-0.5 text-base font-bold"
                                        >{album.title}</span
                                    >
                                    <span class="text-muted-foreground truncate text-sm font-medium"
                                        >{album.artistName}</span
                                    >
                                </div>
                            </a>
                        {/each}
                    </div>
                </section>
            {/if}

            {#if discover.randomTracks.length > 0}
                <section class="flex flex-col gap-5">
                    <h2 class="text-2xl font-bold tracking-tight">Losowe utwory</h2>
                    <div class="bg-card flex flex-col gap-1 rounded-xl border p-3 shadow-sm">
                        {#each discover.randomTracks as track}
                            <TrackListItem track={track as Track} />
                        {/each}
                    </div>
                </section>
            {/if}
        </div>
    </div>
</div>
