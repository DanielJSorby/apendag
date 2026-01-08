<script lang="ts">
let { linjer = $bindable() } = $props();

let editingLinje = $state<any | null>(null);

async function loadLinjer() {
    try {
        const response = await fetch('/api/admin/linjer');
        if (response.ok) {
            const data = await response.json();
            linjer = data.linjer || [];
        }
    } catch (error) {
        console.error('Error loading linjer:', error);
    }
}

async function updateLinje(linje: any) {
    try {
        const response = await fetch('/api/admin/linjer', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(linje)
        });
        
        if (response.ok) {
            editingLinje = null;
            await loadLinjer();
        }
    } catch (error) {
        console.error('Error updating linje:', error);
    }
}
</script>

<div class="section-header">
    <h2>Linjer</h2>
</div>

<div class="linjer-list">
    {#each linjer as linje (linje.id)}
        <div class="linje-item">
            {#if editingLinje?.id === linje.id}
                <div class="linje-edit-form">
                    <div class="form-grid">
                        <div style="grid-column: 1 / -1;">
                            <span class="field-label">ID (kan ikke endres)</span>
                            <input type="text" value={editingLinje.id} disabled />
                        </div>
                        <div style="grid-column: 1 / -1;">
                            <label for="linje-tittel">Tittel</label>
                            <input type="text" id="linje-tittel" bind:value={editingLinje.tittel} />
                        </div>
                        <div style="grid-column: 1 / -1;">
                            <label for="linje-beskrivelse">Beskrivelse</label>
                            <textarea id="linje-beskrivelse" bind:value={editingLinje.beskrivelse} rows="2"></textarea>
                        </div>
                        <div style="grid-column: 1 / -1;">
                            <label for="linje-lang-beskrivelse">Lang beskrivelse</label>
                            <textarea id="linje-lang-beskrivelse" bind:value={editingLinje.langBeskrivelse} rows="8"></textarea>
                        </div>
                        <div style="grid-column: 1 / -1;">
                            <label for="linje-bilde">Bilde path</label>
                            <input type="text" id="linje-bilde" bind:value={editingLinje.bilde} />
                        </div>
                        <div>
                            <label for="linje-farge">Farge</label>
                            <input type="text" id="linje-farge" bind:value={editingLinje.farge} />
                        </div>
                        <div>
                            <label for="linje-lysfarge">Lysfarge</label>
                            <input type="text" id="linje-lysfarge" bind:value={editingLinje.lysfarge} />
                        </div>
                        <div style="grid-column: 1 / -1;">
                            <label for="linje-ekstern-lenke">Ekstern lenke</label>
                            <input type="text" id="linje-ekstern-lenke" bind:value={editingLinje.eksternLenke} />
                        </div>
                    </div>
                    <div class="linje-actions">
                        <button onclick={() => updateLinje(editingLinje)} class="btn-small btn-success">
                            Lagre
                        </button>
                        <button onclick={() => editingLinje = null} class="btn-small btn-cancel">
                            Avbryt
                        </button>
                    </div>
                </div>
            {:else}
                <div class="linje-content">
                    <div class="linje-header">
                        <h3>{linje.tittel}</h3>
                        <div class="linje-actions">
                            <button onclick={() => { editingLinje = {...linje}; }} class="btn-small btn-edit">
                                Rediger
                            </button>
                        </div>
                    </div>
                    <div class="linje-details">
                        <p><strong>Beskrivelse:</strong> {linje.beskrivelse}</p>
                        <p><strong>Bilde:</strong> {linje.bilde}</p>
                        <p><strong>Farge:</strong> <span style="color: {linje.farge};">{linje.farge}</span></p>
                        {#if linje.eksternLenke}
                            <p><strong>Ekstern lenke:</strong> <a href={linje.eksternLenke} target="_blank">{linje.eksternLenke}</a></p>
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
    {/each}
</div>

<style>
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 15px;
    }

    .section-header h2 {
        margin: 0;
        color: #333;
    }

    .linjer-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .linje-item {
        background: white;
        border: 2px solid #f0f0f0;
        border-radius: 15px;
        padding: 25px;
        transition: all 0.3s ease;
    }

    .linje-item:hover {
        border-color: var(--color-pink);
        box-shadow: 0 4px 15px rgba(217, 59, 96, 0.1);
    }

    .linje-content {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .linje-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 15px;
        border-bottom: 2px solid #f0f0f0;
    }

    .linje-header h3 {
        margin: 0;
        color: #333;
        font-size: 1.3rem;
    }

    .linje-details {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .linje-details p {
        margin: 0;
        color: #666;
        line-height: 1.6;
    }

    .linje-details a {
        color: var(--color-pink);
        text-decoration: none;
    }

    .linje-details a:hover {
        text-decoration: underline;
    }

    .linje-edit-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
    }

    .form-grid label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        color: #333;
    }

    .form-grid input,
    .form-grid textarea {
        width: 100%;
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.95rem;
        font-family: inherit;
        resize: vertical;
        box-sizing: border-box;
    }

    .form-grid input:disabled {
        background: #f5f5f5;
        cursor: not-allowed;
    }

    .form-grid input:focus,
    .form-grid textarea:focus {
        outline: none;
        border-color: var(--color-pink);
        box-shadow: 0 0 0 3px rgba(217, 59, 96, 0.1);
    }

    .linje-actions {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .btn-small {
        padding: 8px 16px;
        border: 2px solid;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.3s ease;
        font-weight: 500;
    }

    .btn-edit {
        background: var(--color-orange);
        border-color: var(--color-orange);
        color: white;
        box-shadow: 0 2px 8px rgba(220, 137, 70, 0.2);
    }

    .btn-edit:hover {
        background: white;
        color: var(--color-orange);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(220, 137, 70, 0.3);
    }

    .btn-success {
        padding: 12px 24px;
        background: var(--color-green);
        color: white;
        border: 2px solid var(--color-green);
        border-radius: 25px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 2px 10px rgba(73, 116, 80, 0.2);
    }

    .btn-success:hover {
        background: white;
        color: var(--color-green);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(73, 116, 80, 0.3);
    }

    .btn-cancel {
        padding: 10px 20px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
    }

    .btn-cancel:hover {
        background: #5a6268;
    }

    .field-label {
        display: block;
        font-weight: 500;
        margin-bottom: 6px;
        color: #333;
        font-size: 14px;
    }

    @media (max-width: 768px) {
        .linje-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }

        .form-grid {
            grid-template-columns: 1fr;
        }

        .linje-actions {
            width: 100%;
        }
    }
</style>
