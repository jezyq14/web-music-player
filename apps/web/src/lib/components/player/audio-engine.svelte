<script lang="ts">
    import { player } from '$lib/player.svelte';
    import { untrack } from 'svelte';

    let audioTag: HTMLAudioElement;

    let pageTitle = $derived(
        player.currentTrack && player.isPlaying
            ? `${player.currentTrack.title} | Michael's Music`
            : "Michael's Music",
    );

    async function safelyPlay() {
        if (!audioTag || !player.isPlaying || !player.currentTrack) return;

        try {
            if (audioTag.paused) {
                await audioTag.play();
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Source sync
    $effect(() => {
        if (player.currentTrack?.id && audioTag) {
            const trackUrl = `http://localhost:3000/v1/tracks/${player.currentTrack.id}/stream`;

            if (audioTag.src !== trackUrl) {
                audioTag.pause();
                audioTag.src = trackUrl;
                audioTag.load();

                if (player.isPlaying) {
                    safelyPlay();
                }
            }
        }
    });

    // Play/Pause sync
    $effect(() => {
        if (!audioTag) return;

        if (player.isPlaying) {
            safelyPlay();
        } else {
            audioTag.pause();
        }
    });

    // Seek sync
    $effect(() => {
        if (player.lastSeekTime !== null && audioTag) {
            audioTag.currentTime = player.lastSeekTime;
            untrack(() => {
                player.lastSeekTime = null;
            });
        }
    });

    function handleKeydown(event: KeyboardEvent) {
        // Ignoruj skróty, jeśli użytkownik wpisuje tekst w formularzu (np. w polu wyszukiwania)
        if (
            event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement ||
            (event.target instanceof HTMLElement && event.target.isContentEditable)
        ) {
            return;
        }

        switch (event.key) {
            // Play/pause
            case ' ':
                event.preventDefault();
                if (player.queue.length > 0) {
                    player.togglePlay();
                }
                break;
            // Volume up
            case 'ArrowUp':
                event.preventDefault();
                player.volume = Math.max(
                    0,
                    Math.min(1, Math.round((player.volume + 0.05) * 100) / 100),
                );
                break;
            // Volume down
            case 'ArrowDown':
                event.preventDefault();
                player.volume = Math.max(
                    0,
                    Math.min(1, Math.round((player.volume - 0.05) * 100) / 100),
                );
                break;
            // Previous
            case 'ArrowLeft':
                event.preventDefault();
                if (player.canPlayPrevious) {
                    player.previous();
                }
                break;
            // Next
            case 'ArrowRight':
                event.preventDefault();
                if (player.canPlayNext) {
                    player.next();
                }
                break;
            // Mute/unmute
            case 'm':
            case 'M':
                player.toggleMute();
                break;
        }
    }

    function handleCanPlay() {
        if (player.isPlaying) {
            safelyPlay();
        }
    }

    function handleTimeUpdate() {
        if (player.lastSeekTime === null && audioTag) {
            player.currentTime = audioTag.currentTime;
            player.duration = audioTag.duration;
        }
    }

    function handleEnded() {
        const previousId = player.currentTrack?.id;
        player.next();

        if (player.currentTrack?.id === previousId && player.isPlaying) {
            audioTag.currentTime = 0;
            safelyPlay();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
    <title>{pageTitle}</title>
</svelte:head>

<audio
    bind:this={audioTag}
    bind:volume={player.volume}
    oncanplay={handleCanPlay}
    onloadedmetadata={handleCanPlay}
    ontimeupdate={handleTimeUpdate}
    onended={handleEnded}
    preload="auto"
></audio>
