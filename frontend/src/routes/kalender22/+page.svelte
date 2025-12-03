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

<svelte:head>
    <title>Åpen dag på Elvebakken - Torsdag 22. januar</title>
    <meta name="description" content="Velkommen til Åpen dag på Elvebakken! Her kan du se opplegget til torsdag 22. januar. Du kan også lese mer om de ulike studieretningene på Elvebakken." />
    <meta name="keywords" content="Åpen dag, Elvebakken, torsdag 22. januar, studieretninger, Elvebakken VGS, Elvebakken VGS Åpen dag, Åpen dag på Elvebakken, Åpendag VGS Oslo" />
</svelte:head>

<div class="velkomst-container">
    <h1>Velkommen til påmelding for åpen dag den 22. januar!</h1>
    <p>
        Meld deg på et av kursene under.
        Bruk knappene for å velge tidspunkt, og trykk deretter på "Meld deg på".
    </p>
</div>

<div class="aktiviteter">
    <div id="alleAktiviteter">
        {#each (arrangementer?.dager?.[1]?.kurs ?? []) as arrangement}
            <AktivitetsBoks title={arrangement["navn"]} plasserfør={arrangement["plasser"]} plasseretter={10} tidspunkt={arrangement["tid"]} farge={arrangement["farge"]} plassersiste={5}/>
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
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
        max-width: 1280px; 
        margin: 0 auto;
        padding: 0 1rem;
    }
    
</style>
