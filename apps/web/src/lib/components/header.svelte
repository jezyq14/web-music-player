<script lang="ts">
    import ThemeToggler from '$lib/components/theme-toggler.svelte';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import Logo from '$lib/components/branding/logo.svelte';
    import SidebarTrigger from '$lib/components/sidebar-trigger.svelte';
    import Search from '@lucide/svelte/icons/search';
    import ArrowLeft from '@lucide/svelte/icons/arrow-left';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { IsMobile } from '$lib/hooks/is-mobile.svelte';

    const isMobile = new IsMobile().current;

    let isMobileSearchOpen = $state(false);
    let searchQuery = $state(page.url.searchParams.get('q') || '');
    let searchTimeout: ReturnType<typeof setTimeout>;

    function handleSearchInput(e: Event) {
        const target = e.target as HTMLInputElement;
        searchQuery = target.value;
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (searchQuery.trim())
                goto(`/search?q=${encodeURIComponent(searchQuery.trim())}`, {
                    keepFocus: true,
                    replaceState: true,
                });
            else goto(`/search`, { keepFocus: true, replaceState: true });
        }, 300);
    }
</script>

<header
    class="border-border flex h-[54px] w-full shrink-0 items-center justify-between gap-2 border-b p-2 px-2 md:px-4"
>
    {#if isMobileSearchOpen && isMobile}
        <div class="animate-in fade-in slide-in-from-right-4 flex w-full items-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                onclick={() => (isMobileSearchOpen = false)}
                class="shrink-0"><ArrowLeft /></Button
            >
            <Input
                value={searchQuery}
                oninput={handleSearchInput}
                class="bg-muted/50 flex-1 rounded-full border-transparent focus-visible:ring-1"
                placeholder="Czego chcesz posłuchać?"
                autofocus
            />
        </div>
    {:else}
        <div class="flex items-center gap-2"><SidebarTrigger /></div>
        <div class="flex flex-1 items-center justify-center">
            {#if isMobile}
                <Button href="/" variant="ghost"><Logo class="size-6" /></Button>
            {:else}
                <div class="relative w-full max-w-md">
                    <Search
                        class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                    />
                    <Input
                        value={searchQuery}
                        oninput={handleSearchInput}
                        class="bg-muted/50 w-full rounded-full border-transparent pl-10 transition-all focus-visible:ring-1"
                        placeholder="Czego chcesz posłuchać?"
                    />
                </div>
            {/if}
        </div>
        <div class="flex items-center gap-2">
            {#if isMobile}
                <Button
                    variant="ghost"
                    size="icon"
                    onclick={() => {
                        isMobileSearchOpen = true;
                        goto('/search');
                    }}><Search size={20} /></Button
                >
            {/if}
            <ThemeToggler />
        </div>
    {/if}
</header>
