<script lang="ts">
	import { onMount } from 'svelte';
	import StudiesuppePopup from './StudiesuppePopup.svelte';

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
	export let erPåVenteliste: boolean = false; // Prop for om brukeren er på venteliste for dette kurset
	export let ventelisteTidspunkt: string | null; // Tidspunkt for venteliste
	export let erLoggetInn: boolean = false; // Prop for om brukeren er logget inn

	let visOverlayEL = false
	let erPåmeldt = erAlleredePaameldt;
	let erPåVentelisteLokal = erPåVenteliste; // Lokal kopi av venteliste-status
	let isLoading = false;
	let errorMessage = '';
	let hoverAvmeld = false; // Styrer hover-effekten for avmeldingsknappen
	let hoverAvmeldVenteliste = false; // Styrer hover-effekten for avmeldingsknappen for venteliste
	let visStudiesuppePopup = false;
	let ventelisteMessage = '';
	let visFeilmelding = false; // Styrer visning av feilmelding overlay

	async function meldPaa() {
		if (erPåmeldt || erPåVentelisteLokal || isLoading) return;

		// Sjekk om brukeren allerede er påmeldt et annet kurs
		if (globaltPaameldtKursId !== null) {
			errorMessage = 'Du er allerede påmeldt et annet kurs.';
			return;
		}

		// Sjekk om kurset er fullt
		if (plasser.siste <= 0) {
			errorMessage = 'Det er ingen ledige plasser på dette tidspunktet. Du kan velge å sette deg på venteliste.';
			return;
		}

		// Siden det kun er ett tidspunkt, er det alltid "siste"
		visStudiesuppePopup = true; // Vis popup i stedet for confirm
	}

	async function fullforPaamelding(vilHaStudiesuppe: boolean, venteliste: boolean = false) {
		isLoading = true;
		errorMessage = '';
		ventelisteMessage = '';

		try {
			const response = await fetch('/api/meld-paa-kurs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					kursId: kurs,
					tidspunktTekst: tidspunkt.siste,
					studiesuppe: vilHaStudiesuppe,
					venteliste: venteliste
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				const errorMsg = errorData.message || 'Noe gikk galt under påmelding';
				
				// Hvis brukeren ikke er logget inn, vis melding
				if (response.status === 401) {
					errorMessage = errorMsg;
					return; // Returner uten å kaste feil
				}
				
				// Hvis kurset er fullt og ikke venteliste, vis venteliste-alternativ
				if (response.status === 409 && errorMsg.includes('ingen ledige plasser') && !venteliste) {
					errorMessage = errorMsg;
					return; // Returner uten å kaste feil, så brukeren kan velge venteliste
				}
				
				throw new Error(errorMsg);
			}

			const responseData = await response.json();
			
			if (venteliste) {
				erPåVentelisteLokal = true;
				ventelisteMessage = responseData.message || 'Du er nå satt på venteliste.';
				visOverlayEL = true; // Vis overlay som når man melder seg på
			} else {
				erPåmeldt = true;
				visOverlayEL = true;
			}
		} catch (error: any) {
			errorMessage = error.message;
			visFeilmelding = true;
		} finally {
			isLoading = false;
		}
	}

	async function meldPaaVenteliste() {
		if (isLoading || erPåVentelisteLokal) return;

		// Sjekk om brukeren allerede er påmeldt et annet kurs
		if (globaltPaameldtKursId !== null) {
			errorMessage = 'Du er allerede påmeldt et annet kurs.';
			return;
		}
		
		// Lagre at vi skal på venteliste, så popup kan bruke det
		visStudiesuppePopup = true; // Vis popup for studiesuppe
	}

	function handleStudiesuppeDecision(event: CustomEvent<boolean>) {
		visStudiesuppePopup = false;
		const vilHaStudiesuppe = event.detail;
		// Hvis vi kom hit fra venteliste-knappen eller kurset er fullt, meld på venteliste
		const skalVenteliste = plasser.siste <= 0;
		fullforPaamelding(vilHaStudiesuppe, skalVenteliste);
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

	async function meldAvVenteliste() {
		if (isLoading) return;
		isLoading = true;

		try {
			const response = await fetch('/api/meld-av-venteliste', {
				method: 'POST'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Avmelding fra venteliste feilet');
			}

			// Laster siden på nytt for å oppdatere all status
			window.location.reload();

		} catch (error: any) {
			alert(error.message);
		} finally {
			isLoading = false;
		}
	}

	const lukkOverlay = () => {
		visOverlayEL = false;
		window.location.reload(); // Laster siden på nytt for å oppdatere status på alle knapper
	};

	const lukkFeilmelding = () => {
		visFeilmelding = false;
		errorMessage = '';
	};
</script>

{#if visStudiesuppePopup}
	<StudiesuppePopup on:decision={handleStudiesuppeDecision} />
{/if}

{#if visFeilmelding}
	<div class="overlay" on:click={lukkFeilmelding}>
		<div class="overlay-innhold feilmelding-overlay" on:click|stopPropagation>
			<h1>Påmelding feilet</h1>
			<p>{errorMessage}</p>
			<button on:click={lukkFeilmelding}>OK</button>
		</div>
	</div>
{/if}

{#if visOverlayEL}
	<div class="overlay" on:click={lukkOverlay}>
		<div class="overlay-innhold" on:click|stopPropagation>
			{#if erPåVentelisteLokal}
				<h1>Du er nå satt på venteliste for {title}!</h1>
				<p>Tidspunkt: {tidspunkt.siste}</p>
				<p>Du vil få beskjed via e-post hvis det blir ledig plass.</p>
			{:else}
				<h1>Du har nå meldt deg på {title}!</h1>
				<p>Tidspunkt: {tidspunkt.siste}</p>
			{/if}
			<button on:click={lukkOverlay}>Lagre</button>
		</div>
	</div>
{/if}
<div id="aktivitetBoks">
	<div class="tekst">
	  <h1 id="title">{title}</h1>
	  <h3 id="titleUnder">Meld deg på!</h3>
	  <div id="valgAvKurs">
		<button class="selected">{tidspunkt.siste}</button>
	  </div>  
	  <div class="visesIForholdTilTid">
			<div class="plasser" style="background-color: {farge};">
				<h1 id="plassState">{plasser.siste}</h1>
				<h3 id="tilgjengeligePlasser">plasser</h3>
			</div>
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
		{:else if erPåVentelisteLokal}
			<button 
				on:click={meldAvVenteliste} 
				on:mouseenter={() => hoverAvmeldVenteliste = true}
				on:mouseleave={() => hoverAvmeldVenteliste = false}
				class="paameldt-knapp"
				disabled={isLoading}
			>
				{#if isLoading}
					...
				{:else if hoverAvmeldVenteliste}
					Meld av!
				{:else}
					På venteliste
				{/if}
			</button>
		{:else if globaltPaameldtKursId !== null}
			<button 
				class="paameldt-knapp"
				disabled={true}
			>
				Påmeldt annet kurs
			</button>
		{:else if !erLoggetInn}
			<button 
				class="paameldt-knapp"
				disabled={true}
			>
				Du må være logget inn for å melde deg på
			</button>
		{:else}
			<div class="meldPåKnapp-container">
				{#if plasser.siste <= 0}
					{#if errorMessage && errorMessage.includes('ingen ledige plasser')}
						<p class="fullt-melding">Kurset er fullt.</p>
						<button 
							on:click={meldPaaVenteliste} 
							id="ventelisteKnapp" 
							type="button"
							disabled={isLoading || globaltPaameldtKursId !== null || erPåVentelisteLokal || !erLoggetInn}
						>
							{#if isLoading}
								Melder på venteliste...
							{:else}
								Meld deg på venteliste ({tidspunkt.siste})
							{/if}
						</button>
					{:else}
						<p class="fullt-melding">Kurset er fullt.</p>
						<button 
							on:click={meldPaaVenteliste} 
							id="ventelisteKnapp" 
							type="button"
							disabled={isLoading || globaltPaameldtKursId !== null || erPåVentelisteLokal || !erLoggetInn}
						>
							{#if isLoading}
								Melder på venteliste...
							{:else}
								Meld deg på venteliste ({tidspunkt.siste})
							{/if}
						</button>
					{/if}
				{:else}
					<button 
						on:click={meldPaa} 
						id="meldPåKnapp" 
						type="button"
						disabled={isLoading || globaltPaameldtKursId !== null || erPåVentelisteLokal || !erLoggetInn}
					>
						{#if isLoading}
							Melder på...
						{:else}
							Meld deg på ({tidspunkt.siste})
						{/if}
					</button>
				{/if}
			</div>
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
	.feilmelding-overlay {
		border: 3px solid #f44336;
	}
	.feilmelding-overlay h1 {
		color: #f44336;
	}
	.feilmelding-overlay button {
		background-color: #f44336;
		color: white;
		padding: 0.75rem 2rem;
	}
	.feilmelding-overlay button:hover {
		background-color: #d32f2f;
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
		cursor: default;
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
        color: var(--color-white);
	}
	#tilgjengeligePlasser {
		margin: 0;
        color: var(--color-white);
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
	.meldPåKnapp-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}
	.fullt-melding {
		color: #f44336;
		font-size: 0.9rem;
		margin: 0;
		text-align: center;
	}
	#ventelisteKnapp {
		background-color: #ff9800;
		color: white;
		width: 15rem;
		height: 3rem;
		border-radius: 1rem;
		font-size: 1rem;
		transition: background-color 0.2s ease;
		border: none;
		cursor: pointer;
	}
	#ventelisteKnapp:hover:not(:disabled) {
		background-color: #f44336;
	}
	#ventelisteKnapp:disabled {
		background-color: #ff9800;
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>