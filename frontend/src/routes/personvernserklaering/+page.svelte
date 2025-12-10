<script lang="ts">
	import HeroSection from '$lib/components/HeroSection.svelte';
</script>

<svelte:head>
	<title>Personvernserklæring - Elvebakken VGS</title>
	<meta
		name="description"
		content="Personvernserklæring for Elvebakken VGS sin åpen dag-nettside. Les om hvordan vi behandler dine personopplysninger."
	/>
</svelte:head>

<HeroSection 
	image="/images/Elvebakken fra elven STOT 1.jpg"
	title="Personvernserklæring"
	subtitle="Slik behandler vi dine personopplysninger"
	height="30vh"
/>

<div class="body">
	<div class="container">
		<section class="content-section">
			<p class="last-updated">Sist oppdatert: {new Date().toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

			<h2>1. Innledning</h2>
			<p>
				Elvebakken VGS er ansvarlig for behandlingen av personopplysninger på denne nettsiden. 
				Denne personvernserklæringen forklarer hvilke personopplysninger vi samler inn, hvorfor vi samler dem inn, 
				hvordan vi bruker dem, og hvilke rettigheter du har.
			</p>

			<h2>2. Hvilke personopplysninger samler vi inn?</h2>
			<p>Vi samler inn følgende personopplysninger:</p>
			<ul>
				<li><strong>Navn</strong> - For å identifisere deg og personalisere tjenesten</li>
				<li><strong>E-postadresse</strong> - For å sende deg påloggingslenker og kommunikasjon</li>
				<li><strong>Telefonnummer</strong> - For å kunne kontakte deg ved behov</li>
				<li><strong>Ungdomskole</strong> - For statistikk og planlegging</li>
				<li><strong>Kurs-påmeldinger</strong> - Informasjon om hvilke kurs du melder deg på og tidspunkt</li>
				<li><strong>Studiesuppe-preferanse</strong> - Om du ønsker studiesuppe ved påmelding</li>
			</ul>

			<h2>3. Hvorfor samler vi inn personopplysninger?</h2>
			<p>Vi samler inn personopplysninger for å:</p>
			<ul>
				<li>Gjøre det mulig å melde deg på kurs og aktiviteter under åpen dag</li>
				<li>Autentisere deg når du logger inn på nettsiden</li>
				<li>Planlegge og organisere åpen dag-arrangementet</li>
				<li>Følge opp påmeldinger og sende deg relevant informasjon</li>
			</ul>

			<h2>4. Hvordan samler vi inn personopplysninger?</h2>
			<p>
				Personopplysninger samles inn når du:
			</p>
			<ul>
				<li>Registrerer deg som bruker på nettsiden</li>
				<li>Melder deg på kurs eller aktiviteter</li>
				<li>Logger inn via magic link (e-postlenke)</li>
			</ul>

			<h2>5. Hvordan lagrer vi personopplysninger?</h2>
			<p>
				Personopplysninger lagres i en sikker MariaDB-database. Dataene er kryptert i transit og 
				beskyttet med passord. Kun autorisert personale har tilgang til databasen.
			</p>

			<h2>6. Cookies</h2>
			<p>Vi bruker følgende cookies på nettsiden:</p>
			<ul>
				<li><strong>cookieConsent</strong> - Lagrer at du har akseptert bruk av cookies (varer i 365 dager)</li>
				<li><strong>UserId</strong> - Identifiserer deg når du er innlogget (slettes ved utlogging)</li>
				<li><strong>adminVisibleColumns</strong> - Lagrer dine preferanser i admin-panelet (kun for administratorer)</li>
			</ul>
			<p>
				Cookies brukes kun for å gi deg en bedre brukeropplevelse og for å autentisere deg. 
				Du kan når som helst slette cookies fra nettleseren din.
			</p>

			<h2>7. Deling av personopplysninger</h2>
			<p>
				Vi deler ikke personopplysninger med tredjeparter, bortsett fra:
			</p>
			<ul>
				<li><strong>E-posttjeneste (Resend)</strong> - For å sende deg påloggingslenker via e-post. 
					Resend er GDPR-kompatibel og behandler kun data nødvendig for å sende e-poster.</li>
				<li><strong>Hosting-leverandør</strong> - Våre hosting-leverandører har teknisk tilgang til servere, 
					men behandler ikke personopplysninger aktivt.</li>
			</ul>

			<h2>8. Lagringstid</h2>
			<p>
				Personopplysninger lagres så lenge det er nødvendig for å oppfylle formålet med behandlingen, 
				eller så lenge vi har en juridisk forpliktelse til å lagre dem. Du kan når som helst be om 
				å få slettet dine personopplysninger.
			</p>

			<h2>9. Dine rettigheter</h2>
			<p>Du har følgende rettigheter:</p>
			<ul>
				<li><strong>Innsyn</strong> - Du har rett til å få vite hvilke personopplysninger vi har om deg</li>
				<li><strong>Rettelse</strong> - Du har rett til å få rettet feilaktige eller ufullstendige opplysninger</li>
				<li><strong>Sletting</strong> - Du har rett til å få slettet dine personopplysninger</li>
				<li><strong>Begrensning</strong> - Du har rett til å begrense behandlingen av dine personopplysninger</li>
				<li><strong>Dataportabilitet</strong> - Du har rett til å få utlevert dine personopplysninger i et strukturt format</li>
				<li><strong>Innsigelse</strong> - Du har rett til å gjøre innsigelse mot behandlingen av dine personopplysninger</li>
			</ul>

			<h2>10. Sikkerhet</h2>
			<p>
				Vi har implementert tekniske og organisatoriske tiltak for å beskytte dine personopplysninger 
				mot uautorisert tilgang, tap, endring eller destruksjon. Dette inkluderer:
			</p>
			<ul>
				<li>Kryptert datatransport (HTTPS)</li>
				<li>Sikker database med passordbeskyttelse</li>
				<li>Begrenset tilgang til personopplysninger</li>
				<li>Regelmessige sikkerhetsoppdateringer</li>
			</ul>

			<h2>11. Kontakt oss</h2>
			<p>
				Hvis du har spørsmål om personvernserklæringen eller ønsker å utøve dine rettigheter, 
				kan du kontakte oss:
			</p>
			<div class="contact-box">
				<p><strong>Elvebakken VGS</strong></p>
				<p>Vestre Elvebakke 3, 0182 Oslo</p>
				<p>Telefon: <a href="tel:22996600">22 99 66 00</a></p>
				<p>E-post: <a href="mailto:post@elvebakken.vgs.no">post@elvebakken.vgs.no</a></p>
			</div>

			<h2>12. Endringer i personvernserklæringen</h2>
			<p>
				Vi kan oppdatere denne personvernserklæringen fra tid til annen. Viktige endringer vil 
				blir varslet på nettsiden. Vi oppfordrer deg til å gå gjennom personvernserklæringen 
				regelmessig for å holde deg oppdatert.
			</p>
		</section>
	</div>
</div>

<style>
	.body {
		display: flex;
		justify-content: center;
		width: 100%;
		background: var(--color-grey);
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 3rem 2rem;
	}

	@media (max-width: 768px) {
		.container {
			padding: 2rem 1rem;
		}
	}

	.content-section {
		background: white;
		padding: 3rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 768px) {
		.content-section {
			padding: 2rem 1.5rem;
		}
	}

	.last-updated {
		color: #666;
		font-size: 0.9rem;
		margin-bottom: 2rem;
		font-style: italic;
	}

	h2 {
		font-family: 'Oslo Sans', sans-serif;
		font-size: clamp(1.5rem, 3vw, 2rem);
		font-weight: 500;
		color: #1a1a1a;
		margin: 2.5rem 0 1rem 0;
	}

	h2:first-of-type {
		margin-top: 0;
	}

	p {
		font-family: 'Oslo Sans', sans-serif;
		font-size: 1.125rem;
		line-height: 1.8;
		color: #333;
		margin: 1rem 0;
	}

	ul {
		font-family: 'Oslo Sans', sans-serif;
		font-size: 1.125rem;
		line-height: 1.8;
		color: #333;
		margin: 1rem 0;
		padding-left: 2rem;
	}

	li {
		margin: 0.75rem 0;
	}

	strong {
		font-weight: 500;
		color: #1a1a1a;
	}

	.contact-box {
		background: var(--color-grey);
		padding: 1.5rem;
		border-radius: 8px;
		margin: 1.5rem 0;
	}

	.contact-box p {
		margin: 0.5rem 0;
	}

	.contact-box a {
		color: var(--color-blue, #31ABC6);
		text-decoration: none;
	}

	.contact-box a:hover {
		text-decoration: underline;
	}
</style>

