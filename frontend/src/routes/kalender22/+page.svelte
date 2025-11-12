<script lang="ts">
    import { onMount } from 'svelte';
    import AktivitetsBoks from '$lib/components/aktivitetsBoks.svelte';

    // hold data fetched once
    interface Activity {
        navn?: string;
        info?: string;
        antallPlasser?: number | string;
        [key: string]: unknown;
    }
    let arrangementer: Activity[] = [];

    async function getData(): Promise<Activity[]> {
        const response = await fetch('/aktiviteter.json');
        const data = await response.json();
        return data as Activity[];
    }

    onMount(async () => {
        arrangementer = await getData();
    });
</script>

<div class="aktiviteter">
    <div class="førlunsj">
        {#each arrangementer as a, i}
            <AktivitetsBoks></AktivitetsBoks>
        {/each}

    </div>
    <div class="etterLunsj"></div>
</div>