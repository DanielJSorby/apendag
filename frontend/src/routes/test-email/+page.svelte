<script lang="ts">
	let { data } = $props();

	let email = $state('');
	let navn = $state('');
	let kursNavn = $state('Test Kurs');
	let tidspunkt = $state('09:00-10:30');
	let isLoading = $state(false);
	let message = $state('');
	let messageType: 'success' | 'error' | '' = $state('');
	let errorDetails = $state<any>(null);

	async function sendTestEmail() {
		if (!email || !navn) {
			message = 'Vennligst fyll ut e-post og navn';
			messageType = 'error';
			return;
		}

		isLoading = true;
		message = '';
		messageType = '';

		try {
			const response = await fetch('/api/test-email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email,
					navn,
					kursNavn,
					tidspunkt
				})
			});

			const data = await response.json();

			if (response.ok) {
				message = data.message || 'E-post sendt!';
				messageType = 'success';
				errorDetails = null;
			} else {
				message = data.message || 'Kunne ikke sende e-post';
				messageType = 'error';
				errorDetails = data.error || data.code ? { error: data.error, code: data.code } : null;
			}
		} catch (error: any) {
			message = `Feil: ${error.message}`;
			messageType = 'error';
			errorDetails = { message: error.message, stack: error.stack };
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Test E-post - Venteliste</title>
</svelte:head>

<div class="container">
	<h1>Test E-post - Venteliste Notifikasjon</h1>
	<p class="info">Denne siden er kun tilgjengelig på localhost for testing.</p>

	{#if !data.smtpConfigured}
		<div class="warning">
			<strong>⚠️ SMTP er ikke konfigurert!</strong>
			<p>Du må sette opp SMTP_HOST, SMTP_USER og SMTP_PASS i .env-filen.</p>
			<p>Status:</p>
			<ul>
				<li>SMTP_HOST: {data.smtpHost}</li>
				<li>SMTP_PORT: {data.smtpPort}</li>
				<li>SMTP_USER: {data.smtpUserSet ? '✓ Satt' : '✗ Ikke satt'}</li>
				<li>SMTP_PASS: {data.smtpPassSet ? '✓ Satt' : '✗ Ikke satt'}</li>
			</ul>
		</div>
	{:else}
		<div class="success-info">
			<strong>✓ SMTP er konfigurert</strong>
			<p>Host: {data.smtpHost}:{data.smtpPort}</p>
			<p>SMTP User: {data.smtpUser}</p>
			<p>From Email: {data.fromEmail}</p>
			{#if data.smtpUser.includes('@') && data.fromEmail !== 'Ikke satt' && data.fromEmail.split('@')[1] !== data.smtpUser.split('@')[1]}
				<div class="domain-warning">
					<strong>⚠️ Domene-mismatch!</strong>
					<p>FROM_EMAIL ({data.fromEmail}) er ikke på samme domene som SMTP_USER ({data.smtpUser}).</p>
					<p>Oppdater .env-filen: <code>FROM_EMAIL={data.smtpUser}</code></p>
				</div>
			{/if}
		</div>
	{/if}

	<div class="form-container">
		<div class="form-group">
			<label for="email">E-post:</label>
			<input 
				type="email" 
				id="email" 
				bind:value={email} 
				placeholder="test@example.com"
				disabled={isLoading}
			/>
		</div>

		<div class="form-group">
			<label for="navn">Navn:</label>
			<input 
				type="text" 
				id="navn" 
				bind:value={navn} 
				placeholder="Ola Nordmann"
				disabled={isLoading}
			/>
		</div>

		<div class="form-group">
			<label for="kursNavn">Kursnavn:</label>
			<input 
				type="text" 
				id="kursNavn" 
				bind:value={kursNavn} 
				placeholder="Test Kurs"
				disabled={isLoading}
			/>
		</div>

		<div class="form-group">
			<label for="tidspunkt">Tidspunkt:</label>
			<input 
				type="text" 
				id="tidspunkt" 
				bind:value={tidspunkt} 
				placeholder="09:00-10:30"
				disabled={isLoading}
			/>
		</div>

		<button 
			onclick={sendTestEmail} 
			disabled={isLoading || !email || !navn}
			class="send-button"
		>
			{isLoading ? 'Sender...' : 'Send Test E-post'}
		</button>

		{#if message}
			<div class="message" class:success={messageType === 'success'} class:error={messageType === 'error'}>
				{message}
				{#if messageType === 'error' && errorDetails}
					<div class="error-details">
						<details>
							<summary>Tekniske detaljer</summary>
							<pre>{JSON.stringify(errorDetails, null, 2)}</pre>
						</details>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<div class="config-info">
		<h2>SMTP Konfigurasjon</h2>
		<p>For at e-post skal fungere, må du ha følgende i din .env fil:</p>
		
		<h3>Domeneshop (anbefalt for norske domener):</h3>
		<p><strong>Viktig:</strong> Bruk <strong>brukernavnet</strong> (ikke e-postadressen) som SMTP_USER for wildcard-kontoer!</p>
		
		<h4>For wildcard-kontoer (f.eks. *@dittdomene.no):</h4>
		<pre>SMTP_HOST=smtp.domeneshop.no
SMTP_PORT=587
SMTP_USER=brukernavnet-ditt  (f.eks. elvebakkenapend1)
SMTP_PASS=ditt-epost-passord
FROM_EMAIL=noreply@dittdomene.no (valgfritt)
PUBLIC_BASE_URL=http://localhost:5173 (valgfritt)</pre>

		<h4>For vanlige e-postkontoer:</h4>
		<pre>SMTP_HOST=smtp.domeneshop.no
SMTP_PORT=587
SMTP_USER=dittnavn@dittdomene.no
SMTP_PASS=ditt-epost-passord
FROM_EMAIL=noreply@dittdomene.no (valgfritt)</pre>

		<h4>Alternativt (hvis port 587 ikke fungerer):</h4>
		<pre>SMTP_HOST=smtp.domeneshop.no
SMTP_PORT=465
SMTP_USER=brukernavnet-ditt (eller dittnavn@dittdomene.no)
SMTP_PASS=ditt-epost-passord</pre>
		
		<p class="domeneshop-info">
			<strong>Fra Domeneshop dokumentasjon:</strong><br>
			- SMTP server: smtp.domeneshop.no<br>
			- Port: 587 med STARTTLS (anbefalt) eller 465 med SSL<br>
			- Brukernavn: Navnet på e-post-kontoen (ikke e-postadressen for wildcard-kontoer)<br>
			- Passord: Passordet for e-post-kontoen
		</p>

		<h3>Andre leverandører:</h3>
		<pre>SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
FROM_EMAIL=noreply@example.com (valgfritt)
PUBLIC_BASE_URL=http://localhost:5173 (valgfritt)</pre>

		<div class="note">
			<p><strong>Viktig for Domeneshop wildcard-kontoer:</strong></p>
			<ul>
				<li><strong>For wildcard-kontoer:</strong> Bruk brukernavnet (f.eks. <code>elvebakkenapend1</code>) som SMTP_USER, ikke e-postadressen</li>
				<li><strong>For vanlige e-postkontoer:</strong> Bruk full e-postadresse (f.eks. <code>navn@dittdomene.no</code>)</li>
				<li>Passordet må være det samme som du bruker for å logge inn på e-posten din via webmail eller e-postklient</li>
				<li>Hvis du har endret passord nylig, sørg for at det nye passordet er i .env-filen</li>
				<li>Hvis du ikke er sikker på passordet, kan du endre det i Domeneshop kundesenter</li>
			</ul>
			<p><strong>Eksempel for wildcard-konto:</strong></p>
			<pre>SMTP_USER=elvebakkenapend1
SMTP_PASS=ditt-passord</pre>
		</div>
		
		<div class="troubleshooting">
			<h3>Feilsøking:</h3>
			<p>Hvis du får "535 Incorrect authentication data":</p>
			<ol>
				<li>Sjekk at e-postkontoen faktisk eksisterer i Domeneshop</li>
				<li>Logg inn på webmail (webmail.domeneshop.no) med samme e-post og passord for å verifisere at passordet er riktig</li>
				<li>Sjekk at det ikke er ekstra mellomrom i .env-filen rundt SMTP_USER og SMTP_PASS</li>
				<li>Prøv å endre passordet i Domeneshop og oppdater .env-filen med det nye passordet</li>
			</ol>
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 2rem auto;
		padding: 2rem;
		font-family: Arial, sans-serif;
	}

	h1 {
		color: #333;
		margin-bottom: 0.5rem;
	}

	.info {
		color: #666;
		font-style: italic;
		margin-bottom: 2rem;
	}

	.form-container {
		background: #f9f9f9;
		padding: 2rem;
		border-radius: 8px;
		margin-bottom: 2rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: bold;
		color: #333;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
	}

	input:disabled {
		background-color: #f0f0f0;
		cursor: not-allowed;
	}

	.send-button {
		width: 100%;
		padding: 1rem;
		background-color: #4CAF50;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.send-button:hover:not(:disabled) {
		background-color: #45a049;
	}

	.send-button:disabled {
		background-color: #cccccc;
		cursor: not-allowed;
	}

	.message {
		margin-top: 1rem;
		padding: 1rem;
		border-radius: 4px;
		font-weight: bold;
	}

	.message.success {
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
	}

	.message.error {
		background-color: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}

	.config-info {
		background: #e7f3ff;
		padding: 1.5rem;
		border-radius: 8px;
		border-left: 4px solid #2196F3;
	}

	.config-info h2 {
		margin-top: 0;
		color: #1976D2;
	}

	.config-info pre {
		background: #fff;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		font-size: 0.9rem;
	}

	.error-details {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #f5c6cb;
	}

	.error-details details {
		cursor: pointer;
	}

	.error-details summary {
		font-weight: normal;
		color: #721c24;
		margin-bottom: 0.5rem;
	}

	.error-details pre {
		background: #fff;
		padding: 0.75rem;
		border-radius: 4px;
		font-size: 0.85rem;
		margin: 0.5rem 0 0 0;
		overflow-x: auto;
	}

	.note ul {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.note li {
		margin: 0.25rem 0;
	}

	.troubleshooting {
		background: #fff3cd;
		padding: 1rem;
		border-radius: 4px;
		border-left: 4px solid #ffc107;
		margin-top: 1rem;
	}

	.troubleshooting h3 {
		margin-top: 0;
		color: #856404;
	}

	.troubleshooting ol {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.troubleshooting li {
		margin: 0.25rem 0;
	}

	.domeneshop-info {
		background: #e7f3ff;
		padding: 1rem;
		border-radius: 4px;
		border-left: 4px solid #2196F3;
		margin-top: 1rem;
		font-size: 0.9rem;
	}

	.warning {
		background: #fff3cd;
		padding: 1rem;
		border-radius: 4px;
		border-left: 4px solid #ffc107;
		margin-bottom: 2rem;
	}

	.warning ul {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.success-info {
		background: #d4edda;
		padding: 1rem;
		border-radius: 4px;
		border-left: 4px solid #28a745;
		margin-bottom: 2rem;
		color: #155724;
	}

	h4 {
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		color: #333;
	}

	.domain-warning {
		background: #fff3cd;
		padding: 1rem;
		border-radius: 4px;
		border-left: 4px solid #ffc107;
		margin-top: 1rem;
	}

	.domain-warning code {
		background: #fff;
		padding: 0.25rem 0.5rem;
		border-radius: 3px;
		font-family: monospace;
	}
</style>

