<script lang="ts">
import { onMount } from 'svelte';

let { users = $bindable(), kursListe = $bindable(), kursMap = $bindable(), currentUserId, userRoles } = $props();

let userSearch = $state('');
let isCreatingUser = $state(false);
let editingUser = $state<any | null>(null);
let editingUserRole = $state<string>('ingen');
let editingUserSchoolSearch = $state('');
let showEditingUserSchoolDropdown = $state(false);
let showDeleteConfirm = $state(false);
let userToDelete = $state<{ id: string; navn: string } | null>(null);
let schools = $state<any[]>([]);

let newUser = $state({
    id: '',
    navn: '',
    email: '',
    paameldt_kurs_id: null as number | null,
    paameldt_tidspunkt_tekst: '',
    studiesuppe: '',
    ungdomskole: '',
    telefon: ''
});

onMount(() => {
    loadSchools();
    
    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.school-selector-inline')) {
            showEditingUserSchoolDropdown = false;
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
    if (!searchTerm) return schools.filter(s => s.aktiv);
    const searchLower = searchTerm.toLowerCase();
    return schools.filter(s => 
        s.aktiv && s.navn.toLowerCase().includes(searchLower)
    );
}

function selectSchoolForUser(schoolName: string) {
    if (editingUser) {
        editingUser.ungdomskole = schoolName;
        editingUserSchoolSearch = schoolName;
    }
    showEditingUserSchoolDropdown = false;
}

function getKursNavn(id: number | null): string {
    if (!id) return '-';
    return kursMap[id] || `Ukjent kurs (ID: ${id})`;
}

function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function getUserRole(userId: string): string {
    return userRoles[userId] || 'ingen';
}

let filteredUsers = $derived(
    users.filter((u: any) =>
        u.navn?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.ungdomskole?.toLowerCase().includes(userSearch.toLowerCase())
    )
);

async function createUser() {
    try {
        const response = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });
        
        if (response.ok) {
            location.reload();
        }
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

async function updateUser(user: any) {
    try {
        const response = await fetch('/api/admin', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        
        if (!response.ok) {
            return;
        }

        const currentRole = getUserRole(user.id);
        const newRole = editingUserRole;

        if (user.id !== currentUserId && currentRole !== newRole) {
            await setUserRole(user.id, newRole);
            return;
        }
        
        editingUser = null;
        location.reload();
    } catch (error) {
        console.error('Error updating user:', error);
    }
}

function showDeleteConfirmModal(userId: string, userName: string) {
    userToDelete = { id: userId, navn: userName };
    showDeleteConfirm = true;
}

async function confirmDeleteUser() {
    if (!userToDelete) return;
    
    try {
        const response = await fetch('/api/admin', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userToDelete.id })
        });
        
        if (response.ok) {
            showDeleteConfirm = false;
            userToDelete = null;
            location.reload();
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

function cancelDelete() {
    showDeleteConfirm = false;
    userToDelete = null;
}

async function setUserRole(userId: string, rolle: string) {
    try {
        const response = await fetch('/api/admin/manage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bruker_id: userId, rolle })
        });
        
        if (response.ok) {
            location.reload();
        }
    } catch (error) {
        console.error('Error setting user role:', error);
    }
}
</script>

<div class="section-header">
    <h2>Brukere</h2>
    <div class="actions">
        <input 
            type="text" 
            placeholder="Søk brukere..." 
            bind:value={userSearch}
            class="search-input"
        />
        <button onclick={() => isCreatingUser = !isCreatingUser} class="btn-primary">
            Ny bruker
        </button>
    </div>
</div>

{#if isCreatingUser}
    <div class="create-form">
        <h3>Opprett ny bruker</h3>
        <div class="form-grid">
            <input type="text" placeholder="ID" bind:value={newUser.id} />
            <input type="text" placeholder="Navn" bind:value={newUser.navn} />
            <input type="email" placeholder="E-post" bind:value={newUser.email} />
            <input type="text" placeholder="Ungdomsskole" bind:value={newUser.ungdomskole} />
            <input type="tel" placeholder="+47 123 45 678" bind:value={newUser.telefon} class="tel-input" />
            <select bind:value={newUser.paameldt_kurs_id}>
                <option value={null}>Ingen kurs</option>
                {#each kursListe as kurs}
                    <option value={kurs.id}>{kurs.navn} ({kurs.linje.toUpperCase()})</option>
                {/each}
            </select>
            <input type="text" placeholder="Påmeldt tidspunkt" bind:value={newUser.paameldt_tidspunkt_tekst} />
            <input type="text" placeholder="Studiesuppe" bind:value={newUser.studiesuppe} />
        </div>
        <div class="form-actions">
            <button onclick={() => { newUser.id = generateId(); createUser(); }} class="btn-success">
                Opprett
            </button>
            <button onclick={() => isCreatingUser = false} class="btn-cancel">
                Avbryt
            </button>
        </div>
    </div>
{/if}

<div class="table-container">
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Navn</th>
                <th>E-post</th>
                <th>Ungdomsskole</th>
                <th>Telefon</th>
                <th>Påmeldt kurs</th>
                <th>Tidspunkt</th>
                <th>Studiesuppe</th>
                <th>Rolle</th>
                <th>Handlinger</th>
            </tr>
        </thead>
        <tbody>
            {#each filteredUsers as user}
                <tr>
                    {#if editingUser?.id === user.id}
                        <td>{user.id}</td>
                        <td><input type="text" bind:value={editingUser.navn} /></td>
                        <td><input type="email" bind:value={editingUser.email} /></td>
                        <td>
                            <div class="school-selector-inline">
                                <input 
                                    type="text" 
                                    bind:value={editingUserSchoolSearch}
                                    oninput={() => {
                                        if (editingUser) {
                                            editingUser.ungdomskole = editingUserSchoolSearch;
                                        }
                                        showEditingUserSchoolDropdown = true;
                                    }}
                                    onfocus={() => showEditingUserSchoolDropdown = true}
                                    placeholder="Søk eller skriv skolenavn..."
                                    autocomplete="off"
                                />
                                {#if showEditingUserSchoolDropdown}
                                    <div class="school-dropdown-inline">
                                        {#each filteredSchoolsForEdit(editingUserSchoolSearch) as s}
                                            <div 
                                                class="school-option-inline"
                                                onclick={() => selectSchoolForUser(s.navn)}
                                                onkeydown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        selectSchoolForUser(s.navn);
                                                    }
                                                }}
                                                role="button"
                                                tabindex="0"
                                            >
                                                {s.navn}
                                            </div>
                                        {/each}
                                        <div 
                                            class="school-option-inline school-option-other-inline"
                                            onclick={() => selectSchoolForUser('')}
                                            onkeydown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    selectSchoolForUser('');
                                                }
                                            }}
                                            role="button"
                                            tabindex="0"
                                        >
                                            Annet...
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        </td>
                        <td>
                            <input 
                                type="tel" 
                                bind:value={editingUser.telefon} 
                                placeholder="+47 123 45 678"
                                class="tel-input"
                            />
                        </td>
                        <td>
                            <select bind:value={editingUser.paameldt_kurs_id}>
                                <option value={null}>Ingen kurs</option>
                                {#each kursListe as kurs}
                                    <option value={kurs.id}>{kurs.navn} ({kurs.linje.toUpperCase()})</option>
                                {/each}
                            </select>
                        </td>
                        <td>
                            <select bind:value={editingUser.paameldt_tidspunkt_tekst}>
                                <option value={null}>Ikke valgt</option>
                                <option value="09:00-10:30">09:00-10:30</option>
                                <option value="11:00-12:30">11:00-12:30</option>
                                <option value="13:00-14:30">13:00-14:30</option>
                            </select>
                        </td>
                        <td>
                            <select bind:value={editingUser.studiesuppe}>
                                <option value={null}>-</option>
                                <option value="Ja">Ja</option>
                            </select>
                        </td>
                        <td>
                            <select bind:value={editingUserRole} disabled={user.id === currentUserId}>
                                <option value="ingen">Ingen</option>
                                <option value="admin">Admin</option>
                                <option value="developer">Developer</option>
                            </select>
                        </td>
                        <td class="actions-cell">
                            <button onclick={() => {
                                if (editingUser) {
                                    editingUser.ungdomskole = editingUserSchoolSearch;
                                }
                                updateUser(editingUser!);
                            }} class="btn-small btn-success">
                                Lagre
                            </button>
                            <button onclick={() => { 
                                editingUser = null; 
                                editingUserSchoolSearch = '';
                                showEditingUserSchoolDropdown = false;
                            }} class="btn-small btn-cancel">
                                Avbryt
                            </button>
                        </td>
                    {:else}
                        <td class="id-cell">{user.id}</td>
                        <td>{user.navn || '-'}</td>
                        <td>{user.email || '-'}</td>
                        <td>{user.ungdomskole || '-'}</td>
                        <td>{user.telefon || '-'}</td>
                        <td>{getKursNavn(user.paameldt_kurs_id)}</td>
                        <td>{user.paameldt_tidspunkt_tekst || '-'}</td>
                        <td>{user.studiesuppe || '-'}</td>
                        <td>
                            <span class="role-badge role-{getUserRole(user.id)}">{getUserRole(user.id)}</span>
                        </td>
                        <td class="actions-cell">
                            <button onclick={() => { 
                                editingUser = {...user}; 
                                editingUserRole = getUserRole(user.id);
                                editingUserSchoolSearch = user.ungdomskole || '';
                            }} class="btn-small btn-edit">
                                Rediger
                            </button>
                            <button onclick={() => showDeleteConfirmModal(user.id, user.navn)} class="btn-small btn-danger">
                                Slett
                            </button>
                        </td>
                    {/if}
                </tr>
            {/each}
        </tbody>
    </table>
</div>

{#if showDeleteConfirm && userToDelete}
    <div class="modal-overlay" onclick={cancelDelete} onkeydown={(e) => e.key === 'Escape' && cancelDelete()} role="button" tabindex="-1">
        <div class="modal-content" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="0">
            <div class="modal-header">
                <h3 id="modal-title">Bekreft sletting</h3>
            </div>
            <div class="modal-body">
                <p>Er du sikker på at du vil slette brukeren <strong>{userToDelete.navn}</strong>?</p>
                <p class="modal-warning">Denne handlingen kan ikke angres.</p>
            </div>
            <div class="modal-actions">
                <button onclick={cancelDelete} class="btn-modal-cancel">
                    Avbryt
                </button>
                <button onclick={confirmDeleteUser} class="btn-modal-delete">
                    Slett bruker
                </button>
            </div>
        </div>
    </div>
{/if}

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

    .form-grid input,
    .form-grid select {
        padding: 10px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 0.95rem;
        width: 100%;
        box-sizing: border-box;
    }

    .form-grid input:focus,
    .form-grid select:focus {
        outline: none;
        border-color: var(--color-pink);
        box-shadow: 0 0 0 3px rgba(217, 59, 96, 0.1);
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

    .school-option-other-inline {
        font-weight: 500;
        color: var(--color-pink);
        border-top: 2px solid #f0f0f0;
    }

    .tel-input {
        width: 100%;
        padding: 8px 12px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 0.95rem;
        transition: border-color 0.3s, box-shadow 0.3s;
    }

    .tel-input:focus {
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

    .id-cell {
        font-family: 'Courier New', monospace;
        font-size: 0.85rem;
        color: #666;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
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

    .role-badge {
        font-size: 0.85rem;
        padding: 4px 12px;
        border-radius: 6px;
        font-weight: 600;
        text-transform: capitalize;
        display: inline-block;
    }

    .role-ingen {
        background: rgba(153, 153, 153, 0.1);
        color: #999;
    }

    .role-admin {
        background: rgba(220, 137, 70, 0.15);
        color: var(--color-orange);
    }

    .role-developer {
        background: rgba(65, 145, 215, 0.15);
        color: var(--color-blue);
        font-weight: 700;
    }

    /* Delete Confirmation Modal */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(4px);
        animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .modal-content {
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90%;
        overflow: hidden;
        animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
        from {
            transform: translateY(50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .modal-header {
        background: linear-gradient(135deg, var(--color-pink), var(--color-pink-light));
        padding: 25px 30px;
        color: white;
    }

    .modal-header h3 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 500;
    }

    .modal-body {
        padding: 30px;
    }

    .modal-body p {
        margin: 0 0 15px 0;
        color: #333;
        font-size: 1.05rem;
        line-height: 1.6;
    }

    .modal-body p:last-child {
        margin-bottom: 0;
    }

    .modal-body strong {
        color: var(--color-pink);
        font-weight: 600;
    }

    .modal-warning {
        color: #dc2626;
        font-size: 0.95rem;
        font-weight: 500;
        margin-top: 20px !important;
        padding: 12px;
        background: #fef2f2;
        border-left: 4px solid #dc2626;
        border-radius: 6px;
    }

    .modal-actions {
        display: flex;
        gap: 12px;
        padding: 20px 30px 30px 30px;
        justify-content: flex-end;
    }

    .btn-modal-cancel {
        padding: 12px 28px;
        background: #f3f4f6;
        color: #4b5563;
        border: 2px solid #e5e7eb;
        border-radius: 25px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .btn-modal-cancel:hover {
        background: #e5e7eb;
        border-color: #d1d5db;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .btn-modal-delete {
        padding: 12px 28px;
        background: var(--color-pink);
        color: white;
        border: 2px solid var(--color-pink);
        border-radius: 25px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(217, 59, 96, 0.3);
    }

    .btn-modal-delete:hover {
        background: #c12d56;
        border-color: #c12d56;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(217, 59, 96, 0.4);
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

        .form-grid {
            grid-template-columns: 1fr;
        }

        table {
            font-size: 0.85rem;
        }

        .actions-cell {
            flex-direction: column;
        }

        .modal-content {
            width: 95%;
            max-width: none;
        }

        .modal-header {
            padding: 20px 20px;
        }

        .modal-header h3 {
            font-size: 1.25rem;
        }

        .modal-body {
            padding: 20px;
        }

        .modal-actions {
            padding: 15px 20px 20px 20px;
            flex-direction: column-reverse;
        }

        .btn-modal-cancel,
        .btn-modal-delete {
            width: 100%;
        }
    }
</style>
