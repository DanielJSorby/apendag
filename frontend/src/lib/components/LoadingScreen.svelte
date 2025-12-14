<script lang="ts">
	interface Props {
		text?: string;
		size?: 'small' | 'medium' | 'large';
	}

	let { text = 'Laster...', size = 'medium' }: Props = $props();
</script>

<div class="loading-screen" class:small={size === 'small'} class:large={size === 'large'}>
	<div class="loader-container">
		<div class="spinner">
			<div class="spinner-ring"></div>
			<div class="spinner-ring"></div>
			<div class="spinner-ring"></div>
			<div class="spinner-ring"></div>
		</div>
		<div class="dots">
			<span class="dot"></span>
			<span class="dot"></span>
			<span class="dot"></span>
		</div>
		<p class="loading-text">{text}</p>
	</div>
	<div class="background-shapes">
		<div class="shape shape-1"></div>
		<div class="shape shape-2"></div>
		<div class="shape shape-3"></div>
		<div class="shape shape-4"></div>
	</div>
</div>

<style>
	.loading-screen {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--color-grey) 0%, #e8eef0 100%);
		z-index: 9999;
		overflow: hidden;
	}

	.loader-container {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	.spinner {
		position: relative;
		width: 80px;
		height: 80px;
	}

	.loading-screen.small .spinner {
		width: 50px;
		height: 50px;
	}

	.loading-screen.large .spinner {
		width: 120px;
		height: 120px;
	}

	.spinner-ring {
		position: absolute;
		width: 100%;
		height: 100%;
		border: 3px solid transparent;
		border-top-color: var(--color-blue);
		border-radius: 50%;
		animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
	}

	.spinner-ring:nth-child(1) {
		border-top-color: var(--color-blue);
		animation-delay: 0s;
	}

	.spinner-ring:nth-child(2) {
		border-top-color: var(--color-pink);
		animation-delay: -0.3s;
		width: 80%;
		height: 80%;
		top: 10%;
		left: 10%;
	}

	.spinner-ring:nth-child(3) {
		border-top-color: var(--color-green);
		animation-delay: -0.6s;
		width: 60%;
		height: 60%;
		top: 20%;
		left: 20%;
	}

	.spinner-ring:nth-child(4) {
		border-top-color: var(--color-orange);
		animation-delay: -0.9s;
		width: 40%;
		height: 40%;
		top: 30%;
		left: 30%;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.dots {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--color-blue);
		animation: bounce 1.4s ease-in-out infinite;
	}

	.loading-screen.small .dot {
		width: 8px;
		height: 8px;
	}

	.loading-screen.large .dot {
		width: 12px;
		height: 12px;
	}

	.dot:nth-child(1) {
		background: var(--color-blue);
		animation-delay: 0s;
	}

	.dot:nth-child(2) {
		background: var(--color-pink);
		animation-delay: 0.2s;
	}

	.dot:nth-child(3) {
		background: var(--color-green);
		animation-delay: 0.4s;
	}

	@keyframes bounce {
		0%, 80%, 100% {
			transform: scale(0.8);
			opacity: 0.5;
		}
		40% {
			transform: scale(1.2);
			opacity: 1;
		}
	}

	.loading-text {
		font-family: 'Oslo Sans', sans-serif;
		font-size: 1.125rem;
		font-weight: 500;
		color: #1a1a1a;
		margin: 0;
		opacity: 0.8;
		animation: pulse 2s ease-in-out infinite;
	}

	.loading-screen.small .loading-text {
		font-size: 0.9rem;
	}

	.loading-screen.large .loading-text {
		font-size: 1.5rem;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
	}

	.background-shapes {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		z-index: 1;
	}

	.shape {
		position: absolute;
		border-radius: 50%;
		opacity: 0.1;
		animation: float 20s ease-in-out infinite;
	}

	.shape-1 {
		width: 300px;
		height: 300px;
		background: var(--color-blue);
		top: -150px;
		left: -150px;
		animation-delay: 0s;
	}

	.shape-2 {
		width: 200px;
		height: 200px;
		background: var(--color-pink);
		top: 20%;
		right: -100px;
		animation-delay: -5s;
	}

	.shape-3 {
		width: 250px;
		height: 250px;
		background: var(--color-green);
		bottom: -125px;
		left: 10%;
		animation-delay: -10s;
	}

	.shape-4 {
		width: 180px;
		height: 180px;
		background: var(--color-orange);
		bottom: 10%;
		right: 15%;
		animation-delay: -15s;
	}

	@keyframes float {
		0%, 100% {
			transform: translate(0, 0) scale(1);
		}
		33% {
			transform: translate(30px, -30px) scale(1.1);
		}
		66% {
			transform: translate(-20px, 20px) scale(0.9);
		}
	}

	@media (max-width: 768px) {
		.spinner {
			width: 60px;
			height: 60px;
		}

		.loading-text {
			font-size: 1rem;
		}

		.shape {
			width: 150px;
			height: 150px;
		}

		.shape-1 {
			width: 200px;
			height: 200px;
			top: -100px;
			left: -100px;
		}

		.shape-2 {
			width: 150px;
			height: 150px;
			right: -75px;
		}

		.shape-3 {
			width: 180px;
			height: 180px;
			bottom: -90px;
		}

		.shape-4 {
			width: 120px;
			height: 120px;
		}
	}
</style>

