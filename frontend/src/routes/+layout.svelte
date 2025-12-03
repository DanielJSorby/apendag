<script lang="ts">
	import ElvebakkenLogo from '$lib/assets/ElvebakkenLogo.svg';
	import Navbar from '$lib/components/navbar.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={ElvebakkenLogo} />
	<meta name="author" content="Elvebakken" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index, follow" />
    <meta name="googlebot" content="index, follow" />
    <meta name="bingbot" content="index, follow" />
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
		--color-white: #ffffff;
		--color-pink: #D93B60;
		--color-blue: #31ABC6;
		--color-green: #497450;
		--color-orange: #DC8946;
		--color-grey: #f8f9fa;
		--color-black: black;
		--color-pink-light: #ffe0e3;
		--color-blue-light: #cdf4ff;
		--color-green-light: #d9ecd3;
		--color-orange-light: #ffe7c7;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Oslo Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	:global(.page-wrapper) {
		padding-top: 10vh;
	}
</style>
