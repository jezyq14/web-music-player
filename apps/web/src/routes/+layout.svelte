<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/logo.svg';

    import { ModeWatcher } from 'mode-watcher';

    import { onNavigate } from '$app/navigation';

    let { children } = $props();

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

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>Michael's Music</title>
</svelte:head>
{@render children()}
