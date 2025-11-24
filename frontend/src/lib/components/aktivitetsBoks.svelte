<script lang="ts">
    interface Props {
        title?: string
        tidspunkt?: { forLunsj: string, etterLunsj: string }
        farge?: string
        plasserfør?: number
        plasseretter?: number
    }
    export let title: string = "";
    export let tidspunkt: { forLunsj: string, etterLunsj: string } = { forLunsj: "", etterLunsj: "" };
    export let farge: string = "";
    export let plasserfør: number = 0;
    export let plasseretter: number = 0;
    let visFør = true
    let visOverlayEL = false
    let erPåmeldt = false
    let tidspunktTekst = "09:00-11:00"
    const byttFørEtter = ((førEtter: "førLunsj" | "etterLunsj")=> {
        if (erPåmeldt) return;
        if (førEtter === "etterLunsj") {
            visFør = false
            tidspunktTekst = "12:00-14:30"
        } else {
            visFør = true 
            tidspunktTekst = "09:00-11:00"
        }
    })
    const visOverlay = (()=> {
        if (erPåmeldt) return;
        visOverlayEL = true 
        erPåmeldt = true
    })

    const lukkOverlay = (() => {
        visOverlayEL = false
    })

</script>
{#if visOverlayEL}
    <div class="overlay" on:click={lukkOverlay}>
        <div class="overlay-innhold" on:click|stopPropagation>
            <h1>Du har nå meldt deg på {title}!</h1>
            <p>Tidspunkt: {tidspunktTekst}</p>
            <button on:click={lukkOverlay}>Lukk</button>
        </div>
    </div>
{/if}
<div id="aktivitetBoks">
    <div class="tekst">
      <h1 id="title">{title}</h1>
      <h3 id="titleUnder">Velg et tidspunkt under og meld deg på!</h3>
      <div id="valgAvKurs">
        <button class:selected={visFør} on:click={() => byttFørEtter("førLunsj")}>{tidspunkt["forLunsj"]}</button>
        <button class:selected={!visFør} on:click={() => byttFørEtter("etterLunsj")}>{tidspunkt["etterLunsj"]}</button>
      </div>  
      <div class="visesIForholdTilTid">
        {#if visFør}
            <div style="background-color: {farge};" class="plasser">
                <h1 id="tilgjengeligePlasser">{plasserfør}</h1>
                <h3 id="plassState">Plasser</h3>
            </div>
        {/if}
        {#if !visFør}
            <div style="background-color: {farge};" class="plasser">
                <h1 id="tilgjengeligePlasser">{plasseretter}</h1>
                <h3 id="plassState">Plasser</h3>
            </div>
        {/if}

      </div>  
      
    </div>
    <div class="meldPåKnapp-wrapper">
        <button on:click={visOverlay} id="meldPåKnapp" class:påmeldt={erPåmeldt}>
            {#if erPåmeldt}
                Meldt på!
            {:else}
                Meld deg på ({tidspunktTekst})
            {/if}
        </button>
    </div>  
</div>
<style>
    #title {
        font-size: 18px;
        height: 7rem;
    }
    #titleUnder {
        font-size: 14px;
    }
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }
    .overlay-innhold {
        background-color: white;
        padding: 2rem;
        border-radius: 1rem;
        text-align: center;
        color: black;
    }
    button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 1rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }
    button.selected {
        background-color: #4CAF50; /* En grønnfarge for valgt knapp */
        color: white;
    }
    button.påmeldt {
        background-color: #4CAF50;
        color: white;
        cursor: not-allowed;
    }
    #valgAvKurs {
        display: flex;
        flex-direction: row;
        gap: 1rem;
    }
    #aktivitetBoks {
        min-width: calc(100vw/8);
        padding: 3rem;
        background-color: var(--color-grey);
        border-radius: 1rem;
        border: 1px solid;
    }
    h1 {
        font-size: 15px;
    }
    h3 {
        font-size: 14px;
    }
    .plasser {
        width: 4rem;
        height: 4rem;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: blob 7s infinite;
        flex-direction: column;
    }
    #plassState {
        margin: 0;
    }
    #tilgjengeligePlasser {
        margin: 0;
    }
    @keyframes blob {
        0%,
        100% {
            border-radius: 1rem;
        }
        50% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
        }
    }
    .visesIForholdTilTid {
        display: flex;
        justify-content: center;
        margin-top: 1rem;
        margin-bottom: 1rem;
    } 
    .meldPåKnapp-wrapper {  
        display: flex;
        justify-content: center;
        align-items: center;
    }
    #meldPåKnapp:hover {
        background-color: #4CAF50;
        border-radius: 1rem;
    }
</style>