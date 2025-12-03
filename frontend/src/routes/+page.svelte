<script lang="ts">
    import Linjeknapp from '$lib/components/Linjeknapp.svelte';
    import Noemer from '$lib/components/noemer.svelte';

    let selectedLinje = $state<'st' | 'kda' | 'mk' | 'im' | 'el'>('st');
    let linjeData = $state<any>({});

    // Load JSON data on mount
    $effect(() => {
        fetch('/linjer.json')
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
            <p>Hvilken dag vil du se på opplegge til?</p>
        </div>
        <div class="buttons">
            <button onclick={() => window.location.href = '/kalender20'}>
                <div class="">
                <h2>Tirsdag 20. januar</h2>
                <p>Åpen dag for alle interesserte på ettermiddagen</p>
                </div>
                <p>Trykk her for mer informasjon!</p>
            </button>
            <button onclick={() => window.location.href = '/kalender22'}>
                <div class="">
                <h2>Torsdag 22. januar</h2>
                <p>Åpen dag med spesielle kurs kun for elever</p>
                </div>
                <p>Trykk her for mer informasjon!</p>
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
        padding: 10px 20px;
        border: 2px solid var(--color-pink);
        border-radius: 15px;
        background-color: var(--color-white);
        color: var(--color-pink);
        box-shadow: var(--color-pink) 0px 0px 10px -2px;
        cursor: pointer;
        transition: background-color 0.3s, color 0.3s;
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

    

    .linje-tekst {
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 80vw;
    }


    /*temp bakgrunns animasjon */

    @keyframes bgPulse {
        0% { 
            background-position: 0% 50%;
        }
        100% { 
            background-position: 200% 50%;
        }
    }

    .fillerbilde {
        position: absolute;
        z-index: -1;
        width: 100%;
        height: 100%;
        overflow: hidden;
        /* background-image: 
            linear-gradient(90deg, 
                var(--color-pink) 0%, 
                var(--color-pink) 6%,
                var(--color-white) 6%,
                var(--color-white) 8%,
                var(--color-blue) 8%, 
                var(--color-blue) 14%,
                var(--color-white) 14%,
                var(--color-white) 16%,
                var(--color-green) 16%, 
                var(--color-green) 22%,
                var(--color-white) 22%,
                var(--color-white) 24%,
                var(--color-orange) 24%,
                var(--color-orange) 30%,
                var(--color-white) 30%,
                var(--color-white) 32%,
                var(--color-pink) 32%,
                var(--color-pink) 38%,
                var(--color-white) 38%,
                var(--color-white) 40%,
                var(--color-blue) 40%,
                var(--color-blue) 46%,
                var(--color-white) 46%,
                var(--color-white) 48%,
                var(--color-green) 48%,
                var(--color-green) 54%,
                var(--color-white) 54%,
                var(--color-white) 56%,
                var(--color-orange) 56%,
                var(--color-orange) 62%,
                var(--color-white) 62%,
                var(--color-white) 64%,
                var(--color-pink) 64%,
                var(--color-pink) 70%,
                var(--color-white) 70%,
                var(--color-white) 72%,
                var(--color-blue) 72%,
                var(--color-blue) 78%,
                var(--color-white) 78%,
                var(--color-white) 80%,
                var(--color-green) 80%,
                var(--color-green) 86%,
                var(--color-white) 86%,
                var(--color-white) 88%,
                var(--color-orange) 88%,
                var(--color-orange) 94%,
                var(--color-white) 94%,
                var(--color-white) 96%,
                var(--color-pink) 96%,
                var(--color-pink) 100%
            ); */
        /* background-size: 200% 100%;
        background-position: 0% 50%; */
        background-image: url('/images/forsidebilde.jpg');
        background-size: cover;
        background-repeat: no-repeat;
        /* animation: bgPulse 60s linear infinite; */
    }

    .fillerbilde::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
            90deg,
            transparent 40%,
            rgba(255, 255, 255, 0.08) 50%,
            transparent 60%
        );
        animation: shimmer 15s ease-in-out infinite;
    }

    @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
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

    .linje-tekst {
        width: 90vw;
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

    .linje-tekst {
        width: 85vw;
        padding: 20px;
    }

    .linje-tekst h1 {
        font-size: 2rem;
    }

    .linje-tekst p {
        font-size: 1rem;
        line-height: 1.6;
    }
}
</style>