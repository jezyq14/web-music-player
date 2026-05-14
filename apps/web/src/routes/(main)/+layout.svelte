<script lang="ts">
    import { player } from '$lib/player.svelte';

    import ThemeToggler from '$lib/components/theme-toggler.svelte';
    import * as Sidebar from '$lib/components/ui/sidebar/index.js';
    import AppSidebar from '$lib/components/app-sidebar.svelte';
    import { Button } from '$lib/components/ui/button';

    import Logo from '$lib/components/branding/logo.svelte';
    import SidebarTrigger from '$lib/components/sidebar-trigger.svelte';

    let { children } = $props();
    let audioTag: HTMLAudioElement;

    // EFEKT 1: Obsługa przewijania (Seek)
    $effect(() => {
        if (player.lastSeekTime !== null && audioTag) {
            audioTag.currentTime = player.lastSeekTime;
            player.lastSeekTime = null;
        }
    });

    // EFEKT 2: Synchronizacja Play/Pause
    $effect(() => {
        if (player.isPlaying) {
            audioTag?.play().catch(() => (player.isPlaying = false));
        } else {
            audioTag?.pause();
        }
    });

    // EFEKT 3: Zmiana źródła (src)
    $effect(() => {
        if (player.currentTrack) {
            audioTag.src = `http://localhost:3000/v1/tracks/${player.currentTrack.id}/stream`;
            if (player.isPlaying) audioTag.play();
        }
    });

    function handleTimeUpdate() {
        if (player.lastSeekTime === null) {
            player.currentTime = audioTag.currentTime;
            player.duration = audioTag.duration;
        }
    }

    function handleEnded() {
        player.next();
    }
</script>

<Sidebar.Provider class="h-dvh">
    <audio
        bind:this={audioTag}
        bind:volume={player.volume}
        ontimeupdate={handleTimeUpdate}
        onended={handleEnded}
    ></audio>
    <AppSidebar />
    <main class="h-full w-full">
        <header
            class="border-border flex w-full items-center justify-between border-b p-2 px-2 md:px-4"
        >
            <!-- Left -->
            <div class="flex items-center gap-2">
                <SidebarTrigger />
            </div>

            <!-- Center -->
            <div class="flex items-center gap-2">
                <Button href="/" variant="ghost"><Logo class="size-6 md:hidden" /></Button>
            </div>

            <!-- Right -->
            <div class="flex items-center gap-2">
                <ThemeToggler />
            </div>
        </header>
        {@render children?.()}
    </main>
</Sidebar.Provider>
