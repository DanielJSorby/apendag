<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function setCookie(name: string, value: string, days: number = 365) {
		const expires = new Date();
		expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
		document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
	}

	function handleAccept() {
		setCookie('cookieConsent', 'accepted', 365);
		dispatch('accepted');
	}
</script>

<div class="overlay">
	<div class="overlay-innhold" on:click|stopPropagation>
		<h1>Informasjon om cookies</h1>
		<p>
			Denne siden bruker cookies. Ved å være på denne siden aksepterer du bruken av cookies.
		</p>

		<div class="knapper">
			<button class="ok" on:click={handleAccept}>OK</button>
		</div>
	</div>
</div>

<style>
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
		z-index: 200;
	}

	.overlay-innhold {
		background-color: white;
		padding: 2rem;
		border-radius: 1rem;
		text-align: center;
		color: black;
		max-width: 400px;
		width: 90%;
	}

	h1 {
		margin-top: 0;
		font-family: 'Oslo Sans', sans-serif;
	}

	p {
		font-family: 'Oslo Sans', sans-serif;
		line-height: 1.5;
		margin: 1rem 0;
	}

	.knapper {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
		transition: all 0.2s ease;
		font-family: 'Oslo Sans', sans-serif;
	}

	.ok {
		background-color: var(--color-blue, #2196f3);
		color: white;
		min-width: 100px;
	}

	.ok:hover {
		background-color: var(--color-blue-dark, #1976d2);
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	.ok:active {
		transform: translateY(0);
	}
</style>

