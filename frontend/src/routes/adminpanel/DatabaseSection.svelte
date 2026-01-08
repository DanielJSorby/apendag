<script lang="ts">
let { kursListe = $bindable() } = $props();

let editingKurs = $state<any | null>(null);

function getKursNavn(id: number | null): string {
    if (!id) return '-';
    const kursMap: Record<number, string> = {};
    kursListe.forEach((kurs: any) => {
        kursMap[kurs.id] = kurs.navn;
    });
    return kursMap[id] || `Ukjent kurs (ID: ${id})`;
}

async function updateKurs(kurs: any) {
    try {
        const response = await fetch('/api/admin/kurs', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(kurs)
        });
        
        if (response.ok) {
            editingKurs = null;
            location.reload();
        }
    } catch (error) {
        console.error('Error updating kurs:', error);
    }
}
</script>

<div class="section-header">
    <h2>Database Administrasjon</h2>
    <p style="color: #666; font-size: 0.9rem; margin-top: 5px;">Kun tilgjengelig for developers</p>
</div>

<div class="stats-section">
    <h3>Kurs oversikt</h3>
    <table class="user-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Linje</th>
                <th>Kursnavn</th>
                <th>Tidspunkt</th>
                <th>Plasser</th>
                <th>Handlinger</th>
            </tr>
        </thead>
        <tbody>
            {#each kursListe as kurs}
                <tr>
                    {#if editingKurs && editingKurs.id === kurs.id}
                        <td>{kurs.id}</td>
                        <td><input type="text" bind:value={editingKurs.linje} style="width: 80px;" /></td>
                        <td><input type="text" bind:value={editingKurs.navn} style="width: 150px;" /></td>
                        <td><input type="text" bind:value={editingKurs.tidspunkt} style="width: 100px;" /></td>
                        <td><input type="number" bind:value={editingKurs.plasser_siste} style="width: 70px;" min="0" /></td>
                        <td class="actions-cell">
                            <button onclick={() => updateKurs(editingKurs!)} class="btn-small btn-success">
                                Lagre
                            </button>
                            <button onclick={() => editingKurs = null} class="btn-small btn-cancel">
                                Avbryt
                            </button>
                        </td>
                    {:else}
                        <td>{kurs.id}</td>
                        <td>{kurs.linje}</td>
                        <td>{kurs.navn}</td>
                        <td>{kurs.tid.siste || '-'}</td>
                        <td>{kurs.plasser_siste || 0}</td>
                        <td class="actions-cell">
                            <button onclick={() => {
                                editingKurs = {
                                    id: kurs.id,
                                    linje: kurs.linje,
                                    navn: kurs.navn,
                                    tidspunkt: kurs.tid.siste,
                                    plasser_siste: kurs.plasser_siste || 0
                                };
                            }} class="btn-small btn-edit">
                                Rediger
                            </button>
                        </td>
                    {/if}
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .section-header {
        margin-bottom: 20px;
    }

    .section-header h2 {
        margin: 0;
        color: #333;
    }

    .stats-section {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
    }

    .stats-section h3 {
        margin-top: 0;
        color: #333;
    }

    .user-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 8px;
        overflow: hidden;
    }

    thead {
        background: #f8f9fa;
    }

    th {
        padding: 15px;
        text-align: left;
        font-weight: 600;
        color: #333;
        border-bottom: 2px solid #e0e0e0;
    }

    td {
        padding: 12px 15px;
        border-bottom: 1px solid #f0f0f0;
        vertical-align: middle;
    }

    tbody tr:hover {
        background: #f8f9fa;
    }

    table input[type="text"],
    table input[type="number"] {
        padding: 8px 12px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 0.9rem;
        font-family: inherit;
        transition: border-color 0.3s, box-shadow 0.3s;
    }

    table input[type="text"]:focus,
    table input[type="number"]:focus {
        outline: none;
        border-color: var(--color-pink);
        box-shadow: 0 0 0 3px rgba(217, 59, 96, 0.1);
    }

    .actions-cell {
        display: flex;
        gap: 8px;
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
        padding: 8px 16px;
        background: var(--color-green);
        color: white;
        border: 2px solid var(--color-green);
        border-radius: 20px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(73, 116, 80, 0.2);
    }

    .btn-success:hover {
        background: white;
        color: var(--color-green);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(73, 116, 80, 0.3);
    }

    .btn-cancel {
        padding: 8px 16px;
        background: #6c757d;
        color: white;
        border: 2px solid #6c757d;
        border-radius: 20px;
        cursor: pointer;
        font-weight: 500;
    }

    .btn-cancel:hover {
        background: white;
        color: #6c757d;
    }

    @media (max-width: 768px) {
        .user-table {
            font-size: 0.8rem;
        }

        th, td {
            padding: 8px;
        }

        table input[type="text"],
        table input[type="number"] {
            font-size: 0.8rem;
        }

        .actions-cell {
            flex-direction: column;
            gap: 4px;
        }
    }
</style>
