<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/logo.svg';

    import { ModeWatcher } from 'mode-watcher';

    let { children } = $props();
</script>

<ModeWatcher />
<svelte:head>
    <link rel="icon" href={favicon} />
    <title>Michael's Music</title>
</svelte:head>
{@render children()}
