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

<div class="velkomst-container">
    <h1>Velkommen til påmelding for åpen dag den 22. januar!</h1>
    <p>
        Meld deg på kursene under. Du kan velge ett kurs før lunsj og ett kurs etter lunsj.
        Bruk knappene for å velge tidspunkt, og trykk deretter på "Meld deg på".
    </p>
</div>

<div class="aktiviteter">
    <div id="alleAktiviteter">
        {#each (arrangementer?.dager?.[1]?.kurs ?? []) as arrangement}
            <AktivitetsBoks title={arrangement["navn"]} plasserfør={arrangement["plasser"]} plasseretter={10} tidspunkt={arrangement["tid"]} farge={arrangement["farge"]}/>
        {/each}
    </div>
</div>

<style>
    .velkomst-container {
        text-align: center;
        margin: 2rem auto;
        max-width: 600px;
        margin-top: 5rem;
    }
    .aktiviteter {
        margin-top: 2rem;
    }
    #alleAktiviteter {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
        max-width: 900px; /* approx 3 * 320px columns */
        margin:0 auto
    }
    
</style>
