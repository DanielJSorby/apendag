<script lang="ts">
	import { onMount } from 'svelte';
	import Linjeknapp from '$lib/components/Linjeknapp.svelte';

	let arrangement: any = null;
	let linjeData: any = {};

	async function getData() {
		const response = await fetch('/aktiviteter.json');
		const data = await response.json();
		arrangement = data.dager[0];
	}

	async function getLinjeData() {
		const response = await fetch('/linjer.json');
		const data = await response.json();
		linjeData = data;
	}

	onMount(async () => {
		await getData();
		await getLinjeData();
	});

	const timeSlotColors = [
		'var(--color-blue)',
		'var(--color-pink)',
		'var(--color-green)',
		'var(--color-orange)'
	];

	const address = 'Vestre Elvebakke 3, Oslo';

	function addToCalendar(tidspunkt: string) {
		if (!arrangement) return;

		// Parse dato (format: "22/1" -> 2025-01-22)
		const [dag, måned] = arrangement.dato.split('/');
		const år = 2025; // Åpen dag 2025
		const dateStr = `${år}${måned.padStart(2, '0')}${dag.padStart(2, '0')}`;

		// Parse tidspunkt (format: "16:00-16:30")
		const [startTime, endTime] = tidspunkt.split('-');
		const startTimeFormatted = startTime.replace(':', '');
		const endTimeFormatted = endTime.replace(':', '');
		
		// iCalendar format: YYYYMMDDTHHMMSS
		const dtStart = `${dateStr}T${startTimeFormatted}00`;
		const dtEnd = `${dateStr}T${endTimeFormatted}00`;

		// Generer .ics fil
		const icsContent = [
			'BEGIN:VCALENDAR',
			'VERSION:2.0',
			'PRODID:-//Elvebakken//Åpen dag//NO',
			'CALSCALE:GREGORIAN',
			'BEGIN:VEVENT',
			`DTSTART:${dtStart}`,
			`DTEND:${dtEnd}`,
			`SUMMARY:${arrangement.arrangement}`,
			`DESCRIPTION:Informasjonsshow på Elvebakken\\nTidspunkt: ${tidspunkt}`,
			`LOCATION:${address}`,
			'END:VEVENT',
			'END:VCALENDAR'
		].join('\r\n');

		// Last ned .ics fil
		const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `elvebakken-aapen-dag-${tidspunkt.replace(':', '')}.ics`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(link.href);
	}
</script>

<svelte:head>
	<title>Åpen dag på Elvebakken - Tirsdag 20. januar</title>
	<meta
		name="description"
		content="Velkommen til Åpen dag på Elvebakken! Her kan du se opplegget til tirsdag 20. januar. Du kan også lese mer om de ulike studieretningene på Elvebakken."
	/>
	<meta
		name="keywords"
		content="Åpen dag, Elvebakken, tirsdag 20. januar, studieretninger, Elvebakken VGS, Elvebakken VGS Åpen dag, Åpen dag på Elvebakken, Åpendag VGS Oslo"
	/>
</svelte:head>

{#if !arrangement}
	<div class="loading">
		<p>Laster...</p>
	</div>
{:else}
	<div class="backgroundSearch">
		<div class="searchSection">
			<div class="hero-content">
				<h1 class="hero-title">{arrangement.arrangement}</h1>
				<p class="hero-date">{arrangement.dag} {arrangement.dato}</p>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="body">
		<div class="container">
			<!-- Show Section -->
			<section class="show-section">
				<h2 class="section-title">Informasjonsshow</h2>
				<p class="section-subtitle">Fire showtider i auditoriet:</p>
				<div class="show-grid">
					{#each arrangement.tidspunkter || [] as tidspunkt, index}
						<button
							class="show-slot"
							style="background-color: {timeSlotColors[index % timeSlotColors.length]}"
							onclick={() => addToCalendar(tidspunkt)}
							title="Klikk for å legge til i kalenderen"
						>
							<span class="show-slot-text">{tidspunkt}</span>
						</button>
					{/each}
				</div>
			</section>

			<!-- Linjer Section -->
			{#if Object.keys(linjeData).length > 0}
			<section class="linjer-section">
				<h2 class="section-title">Utforsk studieretningene</h2>
				<p class="section-subtitle">
					Hele tiden fra det starter til det slutter kan du gå innom de ulike linjene og besøke dem!
				</p>
				<div class="linjeknapper">
					<Linjeknapp linje="st" linjeData={linjeData} />
					<Linjeknapp linje="kda" linjeData={linjeData} />
					<Linjeknapp linje="mk" linjeData={linjeData} />
					<Linjeknapp linje="im" linjeData={linjeData} />
					<Linjeknapp linje="el" linjeData={linjeData} />
				</div>
			</section>
			{/if}
		</div>
	</div>
{/if}

<style>
	.loading {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-grey);
		font-family: 'Oslo Sans', sans-serif;
	}

	.loading p {
		color: #1a1a1a;
		font-size: 1.125rem;
	}

	.backgroundSearch {
		height: 40vh;
		width: 100vw;
		display: flex;
		justify-content: center;
		align-items: center;
		background-image: url('/images/Elvebakken fra elven STOT 1.jpg');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		position: relative;
	}

	.backgroundSearch::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1;
	}

	.searchSection {
		margin-top: 80px;
		text-align: center;
		color: white;
		position: relative;
		z-index: 2;
	}

	.hero-content {
		max-width: 800px;
		padding: 0 2rem;
	}

	.hero-title {
		font-family: 'Oslo Sans', sans-serif;
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 500;
		margin: 0 0 1rem 0;
		line-height: 1.2;
		text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5);
	}

	.hero-date {
		font-family: 'Oslo Sans', sans-serif;
		font-size: clamp(1.25rem, 3vw, 1.75rem);
		font-weight: 300;
		margin: 0 0 1rem 0;
		opacity: 0.95;
	}

	.body {
		display: flex;
		justify-content: center;
		width: 100%;
		background: var(--color-grey);
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 2rem;
	}

	@media (max-width: 768px) {
		.container {
			padding: 2rem 1rem;
		}
	}

	/* Section Styles */
	.section-title {
		font-family: 'Oslo Sans', sans-serif;
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 500;
		color: #1a1a1a;
		margin: 0 0 0.5rem 0;
		text-align: center;
	}

	.section-subtitle {
		font-family: 'Oslo Sans', sans-serif;
		font-size: 1.125rem;
		color: #666;
		margin: 0 0 2rem 0;
		text-align: center;
	}

	/* Show Section */
	.show-section {
		margin-bottom: 4rem;
	}

	.show-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		max-width: 900px;
		margin: 0 auto;
	}

	.show-slot {
		color: white;
		border-radius: 12px;
		padding: 2rem 1.5rem;
		text-align: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: transform 0.2s, box-shadow 0.2s;
		border: none;
		cursor: pointer;
		font-family: inherit;
	}

	.show-slot:hover {
		transform: translateY(-4px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
	}

	.show-slot:active {
		transform: translateY(-2px);
	}

	.show-slot-text {
		font-family: 'Oslo Sans', sans-serif;
		font-size: 1.25rem;
		font-weight: 500;
	}

	/* Linjer Section */
	.linjer-section {
		margin-bottom: 2rem;
	}

	.linjeknapper {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		align-items: center;
		width: 100%;
		margin-top: 20px;
		gap: 20px;
		flex-wrap: wrap;
	}

	/* Mobile styles */
	@media (max-width: 570px) {
		.backgroundSearch {
			height: 50vh;
		}

		.searchSection {
			margin-top: 40px;
		}

		.hero-content {
			padding: 0 1rem;
		}

		.show-grid {
			grid-template-columns: 1fr;
		}

		.linjeknapper {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
