<script lang="ts">
	import ElvebakkenLogo from '$lib/assets/ElvebakkenLogo.svg';
	import Navbar from '$lib/components/navbar.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={ElvebakkenLogo} />
</svelte:head>
<Navbar />

{@render children()}


<style>
	@font-face {
		font-family: 'Oslo Sans';
		src: url('/fonts/OsloSans-Regular.woff2') format('woff2');
		font-weight: normal;
		font-style: normal;
	}

	@font-face {
		font-family: 'Oslo Sans';
		src: url('/fonts/Oslo Sans Light.woff2') format('woff2');
		font-weight: 300;
		font-style: normal;
	}

	@font-face {
		font-family: 'Oslo Sans';
		src: url('/fonts/Oslo Sans Medium.woff2') format('woff2');
		font-weight: 500;
		font-style: normal;
	}

	:global(:root) {
		--color-pink: #D93B60;
		--color-blue: #31ABC6;
		--color-green: #497450;
		--color-orange: #DC8946;
		--color-white: #fff;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Oslo Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}
</style>
