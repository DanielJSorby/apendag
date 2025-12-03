<script lang="ts">
    import { onMount } from 'svelte';

    let arrangement: any = null;

    async function getData() {
        const response = await fetch('/aktiviteter.json');
        const data = await response.json();
        // The user mentioned the 22nd, which is the first entry in the json
        arrangement = data.dager[0];
    }

    onMount(async () => {
        await getData();
    });
</script>

<svelte:head>
    <title>Åpen dag på Elvebakken - Tirsdag 20. januar</title>
    <meta name="description" content="Velkommen til Åpen dag på Elvebakken! Her kan du se opplegget til tirsdag 20. januar. Du kan også lese mer om de ulike studieretningene på Elvebakken." />
    <meta name="keywords" content="Åpen dag, Elvebakken, tirsdag 20. januar, studieretninger, Elvebakken VGS, Elvebakken VGS Åpen dag, Åpen dag på Elvebakken, Åpendag VGS Oslo" />
</svelte:head>

{#if arrangement}
    <div class="container">
        <h1>Velkommen til {arrangement.arrangement}</h1>
        <h2>{arrangement.dag} {arrangement.dato}</h2>
        <p>Dette er et show for 10. trinn, med forestillinger en gang i timen. Tidspunktene er listet under. Ingen påmelding er nødvendig, det er bare å møte opp!</p>
        <div class="tidspunkter">
            <p>{arrangement.tidspunkter.join(' / ')}</p>
        </div>
    </div>
{/if}

<style>
    .container {
        text-align: center;
        margin: 5rem auto;
        max-width: 600px;
        padding: 2rem;
        background-color: var(--color-grey);
        border-radius: 1rem;
    }
    h1 {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }
    h2 {
        font-size: 1.2rem;
        margin-bottom: 1.5rem;
    }
    .tidspunkter {
        margin: 2rem 0;
    }
</style>