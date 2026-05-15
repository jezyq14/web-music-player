<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/logo.svg';

    import { ModeWatcher } from 'mode-watcher';

    import { onNavigate } from '$app/navigation';
    import { navigating } from '$app/state';
    import { fade } from 'svelte/transition';

    let { children } = $props();

    let isNavigating = $derived(!!navigating.to);

    onNavigate((navigation) => {
        if (!document.startViewTransition) return;

        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });
</script>

<ModeWatcher />

{#if isNavigating}
    <div
        class="bg-border fixed top-0 right-0 left-0 z-100 h-0.75 overflow-hidden"
        out:fade={{ duration: 400 }}
    >
        <div class="animate-progress-bar h-full"></div>
    </div>
{/if}

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>Michael's Music</title>
</svelte:head>
{@render children()}
