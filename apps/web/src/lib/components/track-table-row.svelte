<script lang="ts">
    import { player, type Track } from '$lib/player.svelte';
    import { getTrackMenuOptions } from '$lib/utils/track-menu';
    import { Button } from '$lib/components/ui/button';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import * as ContextMenu from '$lib/components/ui/context-menu';
    import Play from '@lucide/svelte/icons/play';
    import Pause from '@lucide/svelte/icons/pause';
    import MoreHorizontal from '@lucide/svelte/icons/more-horizontal';
    import { goto } from '$app/navigation';

    let {
        track,
        index,
        showCover = false,
        onPlay,
    } = $props<{ track: Track; index: number; showCover?: boolean; onPlay?: () => void }>();

    let isCurrent = $derived(player.currentTrack?.id === track.id);
    let isPlaying = $derived(isCurrent && player.isPlaying);
    let menuOptions = $derived(getTrackMenuOptions(track));

    function formatTime(seconds: number) {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function handlePlay() {
        if (onPlay) onPlay();
        else player.play(track);
    }
</script>

<ContextMenu.Root>
    <ContextMenu.Trigger>
        <div
            class="group hover:bg-muted/50 grid cursor-pointer grid-cols-[40px_1fr_50px] items-center gap-2 rounded-md px-2 py-2 transition-colors md:grid-cols-[40px_1fr_100px_80px_50px] {isCurrent
                ? 'bg-muted/30'
                : ''}"
            onclick={handlePlay}
            role="button"
            tabindex="0"
            onkeydown={() => null}
        >
            <div class="flex w-8 items-center justify-center">
                {#if isPlaying}
                    <Pause size={16} class="fill-primary text-primary" />
                {:else}
                    <span
                        class="text-muted-foreground group-hover:hidden {isCurrent
                            ? 'text-primary'
                            : ''}">{index}</span
                    >
                    <Play
                        size={16}
                        class="hidden fill-current group-hover:block {isCurrent
                            ? 'text-primary'
                            : ''}"
                    />
                {/if}
            </div>

            <div class="flex min-w-0 items-center gap-3 pr-4">
                {#if showCover}
                    <img
                        src={track.coverUrl}
                        alt=""
                        class="h-10 w-10 shrink-0 rounded object-cover shadow-sm"
                    />
                {/if}
                <div class="flex min-w-0 flex-col">
                    <span
                        class="truncate text-base font-medium {isCurrent
                            ? 'text-primary'
                            : 'text-foreground'}">{track.title}</span
                    >
                    {#if showCover}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <span
                            class="text-muted-foreground hover:text-foreground truncate text-sm hover:underline"
                            onclick={(e) => {
                                e.stopPropagation();
                                goto(`/artist/${track.artistId}`);
                            }}
                        >
                            {track.artistName}
                        </span>
                    {/if}
                </div>
            </div>

            <div class="text-muted-foreground hidden items-center justify-end text-sm md:flex">
                <!-- @ts-ignore -->
                {track.playCount > 0 ? track.playCount.toLocaleString('pl-PL') : '-'}
            </div>

            <div class="text-muted-foreground hidden items-center justify-end text-sm md:flex">
                {formatTime(track.duration)}
            </div>

            <div
                class="flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100"
                onclick={(e) => e.stopPropagation()}
                tabindex="0"
                role="button"
                onkeydown={() => null}
            >
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        <Button
                            variant="ghost"
                            size="icon"
                            class="text-muted-foreground hover:text-foreground"
                            ><MoreHorizontal size={20} /></Button
                        >
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content class="w-56" align="end">
                        {#each menuOptions as option}
                            <DropdownMenu.Item onclick={option.action}
                                ><option.icon
                                    class="mr-2 size-4"
                                />{option.label}</DropdownMenu.Item
                            >
                        {/each}
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            </div>
        </div>
    </ContextMenu.Trigger>

    <ContextMenu.Content class="w-56">
        {#each menuOptions as option}
            <ContextMenu.Item onclick={option.action}
                ><option.icon class="mr-2 size-4" />{option.label}</ContextMenu.Item
            >
        {/each}
    </ContextMenu.Content>
</ContextMenu.Root>
