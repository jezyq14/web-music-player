<script lang="ts">
    import { type ComponentProps } from 'svelte';
    import { page } from '$app/state';

    import { favorites } from '$lib/favorites.svelte';

    import HeartIcon from '@lucide/svelte/icons/heart';
    import HouseIcon from '@lucide/svelte/icons/house';
    import BookSearchIcon from '@lucide/svelte/icons/book-search';
    import Disc3Icon from '@lucide/svelte/icons/disc-3';

    import * as Sidebar from '$lib/components/ui/sidebar/index.js';
    import Logo from '$lib/components/branding/logo.svelte';
    import NavUser from './nav-user.svelte';

    let {
        ref = $bindable(null),
        collapsible = 'icon',
        ...restProps
    }: ComponentProps<typeof Sidebar.Root> = $props();

    const data = {
        navItems: [
            {
                label: 'Strona główna',
                href: '/',
                icon: HouseIcon,
            },
            {
                label: 'Odtwarzacz',
                href: '/player',
                icon: Disc3Icon,
            },
            {
                label: 'Odkrywaj',
                href: '/discover',
                icon: BookSearchIcon,
            },
        ],
    };
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
    <Sidebar.Header class="hidden md:block">
        <Sidebar.Menu>
            <Sidebar.MenuItem>
                <a
                    href="/"
                    class="flex items-center justify-center p-2 transition-all duration-300 ease-in-out"
                >
                    <Logo
                        class="size-9 shrink-0 transition-all duration-300 ease-in-out group-data-[state=collapsed]:size-8"
                    />

                    <div
                        class="ml-2 grid grid-cols-[1fr] overflow-hidden opacity-100
                    transition-all duration-300 ease-in-out
                    group-data-[state=collapsed]:ml-0 group-data-[state=collapsed]:grid-cols-[0fr] group-data-[state=collapsed]:opacity-0"
                    >
                        <span class="min-w-0 text-xl font-bold whitespace-nowrap">
                            Michael's Music
                        </span>
                    </div>
                </a>
            </Sidebar.MenuItem>
        </Sidebar.Menu>
    </Sidebar.Header>

    <Sidebar.Content>
        <Sidebar.Group>
            <Sidebar.GroupLabel>Aplikacja</Sidebar.GroupLabel>
            <Sidebar.Menu>
                {#each data.navItems as item}
                    <Sidebar.MenuItem>
                        <Sidebar.MenuButton
                            tooltipContent={item.label}
                            isActive={page.url.pathname === item.href ||
                                (page.url.pathname.startsWith(item.href) && item.href !== '/')}
                        >
                            {#snippet child({ props })}
                                <a href={item.href} {...props}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </a>
                            {/snippet}
                        </Sidebar.MenuButton>
                    </Sidebar.MenuItem>
                {/each}
            </Sidebar.Menu>
        </Sidebar.Group>

        <Sidebar.Group>
            <Sidebar.GroupLabel>Biblioteka</Sidebar.GroupLabel>
            <Sidebar.Menu>
                <Sidebar.MenuItem>
                    <Sidebar.MenuButton
                        isActive={page.url.pathname === '/playlist/favorites'}
                        tooltipContent="Polubione utwory"
                    >
                        {#snippet child({ props })}
                            <a href="/playlist/favorites" {...props}>
                                <div
                                    class="flex size-6 items-center justify-center rounded-sm bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-sm"
                                >
                                    <HeartIcon class="size-3 fill-current" />
                                </div>
                                <span>Polubione utwory</span>
                            </a>
                        {/snippet}
                    </Sidebar.MenuButton>
                </Sidebar.MenuItem>

                {#each favorites.albums as album}
                    <Sidebar.MenuItem>
                        <Sidebar.MenuButton isActive={page.url.pathname === `/album/${album.id}`}>
                            {#snippet child({ props })}
                                <a href={`/album/${album.id}`} {...props}>
                                    <img
                                        src={album.coverUrl}
                                        class="size-6 rounded-sm object-cover shadow-sm"
                                        alt=""
                                    />
                                    <span class="truncate">{album.title}</span>
                                </a>
                            {/snippet}
                        </Sidebar.MenuButton>
                    </Sidebar.MenuItem>
                {/each}

                {#each favorites.artists as artist}
                    <Sidebar.MenuItem>
                        <Sidebar.MenuButton isActive={page.url.pathname === `/artist/${artist.id}`}>
                            {#snippet child({ props })}
                                <a href={`/artist/${artist.id}`} {...props}>
                                    <img
                                        src={artist.imageUrl || '/placeholder.jpg'}
                                        class="size-6 rounded-full object-cover shadow-sm"
                                        alt=""
                                    />
                                    <span class="truncate">{artist.name}</span>
                                </a>
                            {/snippet}
                        </Sidebar.MenuButton>
                    </Sidebar.MenuItem>
                {/each}
            </Sidebar.Menu>
        </Sidebar.Group>
    </Sidebar.Content>

    <Sidebar.Rail />

    <Sidebar.Footer class="md:hidden">
        <NavUser variant="sidebar" />
    </Sidebar.Footer>
</Sidebar.Root>
