<script lang="ts">
    import MenuIcon from '@lucide/svelte/icons/menu';
    import PanelLeftIcon from '@lucide/svelte/icons/panel-left';

    import { useSidebar } from '$lib/components/ui/sidebar/index.js';
    import Button from '$lib/components/ui/button/button.svelte';
    const sidebar = useSidebar();

    let { class: className = '' } = $props();
</script>

<Button variant="ghost" size="icon" onclick={() => sidebar.toggle()} class={className}>
    <PanelLeftIcon class="hidden md:block" />
    <MenuIcon class="md:hidden" />
</Button>
