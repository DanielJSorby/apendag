<script lang="ts">
    import { onMount } from 'svelte';
    import AktivitetsBoks from '$lib/components/aktivitetsBoks.svelte';
    import HeroSection from '$lib/components/HeroSection.svelte';

    // Mottar nå begge verdiene fra serveren
    export let data;
    const { paameldtKursId, paameldtTidspunktTekst } = data;

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

<HeroSection 
    image="/images/Elvebakken eksteriør 3.jpg"
    title="Velkommen til påmelding for åpen dag den 22. januar!"
    subtitle="Meld deg på et av kursene under. Bruk knappene for å velge tidspunkt, og trykk deretter på 'Meld deg på'."
    height="50vh"
    overlayOpacity={0.6}
/>


<div class="aktiviteter">
    <div id="alleAktiviteter">
        {#each (arrangementer?.dager?.[1]?.kurs ?? []) as arrangement}
            <AktivitetsBoks 
                kurs={arrangement["id"]} 
                title={arrangement["navn"]} 
                plasserfør={arrangement["plasser"]} 
                plasseretter={10} 
                tidspunkt={arrangement["tid"]} 
                farge={arrangement["farge"]} 
                plassersiste={5}
                erAlleredePaameldt={paameldtKursId === arrangement["id"]}
                globaltPaameldtKursId={paameldtKursId}
                paameldtTidspunkt={paameldtTidspunktTekst}
            />
        {/each}
    </div>
</div>

<style>
    .aktiviteter {
        margin-top: 2rem;
        margin-bottom: 2rem;
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
