<script lang="ts">
    import AktivitetsBoks from '$lib/components/aktivitetsBoks.svelte';
    import HeroSection from '$lib/components/HeroSection.svelte';

    // Mottar nå begge verdiene fra serveren
    export let data;
    const { kursListe, paameldtKursId, paameldtTidspunktTekst, ventelisteKursId, ventelisteTidspunktTekst, erLoggetInn } = data;

</script>

<svelte:head>
    <title>Åpen dag på Elvebakken - Torsdag 22. januar</title>
    <meta name="description" content="Velkommen til Åpen dag på Elvebakken! Her kan du se opplegget til torsdag 22. januar. Du kan også lese mer om de ulike studieretningene på Elvebakken." />
    <meta name="keywords" content="Åpen dag, Elvebakken, torsdag 22. januar, studieretninger, Elvebakken VGS, Elvebakken VGS Åpen dag, Åpen dag på Elvebakken, Åpendag VGS Oslo" />
</svelte:head>

<HeroSection 
    image="/images/Elvebakken eksteriør 3.jpg"
    title="Vi ønsker deg som 10. klassing velkommen til å oppleve hverdagen på Elvebakken torsdag 22. januar"
    subtitle="Meld deg på med e-post for kurs fra kl 14-15:30, og følg med for videre informasjon på e-post."
    height="50vh"
    overlayOpacity={0.67}
/>


<div class="aktiviteter">
    <div id="alleAktiviteter">
        {#each (kursListe ?? []) as arrangement}
            <AktivitetsBoks 
                kurs={arrangement.id} 
                title={arrangement.navn} 
                plasser={arrangement.plasser}
                tidspunkt={arrangement.tid} 
                farge={arrangement.farge} 
                erAlleredePaameldt={paameldtKursId === arrangement.id}
                globaltPaameldtKursId={paameldtKursId}
                paameldtTidspunkt={paameldtTidspunktTekst}
                erPåVenteliste={ventelisteKursId === arrangement.id}
                ventelisteTidspunkt={ventelisteTidspunktTekst}
                erLoggetInn={erLoggetInn}
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
