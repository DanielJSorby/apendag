<script lang="ts">
    import { onMount } from 'svelte';
    import AktivitetsBoks from '$lib/components/aktivitetsBoks.svelte';

    let arrangementer: any = null;

    async function getData() {
        const response = await fetch('/aktiviteter.json');
        arrangementer = await response.json();

    }

    onMount(async () => {
        await getData();
    });
</script>

<div class="aktiviteter">
    <div id="førlunsj">
        {#each (arrangementer?.dager?.[1]?.kurs ?? []) as arrangement}
            <AktivitetsBoks title={arrangement["navn"]} plasser={arrangement["plasser"]} tidspunkt={arrangement["tid"]["forLunsj"]} farge="red"/>
        {/each}
    </div>
    <div class="etterLunsj"></div>
</div>

<style>
    #førlunsj {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
        max-width: 900px; /* approx 3 * 320px columns */
        margin:0 auto
    }
</style>
