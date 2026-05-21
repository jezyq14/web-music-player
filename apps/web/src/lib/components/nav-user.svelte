<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';

    import SettingsIcon from '@lucide/svelte/icons/settings';
    import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
    import LogOutIcon from '@lucide/svelte/icons/log-out';
    import LogInIcon from '@lucide/svelte/icons/log-in';

    import * as Avatar from '$lib/components/ui/avatar/index.js';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
    import * as Sidebar from '$lib/components/ui/sidebar/index.js';
    import { useSidebar } from '$lib/components/ui/sidebar/index.js';
    import { Button } from '$lib/components/ui/button/index.js';

    let { variant = 'sidebar' }: { variant?: 'sidebar' | 'header' } = $props();

    let user = $derived(page.data.user);
    const sidebar = useSidebar();
</script>

{#snippet dropdownContent()}
    <DropdownMenu.Label class="p-0 font-normal">
        <div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
            <Avatar.Root class="size-8 rounded-lg">
                <Avatar.Image
                    src={user?.avatar || ''}
                    alt={user?.username}
                    referrerpolicy="no-referrer"
                />
                <Avatar.Fallback class="bg-primary text-primary-foreground rounded-lg">
                    {user?.username?.charAt(0).toUpperCase()}
                </Avatar.Fallback>
            </Avatar.Root>
            <div class="grid flex-1 text-start text-sm leading-tight">
                <span class="truncate font-medium">{user?.username}</span>
                {#if user?.email}
                    <span class="text-muted-foreground truncate text-xs">{user?.email}</span>
                {/if}
            </div>
        </div>
    </DropdownMenu.Label>
    <DropdownMenu.Separator />
    <DropdownMenu.Group>
        <DropdownMenu.Item onclick={() => goto('/settings')}>
            <SettingsIcon class="mr-2 size-4" />
            Ustawienia
        </DropdownMenu.Item>
    </DropdownMenu.Group>
    <DropdownMenu.Separator />
    <DropdownMenu.Item onclick={() => goto('/logout')}>
        <LogOutIcon class="mr-2 size-4" />
        Wyloguj się
    </DropdownMenu.Item>
{/snippet}

{#if !user}
    {#if variant === 'sidebar'}
        <Sidebar.Menu>
            <Sidebar.MenuItem>
                <Button variant="outline" href="/login" class="w-full">
                    <LogInIcon class="mr-2 size-4" />
                    <span class="group-data-[state=collapsed]:hidden">Zaloguj się</span>
                </Button>
            </Sidebar.MenuItem>
        </Sidebar.Menu>
    {:else}
        <Button variant="outline" size="sm" href="/login">Zaloguj się</Button>
    {/if}
{:else if variant === 'sidebar'}
    <Sidebar.Menu>
        <Sidebar.MenuItem>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    {#snippet child({ props })}
                        <Sidebar.MenuButton
                            size="lg"
                            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            {...props}
                        >
                            <Avatar.Root class="size-8 rounded-lg">
                                <Avatar.Image
                                    src={user.avatar || ''}
                                    alt={user.username}
                                    referrerpolicy="no-referrer"
                                />
                                <Avatar.Fallback
                                    class="bg-primary text-primary-foreground rounded-lg"
                                >
                                    {user.username.charAt(0).toUpperCase()}
                                </Avatar.Fallback>
                            </Avatar.Root>
                            <div class="grid flex-1 text-start text-sm leading-tight">
                                <span class="truncate font-medium">{user.username}</span>
                            </div>
                            <ChevronsUpDownIcon class="ms-auto size-4" />
                        </Sidebar.MenuButton>
                    {/snippet}
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                    class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
                    side={sidebar.isMobile ? 'bottom' : 'right'}
                    align="end"
                    sideOffset={4}
                >
                    {@render dropdownContent()}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </Sidebar.MenuItem>
    </Sidebar.Menu>
{:else}
    <DropdownMenu.Root>
        <DropdownMenu.Trigger>
            <Button
                variant="ghost"
                size="icon"
                class="border-border/50 relative size-9 overflow-hidden rounded-full border"
            >
                <Avatar.Root class="size-9 rounded-full">
                    <Avatar.Image
                        src={user.avatar || ''}
                        alt={user.username}
                        referrerpolicy="no-referrer"
                    />
                    <Avatar.Fallback class="bg-primary text-primary-foreground font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                    </Avatar.Fallback>
                </Avatar.Root>
            </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-56 rounded-lg" align="end" sideOffset={8}>
            {@render dropdownContent()}
        </DropdownMenu.Content>
    </DropdownMenu.Root>
{/if}
