```svelte
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function handleDecision(decision: boolean) {
		dispatch('decision', decision);
	}
</script>

<div class="overlay" on:click={() => handleDecision(false)}>
	<div class="overlay-innhold" on:click|stopPropagation>
		<h1>Vil du ha studiesuppe?</h1>
		<p>Meld deg på for en gratis og varm lunsj i kantina.</p>

		<details>
			<summary>Hva er studiesuppe?</summary>
			<p class="explanation">
				Studiesuppe er et sosialt tiltak for elever på Elvebakken. Hver dag serveres det gratis,
				varm suppe i kantina for de som er påmeldt. Det er en flott mulighet til å møte andre
				elever i en uformell setting.
			</p>
		</details>

		<div class="knapper">
			<button class="ja" on:click={() => handleDecision(true)}>Ja, takk!</button>
			<button class="nei" on:click={() => handleDecision(false)}>Nei, takk</button>
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
		z-index: 200; /* Høyere z-index for å ligge over alt annet */
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
	}

	details {
		margin: 1.5rem 0;
		text-align: left;
		border: 1px solid #ccc;
		border-radius: 8px;
	}

	summary {
		padding: 0.5rem;
		cursor: pointer;
		font-weight: bold;
	}

	.explanation {
		padding: 0 0.5rem 0.5rem 0.5rem;
		border-top: 1px solid #ccc;
		margin-top: 0.5rem;
		color: #333;
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
	}

	.ja {
		background-color: #4caf50;
		color: white;
	}
	.ja:hover {
		background-color: #45a049;
	}

	.nei {
		background-color: #f44336;
		color: white;
	}
	.nei:hover {
		background-color: #e53935;
	}
</style>
```
