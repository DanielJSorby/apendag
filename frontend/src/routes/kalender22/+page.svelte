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
    <div id="alleAktiviteter">
        {#each (arrangementer?.dager?.[1]?.kurs ?? []) as arrangement}
            <AktivitetsBoks title={arrangement["navn"]} plasserfør={arrangement["plasser"]} plasseretter={10} tidspunkt={arrangement["tid"]} farge={arrangement["farge"]}/>
        {/each}
    </div>
</div>

<style>
    .aktiviteter {
        margin-top: 20rem;
    }
    #alleAktiviteter {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
        max-width: 900px; /* approx 3 * 320px columns */
        margin:0 auto
    }
    
</style>
