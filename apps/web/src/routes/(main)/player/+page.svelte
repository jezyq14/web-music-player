<script lang="ts">
    import PlayerCover from '$lib/components/player/player-cover.svelte';
    import PlayerQueue from '$lib/components/player/player-queue.svelte';
    import PlayerLyrics from '$lib/components/player/player-lyrics.svelte';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
</script>

<div
    class="flex h-full w-full flex-col gap-10 pb-28 lg:flex-row lg:gap-16 lg:p-10 xl:gap-32 2xl:px-16"
>
    <PlayerCover />

    <div class="flex min-h-[500px] w-full flex-1 flex-col lg:h-full lg:w-1/3 lg:flex-none">
        <Tabs value="queue" class="flex h-full flex-col">
            <TabsList class="grid w-full grid-cols-2">
                <TabsTrigger value="queue">Kolejka</TabsTrigger>
                <TabsTrigger value="lyrics">Tekst</TabsTrigger>
            </TabsList>

            <TabsContent
                value="queue"
                class="bg-card text-card-foreground mt-2 flex-1 overflow-hidden rounded-xl border shadow-sm"
            >
                <PlayerQueue />
            </TabsContent>

            <TabsContent
                value="lyrics"
                class="bg-card text-card-foreground mt-2 flex-1 overflow-hidden rounded-xl border p-0 shadow-sm"
            >
                <PlayerLyrics />
            </TabsContent>
        </Tabs>
    </div>
</div>
