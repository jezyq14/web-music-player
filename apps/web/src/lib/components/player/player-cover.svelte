<script lang="ts">
    import { player } from '$lib/player.svelte';
    import { Button } from '$lib/components/ui/button';
    import { Slider } from '$lib/components/ui/slider';

    import Play from '@lucide/svelte/icons/play';
    import Pause from '@lucide/svelte/icons/pause';
    import SkipForward from '@lucide/svelte/icons/skip-forward';
    import SkipBack from '@lucide/svelte/icons/skip-back';
    import Shuffle from '@lucide/svelte/icons/shuffle';
    import Repeat from '@lucide/svelte/icons/repeat';
    import Repeat1 from '@lucide/svelte/icons/repeat-1';
    import Music2 from '@lucide/svelte/icons/music-2';
    import LikeButton from '../like-button.svelte';

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
</script>

<div class="flex flex-1 flex-col items-center justify-center lg:px-4">
    {#if player.currentTrack}
        <div class="flex w-full max-w-1/4 flex-col gap-6 lg:max-w-[600px] lg:gap-8">
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
                <div class="flex gap-4">
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
                                >{player.currentTrack.artistName}</a
                            >
                        </div>
                    </div>
                    <LikeButton type="track" id={player.currentTrack.id!} class="" />
                </div>

                <div class="flex flex-col gap-2 md:hidden">
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
                        class="cursor-pointer"
                    />
                    <div
                        class="text-muted-foreground flex w-full justify-between text-xs font-medium"
                    >
                        <span>{formatTime(displayTime)}</span>
                        <span>{formatTime(player.duration || 0)}</span>
                    </div>
                </div>

                <!-- Kontrolki (Mobilnie) -->
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
                                class={player.isShuffled ? buttonActiveClass : buttonDefaultClass}
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
                            {#if player.isRepeat !== 'none'}<div class={buttonDotClass}></div>{/if}
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
