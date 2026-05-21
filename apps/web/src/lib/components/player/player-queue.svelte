<script lang="ts">
    import { player } from '$lib/player.svelte';
    import { ScrollArea } from '$lib/components/ui/scroll-area';
    import { Button } from '$lib/components/ui/button';
    import GripVertical from '@lucide/svelte/icons/grip-vertical';
    import Play from '@lucide/svelte/icons/play';
    import Trash2 from '@lucide/svelte/icons/trash-2';

    let draggingIndex = $state<number | null>(null);
    let dragOverIndex = $state<number | null>(null);

    function jumpToQueueIndex(index: number) {
        player.currentIndex = index;
        player.currentTrack = player.queue[index];
        player.currentTime = 0;
        player.isPlaying = true;
    }

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
        if (player.currentIndex === fromIdx) newCurrentIndex = toIdx;
        else if (fromIdx < player.currentIndex && toIdx >= player.currentIndex) newCurrentIndex--;
        else if (fromIdx > player.currentIndex && toIdx <= player.currentIndex) newCurrentIndex++;

        player.queue = newQueue;
        player.currentIndex = newCurrentIndex;
    }
</script>

<ScrollArea class="h-full w-full p-4">
    {#if player.playbackContext && player.currentTrack}
        <div class="bg-muted/50 border-border/40 mb-6 rounded-lg border p-4 shadow-sm">
            <span class="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                {#if player.playbackContext.type === 'album'}
                    Odtwarzane z albumu
                {:else if player.playbackContext.type === 'artist'}
                    Popularne utwory wykonawcy
                {:else}
                    Odtwarzane
                {/if}
            </span>
            <a
                href={`/${player.playbackContext.type}/${player.playbackContext.id}`}
                class="text-foreground hover:text-primary mt-0.5 block truncate text-base font-bold transition-colors"
            >
                {#if player.playbackContext.type === 'album'}
                    {player.currentTrack.albumTitle || 'Album'}
                {:else if player.playbackContext.type === 'artist'}
                    {player.currentTrack.artistName || 'Wykonawca'}
                {/if}
            </a>
        </div>
    {/if}

    {#if player.currentTrack}
        <div class="text-muted-foreground mb-2 px-1 text-xs font-bold tracking-wider uppercase">
            Teraz odtwarzane
        </div>
        <div
            class="border-primary/20 bg-primary/5 mb-6 flex items-center gap-3 rounded-lg border p-2 shadow-sm"
        >
            <div class="relative h-12 w-12 shrink-0 overflow-hidden rounded-md shadow-sm">
                <img src={player.currentTrack.coverUrl} alt="" class="h-full w-full object-cover" />
            </div>
            <div class="flex min-w-0 flex-1 flex-col text-left">
                <span class="text-primary truncate text-base font-bold"
                    >{player.currentTrack.title}</span
                >
                <span class="text-foreground/70 truncate text-sm"
                    >{player.currentTrack.artistName}</span
                >
            </div>
        </div>
    {/if}

    {#if player.queue.length - 1 > player.currentIndex}
        <div class="mb-2 flex items-center justify-between px-1">
            <span class="text-muted-foreground text-xs font-bold tracking-wider uppercase"
                >Następnie w kolejce</span
            >
            <Button
                variant="ghost"
                size="sm"
                class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-auto px-2 py-1 text-xs"
                onclick={() => player.clearQueue()}
            >
                Wyczyść
            </Button>
        </div>

        <div class="flex flex-col space-y-1">
            {#each player.queue as track, i (track.id + '-' + i)}
                {#if i > player.currentIndex}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                        draggable="true"
                        ondragstart={(e) => handleDragStart(e, i)}
                        ondragover={(e) => {
                            e.preventDefault();
                            dragOverIndex = i;
                        }}
                        ondragleave={() => (dragOverIndex = null)}
                        ondrop={(e) => handleDrop(e, i)}
                        class="group hover:bg-muted flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors active:cursor-grabbing {dragOverIndex ===
                        i
                            ? 'border-primary border-t-2'
                            : 'border-t-2 border-transparent'}"
                        onclick={() => jumpToQueueIndex(i)}
                    >
                        <div
                            class="text-muted-foreground hover:text-foreground cursor-grab p-1"
                            onclick={(e) => e.stopPropagation()}
                        >
                            <GripVertical size={16} />
                        </div>

                        <div class="relative h-10 w-10 shrink-0 overflow-hidden rounded shadow-sm">
                            <img src={track.coverUrl} alt="" class="h-full w-full object-cover" />
                            <div
                                class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100"
                            >
                                <Play size={16} class="ml-0.5 fill-white text-white" />
                            </div>
                        </div>

                        <div class="flex min-w-0 flex-1 flex-col text-left">
                            <span class="text-foreground truncate text-sm font-medium"
                                >{track.title}</span
                            >
                            <span class="text-muted-foreground truncate text-xs"
                                >{track.artistName}</span
                            >
                        </div>

                        <div class="opacity-0 transition-opacity group-hover:opacity-100">
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
                        </div>
                    </div>
                {/if}
            {/each}
        </div>
    {:else if player.currentTrack}
        <div
            class="text-muted-foreground mt-8 flex flex-col items-center justify-center text-center opacity-60"
        >
            <p class="text-sm font-medium">To już wszystko w kolejce.</p>
            <p class="mt-1 text-xs">Odtwarzanie zatrzyma się po tym utworze.</p>
        </div>
    {/if}
</ScrollArea>
