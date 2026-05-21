<script lang="ts">
    import * as Sidebar from '$lib/components/ui/sidebar/index.js';
    import AppSidebar from '$lib/components/app-sidebar.svelte';
    import BottomBar from '$lib/components/player/bottom-bar.svelte';
    import AudioEngine from '$lib/components/player/audio-engine.svelte';
    import Header from '$lib/components/header.svelte';
    import { page } from '$app/state';
    import { IsMobile } from '$lib/hooks/is-mobile.svelte';
    import { favorites } from '$lib/favorites.svelte';

    let { children, data } = $props();
    const isMobile = new IsMobile().current;
    let isPlayerPage = $derived(page.url.pathname === '/player');

    $effect.pre(() => {
        favorites.init(data.userFavorites);
    });
</script>

<Sidebar.Provider class="h-dvh">
    <AudioEngine />
    <AppSidebar
        class={isPlayerPage && isMobile
            ? 'h-dvh'
            : 'h-[calc(100dvh-64px)] md:h-[calc(100dvh-88px)]'}
    />

    <main class="flex h-full w-full flex-col overflow-hidden">
        <Header />
        <div
            class="overflow-auto px-4 py-4 transition-all md:px-6 {isPlayerPage && isMobile
                ? 'h-[calc(100dvh-54px)]'
                : 'h-[calc(100dvh-54px-64px)] md:h-[calc(100dvh-54px-88px)]'}"
        >
            {@render children?.()}
        </div>
    </main>

    {#if !(isPlayerPage && isMobile)}
        <div class="bg-sidebar fixed bottom-0 z-50 h-16 w-full border-t px-4 md:h-22">
            <BottomBar />
        </div>
    {/if}
</Sidebar.Provider>
