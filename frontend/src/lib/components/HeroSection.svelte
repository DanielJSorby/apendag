<script lang="ts">
	interface Props {
		image: string;
		title?: string;
		subtitle?: string;
		height?: string;
		overlayOpacity?: number;
		textAlign?: 'left' | 'center' | 'right';
		shimmer?: boolean;
	}

	let {
		image,
		title = '',
		subtitle = '',
		height = '40vh',
		overlayOpacity = 0.5,
		textAlign = 'center',
		shimmer = false
	}: Props = $props();
</script>

<div class="hero-section" style="height: {height}; background-image: url('{image}');">
	{#if shimmer}
		<div class="shimmer-overlay"></div>
	{/if}
	<div class="overlay" style="background: rgba(0, 0, 0, {overlayOpacity});"></div>
	<div class="content" style="text-align: {textAlign};">
		<slot>
			{#if title}
				<h1 class="hero-title">{title}</h1>
			{/if}
			{#if subtitle}
				<p class="hero-subtitle">{@html subtitle}</p>
			{/if}
		</slot>
	</div>
</div>

<style>
	.hero-section {
		width: 100vw;
		display: flex;
		justify-content: center;
		align-items: center;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		position: relative;
		overflow: hidden;
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;
	}

	.shimmer-overlay {
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: linear-gradient(
			90deg,
			transparent 40%,
			rgba(255, 255, 255, 0.08) 50%,
			transparent 60%
		);
		animation: shimmer 15s ease-in-out infinite;
		z-index: 2;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	.content {
		position: relative;
		z-index: 3;
		color: white;
		padding: 0 2rem;
		width: 100%;
		max-width: 1200px;
	}

	.hero-title {
		font-family: 'Oslo Sans', sans-serif;
		font-size: clamp(1.5rem, 4vw, 2.5rem);
		font-weight: 500;
		margin: 0 0 1rem 0;
		line-height: 1.2;
		text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5);
	}

	.hero-subtitle {
		font-family: 'Oslo Sans', sans-serif;
		font-size: clamp(.8rem, 2vw, 1.3rem);
		font-weight: 300;
		margin: 0;
		opacity: 0.95;
	}

	/* Mobile styles */
	@media (max-width: 570px) {
		.hero-section {
			height: 50vh !important;
		}

		.content {
			padding: 0 1rem;
		}
	}
</style>
