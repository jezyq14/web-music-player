<script lang="ts">
    import ThemeToggler from '$lib/components/theme-toggler.svelte';
    import * as Sidebar from '$lib/components/ui/sidebar/index.js';
    import AppSidebar from '$lib/components/app-sidebar.svelte';
    import { Button } from '$lib/components/ui/button';

    import Logo from '$lib/components/branding/logo.svelte';
    import SidebarTrigger from '$lib/components/sidebar-trigger.svelte';
    import BottomBar from '$lib/components/player/bottom-bar.svelte';
    import AudioEngine from '$lib/components/player/audio-engine.svelte';

    let { children } = $props();
</script>

<Sidebar.Provider class="h-dvh">
    <AudioEngine />

    <AppSidebar />
    <main class="h-full w-full overflow-hidden">
        <header
            class="border-border flex h-[54px] w-full items-center justify-between border-b p-2 px-2 md:px-4"
        >
            <!-- Left -->
            <div class="flex items-center gap-2">
                <SidebarTrigger />
            </div>

            <!-- Center -->
            <div class="flex items-center gap-2 md:hidden">
                <Button href="/" variant="ghost"><Logo class="size-6" /></Button>
            </div>

            <!-- Right -->
            <div class="flex items-center gap-2">
                <ThemeToggler />
            </div>
        </header>

        <div
            class="h-[calc(100dvh-54px-64px)] overflow-auto px-6 py-4 md:h-[calc(100dvh-54px-88px)]"
        >
            {@render children?.()}
        </div>
    </main>

    <div class="bg-sidebar fixed bottom-0 z-50 h-16 w-full border-t px-4 md:h-22">
        <BottomBar />
    </div>
</Sidebar.Provider>
