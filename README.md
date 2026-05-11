# Web Music Player

> [!NOTE]
> Całość jest projektem szkolnym na którego wykonanie mieliśmy 2 tygodnie.

Aplikacja do streamowania muzyki, a w zasadzie to jej monorepo. Korzysta ona z lokalnych plików muzyki, w początkowym zamyśle miała streamować z jakichś konkretnych platform, ale z racji na problemy z ich regulaminami ten pomysł nie wypalił.

## Użyte technologie

### Frontend

- SvelteKit
- tailwindcss
- svelte-shadcn
- Hono RPC

### Backend

- Hono
- Drizzle ORM (PostgreSQL)
- Socket.IO

## Uruchamianie

### Development

1. Sklonuj repozytorium:

```bash
git clone https://github.com/jezyq14/web-music-player
```

2. Zainstaluj dependencies:

```bash
pnpm install
```

3. Skopiuj plik `.env.example` do `.env` i uzupełnij go zgodnie z [tymi instrukcjami](#konfiguracja)

4. Uruchom aplikację:

```bash
pnpm dev
```

## Konfiguracja

Skopiuj plik `.env.example` do `.env` i uzupełnij go:

```bash
cp .env.example .env
```

Z opcji wartych wytłumaczenia to:

- `MUSIC_LIBRARY_PATH` to ścieżka do katalogu z muzyką, gdzie struktura powinna przypominać: `[Wykonawca]/[(rok) Album]/[Nr. Tytuł].mp3`, dodatkowo w każdym folderze albumu powinna znajdować się jego okładka w pliku `cover.jpeg`.

## Licencja

Projekt objęty jest licencją [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html).

<img width="150px" src="/assets/szczur-platform-badge.svg" />