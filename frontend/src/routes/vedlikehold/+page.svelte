<script lang="ts">
let { data } = $props();
</script>

<svelte:head>
    <title>Maintenance - Åpendag</title>
    <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="maintenance-container">
    <div class="maintenance-content">
        <div class="maintenance-icon">⚙️</div>
        
        <h1>Systemvedlikehold pågår</h1>
        
        <p class="maintenance-message">
            Vi gjennomfører rutinemessig vedlikehold av systemet for å sikre best mulig ytelse og sikkerhet.
            Vi er tilbake snart!
        </p>
        
        <div class="maintenance-details">
            <div class="detail-item">
                <span class="detail-label">Vedlikehold startet:</span>
                <span class="detail-value">{data.activatedAt}</span>
            </div>
        </div>
        
    </div>
</div>

<style>
    .maintenance-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        padding: 1rem;
        animation: colorCycle 20s ease-in-out infinite;
    }

    @keyframes colorCycle {
        0% {
            background-color: var(--color-pink);
            box-shadow: 0 4px 20px rgba(217, 59, 96, 0.5);
        }
        25% {
            background-color: var(--color-blue);
            box-shadow: 0 4px 20px rgba(49, 171, 198, 0.5);
        }
        50% {
            background-color: var(--color-green);
            box-shadow: 0 4px 20px rgba(73, 116, 80, 0.5);
        }
        75% {
            background-color: var(--color-orange);
            box-shadow: 0 4px 20px rgba(220, 137, 70, 0.5);
        }
        100% {
            background-color: var(--color-pink);
            box-shadow: 0 4px 20px rgba(217, 59, 96, 0.5);
        }
    }

    .maintenance-content {
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        padding: 3rem 2rem;
        max-width: 500px;
        text-align: center;
    }

    .maintenance-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        animation: spin 3s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    h1 {
        color: #333;
        margin: 0 0 1rem 0;
        font-size: 2rem;
    }

    .maintenance-message {
        color: #666;
        font-size: 1.1rem;
        margin: 0 0 2rem 0;
        line-height: 1.6;
    }

    .maintenance-details {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 1.5rem;
        margin: 2rem 0;
        text-align: left;
    }

    .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid #e0e0e0;
    }

    .detail-item:last-child {
        border-bottom: none;
    }

    .detail-label {
        color: #999;
        font-weight: 500;
    }

    .detail-value {
        color: #333;
        font-weight: 600;
    }
</style>
