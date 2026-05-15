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
