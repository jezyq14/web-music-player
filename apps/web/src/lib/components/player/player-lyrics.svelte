<script lang="ts">
    import { player } from '$lib/player.svelte';
    import { ScrollArea } from '$lib/components/ui/scroll-area';

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
            if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    $effect(() => {
        const track = player.currentTrack;
        if (track) fetchLyrics(track.title || '', track.artistName || '', track.duration);
        else lyrics = [];
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
                if (bestMatch) parseLrc(bestMatch.syncedLyrics);
                else lyricsError = 'Brak zsynchronizowanego tekstu.';
            } else {
                const data = await res.json();
                if (data.syncedLyrics) parseLrc(data.syncedLyrics);
                else lyricsError = 'Brak zsynchronizowanego tekstu.';
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
                const text = line.replace(timeRegex, '').trim();
                if (text) parsed.push({ time: minutes * 60 + seconds, text });
            }
        }
        lyrics = parsed;
    }
</script>

<ScrollArea class="h-full w-full p-6">
    {#if isLoadingLyrics}
        <div class="text-muted-foreground flex h-40 items-center justify-center">
            <span class="animate-pulse">Wczytywanie tekstu...</span>
        </div>
    {:else if lyricsError}
        <div class="text-muted-foreground flex h-40 items-center justify-center text-center">
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
