<script lang="ts">
import { onMount } from 'svelte';

let { venteliste = $bindable(), kursListe = $bindable() } = $props();

let ventelisteSearch = $state('');
let expandedVentelisteKurs = $state<Set<string>>(new Set());

function getKursNavn(id: number | null): string {
    if (!id) return '-';
    const kursMap: Record<number, string> = {};
    kursListe.forEach((kurs: any) => {
        kursMap[kurs.id] = kurs.navn;
    });
    return kursMap[id] || `Ukjent kurs (ID: ${id})`;
}

function toggleVentelisteKurs(kursId: number, tidspunkt: string) {
    const key = `${kursId}-${tidspunkt}`;
    if (expandedVentelisteKurs.has(key)) {
        expandedVentelisteKurs.delete(key);
    } else {
        expandedVentelisteKurs.add(key);
    }
    expandedVentelisteKurs = new Set(expandedVentelisteKurs);
}

function groupVentelisteByKurs() {
    const grouped: Map<string, any[]> = new Map();
    
    venteliste.forEach((entry: any) => {
        const key = `${entry.kurs_id}-${entry.tidspunkt_tekst}`;
        if (!grouped.has(key)) {
            grouped.set(key, []);
        }
        grouped.get(key)!.push(entry);
    });
    
    return Array.from(grouped.entries()).map(([key, entries]) => {
        const [kursId, tidspunkt] = key.split('-');
        return {
            kursId: parseInt(kursId),
            tidspunkt: entries[0].tidspunkt_tekst,
            entries: entries.sort((a, b) => a.position - b.position)
        };
    });
}

async function loadVenteliste() {
    try {
        const response = await fetch('/api/admin/venteliste');
        if (response.ok) {
            const data = await response.json();
            venteliste = data.venteliste || [];
        }
    } catch (error) {
        console.error('Error loading venteliste:', error);
    }
}

async function removeFromVenteliste(ventelisteId: string) {
    try {
        const response = await fetch('/api/admin/venteliste', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: ventelisteId })
        });
        
        if (response.ok) {
            await loadVenteliste();
        }
    } catch (error) {
        console.error('Error removing from venteliste:', error);
    }
}

let filteredVenteliste = $derived(
    venteliste.filter((v: any) =>
        v.bruker_navn?.toLowerCase().includes(ventelisteSearch.toLowerCase()) ||
        v.bruker_email?.toLowerCase().includes(ventelisteSearch.toLowerCase()) ||
        getKursNavn(v.kurs_id)?.toLowerCase().includes(ventelisteSearch.toLowerCase())
    )
);
</script>

<div class="section-header">
    <h2>Venteliste</h2>
    <div class="actions">
        <input 
            type="text" 
            placeholder="Søk i venteliste..." 
            bind:value={ventelisteSearch}
            class="search-input"
        />
    </div>
</div>

<div class="stats-section">
    <h3>Ventelister per kurs og tidspunkt</h3>
    <div class="course-stats">
        {#each groupVentelisteByKurs() as gruppe}
            {@const key = `${gruppe.kursId}-${gruppe.tidspunkt}`}
            <div class="course-stat-container">
                <button 
                    class="course-stat-item"
                    onclick={() => toggleVentelisteKurs(gruppe.kursId, gruppe.tidspunkt)}
                >
                    <span class="course-name">{getKursNavn(gruppe.kursId)} - {gruppe.tidspunkt}</span>
                    <div class="course-header-right">
                        <span class="course-count">{gruppe.entries.length} på venteliste</span>
                        <span class="expand-icon">{expandedVentelisteKurs.has(key) ? '▲' : '▼'}</span>
                    </div>
                </button>
                
                {#if expandedVentelisteKurs.has(key)}
                    <div class="course-users">
                        {#each gruppe.entries as entry}
                            <div class="venteliste-item">
                                <div class="venteliste-position">#{entry.position}</div>
                                <div class="venteliste-info">
                                    <span class="user-name">{entry.bruker_navn}</span>
                                    <span class="user-email">{entry.bruker_email}</span>
                                    {#if entry.studiesuppe}
                                        <span class="studiesuppe-badge">Studiesuppe: {entry.studiesuppe}</span>
                                    {/if}
                                    <span class="venteliste-date">Påmeldt: {new Date(entry.created_at).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                </div>
                                <button 
                                    onclick={() => removeFromVenteliste(entry.id)} 
                                    class="btn-small btn-danger"
                                    title="Fjern fra venteliste"
                                >
                                    Fjern
                                </button>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
        {#if groupVentelisteByKurs().length === 0}
            <div class="empty-state">
                <p>Ingen på venteliste for øyeblikket</p>
            </div>
        {/if}
    </div>
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

    .actions {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .search-input {
        padding: 12px 20px;
        border: 2px solid #e8e8e8;
        border-radius: 25px;
        font-size: 0.95rem;
        min-width: 250px;
        transition: all 0.3s ease;
        background: white;
    }

    .search-input:focus {
        outline: none;
        border-color: var(--color-pink);
        box-shadow: 0 0 0 3px rgba(217, 59, 96, 0.1);
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

    .course-stats {
        display: grid;
        gap: 10px;
    }

    .course-stat-container {
        background: white;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid #f0f0f0;
        transition: all 0.3s ease;
    }

    .course-stat-container:hover {
        border-color: var(--color-green);
        box-shadow: 0 2px 8px rgba(73, 116, 80, 0.1);
    }

    .course-stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: white;
        border: none;
        border-left: 4px solid var(--color-green);
        width: 100%;
        cursor: pointer;
        font-size: 1rem;
        font-family: inherit;
        transition: all 0.3s ease;
    }

    .course-stat-item:hover {
        background: #f8f9fa;
    }

    .course-header-right {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .course-name {
        font-weight: 600;
        color: #333;
    }

    .course-count {
        color: var(--color-green);
        font-weight: 500;
    }

    .expand-icon {
        color: var(--color-green);
        font-size: 0.9rem;
        transition: transform 0.3s ease;
    }

    .course-users {
        padding: 0 15px 15px 15px;
        background: #f8f9fa;
    }

    .venteliste-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        background: white;
        border-radius: 8px;
        margin-bottom: 10px;
        border-left: 4px solid var(--color-orange);
        transition: all 0.2s ease;
    }

    .venteliste-item:hover {
        transform: translateX(5px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .venteliste-position {
        background: var(--color-orange);
        color: white;
        font-weight: 600;
        font-size: 1.1rem;
        padding: 10px 15px;
        border-radius: 50%;
        min-width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(220, 137, 70, 0.3);
    }

    .venteliste-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .user-name {
        font-weight: 600;
        color: #333;
    }

    .user-email {
        color: #666;
        font-size: 0.9rem;
    }

    .studiesuppe-badge {
        display: inline-block;
        background: var(--color-green-light);
        color: var(--color-green);
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 500;
        width: fit-content;
    }

    .venteliste-date {
        color: #999;
        font-size: 0.85rem;
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

    .btn-danger {
        background: var(--color-pink);
        color: white;
        border: 2px solid var(--color-pink);
        border-radius: 25px;
        padding: 10px 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 10px rgba(217, 59, 96, 0.2);
    }

    .btn-danger:hover {
        background: white;
        color: var(--color-pink);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(217, 59, 96, 0.3);
    }

    .empty-state {
        text-align: center;
        padding: 60px 20px;
        background: #f8f9fa;
        border-radius: 12px;
        border: 2px dashed #e0e0e0;
    }

    .empty-state p {
        color: #666;
        font-size: 1.1rem;
        margin: 0;
    }

    @media (max-width: 768px) {
        .section-header {
            flex-direction: column;
            align-items: stretch;
        }

        .actions {
            flex-direction: column;
        }

        .search-input {
            min-width: 100%;
        }

        .venteliste-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .venteliste-position {
            align-self: flex-start;
        }
    }
</style>
