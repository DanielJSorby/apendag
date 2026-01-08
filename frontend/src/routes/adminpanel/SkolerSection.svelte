<script lang="ts">
import { onMount } from 'svelte';

let { schools = $bindable() } = $props();

let schoolSearch = $state('');
let editingSchool = $state<any | null>(null);
let isCreatingSchool = $state(false);
let newSchoolName = $state('');
let editingSchoolSearch = $state('');
let showEditingSchoolDropdown = $state(false);
let showInactiveSchools = $state(false);
let schoolErrorMessage = $state('');

let filteredSchools = $derived(
    schools.filter((s: any) => {
        const matchesSearch = s.navn.toLowerCase().includes(schoolSearch.toLowerCase());
        if (showInactiveSchools) {
            return matchesSearch;
        }
        return matchesSearch && s.aktiv;
    })
);

onMount(() => {
    loadSchools();

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.school-selector-inline')) {
            showEditingSchoolDropdown = false;
        }
    }
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
        document.removeEventListener('click', handleClickOutside);
    };
});

async function loadSchools() {
    try {
        const response = await fetch('/api/admin/skoler?includeInactive=true');
        if (response.ok) {
            const data = await response.json();
            schools = Array.isArray(data) ? data : [];
        }
    } catch (error) {
        console.error('Error loading schools:', error);
    }
}

function filteredSchoolsForEdit(searchTerm: string) {
    if (!searchTerm) return schools.filter((s: any) => s.aktiv);
    const searchLower = searchTerm.toLowerCase();
    return schools.filter((s: any) => 
        s.aktiv && s.navn.toLowerCase().includes(searchLower)
    );
}

function selectSchoolForEdit(schoolName: string) {
    if (editingSchool) {
        editingSchool.navn = schoolName;
        editingSchoolSearch = schoolName;
    }
    showEditingSchoolDropdown = false;
}

async function createSchool() {
    if (!newSchoolName.trim()) {
        schoolErrorMessage = 'Skolenavn er påkrevd';
        return;
    }
    
    schoolErrorMessage = '';
    
    try {
        const response = await fetch('/api/admin/skoler', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ navn: newSchoolName.trim() })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            await loadSchools();
            newSchoolName = '';
            isCreatingSchool = false;
            schoolErrorMessage = '';
        } else {
            schoolErrorMessage = data.error || 'Kunne ikke opprette skole';
            console.error('Error creating school:', data);
        }
    } catch (error) {
        console.error('Error creating school:', error);
        schoolErrorMessage = 'En uventet feil oppstod ved oppretting av skole';
    }
}

async function toggleSchoolStatus(schoolId: string, currentStatus: boolean) {
    const action = currentStatus ? 'deaktivere' : 'aktivere';
    if (!confirm(`Er du sikker på at du vil ${action} denne skolen?`)) return;
    try {
        const response = await fetch('/api/admin/skoler', {
            method: currentStatus ? 'DELETE' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: schoolId,
                aktiv: !currentStatus 
            })
        });
        if (response.ok) {
            await loadSchools();
        }
    } catch (error) {
        console.error('Error toggling school status:', error);
    }
}

async function updateSchool(school: any) {
    try {
        const response = await fetch('/api/admin/skoler', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: school.id, 
                navn: school.navn,
                aktiv: school.aktiv 
            })
        });
        if (response.ok) {
            await loadSchools();
            editingSchool = null;
        }
    } catch (error) {
        console.error('Error updating school:', error);
    }
}
</script>

<div class="section-header">
    <h2>Ungdomsskoler</h2>
    <div class="actions">
        <input 
            type="text" 
            placeholder="Søk skoler..." 
            bind:value={schoolSearch}
            class="search-input"
        />
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input 
                type="checkbox" 
                bind:checked={showInactiveSchools}
            />
            Vis deaktiverte
        </label>
        <button onclick={() => isCreatingSchool = !isCreatingSchool} class="btn-primary">
            Ny skole
        </button>
    </div>
</div>

{#if isCreatingSchool}
    <div class="create-form">
        <h3>Opprett ny skole</h3>
        {#if schoolErrorMessage}
            <div class="error-message" style="margin-bottom: 1rem; padding: 0.75rem; background-color: #fef2f2; border: 2px solid #fecaca; color: #dc2626; border-radius: 6px; font-size: 0.9rem;">
                {schoolErrorMessage}
            </div>
        {/if}
        <div class="form-grid">
            <input 
                type="text" 
                placeholder="Skolenavn" 
                bind:value={newSchoolName}
                onkeydown={(e) => {
                    if (e.key === 'Enter') {
                        createSchool();
                    }
                }}
            />
        </div>
        <div class="form-actions">
            <button onclick={createSchool} class="btn-success">
                Opprett
            </button>
            <button onclick={() => { 
                isCreatingSchool = false; 
                newSchoolName = '';
                schoolErrorMessage = '';
            }} class="btn-cancel">
                Avbryt
            </button>
        </div>
    </div>
{/if}

<div class="table-container">
    <table>
        <thead>
            <tr>
                <th>Navn</th>
                <th>Status</th>
                <th>Handlinger</th>
            </tr>
        </thead>
        <tbody>
            {#each filteredSchools as school}
                <tr>
                    {#if editingSchool?.id === school.id}
                        <td>
                            <div class="school-selector-inline">
                                <input 
                                    type="text" 
                                    bind:value={editingSchoolSearch}
                                    oninput={() => {
                                        if (editingSchool) {
                                            editingSchool.navn = editingSchoolSearch;
                                        }
                                        showEditingSchoolDropdown = true;
                                    }}
                                    onfocus={() => showEditingSchoolDropdown = true}
                                    placeholder="Søk eller skriv skolenavn..."
                                    autocomplete="off"
                                />
                                {#if showEditingSchoolDropdown}
                                    <div class="school-dropdown-inline">
                                        {#each filteredSchoolsForEdit(editingSchoolSearch) as s}
                                            <div 
                                                class="school-option-inline"
                                                onclick={() => selectSchoolForEdit(s.navn)}
                                                onkeydown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        selectSchoolForEdit(s.navn);
                                                    }
                                                }}
                                                role="button"
                                                tabindex="0"
                                            >
                                                {s.navn}
                                            </div>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        </td>
                        <td>
                            <select bind:value={editingSchool.aktiv}>
                                <option value={true}>Aktiv</option>
                                <option value={false}>Deaktivert</option>
                            </select>
                        </td>
                        <td class="actions-cell">
                            <button onclick={() => {
                                if (editingSchool) {
                                    editingSchool.navn = editingSchoolSearch;
                                }
                                updateSchool(editingSchool!);
                            }} class="btn-small btn-success">
                                Lagre
                            </button>
                            <button onclick={() => { 
                                editingSchool = null; 
                                editingSchoolSearch = '';
                                showEditingSchoolDropdown = false;
                            }} class="btn-small btn-cancel">
                                Avbryt
                            </button>
                        </td>
                    {:else}
                        <td>{school.navn}</td>
                        <td>
                            {#if school.aktiv}
                                <span class="admin-badge">Aktiv</span>
                            {:else}
                                <span class="non-admin-badge">Deaktivert</span>
                            {/if}
                        </td>
                        <td class="actions-cell">
                            <button onclick={() => { 
                                editingSchool = {...school}; 
                                editingSchoolSearch = school.navn;
                            }} class="btn-small btn-edit">
                                Rediger
                            </button>
                            <button 
                                onclick={() => toggleSchoolStatus(school.id, school.aktiv)} 
                                class={school.aktiv ? "btn-small btn-danger" : "btn-small btn-success"}
                            >
                                {school.aktiv ? 'Deaktiver' : 'Aktiver'}
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
        flex-wrap: wrap;
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

    .btn-primary:hover {
        background: white;
        color: var(--color-pink);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(217, 59, 96, 0.3);
    }

    .create-form {
        background: var(--color-grey);
        padding: 25px;
        border-radius: 15px;
        margin-bottom: 25px;
        border: 2px solid var(--color-pink-light);
        box-shadow: 0 2px 10px rgba(217, 59, 96, 0.05);
    }

    .create-form h3 {
        margin-top: 0;
        color: #333;
    }

    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 15px;
    }

    .form-grid input {
        padding: 10px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 0.95rem;
        width: 100%;
        box-sizing: border-box;
    }

    .form-grid input:focus {
        outline: none;
        border-color: var(--color-pink);
        box-shadow: 0 0 0 3px rgba(217, 59, 96, 0.1);
    }

    .form-actions {
        display: flex;
        gap: 10px;
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

    .table-container {
        overflow-x: auto;
        border-radius: 15px;
        border: 2px solid #f0f0f0;
        box-shadow: 0 2px 15px rgba(0,0,0,0.05);
    }

    table {
        width: 100%;
        border-collapse: collapse;
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
        padding: 5px;
        border-bottom: 2px solid #f0f0f0;
        vertical-align: middle;
        height: 100px;
    }

    tbody tr:hover {
        background: #f8f9fa;
    }

    .school-selector-inline {
        position: relative;
        width: 100%;
    }

    .school-selector-inline input {
        width: 100%;
        padding: 8px 12px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 0.95rem;
        transition: border-color 0.3s, box-shadow 0.3s;
    }

    .school-selector-inline input:focus {
        outline: none;
        border-color: var(--color-pink);
        box-shadow: 0 0 0 3px rgba(217, 59, 96, 0.1);
    }

    .school-dropdown-inline {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: white;
        border: 2px solid var(--color-pink);
        border-radius: 6px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        margin-top: 4px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .school-option-inline {
        padding: 10px 12px;
        cursor: pointer;
        transition: background-color 0.2s;
        border-bottom: 1px solid #f0f0f0;
        font-size: 0.95rem;
    }

    .school-option-inline:last-child {
        border-bottom: none;
    }

    .school-option-inline:hover,
    .school-option-inline:focus {
        background-color: var(--color-pink-light);
        outline: none;
    }

    table select {
        width: 100%;
        padding: 8px 12px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 0.95rem;
        font-family: inherit;
        transition: border-color 0.3s, box-shadow 0.3s;
    }

    table select:focus {
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

    .admin-badge {
        color: var(--color-green);
        font-weight: 600;
    }

    .non-admin-badge {
        color: #999;
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

        table {
            font-size: 0.85rem;
        }

        .actions-cell {
            flex-direction: column;
        }
    }
</style>
