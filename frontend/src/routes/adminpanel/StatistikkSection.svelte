<script lang="ts">
let { users = $bindable(), courseStats = $bindable(), kursListe = $bindable() } = $props();

import { getCookie } from '$lib/functions/getCookie';
import { onMount } from 'svelte';

function setCookie(name: string, value: string, days: number = 365) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getKursNavn(id: number | null): string {
    if (!id) return '-';
    const kursMap: Record<number, string> = {};
    kursListe.forEach((kurs: any) => {
        kursMap[kurs.id] = kurs.navn;
    });
    return kursMap[id] || `Ukjent kurs (ID: ${id})`;
}

let expandedCourses = $state<Set<number>>(new Set());
let visibleColumns = $state({
    navn: true,
    email: true,
    telefon: true,
    ungdomskole: true,
    paameldt_tidspunkt_tekst: true,
    studiesuppe: false,
    paameldt_kurs_id: false
});
let selectedLinesForExport = $state<Set<string>>(new Set());
let selectedFieldsForExport = $state<Set<string>>(new Set([
    'navn',
    'email',
    'telefon',
    'ungdomskole',
    'linje',
    'kurs_navn',
    'paameldt_tidspunkt_tekst'
]));
let isExporting = $state(false);

const exportFields = [
    { key: 'id', label: 'ID' },
    { key: 'navn', label: 'Navn' },
    { key: 'email', label: 'E-post' },
    { key: 'telefon', label: 'Telefon' },
    { key: 'ungdomskole', label: 'Ungdomsskole' },
    { key: 'linje', label: 'Linje' },
    { key: 'kurs_navn', label: 'Kursnavn' },
    { key: 'paameldt_tidspunkt_tekst', label: 'Tidspunkt' },
    { key: 'studiesuppe', label: 'Studiesuppe' },
    { key: 'paameldt_kurs_id', label: 'Kurs ID' }
];

let availableLines = $derived<Set<string>>(new Set(kursListe.map((k: any) => k.linje).filter(Boolean)));

$effect(() => {
    if (availableLines.size > 0 && selectedLinesForExport.size === 0) {
        selectedLinesForExport = new Set(availableLines);
    }
});

onMount(() => {
    if (typeof document !== 'undefined') {
        const saved = getCookie('adminVisibleColumns');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                visibleColumns = {
                    navn: parsed.navn !== undefined ? parsed.navn : true,
                    email: parsed.email !== undefined ? parsed.email : true,
                    telefon: parsed.telefon !== undefined ? parsed.telefon : true,
                    ungdomskole: parsed.ungdomskole !== undefined ? parsed.ungdomskole : true,
                    paameldt_tidspunkt_tekst: parsed.paameldt_tidspunkt_tekst !== undefined ? parsed.paameldt_tidspunkt_tekst : true,
                    studiesuppe: parsed.studiesuppe !== undefined ? parsed.studiesuppe : false,
                    paameldt_kurs_id: parsed.paameldt_kurs_id !== undefined ? parsed.paameldt_kurs_id : false
                };
            } catch (e) {
                console.error('Error parsing visibleColumns from cookie:', e);
            }
        }
    }
});

$effect(() => {
    if (typeof document !== 'undefined') {
        setCookie('adminVisibleColumns', JSON.stringify(visibleColumns));
    }
});

function toggleCourse(courseId: number) {
    if (expandedCourses.has(courseId)) {
        expandedCourses.delete(courseId);
    } else {
        expandedCourses.add(courseId);
    }
    expandedCourses = new Set(expandedCourses);
}

function getUsersForCourse(courseId: number) {
    return users.filter((u: any) => u.paameldt_kurs_id === courseId);
}

function toggleLineForExport(line: string) {
    const newSet = new Set(selectedLinesForExport);
    if (newSet.has(line)) {
        newSet.delete(line);
    } else {
        newSet.add(line);
    }
    selectedLinesForExport = newSet;
}

function toggleFieldForExport(field: string) {
    const newSet = new Set(selectedFieldsForExport);
    if (newSet.has(field)) {
        newSet.delete(field);
    } else {
        newSet.add(field);
    }
    selectedFieldsForExport = newSet;
}

function selectAllLines() {
    selectedLinesForExport = new Set(availableLines);
}

function deselectAllLines() {
    selectedLinesForExport = new Set();
}

async function exportToCSV() {
    if (selectedLinesForExport.size === 0) {
        alert('Velg minst én linje å eksportere');
        return;
    }
    
    if (selectedFieldsForExport.size === 0) {
        alert('Velg minst ett felt å eksportere');
        return;
    }
    
    isExporting = true;
    
    try {
        const response = await fetch('/api/admin/export-csv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                selectedLines: Array.from(selectedLinesForExport),
                selectedFields: Array.from(selectedFieldsForExport)
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            alert(`Kunne ikke eksportere CSV: ${errorText}`);
            return;
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kurspaameldinger_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        alert('En feil oppstod ved eksport av CSV');
    } finally {
        isExporting = false;
    }
}
</script>

<h2>Statistikk</h2>

<div class="stats-grid">
    <div class="stat-card">
        <h3>Totalt antall brukere</h3>
        <p class="stat-number">{users.length}</p>
    </div>

    <div class="stat-card">
        <h3>Brukere med kurs</h3>
        <p class="stat-number">{users.filter((u: any) => u.paameldt_kurs_id).length}</p>
    </div>
</div>

<div class="stats-section" style="margin-bottom: 30px;">
    <div class="section-header">
        <h3>Eksporter til CSV</h3>
    </div>
    
    <div class="export-controls">
        <div class="export-group">
            <div class="export-group-header">
                <h4>Velg linjer</h4>
                <div class="select-all-buttons">
                    <button onclick={selectAllLines} class="btn-small btn-edit">Velg alle</button>
                    <button onclick={deselectAllLines} class="btn-small btn-cancel">Fjern alle</button>
                </div>
            </div>
            <div class="export-checkboxes">
                {#each Array.from(availableLines).sort() as line}
                    <label>
                        <input 
                            type="checkbox" 
                            checked={selectedLinesForExport.has(line)}
                            onchange={() => toggleLineForExport(line)}
                        />
                        {line.toUpperCase()}
                    </label>
                {/each}
            </div>
        </div>
        
        <div class="export-group">
            <div class="export-group-header">
                <h4>Velg felter</h4>
            </div>
            <div class="export-checkboxes">
                {#each exportFields as field}
                    <label>
                        <input 
                            type="checkbox" 
                            checked={selectedFieldsForExport.has(field.key)}
                            onchange={() => toggleFieldForExport(field.key)}
                        />
                        {field.label}
                    </label>
                {/each}
            </div>
        </div>
    </div>
    
    <div class="export-actions">
        <button 
            onclick={exportToCSV} 
            class="btn-primary"
            disabled={isExporting || selectedLinesForExport.size === 0 || selectedFieldsForExport.size === 0}
        >
            {isExporting ? 'Eksporterer...' : 'Eksporter til CSV'}
        </button>
    </div>
</div>

<div class="stats-section">
    <div class="column-selector-header">
        <h3>Kurspåmeldinger</h3>
        <div class="column-selector">
            <span class="column-selector-label">Velg kolonner å vise:</span>
            <div class="column-checkboxes">
                <label>
                    <input type="checkbox" id="col-navn" bind:checked={visibleColumns.navn} />
                    Navn
                </label>
                <label>
                    <input type="checkbox" id="col-email" bind:checked={visibleColumns.email} />
                    E-post
                </label>
                <label>
                    <input type="checkbox" id="col-telefon" bind:checked={visibleColumns.telefon} />
                    Telefonnummer
                </label>
                <label>
                    <input type="checkbox" id="col-ungdomskole" bind:checked={visibleColumns.ungdomskole} />
                    Ungdomsskole
                </label>
                <label>
                    <input type="checkbox" id="col-tidspunkt" bind:checked={visibleColumns.paameldt_tidspunkt_tekst} />
                    Tidspunkt
                </label>
                <label>
                    <input type="checkbox" id="col-studiesuppe" bind:checked={visibleColumns.studiesuppe} />
                    Studiesuppe
                </label>
                <label>
                    <input type="checkbox" id="col-kurs" bind:checked={visibleColumns.paameldt_kurs_id} />
                    Kurs
                </label>
            </div>
        </div>
    </div>
    <div class="course-stats">
        {#each courseStats as stat}
            <div class="course-stat-container">
                <button 
                    class="course-stat-item"
                    onclick={() => toggleCourse(stat.paameldt_kurs_id)}
                >
                    <span class="course-name">{getKursNavn(stat.paameldt_kurs_id)}</span>
                    <div class="course-header-right">
                        <span class="course-count">{stat.antall} påmeldte</span>
                        <span class="expand-icon">{expandedCourses.has(stat.paameldt_kurs_id) ? '▲' : '▼'}</span>
                    </div>
                </button>
                
                {#if expandedCourses.has(stat.paameldt_kurs_id)}
                    <div class="course-users">
                        {#each getUsersForCourse(stat.paameldt_kurs_id) as user}
                            <div class="course-user-item">
                                {#if visibleColumns.navn}
                                    <span class="user-name"><strong>Navn:</strong> {user.navn || '-'}</span>
                                {/if}
                                {#if visibleColumns.email}
                                    <span class="user-email"><strong>E-post:</strong> {user.email || '-'}</span>
                                {/if}
                                {#if visibleColumns.telefon}
                                    <span class="user-telefon"><strong>Telefon:</strong> {user.telefon || '-'}</span>
                                {/if}
                                {#if visibleColumns.ungdomskole}
                                    <span class="user-school"><strong>Skole:</strong> {user.ungdomskole || '-'}</span>
                                {/if}
                                {#if visibleColumns.paameldt_tidspunkt_tekst}
                                    <span class="user-time"><strong>Tidspunkt:</strong> {user.paameldt_tidspunkt_tekst || 'Ikke valgt'}</span>
                                {/if}
                                {#if visibleColumns.studiesuppe}
                                    <span class="user-studiesuppe"><strong>Studiesuppe:</strong> {user.studiesuppe || '-'}</span>
                                {/if}
                                {#if visibleColumns.paameldt_kurs_id}
                                    <span class="user-kurs"><strong>Kurs:</strong> {getKursNavn(user.paameldt_kurs_id)}</span>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</div>

<style>
    h2 {
        color: #333;
        margin-top: 0;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .stat-card {
        background: linear-gradient(135deg, var(--color-pink-light), white);
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        box-shadow: 10px 5px 10px rgba(217, 59, 96, 0.2);
        border: 2px solid transparent;
        transition: all 0.3s ease;
    }

    .stat-number {
        font-size: 3.5rem;
        font-weight: 500;
        color: var(--color-pink);
        margin: 0;
        line-height: 1;
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

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 15px;
    }

    .section-header h3 {
        margin: 0;
    }

    .export-controls {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
        margin-bottom: 25px;
    }

    .export-group {
        background: white;
        padding: 20px;
        border-radius: 12px;
        border: 2px solid #f0f0f0;
    }

    .export-group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 2px solid #f0f0f0;
    }

    .export-group-header h4 {
        margin: 0;
        color: #333;
        font-size: 1.1rem;
    }

    .select-all-buttons {
        display: flex;
        gap: 8px;
    }

    .export-checkboxes {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
    }

    .export-checkboxes label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 0.95rem;
        padding: 8px;
        border-radius: 6px;
        transition: background-color 0.2s;
    }

    .export-checkboxes label:hover {
        background-color: #f8f9fa;
    }

    .export-checkboxes input[type="checkbox"] {
        cursor: pointer;
        width: 18px;
        height: 18px;
    }

    .export-actions {
        display: flex;
        justify-content: center;
        padding-top: 20px;
    }

    .btn-primary {
        padding: 12px 24px;
        background: var(--color-pink);
        color: white;
        border: 2px solid var(--color-pink);
        border-radius: 25px;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 2px 10px rgba(217, 59, 96, 0.2);
    }

    .btn-primary:hover:not(:disabled) {
        background: white;
        color: var(--color-pink);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(217, 59, 96, 0.3);
    }

    .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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

    .btn-cancel {
        background: #6c757d;
        border-color: #6c757d;
        color: white;
    }

    .btn-cancel:hover {
        background: white;
        color: #6c757d;
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

    .course-user-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        background: white;
        border-radius: 6px;
        margin-bottom: 8px;
        border-left: 3px solid var(--color-pink);
        transition: all 0.2s ease;
    }

    .course-user-item:hover {
        transform: translateX(5px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .course-user-item:last-child {
        margin-bottom: 0;
    }

    .course-user-item span {
        display: block;
    }

    .user-name {
        font-weight: 600;
        color: #333;
    }

    .user-email {
        color: #666;
        font-size: 0.9rem;
    }

    .user-telefon {
        color: #666;
        font-size: 0.9rem;
    }

    .user-school {
        color: #666;
        font-size: 0.9rem;
    }

    .user-time {
        color: var(--color-green);
        font-weight: 500;
        font-size: 0.9rem;
    }

    .user-studiesuppe {
        color: #666;
        font-size: 0.9rem;
    }

    .user-kurs {
        color: #666;
        font-size: 0.9rem;
    }

    .column-selector-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .column-selector-header h3 {
        margin: 0;
    }

    .column-selector {
        display: flex;
        align-items: center;
        gap: 15px;
        flex-wrap: wrap;
    }

    .column-selector-label {
        font-weight: 500;
        color: #333;
        white-space: nowrap;
    }

    .column-checkboxes {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        align-items: center;
    }

    .column-checkboxes label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 0.95rem;
    }

    .column-checkboxes input[type="checkbox"] {
        cursor: pointer;
        width: 18px;
        height: 18px;
    }

    @media (max-width: 768px) {
        .export-controls {
            grid-template-columns: 1fr;
        }

        .export-checkboxes {
            grid-template-columns: 1fr;
        }

        .course-user-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .column-selector-header {
            flex-direction: column;
            align-items: stretch;
        }
    }
</style>
