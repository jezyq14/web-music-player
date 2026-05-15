// apps/web/src/lib/player.svelte.ts
export interface Track {
    id: string | null;
    title: string | null;
    artistName: string | null;
    artistId: string | null;
    albumTitle: string | null;
    albumId: string | null;
    coverUrl: string | null;
    duration: number;
}

export type RepeatMode = 'none' | 'all' | 'one';

class PlayerStore {
    // Player State
    currentTrack = $state<Track | null>(null);
    isPlaying = $state(false);
    isShuffled = $state(false);
    isRepeat = $state<RepeatMode>('none');
    currentTime = $state(0);
    duration = $state(0);
    lastSeekTime = $state<number | null>(null);

    volume = $state(0.5);
    private preMuteVolume = $state(0.5);

    // Queue
    queue = $state<Track[]>([]);
    queueSnapshot = $state<Track[]>([]);
    currentIndex = $state(-1);

    // Computed values
    canPlayPrevious = $derived(this.queue.length > 0 && (this.currentIndex > 0 || this.isRepeat === 'all' || this.currentTime > 3));
    canPlayNext = $derived(this.queue.length > 0 && (this.currentIndex < this.queue.length - 1 || this.isRepeat === 'all'));

    play(track: Track) {
        if (this.currentTrack?.id === track.id) {
            this.togglePlay();
            return;
        }
        this.currentTrack = track;
        this.isPlaying = true;

        const idx = this.queue.findIndex(t => t.id === track.id);
        if (idx === -1) {
            this.queue = [track, ...this.queue];
            this.currentIndex = 0;
        } else {
            this.currentIndex = idx;
        }
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
    }

    next() {
        if (this.queue.length === 0) return;

        if (this.isRepeat === 'one') {
            this.seek(0);
            this.isPlaying = true;
            return;
        }

        const isLastTrack = this.currentIndex === this.queue.length - 1;

        if (!isLastTrack) {
            this.currentIndex++;
        } else if (this.isRepeat === 'all') {
            this.currentIndex = 0;
        } else {
            this.isPlaying = false;
            return;
        }

        this.currentTrack = this.queue[this.currentIndex];
        this.isPlaying = true;
    }

    previous() {
        if (this.queue.length === 0) return;

        if (this.currentTime > 3) {
            this.seek(0);
            return;
        }

        const isFirstTrack = this.currentIndex === 0;

        if (!isFirstTrack) {
            this.currentIndex--;
        } else if (this.isRepeat === 'all') {
            this.currentIndex = this.queue.length - 1;
        }

        this.currentTrack = this.queue[this.currentIndex];
        this.isPlaying = true;
    }

    addToQueue(track: Track) {
        this.queue.push(track);
    }

    seek(time: number) {
        this.currentTime = time;
        this.lastSeekTime = time;
    }

    setQueue(tracks: Track[], startIndex = 0) {
        this.queue = tracks;
        this.currentIndex = startIndex;
        this.currentTrack = tracks[startIndex];
        this.isPlaying = true;
    }

    addToEnd(track: Track) {
        this.queue.push(track);
        if (this.currentIndex === -1) {
            this.play(track);
        }
    }

    playNext(track: Track) {
        if (this.currentIndex === -1) {
            this.addToEnd(track);
            return;
        }
        this.queue.splice(this.currentIndex + 1, 0, track);
    }

    removeFromQueue(index: number) {
        if (index === this.currentIndex) return;
        this.queue.splice(index, 1);
        if (index < this.currentIndex) {
            this.currentIndex--;
        }
    }

    clearQueue() {
        if (this.currentTrack) {
            this.queue = [this.currentTrack];
            this.currentIndex = 0;
        } else {
            this.queue = [];
            this.currentIndex = -1;
        }
    }

    shuffle() {
        if (this.queue.length <= 1) return;

        this.queueSnapshot = [...this.queue];

        const current = this.currentTrack;
        const others = this.queue.filter(t => t.id !== current?.id);

        for (let i = others.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [others[i], others[j]] = [others[j], others[i]];
        }

        if (current) {
            this.queue = [current, ...others];
            this.currentIndex = 0;
        } else {
            this.queue = others;
        }

        this.isShuffled = true;
    }

    unshuffle() {
        if (this.queueSnapshot.length === 0) return;

        const currentId = this.currentTrack?.id;

        this.queue = [...this.queueSnapshot];

        if (currentId) {
            const originalIndex = this.queue.findIndex(t => t.id === currentId);

            if (originalIndex !== -1) {
                this.currentIndex = originalIndex;
            }
        }

        this.isShuffled = false;
        this.queueSnapshot = [];
    }

    toggleShuffle() {
        if (!this.isShuffled) this.shuffle();
        else this.unshuffle();
    }

    toggleRepeat() {
        const modes: RepeatMode[] = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(this.isRepeat);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.isRepeat = modes[nextIndex];
    }

    toggleMute() {
        if (this.volume > 0) {
            this.preMuteVolume = this.volume;
            this.volume = 0;
        } else {
            this.volume = this.preMuteVolume || 0.5;
        }
    }

    get upcomingTracks() {
        return this.queue.slice(this.currentIndex + 1);
    }
}

export const player = new PlayerStore();