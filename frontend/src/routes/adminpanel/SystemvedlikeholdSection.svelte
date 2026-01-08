<script lang="ts">
import { onMount } from 'svelte';

let maintenanceActive = $state(false);
let isLoading = $state(false);
let message = $state('');
let messageType = $state<'success' | 'error'>('success');

onMount(async () => {
    await loadMaintenanceStatus();
});

async function loadMaintenanceStatus() {
    try {
        const response = await fetch('/api/admin/maintenance');
        if (response.ok) {
            const data = await response.json();
            // Handle både boolean og 0/1 fra databasen
            maintenanceActive = Boolean(data.is_active);
        }
    } catch (error) {
        console.error('Error loading systemvedlikehold status:', error);
    }
}

async function toggleMaintenance() {
    isLoading = true;
    message = '';
    try {
        const response = await fetch('/api/admin/maintenance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ is_active: !maintenanceActive })
        });

        if (response.ok) {
            maintenanceActive = !maintenanceActive;
            messageType = 'success';
            message = maintenanceActive 
                ? 'Systemvedlikehold modus aktivert - utviklere har fortsatt tilgang' 
                : 'Systemvedlikehold modus deaktivert';
            setTimeout(() => {
                message = '';
            }, 3000);
        } else {
            messageType = 'error';
            message = 'Feil ved oppdatering av systemvedlikehold modus';
        }
    } catch (error) {
        console.error('Error toggling maintenance:', error);
        messageType = 'error';
        message = 'Feil: ' + (error as Error).message;
    } finally {
        isLoading = false;
    }
}
</script>

<div class="maintenance-section">
    <h2>Systemvedlikehold Modus</h2>
    
    <div class="status-card">
        <div class="status-info">
            <p class="status-label">Status:</p>
            <p class="status-value" class:active={maintenanceActive}>
                {maintenanceActive ? 'Aktiv' : 'Inaktiv'}
            </p>
        </div>
        
        <div class="description">
            <p>
                Når systemvedlikehold modus er aktivert vil alle brukere (unntatt utviklere) 
                se en systemvedlikehold-side i stedet for normale sider.
            </p>
            <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #666;">
                Utviklere får fortsatt full tilgang til applikasjonen.
            </p>
        </div>
        
        <button 
            onclick={toggleMaintenance}
            disabled={isLoading}
            class:loading={isLoading}
            class={maintenanceActive ? 'btn-danger' : 'btn-success'}
        >
            {isLoading ? 'Oppdaterer...' : (maintenanceActive ? 'Deaktiver' : 'Aktiver')}
        </button>

        {#if message}
            <div class="message" class:error={messageType === 'error'}>
                {message}
            </div>
        {/if}
    </div>
</div>

<style>
    .maintenance-section {
        padding: 1.5rem;
        background: #f8f9fa;
        border-radius: 8px;
        margin: 2rem 0;
    }

    .maintenance-section h2 {
        margin-top: 0;
        color: #333;
        font-size: 1.5rem;
    }

    .status-card {
        background: white;
        padding: 1.5rem;
        border-radius: 6px;
        border: 1px solid #ddd;
    }

    .status-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .status-label {
        margin: 0;
        font-weight: 600;
        color: #333;
    }

    .status-value {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
        color: #27ae60;
    }

    .status-value.active {
        color: #e74c3c;
    }

    .description {
        background: #f0f7ff;
        padding: 1rem;
        border-radius: 4px;
        margin: 1rem 0;
        border-left: 4px solid #3498db;
    }

    .description p {
        margin: 0.25rem 0;
        color: #333;
        font-size: 0.95rem;
    }

    button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .btn-success {
        background: #27ae60;
        color: white;
    }

    .btn-success:hover:not(:disabled) {
        background: #229954;
    }

    .btn-danger {
        background: #e74c3c;
        color: white;
    }

    .btn-danger:hover:not(:disabled) {
        background: #c0392b;
    }

    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    button.loading {
        pointer-events: none;
    }

    .message {
        margin-top: 1rem;
        padding: 0.75rem 1rem;
        border-radius: 4px;
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }

    .message.error {
        background: #f8d7da;
        color: #721c24;
        border-color: #f5c6cb;
    }
</style>
