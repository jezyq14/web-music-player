<script lang="ts">
    import { player } from '$lib/player.svelte';
    import { Button } from '$lib/components/ui/button';
    import { Slider } from '$lib/components/ui/slider';

    import Play from '@lucide/svelte/icons/play';
    import Pause from '@lucide/svelte/icons/pause';
    import SkipForward from '@lucide/svelte/icons/skip-forward';
    import SkipBack from '@lucide/svelte/icons/skip-back';
    import Volume2 from '@lucide/svelte/icons/volume-2';
    import Volume1 from '@lucide/svelte/icons/volume-1';
    import VolumeX from '@lucide/svelte/icons/volume-x';
    import Shuffle from '@lucide/svelte/icons/shuffle';
    import Repeat from '@lucide/svelte/icons/repeat';
    import Repeat1 from '@lucide/svelte/icons/repeat-1';
    import { goto } from '$app/navigation';

    let albumUrl = $derived(
        player.currentTrack?.albumId ? `/album/${player.currentTrack.albumId}` : '#',
    );
    let artistUrl = $derived(
        player.currentTrack?.artistId ? `/artist/${player.currentTrack.artistId}` : '#',
    );

    let buttonDefaultClass = 'text-current';
    let buttonActiveClass = 'text-primary dark:text-chart-2';
    let buttonDotClass = 'bg-primary dark:bg-chart-2 absolute bottom-0.5 h-1 w-1 rounded-full';

    let isDragging = $state(false);
    let dragTime = $state(0);

    let displayTime = $derived(isDragging ? dragTime : player.currentTime);

    function handleVolumeScroll(e: WheelEvent) {
        e.preventDefault();

        const step = 0.05;
        const change = e.deltaY < 0 ? step : -step;

        const newVolume = player.volume + change;
        player.volume = Math.max(0, Math.min(1, Math.round(newVolume * 100) / 100));
    }

    function formatTime(seconds: number) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function handleBarClick(e: MouseEvent) {
        const target = e.target as HTMLElement;

        if (target.closest('button, a, .no-navigate')) {
            return;
        }

        goto('/player');
    }
</script>

<div
    class="flex h-full w-full items-center justify-between md:grid md:grid-cols-3"
    role="button"
    tabindex="-1"
    onkeydown={() => null}
    onclick={handleBarClick}
>
    <div class="flex min-w-0 flex-1 items-center gap-3 pr-4 text-left md:pr-0">
        {#if player.currentTrack}
            <a href={albumUrl} class="block shrink-0">
                <img
                    src={player.currentTrack.coverUrl}
                    class="aspect-square h-10 rounded object-cover shadow-lg hover:cursor-pointer md:h-14"
                    alt="album cover"
                />
            </a>
            <div class="min-w-0 overflow-hidden">
                <a href={albumUrl} class="block">
                    <div class="truncate font-medium hover:underline">
                        {player.currentTrack.title}
                    </div>
                </a>
                <a href={artistUrl} class="block">
                    <div class="text-foreground/70 truncate text-xs hover:underline">
                        {player.currentTrack.artistName}
                    </div>
                </a>
            </div>
        {/if}
    </div>

    <div class="flex items-center gap-2 md:flex-col md:gap-2">
        <div class="flex items-center gap-1 md:gap-4">
            <Button
                variant="ghost"
                size="icon"
                onclick={() => player.toggleShuffle()}
                class="relative hidden md:inline-flex"
                disabled={player.queue.length <= 1}
            >
                <div class="flex flex-col items-center">
                    <Shuffle class={player.isShuffled ? buttonActiveClass : buttonDefaultClass} />
                    {#if player.isShuffled}<div class={buttonDotClass}></div>{/if}
                </div>
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onclick={() => player.previous()}
                class="hidden md:inline-flex"
                disabled={!player.canPlayPrevious}
            >
                <SkipBack class="fill-current" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                class="md:bg-foreground md:text-background md:hover:bg-input! rounded-full md:size-10"
                onclick={() => player.togglePlay()}
                disabled={!player.queue.length}
            >
                {#if player.isPlaying}
                    <Pause class="fill-current" />
                {:else}
                    <Play class="fill-current" />
                {/if}
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onclick={() => player.next()}
                disabled={!player.canPlayNext}
            >
                <SkipForward class="fill-current" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onclick={() => player.toggleRepeat()}
                class="relative hidden md:inline-flex"
                disabled={!player.queue.length}
            >
                <div class="flex flex-col items-center">
                    {#if player.isRepeat === 'one'}
                        <Repeat1 class={buttonActiveClass} />
                    {:else if player.isRepeat === 'all'}
                        <Repeat class={buttonActiveClass} />
                    {:else}
                        <Repeat class={buttonDefaultClass} />
                    {/if}
                    {#if player.isRepeat !== 'none'}<div class={buttonDotClass}></div>{/if}
                </div>
            </Button>
        </div>

        <div class="hidden w-full max-w-md items-center gap-3 text-[10px] text-zinc-500 md:flex">
            <span class="w-8 text-right">{formatTime(displayTime)}</span>

            <Slider
                type="single"
                value={displayTime}
                max={Math.max(player.duration || 0, player.currentTime || 0, 1)}
                step={1}
                onValueChange={(v) => {
                    if (!isDragging && v === Math.round(player.currentTime || 0)) return;

                    isDragging = true;
                    dragTime = v;
                }}
                onValueCommit={(v) => {
                    isDragging = false;
                    player.seek(v);
                }}
                class="no-navigate flex-1 cursor-pointer"
            />

            <span class="w-8">{formatTime(player.duration || 0)}</span>
        </div>
    </div>

    <div class="hidden items-center justify-end gap-2 px-4 md:flex" onwheel={handleVolumeScroll}>
        <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 text-zinc-400 transition-colors hover:text-white"
            onclick={() => player.toggleMute()}
        >
            {#if player.volume >= 0.5}
                <Volume2 size={18} />
            {:else if player.volume > 0}
                <Volume1 size={18} />
            {:else}
                <VolumeX size={18} />
            {/if}
        </Button>

        <Slider
            type="single"
            value={player.volume}
            max={1}
            step={0.01}
            onValueChange={(v) => (player.volume = v)}
            class="no-navigate w-24 cursor-pointer"
        />
    </div>
</div>
