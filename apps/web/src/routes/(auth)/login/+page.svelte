<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import Logo from '$lib/components/branding/logo.svelte';

    let { form } = $props();
</script>

<div class="bg-background flex min-h-screen items-center justify-center p-4">
    <div class="bg-card w-full max-w-md space-y-8 rounded-2xl border p-8 shadow-2xl">
        <div class="flex flex-col items-center gap-2 text-center">
            <Logo class="h-12 w-12" />
            <h1 class="text-foreground text-2xl font-bold tracking-tight">Witaj z powrotem</h1>
            <p class="text-muted-foreground text-sm">Zaloguj się do swojego konta</p>
        </div>

        <form method="POST" class="space-y-6">
            <div class="space-y-4">
                <div class="space-y-2">
                    <label for="username" class="text-sm leading-none font-medium"
                        >Nazwa użytkownika</label
                    >
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        required
                        placeholder="janek123"
                    />
                </div>
                <div class="space-y-2">
                    <label for="password" class="text-sm leading-none font-medium">Hasło</label>
                    <Input id="password" name="password" type="password" required />
                </div>
            </div>

            {#if form?.error}
                <p class="text-destructive text-center text-sm font-medium">{form.error}</p>
            {/if}

            <Button type="submit" class="w-full">Zaloguj się</Button>
        </form>

        <p class="text-muted-foreground text-center text-sm">
            Nie masz konta? <a href="/register" class="text-primary font-semibold hover:underline"
                >Zarejestruj się</a
            >
        </p>
    </div>
</div>
