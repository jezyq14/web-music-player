<script lang="ts">
    import { player } from '$lib/player.svelte';
    import { untrack } from 'svelte';

    let audioTag: HTMLAudioElement;

    // Time sync
    $effect(() => {
        if (player.lastSeekTime !== null && audioTag) {
            audioTag.currentTime = player.lastSeekTime;
            untrack(() => {
                player.lastSeekTime = null;
            });
        }
    });

    // Play/Pause sync
    $effect(() => {
        if (player.isPlaying) {
            audioTag?.play().catch(() => (player.isPlaying = false));
        } else {
            audioTag?.pause();
        }
    });

    // Source sync
    $effect(() => {
        if (player.currentTrack?.id) {
            const trackUrl = `http://localhost:3000/v1/tracks/${player.currentTrack.id}/stream`;

            if (audioTag.src !== trackUrl) {
                audioTag.src = trackUrl;
                if (player.isPlaying) audioTag.play();
            }
        }
    });

    function handleTimeUpdate() {
        if (player.lastSeekTime === null) {
            player.currentTime = audioTag.currentTime;
            player.duration = audioTag.duration;
        }
    }

    function handleEnded() {
        const previousId = player.currentTrack?.id;

        player.next();

        if (player.currentTrack?.id === previousId && player.isPlaying) {
            audioTag.play();
        }
    }
</script>

<audio
    bind:this={audioTag}
    bind:volume={player.volume}
    ontimeupdate={handleTimeUpdate}
    onended={handleEnded}
    preload="auto"
></audio>
