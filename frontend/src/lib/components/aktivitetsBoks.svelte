<script lang="ts">
    import { onMount } from 'svelte';
    interface Props {
        title?: string
        tidspunkt?: { forLunsj: string, etterLunsj: string, siste: string }
        farge?: string
        plasser?: { forLunsj: number, etterLunsj: number, siste: number }
    }
    export let title: string = "";
    export let tidspunkt: { forLunsj: string, etterLunsj: string, siste: string } = { forLunsj: "", etterLunsj: "", siste: "" };
    export let farge: string = "";
    export let plasser: { forLunsj: number, etterLunsj: number, siste: number } = { forLunsj: 0, etterLunsj: 0, siste: 0 };
    export let kurs: number;
    export let erAlleredePaameldt: boolean = false;
    export let globaltPaameldtKursId: number | null;
    export let paameldtTidspunkt: string | null; // Ny prop for påmeldt tidspunkt

    let valgtTidspunkt: 'forLunsj' | 'etterLunsj' | 'siste' = 'forLunsj';
    let visOverlayEL = false
    let erPåmeldt = erAlleredePaameldt;
    let tidspunktTekst: string;
    let isLoading = false;
    let errorMessage = '';
    let hoverAvmeld = false; // Styrer hover-effekten for avmeldingsknappen

    onMount(() => {
        // Setter start-tidspunktet basert på hva som er lagret i databasen
        if (erAlleredePaameldt && paameldtTidspunkt) {
            if (paameldtTidspunkt === tidspunkt.forLunsj) {
                valgtTidspunkt = 'forLunsj';
            } else if (paameldtTidspunkt === tidspunkt.etterLunsj) {
                valgtTidspunkt = 'etterLunsj';
            } else if (paameldtTidspunkt === tidspunkt.siste) {
                valgtTidspunkt = 'siste';
            }
        }
        // Oppdaterer den synlige teksten
        tidspunktTekst = tidspunkt[valgtTidspunkt];
    });

    const byttFørEtter = ((førEtter: 'forLunsj' | 'etterLunsj' | 'siste')=> {
        if (erPåmeldt) return;
        valgtTidspunkt = førEtter;
        tidspunktTekst = tidspunkt[førEtter];
    })

    async function meldPaa() {
        if (erPåmeldt || isLoading) return;

        isLoading = true;
        errorMessage = '';

        // Sjekk for studiesuppe
        const erSisteTidspunkt = valgtTidspunkt === 'siste';
        let vilHaStudiesuppe = false;
        if (erSisteTidspunkt) {
            if (confirm('Ønsker du å melde deg på studiesuppe?')) {
                vilHaStudiesuppe = true;
            }
        }

        try {
            const response = await fetch('/api/meld-paa-kurs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    kursId: kurs,
                    tidspunktTekst: tidspunktTekst,
                    studiesuppe: vilHaStudiesuppe // Sender med studiesuppe-valget
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Noe gikk galt under påmelding');
            }

            erPåmeldt = true;
            visOverlayEL = true;

        } catch (error: any) {
            errorMessage = error.message;
            alert(`Påmelding feilet: ${errorMessage}`);
        } finally {
            isLoading = false;
        }
    }

    async function meldAv() {
        if (isLoading) return;
        isLoading = true;

        try {
            const response = await fetch('/api/meld-av-kurs', {
                method: 'POST'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Avmelding feilet');
            }

            // Laster siden på nytt for å oppdatere all status
            window.location.reload();

        } catch (error: any) {
            alert(error.message);
        } finally {
            isLoading = false;
        }
    }

    const lukkOverlay = (() => {
        visOverlayEL = false
        window.location.reload(); // Laster siden på nytt for å oppdatere status på alle knapper
    })

</script>
{#if visOverlayEL}
    <div class="overlay" on:click={lukkOverlay}>
        <div class="overlay-innhold" on:click|stopPropagation>
            <h1>Du har nå meldt deg på {title}!</h1>
            <p>Tidspunkt: {tidspunktTekst}</p>
            <button on:click={lukkOverlay}>Lagre</button>
        </div>
    </div>
{/if}
<div id="aktivitetBoks">
    <div class="tekst">
      <h1 id="title">{title}</h1>
      <h3 id="titleUnder">Velg et tidspunkt under og meld deg på!</h3>
      <div id="valgAvKurs">
        <button class:selected={valgtTidspunkt === 'forLunsj'} on:click={() => byttFørEtter('forLunsj')}>{tidspunkt["forLunsj"]}</button>
        <button class:selected={valgtTidspunkt === 'etterLunsj'} on:click={() => byttFørEtter('etterLunsj')}>{tidspunkt["etterLunsj"]}</button>
        <button class:selected={valgtTidspunkt === 'siste'} on:click={() => byttFørEtter('siste')}>{tidspunkt["siste"]}</button>
      </div>  
      <div class="visesIForholdTilTid">
        {#if valgtTidspunkt === 'forLunsj'}
            <div class="plasser" style="background-color: {farge};">
                <h1 id="plassState">{plasser.forLunsj}</h1>
                <h3 id="tilgjengeligePlasser">plasser</h3>
            </div>
        {:else if valgtTidspunkt === 'etterLunsj'}
            <div class="plasser" style="background-color: {farge};">
                <h1 id="plassState">{plasser.etterLunsj}</h1>
                <h3 id="tilgjengeligePlasser">plasser</h3>
            </div>
        {:else}
            <div class="plasser" style="background-color: {farge};">
                <h1 id="plassState">{plasser.siste}</h1>
                <h3 id="tilgjengeligePlasser">plasser</h3>
            </div>
        {/if}

      </div>  
      
    </div>
    <div class="meldPåKnapp-wrapper">
        {#if erPåmeldt}
            <button 
                on:click={meldAv} 
                on:mouseenter={() => hoverAvmeld = true}
                on:mouseleave={() => hoverAvmeld = false}
                class="paameldt-knapp"
                disabled={isLoading}
            >
                {#if isLoading}
                    ...
                {:else if hoverAvmeld}
                    Meld av!
                {:else}
                    Meldt på!
                {/if}
            </button>
        {:else}
            <button 
                on:click={meldPaa} 
                id="meldPåKnapp" 
                type="button"
                disabled={isLoading || globaltPaameldtKursId !== null}
            >
                {#if isLoading}
                    Melder på...
                {:else}
                    Meld deg på ({tidspunktTekst})
                {/if}
            </button>
        {/if}
    </div>  
</div>
<style>
    .tekst {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
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

    .paameldt-knapp {
        background-color: #4CAF50;
        color: white;
        width: 15rem;
        height: 3rem;
        border-radius: 1rem;
        font-size: 1rem;
        transition: background-color 0.2s ease;
    }

    .paameldt-knapp:hover {
        background-color: #f44336; /* Rød farge ved hover */
    }

    button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }

    #valgAvKurs {
        display: flex;
        flex-direction: row;
        gap: 1rem;
    }
    #aktivitetBoks {
        padding: 3rem;
        background-color: var(--color-white);
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