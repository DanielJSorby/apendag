<script lang="ts">
    import Linjeknapp from '$lib/components/Linjeknapp.svelte';
    import Noemer from '$lib/components/noemer.svelte';

    let selectedLinje = $state<'st' | 'kda' | 'mk' | 'im' | 'el' | 'stx'>('st');
    let linjeData = $state<any>({});

    // Load JSON data on mount
    $effect(() => {
        fetch('/api/linjer')
            .then(res => res.json())
            .then(data => linjeData = data);
    });
</script>

<svelte:head>
    <title>Åpen dag på Elvebakken</title>
    <meta name="description" content="Velkommen til Åpen dag på Elvebakken! Her kan du se opplegget til tirsdag 20. januar og torsdag 22. januar. Du kan også lese mer om de ulike studieretningene på Elvebakken." />
    <meta name="keywords" content="Åpen dag, Elvebakken, tirsdag 20. januar, torsdag 22. januar, studieretninger, Elvebakken VGS, Elvebakken VGS Åpen dag, Åpen dag på Elvebakken, Åpendag VGS Oslo" />
</svelte:head>

<div class="filler"></div>
<div class="container">
    <div class="fillerbilde"></div>
    <div class="content">
        <div class="tekst-boks">
            <h2>VELKOMMEN TIL</h2>
            <h1>ÅPEN DAG PÅ</h1>
            <h1>ELVEBAKKEN</h1>
            <p>Hvilken dag vil du se på opplegget til?</p>
        </div>
        <div class="buttons">
            <button onclick={() => window.location.href = '/kalender20'}>
                <h2>Tirsdag <br> 20. januar</h2>
                <p>Åpen dag for alle interesserte på ettermiddagen</p>
                <p>Trykk her for mer informasjon!</p>
            </button>
            <button onclick={() => window.location.href = '/kalender22'}>
                <h2>Torsdag <br> 22. januar</h2>
                <p>En smak av Elvebakken kun for 10. klasse elever</p>
                <p>Trykk her for en smak av Elvebakken!</p>
            </button>
        </div>
    </div>
</div>
{#if Object.keys(linjeData).length > 0}
<div class="linjer">
    <div class="linjeknapper">
        <Linjeknapp linje="st" linjeData={linjeData} onclick={() => selectedLinje = 'st'} />
        <Linjeknapp linje="kda" linjeData={linjeData} onclick={() => selectedLinje = 'kda'} />
        <Linjeknapp linje="mk" linjeData={linjeData} onclick={() => selectedLinje = 'mk'} />
        <Linjeknapp linje="im" linjeData={linjeData} onclick={() => selectedLinje = 'im'} />
        <Linjeknapp linje="el" linjeData={linjeData} onclick={() => selectedLinje = 'el'} />
    </div>
</div>
{/if}

<Noemer />

<style>
    .filler {
        height: 10vh;
        width: 100%;
    }
    .container {
        overflow-x: hidden;
        width: 100vw;
        min-height: 80vh;
        display: flex;
        align-items: center;
        justify-content: left;
    }

    .content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: left;
        width: 30%;
        gap: 5px;
        padding: 30px;
    }

    .tekst-boks{
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        color: white;
    }

    .tekst-boks h1 {
        margin: 5px 0;
        font-size: 3rem;
    }

    .tekst-boks h2 {
        margin: 0;
        font-size: 2.5rem;
        font-weight: normal;
    }

    .buttons {
        display: flex;
        gap: 20px;
    }

    button {
        width: 100%;
        padding: 10px 20px;
        border: 2px solid var(--color-pink);
        border-radius: 15px;
        background-color: var(--color-white);
        color: var(--color-pink);
        box-shadow: var(--color-pink) 0px 0px 10px -2px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: left;
    }

    /*Linjer*/
    .linjer{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .linjeknapper {
        margin-left: 0;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
        width: 100vw;
        margin-top: 20px;
        gap: 20px;
        flex-wrap: wrap;
    }

    /* splashbilde */
    .fillerbilde {
        position: absolute;
        z-index: -1;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-image: url('/images/forsidebilde.jpg');
        background-size: cover;
        background-repeat: no-repeat;
    }

    /* Small mobile styles */
@media (max-width: 570px) {

    .container {
        overflow-x: hidden;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        display: flex;
        align-items: start;
        justify-content: left;
    }

    .content {
        display: flex;
        height: 90vh;
        width: 100vw;
        flex-direction: column;
        padding: 0;
        gap: 0;
        align-items: left;
        justify-content: end;
    }

    .fillerbilde {
        height: 25vh;
        width: 100%;
    }

    .tekst-boks{
        padding-left: 5vw;
        color: #000000;
    }
    .content h1 {
        font-size: 1.2rem;
    }

    .content h2 {
        font-size: 1rem;
    }

    .content p {
        font-size: 0.9rem;
    }

    .buttons {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
        width: 100vw;
        height: 45vh;
        gap: 0;
    }

    button {
        width: 40vw;
        height: 40vh;
        border-radius: 1rem;
        border-width: 3px;
    }
}

/* Tablet styles */
@media (min-width: 571px) and (max-width: 1024px) {
    .container {
        min-height: 70vh;
    }

    .content {
        width: 50%;
        padding: 20px;
    }

    .tekst-boks h1 {
        font-size: 2.5rem;
    }

    .tekst-boks h2 {
        font-size: 2rem;
    }

    .buttons {
        flex-direction: column;
        gap: 15px;
        width: 100%;
    }

    button {
        width: 100%;
        padding: 15px;
    }

    .linjeknapper {
        gap: 15px;
        padding: 0 20px;
    }
}
</style>