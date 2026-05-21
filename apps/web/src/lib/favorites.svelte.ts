import { api } from "./api";

class FavoritesStore {
    tracks = $state<Set<string>>(new Set());
    albums = $state<any[]>([]);
    artists = $state<any[]>([]);

    init(data: any) {
        this.tracks = new Set(data?.tracks || []);
        this.albums = data?.albums || [];
        this.artists = data?.artists || [];
    }

    async toggleTrack(id: string) {
        const isLiked = this.tracks.has(id);
        if (isLiked) {
            this.tracks.delete(id);
        } else {
            this.tracks.add(id);
        }

        this.tracks = new Set(this.tracks);

        await api.v1.favorites.toggle.$post({ json: { type: 'track', id } });
    }

    async toggleAlbum(album: any) {
        const isLiked = this.albums.some(a => a.id === album.id);
        if (isLiked) this.albums = this.albums.filter(a => a.id !== album.id);
        else this.albums = [{ id: album.id, title: album.title, coverUrl: album.coverUrl }, ...this.albums];

        await api.v1.favorites.toggle.$post({ json: { type: 'album', id: album.id } });
    }

    async toggleArtist(artist: any) {
        const isLiked = this.artists.some(a => a.id === artist.id);
        if (isLiked) this.artists = this.artists.filter(a => a.id !== artist.id);
        else this.artists = [{ id: artist.id, name: artist.name, imageUrl: artist.imageUrl }, ...this.artists];

        await api.v1.favorites.toggle.$post({ json: { type: 'artist', id: artist.id } });
    }
}

export const favorites = new FavoritesStore();