<script lang="ts">
	import { onMount } from 'svelte';

	interface Course {
		id: number;
		navn: string;
		plasser: number;
		tid: {
			forLunsj: string;
			etterLunsj: string;
		};
	}

	interface DayData {
		dato: string;
		dag: string;
		arrangement: string;
		tidspunkter?: string[];
		kurs?: Course[];
	}

	interface AktiviteterData {
		dager: DayData[];
	}

	let data: AktiviteterData | null = null;

	onMount(async () => {
		try {
			const response = await fetch('/aktiviteter.json');
			if (!response.ok) {
				throw new Error('Kunne ikke laste data');
			}
			data = await response.json();
		} catch (err) {
			console.error('Kunne ikke laste data:', err);
		}
	});

	const timeSlotColors = ['#4facfe', '#c85a6b', '#6b8e5a', '#ff8a5b'];
	const rotations = ['rotate-1', 'rotate-2', 'rotate-3', 'rotate-4'];

	const programColors = [
		'#4facfe', // primary
		'#c85a6b', // secondary
		'#6b8e5a', // success
		'#ff8a5b' // accent
	];

	const programBorderColors = [
		'rgba(79, 172, 254, 0.3)',
		'rgba(200, 90, 107, 0.3)',
		'rgba(107, 142, 90, 0.3)',
		'rgba(255, 138, 91, 0.3)'
	];

	const revyeAktiviteter = ['🎬 Skuespill', '🎵 Sang', '💃 Dans', '🎨 Design', '🎪 Manus'];
</script>

{#if !data}
	<div class="loading">
		<p>Laster...</p>
	</div>
{:else}
	{@const tirsdag = data.dager.find((d) => d.dag === 'tirsdag')}
	{@const torsdag = data.dager.find((d) => d.dag === 'torsdag')}

	<div class="page-wrapper">
		<div class="container">
			<!-- Hero Section -->
			<section class="hero">
				<div class="hero-decoration hero-decoration-top">🎉</div>
				<div class="hero-decoration hero-decoration-bottom">✨</div>
				<div class="hero-content">
					<div class="hero-badge">Åpen dag 2025 🎓</div>
					<h1 class="hero-title">Hei! Klar for å sjekke ut Elvebakken? 👋</h1>
					<p class="hero-subtitle">
						Vi holder åpen dag <span class="highlight">{tirsdag?.dato} og {torsdag?.dato} januar</span> – og vi
						gleder oss skikkelig til å møte deg!
					</p>
					<p class="hero-text">
						Lurer du på hvordan det er å gå på Elvebakken? Her får du møte ekte elever, se hvordan det er i
						klasserommene, og høre om alt det kule som skjer. Vi har revyer, elevlag, studiefrokost og masse
						andre ting du kan bli med på. Kom gjerne med foreldre eller venner! 😊
					</p>
				</div>
			</section>

			<!-- Tuesday Section -->
			<div class="tuesday-grid">
				<section class="tuesday-section">
					<div class="section-header">
						<span class="section-icon">📅</span>
						<div>
							<h2>Tirsdag {tirsdag?.dato} januar</h2>
							<p class="section-subtitle">Åpen kveld</p>
						</div>
					</div>
					<div class="time-highlight">
						<p class="time-highlight-main">kl. 15:00 - 20:00</p>
						<p class="time-highlight-sub">Kom når det passer deg!</p>
					</div>
					<p class="section-text">
						Stikk innom når det passer deg mellom 15 og 20! Ta med deg foreldrene, eller kom med venner fra
						klassen. Vi er her hele kvelden 😊
					</p>
					<div class="protip-box">
						<p>
							💡 <strong>Protip:</strong> Kom gjerne til et av showene i auditoriet – der får du mye info
							på kort tid!
						</p>
					</div>
				</section>

				<section class="show-section">
					<h3 class="show-title">
						<span class="show-icon">🎭</span>
						Informasjonsshow
					</h3>
					<p class="show-subtitle">Fire showtider i auditoriet:</p>
					<div class="show-grid">
						{#each tirsdag?.tidspunkter || [] as tidspunkt, index}
							<div
								class="show-slot {rotations[index % rotations.length]}"
								style="background-color: {timeSlotColors[index % timeSlotColors.length]}"
							>
								<span class="show-slot-icon">🎬</span>
								<span class="show-slot-text">{tidspunkt}</span>
							</div>
						{/each}
					</div>
				</section>
			</div>

			<!-- Thursday Section -->
			<section class="thursday-section">
				<div class="thursday-decoration">📚</div>
				<div class="thursday-content">
					<div class="grade-banner">KUN FOR 10. TRINN</div>
					<div class="section-header">
						<span class="section-icon">🎒</span>
						<div>
							<h2>Torsdag {torsdag?.dato} januar</h2>
							<p class="section-subtitle thursday-subtitle">Opplev en skoledag her!</p>
						</div>
					</div>
					<p class="section-text thursday-text">
						Her får du være med på <strong>ekte undervisning</strong>, snakke med elever som går her nå, og
						få se hvordan en dag på Elvebakken faktisk er. Mye bedre enn bare å lese om det, ikke sant? 😄
					</p>
					<div class="registration-box">
						<div class="registration-decoration">🚀</div>
						<div class="registration-content">
							<span class="registration-icon">⏰</span>
							<div>
								<h3>Påmelding åpner snart!</h3>
								<p class="registration-text">
									Du velger selv om du vil komme på <strong>formiddagen</strong> eller
									<strong>ettermiddagen</strong>:
								</p>
								<div class="registration-buttons">
									<div class="registration-button">☀️ Formiddag: 09:00-11:30</div>
									<div class="registration-button">🌤️ Ettermiddag: 12:00-14:30</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Programs Section -->
			<section class="programs-section">
				<div class="programs-header">
					<span class="programs-icon">🎓</span>
					<div>
						<h2>Hvilke studieretninger kan du velge?</h2>
						<p class="programs-subtitle">Her er alle programmene du kan prøve på torsdag:</p>
					</div>
				</div>
				<div class="programs-grid">
					{#each torsdag?.kurs || [] as kurs, index}
						<div
							class="program-card"
							style="border-color: {programBorderColors[index % programBorderColors.length]}"
						>
							<h3 class="program-title">{kurs.navn}</h3>
							<div class="program-spots">
								<div
									class="spots-badge"
									style="background-color: {programColors[index % programColors.length]}"
								>
									<span class="spots-number">{kurs.plasser}</span>
									<span class="spots-label">plasser</span>
								</div>
							</div>
							<div class="program-times">
								<div class="program-time">
									<span class="time-label">☀️ Før lunsj:</span>
									<span class="time-value">{kurs.tid.forLunsj}</span>
								</div>
								<div class="program-time">
									<span class="time-label">🌤️ Etter lunsj:</span>
									<span class="time-value">{kurs.tid.etterLunsj}</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<!-- School Culture Section -->
			<div class="culture-grid">
				<section class="culture-section">
					<div class="culture-header">
						<span class="culture-icon">✨</span>
						<h2>Hva skjer ellers på Elvebakken?</h2>
					</div>
					<div class="culture-content">
						<p>
							Elvebakken er <strong>ikke</strong> bare en vanlig skole. Her skjer det <strong>masse</strong>!
							Vi har studiefrokost (ja, gratis mat!), suppe, skriverkurs, lørdagsskole, og en haug med
							elevlag.
						</p>
						<p>
							Det beste? Her stoler vi på elevene. Du får ansvar og fleksibilitet til å finne din egen vei.
							Og nei, det er ikke kjedelig – tvert imot! 🎉
						</p>
						<div class="quote-box">
							<p class="quote-text">
								"Jeg trodde videregående skulle være stivt og kjedelig, men Elvebakken er helt annerledes.
								Her får jeg være meg selv!"
							</p>
							<p class="quote-attribution">– Elev på Elvebakken</p>
						</div>
					</div>
				</section>

				<section class="revy-section">
					<div class="revy-decoration">🎭</div>
					<div class="revy-content">
						<div class="revy-header">
							<span class="revy-icon">🎭</span>
							<h2>Elvebakkenrevyen</h2>
						</div>
						<p class="revy-text">
							Revyen på Elvebakken er legendarisk! Fra oppstartsprogrammet på Lunde til den store
							showkvelden – det er noe helt spesielt.
						</p>
						<p class="revy-text">
							Her bygger vi sammen <strong>"Bakkakultur"</strong> – en plass hvor alle får være seg selv,
							bidra med det de er gode på, og ha det skikkelig gøy sammen.
						</p>
						<div class="revy-activities">
							{#each revyeAktiviteter as aktivitet}
								<span class="revy-activity">{aktivitet}</span>
							{/each}
						</div>
					</div>
				</section>
			</div>

			<!-- Final CTA -->
			<section class="cta-section">
				<div class="cta-decoration cta-decoration-top">🎉</div>
				<div class="cta-decoration cta-decoration-bottom">✨</div>
				<div class="cta-content">
					<h2>Ser vi deg her? 😊</h2>
					<p>
						Vi gleder oss masse til å møte deg! Ta med deg venner og foreldre, og kom innom for å se om
						Elvebakken er rett for deg.
					</p>
				</div>
			</section>
		</div>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		background: #f8f9fa;
		min-height: 100vh;
		color: #1a1a1a;
	}

	.loading {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f8f9fa;
	}

	.loading p {
		color: #1a1a1a;
		font-size: 1.125rem;
	}

	.page-wrapper {
		min-height: 100vh;
		background: #f8f9fa;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	@media (min-width: 640px) {
		.container {
			padding: 2.5rem 1.5rem;
		}
	}

	@media (min-width: 1024px) {
		.container {
			padding: 3.5rem 2.5rem;
		}
	}

	/* Hero Section */
	.hero {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 3px 18px rgba(0, 0, 0, 0.06);
		padding: 1.5rem;
		margin-bottom: 2rem;
		position: relative;
		overflow: hidden;
	}

	@media (min-width: 640px) {
		.hero {
			padding: 2rem;
		}
	}

	@media (min-width: 1024px) {
		.hero {
			padding: 2.5rem;
		}
	}

	.hero-decoration {
		position: absolute;
		font-size: 3.75rem;
		opacity: 0.1;
		pointer-events: none;
	}

	.hero-decoration-top {
		top: 1rem;
		right: 1rem;
		transform: rotate(12deg);
	}

	.hero-decoration-bottom {
		bottom: 1rem;
		left: 1rem;
		transform: rotate(-12deg);
		font-size: 3rem;
	}

	.hero-content {
		position: relative;
		z-index: 10;
	}

	.hero-badge {
		display: inline-block;
		background: rgba(79, 172, 254, 0.1);
		color: #4facfe;
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.hero-title {
		color: #4facfe;
		font-weight: 700;
		margin: 0 0 0.75rem 0;
		text-align: left;
		font-size: clamp(1.8rem, 5vw, 2.6rem);
		line-height: 1.15;
		letter-spacing: -0.02em;
	}

	.hero-subtitle {
		color: #1a1a1a;
		font-size: 1.125rem;
		font-weight: 500;
		margin: 0 0 1rem 0;
		text-align: left;
	}

	@media (min-width: 640px) {
		.hero-subtitle {
			font-size: 1.25rem;
		}
	}

	.hero-subtitle .highlight {
		color: #4facfe;
		font-weight: 700;
	}

	.hero-text {
		color: #64748b;
		font-size: 1rem;
		line-height: 1.75;
		margin: 0;
		text-align: left;
	}

	@media (min-width: 640px) {
		.hero-text {
			font-size: 1.125rem;
		}
	}

	/* Tuesday Grid */
	.tuesday-grid {
		display: grid;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	@media (min-width: 1024px) {
		.tuesday-grid {
			grid-template-columns: 1.2fr 1fr;
		}
	}

	/* Tuesday Section */
	.tuesday-section {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 3px 18px rgba(0, 0, 0, 0.06);
		padding: 1.5rem;
		border-left: 6px solid #4facfe;
	}

	@media (min-width: 640px) {
		.tuesday-section {
			padding: 1.75rem;
		}
	}

	@media (min-width: 1024px) {
		.tuesday-section {
			padding: 2rem;
		}
	}

	.section-header {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.section-icon {
		font-size: 2.5rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.section-header h2 {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 0.25rem 0;
	}

	@media (min-width: 640px) {
		.section-header h2 {
			font-size: 1.5rem;
		}
	}

	.section-subtitle {
		color: #4facfe;
		font-weight: 600;
		font-size: 1.125rem;
		margin: 0;
	}

	.time-highlight {
		background: rgba(79, 172, 254, 0.05);
		border-radius: 0.75rem;
		padding: 1rem;
		margin-bottom: 1.25rem;
	}

	.time-highlight-main {
		font-size: 1.5rem;
		font-weight: 700;
		color: #4facfe;
		margin: 0 0 0.25rem 0;
	}

	.time-highlight-sub {
		color: #64748b;
		font-size: 0.875rem;
		margin: 0;
	}

	.section-text {
		font-size: 1rem;
		color: #64748b;
		line-height: 1.75;
		margin: 0 0 1.25rem 0;
	}

	.protip-box {
		background: rgba(255, 138, 91, 0.1);
		border-radius: 0.75rem;
		padding: 1rem;
		border: 2px dashed rgba(255, 138, 91, 0.3);
	}

	.protip-box p {
		font-size: 0.875rem;
		color: #64748b;
		font-weight: 500;
		margin: 0;
	}

	.protip-box strong {
		font-weight: 700;
	}

	/* Show Section */
	.show-section {
		background: linear-gradient(to bottom right, rgba(79, 172, 254, 0.05), rgba(255, 138, 91, 0.05));
		border-radius: 1rem;
		box-shadow: 0 3px 18px rgba(0, 0, 0, 0.06);
		padding: 1.5rem;
	}

	@media (min-width: 640px) {
		.show-section {
			padding: 1.75rem;
		}
	}

	.show-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 1rem 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.show-icon {
		font-size: 1.5rem;
	}

	.show-subtitle {
		font-size: 0.875rem;
		color: #64748b;
		margin: 0 0 1.25rem 0;
	}

	.show-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}

	.show-slot {
		color: white;
		border-radius: 0.75rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		padding: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		cursor: pointer;
		min-height: 90px;
	}

	.show-slot:hover {
		transform: translateY(-8px) scale(1.05);
	}

	.show-slot-icon {
		font-size: 1.5rem;
		margin-bottom: 0.25rem;
	}

	.show-slot-text {
		font-size: 1rem;
		font-weight: 700;
	}

	.rotate-1 {
		transform: rotate(1deg);
	}

	.rotate-2 {
		transform: rotate(-1deg);
	}

	.rotate-3 {
		transform: rotate(2deg);
	}

	.rotate-4 {
		transform: rotate(-2deg);
	}

	.show-slot.rotate-1:hover,
	.show-slot.rotate-2:hover,
	.show-slot.rotate-3:hover,
	.show-slot.rotate-4:hover {
		transform: translateY(-8px) scale(1.05);
	}

	/* Thursday Section */
	.thursday-section {
		background: linear-gradient(to bottom right, rgba(200, 90, 107, 0.1), rgba(200, 90, 107, 0.05));
		border-radius: 1rem;
		box-shadow: 0 3px 18px rgba(0, 0, 0, 0.06);
		padding: 1.5rem;
		margin-bottom: 2rem;
		position: relative;
		overflow: hidden;
		border-left: 6px solid #c85a6b;
	}

	@media (min-width: 640px) {
		.thursday-section {
			padding: 2rem;
		}
	}

	@media (min-width: 1024px) {
		.thursday-section {
			padding: 2.5rem;
		}
	}

	.thursday-decoration {
		position: absolute;
		top: 0;
		right: 0;
		font-size: 5rem;
		opacity: 0.05;
		pointer-events: none;
	}

	.thursday-content {
		position: relative;
		z-index: 10;
	}

	.grade-banner {
		display: inline-block;
		background: #c85a6b;
		color: white;
		padding: 0.375rem 1rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 700;
		margin-bottom: 1rem;
	}

	.thursday-subtitle {
		color: #c85a6b;
	}

	.thursday-text {
		max-width: 42rem;
	}

	.registration-box {
		background: #ff8a5b;
		color: white;
		border-radius: 0.75rem;
		padding: 1.25rem;
		position: relative;
		overflow: hidden;
		margin-top: 1.5rem;
	}

	@media (min-width: 640px) {
		.registration-box {
			padding: 1.5rem;
		}
	}

	.registration-decoration {
		position: absolute;
		bottom: -1.5rem;
		right: -1.5rem;
		font-size: 5rem;
		opacity: 0.2;
		transform: rotate(12deg);
		pointer-events: none;
	}

	.registration-content {
		position: relative;
		z-index: 10;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.registration-content {
			flex-direction: row;
			align-items: flex-start;
		}
	}

	.registration-icon {
		font-size: 3rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.registration-content h3 {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
	}

	@media (min-width: 640px) {
		.registration-content h3 {
			font-size: 1.5rem;
		}
	}

	.registration-text {
		font-size: 0.875rem;
		line-height: 1.75;
		margin: 0 0 0.75rem 0;
	}

	@media (min-width: 640px) {
		.registration-text {
			font-size: 1rem;
		}
	}

	.registration-text strong {
		font-weight: 700;
	}

	.registration-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	@media (min-width: 640px) {
		.registration-buttons {
			flex-direction: row;
		}
	}

	.registration-button {
		background: rgba(255, 255, 255, 0.3);
		backdrop-filter: blur(4px);
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 600;
	}

	/* Programs Section */
	.programs-section {
		margin-bottom: 2rem;
	}

	.programs-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.programs-icon {
		font-size: 2.5rem;
		line-height: 1;
	}

	.programs-header h2 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 0.25rem 0;
	}

	@media (min-width: 640px) {
		.programs-header h2 {
			font-size: 1.875rem;
		}
	}

	.programs-subtitle {
		font-size: 1rem;
		color: #64748b;
		margin: 0;
	}

	.programs-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		margin-top: 1rem;
	}

	@media (min-width: 640px) {
		.programs-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 1.25rem;
		}
	}

	@media (min-width: 1024px) {
		.programs-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.program-card {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 3px 18px rgba(0, 0, 0, 0.06);
		padding: 1.25rem;
		transition: all 0.2s;
		cursor: pointer;
		border: 2px solid transparent;
	}

	.program-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
	}

	.program-title {
		font-size: 1rem;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 1rem 0;
		line-height: 1.4;
		min-height: 3rem;
		display: flex;
		align-items: center;
	}

	@media (min-width: 640px) {
		.program-title {
			font-size: 1.125rem;
		}
	}

	.program-spots {
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.spots-badge {
		color: white;
		width: 5rem;
		height: 5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 1rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		animation: blob 8s ease-in-out infinite;
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

	.spots-number {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.1;
	}

	.spots-label {
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.program-times {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.program-time {
		background: rgba(248, 249, 250, 0.3);
		border-radius: 0.5rem;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		color: #64748b;
	}

	@media (min-width: 640px) {
		.program-time {
			font-size: 0.875rem;
		}
	}

	.time-label {
		font-weight: 600;
		color: #1a1a1a;
	}

	.time-value {
		margin-left: 0.5rem;
	}

	/* Culture Grid */
	.culture-grid {
		display: grid;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	@media (min-width: 1024px) {
		.culture-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* Culture Section */
	.culture-section {
		background: linear-gradient(to bottom right, rgba(107, 142, 90, 0.1), rgba(107, 142, 90, 0.05));
		border-radius: 1rem;
		box-shadow: 0 3px 18px rgba(0, 0, 0, 0.06);
		padding: 1.5rem;
	}

	@media (min-width: 640px) {
		.culture-section {
			padding: 2rem;
		}
	}

	.culture-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.culture-icon {
		font-size: 1.875rem;
		line-height: 1;
	}

	.culture-header h2 {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0;
	}

	@media (min-width: 640px) {
		.culture-header h2 {
			font-size: 1.5rem;
		}
	}

	.culture-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-size: 1rem;
		color: #64748b;
		line-height: 1.75;
	}

	.culture-content p {
		margin: 0;
	}

	.culture-content strong {
		font-weight: 600;
		color: #1a1a1a;
	}

	.quote-box {
		background: rgba(255, 255, 255, 0.5);
		border-radius: 0.75rem;
		padding: 1rem;
		border-left: 4px solid #6b8e5a;
		margin-top: 1.25rem;
	}

	.quote-text {
		font-size: 0.875rem;
		font-style: italic;
		color: #64748b;
		margin: 0 0 0.5rem 0;
	}

	.quote-attribution {
		font-size: 0.75rem;
		color: #64748b;
		margin: 0;
		font-weight: 500;
		font-style: normal;
	}

	/* Revy Section */
	.revy-section {
		background: linear-gradient(to bottom right, rgba(255, 138, 91, 0.1), rgba(255, 138, 91, 0.05));
		border-radius: 1rem;
		box-shadow: 0 3px 18px rgba(0, 0, 0, 0.06);
		padding: 1.5rem;
		position: relative;
		overflow: hidden;
	}

	@media (min-width: 640px) {
		.revy-section {
			padding: 2rem;
		}
	}

	.revy-decoration {
		position: absolute;
		bottom: -2rem;
		right: -2rem;
		font-size: 9rem;
		opacity: 0.05;
		transform: rotate(12deg);
		pointer-events: none;
	}

	.revy-content {
		position: relative;
		z-index: 10;
	}

	.revy-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.revy-icon {
		font-size: 1.875rem;
		line-height: 1;
	}

	.revy-header h2 {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0;
	}

	@media (min-width: 640px) {
		.revy-header h2 {
			font-size: 1.5rem;
		}
	}

	.revy-text {
		font-size: 1rem;
		color: #64748b;
		line-height: 1.75;
		margin: 0 0 1rem 0;
	}

	.revy-text strong {
		font-weight: 600;
		color: #1a1a1a;
	}

	.revy-activities {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.revy-activity {
		background: rgba(255, 138, 91, 0.2);
		color: #1a1a1a;
		padding: 0.375rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
	}

	/* CTA Section */
	.cta-section {
		background: linear-gradient(to right, #4facfe, #c85a6b);
		border-radius: 1rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		padding: 1.5rem;
		text-align: center;
		color: white;
		position: relative;
		overflow: hidden;
		margin-top: 2rem;
	}

	@media (min-width: 640px) {
		.cta-section {
			padding: 2rem;
		}
	}

	.cta-decoration {
		position: absolute;
		font-size: 3.75rem;
		opacity: 0.1;
		pointer-events: none;
	}

	.cta-decoration-top {
		top: 0;
		left: 0;
	}

	.cta-decoration-bottom {
		bottom: 0;
		right: 0;
	}

	.cta-content {
		position: relative;
		z-index: 10;
	}

	.cta-content h2 {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.75rem 0;
	}

	@media (min-width: 640px) {
		.cta-content h2 {
			font-size: 1.875rem;
		}
	}

	.cta-content p {
		font-size: 1rem;
		max-width: 42rem;
		margin: 0 auto;
		opacity: 0.95;
	}

	@media (min-width: 640px) {
		.cta-content p {
			font-size: 1.125rem;
		}
	}
</style>

