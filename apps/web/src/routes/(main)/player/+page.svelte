<script lang="ts">
    import { player } from '$lib/player.svelte';
    import { Button } from '$lib/components/ui/button';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
    import { ScrollArea } from '$lib/components/ui/scroll-area';
    import { Slider } from '$lib/components/ui/slider';

    import GripVertical from '@lucide/svelte/icons/grip-vertical';
    import Play from '@lucide/svelte/icons/play';
    import Pause from '@lucide/svelte/icons/pause';
    import SkipForward from '@lucide/svelte/icons/skip-forward';
    import SkipBack from '@lucide/svelte/icons/skip-back';
    import Shuffle from '@lucide/svelte/icons/shuffle';
    import Repeat from '@lucide/svelte/icons/repeat';
    import Repeat1 from '@lucide/svelte/icons/repeat-1';
    import Trash2 from '@lucide/svelte/icons/trash-2';
    import Music2 from '@lucide/svelte/icons/music-2';

    let buttonDefaultClass = 'text-muted-foreground hover:text-foreground';
    let buttonActiveClass = 'text-primary dark:text-primary';
    let buttonDotClass = 'bg-primary absolute bottom-0.5 h-1 w-1 rounded-full';

    let isDragging = $state(false);
    let dragTime = $state(0);
    let displayTime = $derived(isDragging ? dragTime : player.currentTime);

    function formatTime(seconds: number) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    interface LyricLine {
        time: number;
        text: string;
    }

    let lyrics = $state<LyricLine[]>([]);
    let isLoadingLyrics = $state(false);
    let lyricsError = $state<string | null>(null);

    let currentLyricIndex = $derived.by(() => {
        if (!lyrics.length) return -1;
        for (let i = lyrics.length - 1; i >= 0; i--) {
            if (player.currentTime >= lyrics[i].time) return i;
        }
        return 0;
    });

    $effect(() => {
        if (currentLyricIndex !== -1) {
            const activeEl = document.getElementById(`lyric-${currentLyricIndex}`);
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    $effect(() => {
        const track = player.currentTrack;
        if (track) {
            fetchLyrics(track.title || '', track.artistName || '', track.duration);
        } else {
            lyrics = [];
        }
    });

    async function fetchLyrics(title: string, artist: string, duration: number) {
        isLoadingLyrics = true;
        lyricsError = null;
        lyrics = [];

        try {
            const params = new URLSearchParams({
                track_name: title,
                artist_name: artist,
                duration: Math.round(duration).toString(),
            });

            let res = await fetch(`https://lrclib.net/api/get?${params}`);

            if (!res.ok) {
                const searchParams = new URLSearchParams({
                    track_name: title,
                    artist_name: artist,
                });
                const searchRes = await fetch(`https://lrclib.net/api/search?${searchParams}`);
                const searchData = await searchRes.json();

                const bestMatch = searchData.find((t: any) => t.syncedLyrics);
                if (bestMatch) {
                    parseLrc(bestMatch.syncedLyrics);
                } else {
                    lyricsError = 'Brak zsynchronizowanego tekstu.';
                }
            } else {
                const data = await res.json();
                if (data.syncedLyrics) {
                    parseLrc(data.syncedLyrics);
                } else {
                    lyricsError = 'Brak zsynchronizowanego tekstu.';
                }
            }
        } catch (e) {
            lyricsError = 'Błąd podczas wczytywania tekstu.';
        } finally {
            isLoadingLyrics = false;
        }
    }

    function parseLrc(lrc: string) {
        const lines = lrc.split('\n');
        const parsed: LyricLine[] = [];

        const timeRegex = /\[(\d{2}):(\d{2}\.\d{2,3})\]/;

        for (const line of lines) {
            const match = timeRegex.exec(line);
            if (match) {
                const minutes = parseInt(match[1], 10);
                const seconds = parseFloat(match[2]);
                const time = minutes * 60 + seconds;
                const text = line.replace(timeRegex, '').trim();

                if (text) parsed.push({ time, text });
            }
        }
        lyrics = parsed;
    }

    let draggingIndex = $state<number | null>(null);
    let dragOverIndex = $state<number | null>(null);

    function handleDragStart(e: DragEvent, index: number) {
        draggingIndex = index;
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', index.toString());
        }
    }

    function handleDrop(e: DragEvent, toIndex: number) {
        e.preventDefault();
        dragOverIndex = null;
        if (draggingIndex === null || draggingIndex === toIndex) return;

        reorderQueue(draggingIndex, toIndex);
        draggingIndex = null;
    }

    function reorderQueue(fromIdx: number, toIdx: number) {
        const newQueue = [...player.queue];
        const [movedTrack] = newQueue.splice(fromIdx, 1);
        newQueue.splice(toIdx, 0, movedTrack);

        let newCurrentIndex = player.currentIndex;

        if (player.currentIndex === fromIdx) {
            newCurrentIndex = toIdx;
        } else if (fromIdx < player.currentIndex && toIdx >= player.currentIndex) {
            newCurrentIndex--;
        } else if (fromIdx > player.currentIndex && toIdx <= player.currentIndex) {
            newCurrentIndex++;
        }

        player.queue = newQueue;
        player.currentIndex = newCurrentIndex;
    }
</script>

<div class="flex h-full w-full flex-col gap-10 pb-28 lg:flex-row lg:gap-16 lg:pb-6 xl:gap-32">
    <div class="flex flex-1 flex-col items-center justify-center lg:px-4">
        {#if player.currentTrack}
            <div class="flex w-full max-w-[500px] flex-col gap-6 lg:max-w-[600px] lg:gap-8">
                <div
                    class="group relative aspect-square w-full overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 lg:hover:scale-[1.02]"
                >
                    <img
                        src={player.currentTrack.coverUrl || '/placeholder.jpg'}
                        alt={player.currentTrack.title}
                        class="h-full w-full object-cover"
                    />
                    <div
                        class="absolute inset-0 hidden bg-linear-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:block"
                    ></div>
                </div>

                <div class="flex w-full flex-col gap-5 lg:gap-6">
                    <div class="flex flex-col text-left">
                        <h1
                            class="text-foreground truncate text-3xl font-bold tracking-tight md:text-4xl"
                        >
                            {player.currentTrack.title}
                        </h1>
                        <div class="text-muted-foreground mt-1 flex items-center gap-2 text-lg">
                            <a
                                href={`/artist/${player.currentTrack.artistId}`}
                                class="hover:text-primary cursor-pointer hover:underline"
                            >
                                {player.currentTrack.artistName}
                            </a>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2 md:hidden">
                        <Slider
                            type="single"
                            value={displayTime}
                            max={Math.max(player.duration || 0, player.currentTime || 0, 1)}
                            step={1}
                            onValueChange={(v) => {
                                if (!isDragging && v === Math.round(player.currentTime || 0))
                                    return;
                                isDragging = true;
                                dragTime = v;
                            }}
                            onValueCommit={(v) => {
                                isDragging = false;
                                player.seek(v);
                            }}
                            class="cursor-pointer"
                        />
                        <div
                            class="text-muted-foreground flex w-full justify-between text-xs font-medium"
                        >
                            <span>{formatTime(displayTime)}</span>
                            <span>{formatTime(player.duration || 0)}</span>
                        </div>
                    </div>

                    <div class="flex w-full items-center justify-between md:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            onclick={() => player.toggleShuffle()}
                            disabled={player.queue.length <= 1}
                            class="relative"
                        >
                            <div class="flex flex-col items-center">
                                <Shuffle
                                    class={player.isShuffled
                                        ? buttonActiveClass
                                        : buttonDefaultClass}
                                />
                                {#if player.isShuffled}<div class={buttonDotClass}></div>{/if}
                            </div>
                        </Button>

                        <div class="flex items-center gap-4 md:hidden md:gap-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                onclick={() => player.previous()}
                                disabled={!player.canPlayPrevious}
                                class="size-10 md:size-12"
                            >
                                <SkipBack class="size-6 fill-current md:size-8" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onclick={() => player.togglePlay()}
                                disabled={!player.queue.length}
                                class="bg-foreground text-background hover:bg-foreground/90 size-16 rounded-full transition-transform hover:scale-105 md:size-20"
                            >
                                {#if player.isPlaying}
                                    <Pause class="size-8 fill-current md:size-10" />
                                {:else}
                                    <Play class="ml-1 size-8 fill-current md:size-10" />
                                {/if}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onclick={() => player.next()}
                                disabled={!player.canPlayNext}
                                class="size-10 md:size-12"
                            >
                                <SkipForward class="size-6 fill-current md:size-8" />
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onclick={() => player.toggleRepeat()}
                            disabled={!player.queue.length}
                            class="relative"
                        >
                            <div class="flex flex-col items-center">
                                {#if player.isRepeat === 'one'}
                                    <Repeat1 class={buttonActiveClass} />
                                {:else if player.isRepeat === 'all'}
                                    <Repeat class={buttonActiveClass} />
                                {:else}
                                    <Repeat class={buttonDefaultClass} />
                                {/if}
                                {#if player.isRepeat !== 'none'}<div
                                        class={buttonDotClass}
                                    ></div>{/if}
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
        {:else}
            <div class="text-muted-foreground flex flex-col items-center justify-center">
                <Music2 size={64} class="mb-4 opacity-20" />
                <p class="text-xl font-medium">Nic teraz nie gra</p>
            </div>
        {/if}
    </div>

    <div
        class="lg:w-[40%]/500px] flex min-h-[500px] w-full flex-1 flex-col lg:h-full lg:flex-none xl:w-[500px] 2xl:w-[600px]"
    >
        <Tabs value="queue" class="flex h-full flex-col">
            <TabsList class="grid w-full grid-cols-2">
                <TabsTrigger value="queue">Kolejka</TabsTrigger>
                <TabsTrigger value="lyrics">Tekst</TabsTrigger>
            </TabsList>

            <TabsContent
                value="queue"
                class="bg-card text-card-foreground mt-2 flex-1 overflow-hidden rounded-xl border shadow-sm"
            >
                <ScrollArea class="h-full w-full p-4">
                    <div class="flex flex-col space-y-1">
                        {#each player.queue as track, i (track.id + '-' + i)}
                            <div
                                draggable="true"
                                ondragstart={(e) => handleDragStart(e, i)}
                                ondragover={(e) => {
                                    e.preventDefault();
                                    dragOverIndex = i;
                                }}
                                ondragleave={() => (dragOverIndex = null)}
                                ondrop={(e) => handleDrop(e, i)}
                                role="listitem"
                                class="group hover:bg-muted flex cursor-grab items-center gap-3 rounded-md p-2 transition-colors active:cursor-grabbing
                                    {i === player.currentIndex
                                    ? 'bg-primary/10 hover:bg-primary/15'
                                    : ''} 
                                    {dragOverIndex === i
                                    ? 'border-primary border-t-2'
                                    : 'border-t-2 border-transparent'}"
                            >
                                <div
                                    class="text-muted-foreground hover:text-foreground cursor-grab"
                                >
                                    <GripVertical size={16} />
                                </div>

                                <div
                                    class="relative h-10 w-10 shrink-0 overflow-hidden rounded shadow-sm"
                                >
                                    <img
                                        src={track.coverUrl}
                                        alt=""
                                        class="h-full w-full object-cover"
                                    />
                                    {#if i === player.currentIndex}
                                        <div
                                            class="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]"
                                        >
                                            <Play size={16} class="fill-white text-white" />
                                        </div>
                                    {/if}
                                </div>

                                <div class="flex min-w-0 flex-1 flex-col text-left">
                                    <span
                                        class="truncate text-sm font-medium {i ===
                                        player.currentIndex
                                            ? 'text-primary'
                                            : ''}"
                                    >
                                        {track.title}
                                    </span>
                                    <span class="text-muted-foreground truncate text-xs"
                                        >{track.artistName}</span
                                    >
                                </div>

                                <div class="opacity-0 transition-opacity group-hover:opacity-100">
                                    {#if i !== player.currentIndex}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            class="text-muted-foreground hover:text-destructive h-8 w-8"
                                            onclick={(e) => {
                                                e.stopPropagation();
                                                player.removeFromQueue(i);
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </ScrollArea>
            </TabsContent>

            <TabsContent
                value="lyrics"
                class="bg-card text-card-foreground mt-2 flex-1 overflow-hidden rounded-xl border p-0 shadow-sm"
            >
                <ScrollArea class="h-full w-full p-6">
                    {#if isLoadingLyrics}
                        <div class="text-muted-foreground flex h-40 items-center justify-center">
                            <span class="animate-pulse">Wczytywanie tekstu...</span>
                        </div>
                    {:else if lyricsError}
                        <div
                            class="text-muted-foreground flex h-40 items-center justify-center text-center"
                        >
                            <span>{lyricsError}</span>
                        </div>
                    {:else if lyrics.length > 0}
                        <div class="flex flex-col space-y-4 py-6">
                            {#each lyrics as line, i}
                                <button
                                    id="lyric-{i}"
                                    onclick={() => player.seek(line.time)}
                                    class="origin-left cursor-pointer text-left text-2xl font-bold transition-all duration-300 md:text-3xl
                                        {currentLyricIndex === i
                                        ? 'text-primary opacity-100'
                                        : currentLyricIndex > i
                                          ? 'text-muted-foreground hover:text-foreground opacity-40 hover:opacity-70'
                                          : 'text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100'}"
                                >
                                    {line.text}
                                </button>
                            {/each}
                        </div>
                    {:else}
                        <div class="text-muted-foreground flex h-40 items-center justify-center">
                            Odtwórz utwór, by zobaczyć tekst
                        </div>
                    {/if}
                </ScrollArea>
            </TabsContent>
        </Tabs>
    </div>
</div>
