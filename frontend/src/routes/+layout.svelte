<script lang="ts">
	import { onMount } from 'svelte';
	import { navigating, page } from '$app/stores';
	import ElvebakkenLogo from '$lib/assets/ElvebakkenLogo.svg';
	import Footer from '$lib/components/footer.svelte';
	import Navbar from '$lib/components/navbar.svelte';
	import LoadingScreen from '$lib/components/LoadingScreen.svelte';
	import CookieConsent from '$lib/components/CookieConsent.svelte';
	import { getCookie } from '$lib/functions/getCookie';
	
	let { children } = $props();
	let initialLoad = $state(true);
	let imagesLoading = $state(true);
	let showCookieConsent = $state(false);

	function preloadImage(src: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve();
			img.onerror = () => resolve(); // Resolve even on error to not block
			img.src = src;
		});
	}

	function waitForImages() {
		imagesLoading = true;
		
		// Wait a bit for DOM to update
		setTimeout(() => {
			const images: HTMLImageElement[] = Array.from(document.querySelectorAll('img'));
			const backgroundImages: string[] = [];
			
			// Find all elements with background-image
			const allElements = document.querySelectorAll('*');
			allElements.forEach((el) => {
				const bgImage = window.getComputedStyle(el).backgroundImage;
				if (bgImage && bgImage !== 'none') {
					const match = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
					if (match && match[1]) {
						backgroundImages.push(match[1]);
					}
				}
			});

			const imagePromises: Promise<void>[] = [];
			
			// Preload all img tags
			images.forEach((img) => {
				if (img.src && !img.complete) {
					imagePromises.push(preloadImage(img.src));
				}
			});

			// Preload all background images
			backgroundImages.forEach((bgSrc) => {
				imagePromises.push(preloadImage(bgSrc));
			});

			if (imagePromises.length === 0) {
				imagesLoading = false;
			} else {
				Promise.all(imagePromises).then(() => {
					imagesLoading = false;
				});
			}
		}, 100);
	}

	onMount(() => {
		waitForImages();
		// Also wait for initial load
		setTimeout(() => {
			initialLoad = false;
		}, 300);
		
		// Sjekk om brukeren allerede har akseptert cookies
		const cookieConsent = getCookie('cookieConsent');
		if (!cookieConsent) {
			showCookieConsent = true;
		}
	});

	function handleCookieAccepted() {
		showCookieConsent = false;
	}

	$effect(() => {
		if ($navigating) {
			imagesLoading = true;
		} else if (!$navigating && !initialLoad) {
			waitForImages();
		}
	});
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

{#if showCookieConsent}
	<CookieConsent on:accepted={handleCookieAccepted} />
{/if}

{#if $navigating || initialLoad || imagesLoading}
	<LoadingScreen />
{/if}

{@render children()}

<Footer></Footer>
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
		background-color: var(--color-grey);
	}

	:global(*) {
		box-sizing: border-box;
	}

	:global(.page-wrapper) {
		padding-top: 10vh;
	}

	:global(.hiddenDot) {
		opacity: 0;
		margin: -8px;
	}
</style>
