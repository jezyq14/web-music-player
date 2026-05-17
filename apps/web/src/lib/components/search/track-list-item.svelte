<script lang="ts">
    import { player, type Track } from '$lib/player.svelte';
    import { Button } from '$lib/components/ui/button';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import * as ContextMenu from '$lib/components/ui/context-menu';
    import Play from '@lucide/svelte/icons/play';
    import MoreHorizontal from '@lucide/svelte/icons/more-horizontal';
    import ListPlus from '@lucide/svelte/icons/list-plus';
    import ArrowRightToLine from '@lucide/svelte/icons/arrow-right-to-line';
    import Disc from '@lucide/svelte/icons/disc';
    import User from '@lucide/svelte/icons/user';
    import { goto } from '$app/navigation';

    let { track }: { track: Track } = $props();

    const trackMenuOptions = [
        {
            label: 'Dodaj do kolejki',
            icon: ListPlus,
            action: () => player.addToQueue(track),
        },
        {
            label: 'Odtwórz jako następny',
            icon: ArrowRightToLine,
            action: () => player.playNext(track),
        },
        {
            label: 'Przejdź do wykonawcy',
            icon: User,
            action: () => goto(`/artist/${track.artistId}`),
        },
        {
            label: 'Przejdź do albumu',
            icon: Disc,
            action: () => goto(`/album/${track.albumId}`),
        },
    ];

    function play() {
        player.play(track);
    }
</script>

<ContextMenu.Root>
    <ContextMenu.Trigger>
        <div
            class="group hover:bg-muted/50 flex cursor-pointer items-center justify-between gap-3 rounded-md p-2 transition-colors"
            onclick={play}
            role="button"
            tabindex={0}
            onkeydown={() => null}
        >
            <div class="flex min-w-0 items-center gap-4">
                <div class="relative h-12 w-12 shrink-0 overflow-hidden rounded shadow-sm">
                    <img src={track.coverUrl} alt="" class="h-full w-full object-cover" />
                    <div
                        class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                        <Play size={16} class="fill-white text-white" />
                    </div>
                </div>
                <div class="flex min-w-0 flex-col">
                    <span class="text-foreground truncate text-base font-medium">{track.title}</span
                    >
                    <span
                        class="text-muted-foreground hover:text-foreground truncate text-sm hover:underline"
                        onclick={(e) => {
                            e.stopPropagation();
                            goto(`/artist/${track.artistId}`);
                        }}
                        role="button"
                        tabindex={0}
                        onkeydown={() => null}>{track.artistName}</span
                    >
                </div>
            </div>

            <div
                class="px-2 opacity-0 transition-opacity group-hover:opacity-100"
                onclick={(e) => e.stopPropagation()}
                role="button"
                tabindex={0}
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
                        {#each trackMenuOptions as option}
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
        {#each trackMenuOptions as option}
            <ContextMenu.Item onclick={option.action}
                ><option.icon class="mr-2 size-4" />{option.label}</ContextMenu.Item
            >
        {/each}
    </ContextMenu.Content>
</ContextMenu.Root>
