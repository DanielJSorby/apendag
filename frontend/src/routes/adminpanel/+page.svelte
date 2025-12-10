<script lang="ts">
import { onMount } from 'svelte';

let { data } = $props();

type User = {
    id: string;
    navn: string;
    email: string;
    paameldt_kurs_id: number | null;
    paameldt_tidspunkt_tekst: string | null;
    studiesuppe: string | null;
};

type Kurs = {
    id: number;
    linje: string;
    navn: string;
    plasser: number;
    tid: {
        forLunsj: string;
        etterLunsj: string;
        siste: string;
    };
    farge: string;
};

// Kurs-mapping basert på aktiviteter.json
let kursMap = $state<Record<number, string>>({});
let kursListe = $state<Kurs[]>([]);

onMount(async () => {
    try {
        const response = await fetch('/aktiviteter.json');
        const data = await response.json();
        const apenSkoledag = data.dager.find((d: any) => d.arrangement === "Åpen skoledag for 10. trinn");
        
        if (apenSkoledag && apenSkoledag.kurs) {
            kursListe = apenSkoledag.kurs;
            kursMap = {};
            apenSkoledag.kurs.forEach((kurs: Kurs) => {
                kursMap[kurs.id] = kurs.navn;
            });
        }
    } catch (error) {
        // Fallback til tom mapping hvis det feiler
        kursMap = {};
    }
    
    // Load FAQ questions
    await loadFAQ();
});

async function loadFAQ() {
    try {
        const response = await fetch('/api/admin/faq');
        if (response.ok) {
            const data = await response.json();
            faqQuestions = data.questions || [];
        }
    } catch (error) {
        console.error('Error loading FAQ:', error);
    }
}

function getKursNavn(id: number | null): string {
    if (!id) return '-';
    return kursMap[id] || `Ukjent kurs (ID: ${id})`;
}

type FAQ = {
    id: number;
    question: string;
    answer: string;
    display_order: number;
};

let activeTab = $state<'users' | 'stats' | 'faq'>('users');
let faqQuestions = $state<FAQ[]>([]);
let editingFAQ = $state<FAQ | null>(null);
let isCreatingFAQ = $state(false);
let faqSearch = $state('');
let draggedItem = $state<FAQ | null>(null);

let newFAQ = $state({
    question: '',
    answer: ''
});
let users = $state<User[]>((data.users as User[]) || []);
let courseStats = $state<any[]>((data.courseStats as any[]) || []);
let adminIds = $state<string[]>(data.adminIds || []);
let expandedCourses = $state<Set<number>>(new Set());

function toggleCourse(courseId: number) {
    if (expandedCourses.has(courseId)) {
        expandedCourses.delete(courseId);
    } else {
        expandedCourses.add(courseId);
    }
    expandedCourses = new Set(expandedCourses);
}

function getUsersForCourse(courseId: number) {
    return users.filter(u => u.paameldt_kurs_id === courseId);
}
let currentUserId = $state<string>(data.currentUserId || '');
let isDevelopmentMode = $state<boolean>(data.isDevelopmentMode || false);

function isAdmin(userId: string): boolean {
    return adminIds.includes(userId);
}

// Editing states
let editingUser = $state<User | null>(null);
let editingUserIsAdmin = $state(false);
let isCreatingUser = $state(false);

// New user form
let newUser = $state({
    id: '',
    navn: '',
    email: '',
    paameldt_kurs_id: null as number | null,
    paameldt_tidspunkt_tekst: '',
    studiesuppe: ''
});

// Search/filter
let userSearch = $state('');
let adminSearch = $state('');

// Filtered list
let filteredUsers = $derived(
    users.filter(u => 
        u.navn?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.id?.toLowerCase().includes(userSearch.toLowerCase())
    )
);

let filteredAdminUsers = $derived(
    users.filter(u => 
        u.navn?.toLowerCase().includes(adminSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(adminSearch.toLowerCase()) ||
        u.id?.toLowerCase().includes(adminSearch.toLowerCase())
    )
);

// CRUD Functions for Users
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
        // Handle error silently
    }
}

async function updateUser(user: User) {
    try {
        // Update user data
        const response = await fetch('/api/admin', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        
        if (!response.ok) {
            return;
        }

        // Handle admin status change
        const wasAdmin = isAdmin(user.id);
        const shouldBeAdmin = editingUserIsAdmin;

        if (wasAdmin !== shouldBeAdmin && user.id !== currentUserId) {
            if (shouldBeAdmin) {
                await addAdmin(user.id);
            } else {
                await removeAdmin(user.id);
            }
        }
        
        editingUser = null;
        location.reload();
    } catch (error) {
        // Handle error silently
    }
}

async function deleteUser(id: string) {
    try {
        const response = await fetch('/api/admin', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        
        if (response.ok) {
            location.reload();
        }
    } catch (error) {
        // Handle error silently
    }
}

// Generate unique ID
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Admin management
async function addAdmin(userId: string) {
    try {
        const response = await fetch('/api/admin/manage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bruker_id: userId })
        });
        
        if (response.ok) {
            location.reload();
        }
    } catch (error) {
        // Handle error silently
    }
}

async function removeAdmin(userId: string) {
    try {
        const response = await fetch('/api/admin/manage', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bruker_id: userId })
        });
        
        if (response.ok) {
            location.reload();
        }
    } catch (error) {
        // Handle error silently
    }
}

// FAQ Functions
async function createFAQ() {
    try {
        const response = await fetch('/api/admin/faq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFAQ)
        });
        
        if (response.ok) {
            newFAQ = { question: '', answer: '' };
            isCreatingFAQ = false;
            await loadFAQ();
        }
    } catch (error) {
        console.error('Error creating FAQ:', error);
    }
}

async function updateFAQ(faq: FAQ) {
    try {
        const response = await fetch('/api/admin/faq', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(faq)
        });
        
        if (response.ok) {
            editingFAQ = null;
            await loadFAQ();
        }
    } catch (error) {
        console.error('Error updating FAQ:', error);
    }
}

async function deleteFAQ(id: number) {
    if (!confirm('Er du sikker på at du vil slette dette spørsmålet?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/faq', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        
        if (response.ok) {
            await loadFAQ();
        }
    } catch (error) {
        console.error('Error deleting FAQ:', error);
    }
}

async function reorderFAQ() {
    try {
        const orders = faqQuestions.map((faq, index) => ({
            id: faq.id,
            display_order: index + 1
        }));
        
        const response = await fetch('/api/admin/faq', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orders })
        });
        
        if (response.ok) {
            await loadFAQ();
        }
    } catch (error) {
        console.error('Error reordering FAQ:', error);
    }
}

function handleDragStart(faq: FAQ) {
    draggedItem = faq;
}

function handleDragOver(event: DragEvent) {
    event.preventDefault();
}

function handleDrop(targetFAQ: FAQ) {
    if (!draggedItem || draggedItem.id === targetFAQ.id) {
        draggedItem = null;
        return;
    }
    
    const draggedIndex = faqQuestions.findIndex(f => f.id === draggedItem!.id);
    const targetIndex = faqQuestions.findIndex(f => f.id === targetFAQ.id);
    
    const newQuestions = [...faqQuestions];
    const [removed] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(targetIndex, 0, removed);
    
    faqQuestions = newQuestions;
    draggedItem = null;
    reorderFAQ();
}

let filteredFAQ = $derived(
    faqQuestions.filter(faq =>
        faq.question?.toLowerCase().includes(faqSearch.toLowerCase()) ||
        faq.answer?.toLowerCase().includes(faqSearch.toLowerCase())
    )
);
</script>

<svelte:head>
    <title>Admin Panel - Elvebakken</title>
</svelte:head>

    <header>
        <h1>Admin Panel</h1>
        <p>Administrer brukere for åpen dag</p>
        {#if isDevelopmentMode}
            <div class="dev-badge">UTVIKLINGSMODUS - Localhost Admin</div>
        {/if}
    </header>

<div class="admin-container">

    <nav class="tabs">
        <button 
            class:active={activeTab === 'users'}
            onclick={() => activeTab = 'users'}>
            Brukere ({users.length})
        </button>
        <button 
            class:active={activeTab === 'stats'}
            onclick={() => activeTab = 'stats'}>
            Statistikk
        </button>
        <button 
            class:active={activeTab === 'faq'}
            onclick={async () => { 
                activeTab = 'faq';
                await loadFAQ();
            }}>
            FAQ ({faqQuestions.length})
        </button>
    </nav>

    {#if activeTab === 'users'}
        <section class="content-section">
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
                        <select bind:value={newUser.paameldt_kurs_id}>
                            <option value={null}>Ingen kurs</option>
                            {#each kursListe as kurs}
                                <option value={kurs.id}>{kurs.navn}</option>
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
                            <th>Påmeldt kurs</th>
                            <th>Tidspunkt</th>
                            <th>Studiesuppe</th>
                            <th>Admin</th>
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
                                        <select bind:value={editingUser.paameldt_kurs_id}>
                                            <option value={null}>Ingen kurs</option>
                                            {#each kursListe as kurs}
                                                <option value={kurs.id}>{kurs.linje.toUpperCase()}</option>
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
                                        <select bind:value={editingUserIsAdmin} disabled={user.id === currentUserId}>
                                            <option value={true}>Ja</option>
                                            <option value={false}>Nei</option>
                                        </select>
                                    </td>
                                    <td class="actions-cell">
                                        <button onclick={() => updateUser(editingUser!)} class="btn-small btn-success">
                                            Lagre
                                        </button>
                                        <button onclick={() => editingUser = null} class="btn-small btn-cancel">
                                            Avbryt
                                        </button>
                                    </td>
                                {:else}
                                    <td class="id-cell">{user.id}</td>
                                    <td>{user.navn || '-'}</td>
                                    <td>{user.email || '-'}</td>
                                    <td>{getKursNavn(user.paameldt_kurs_id)}</td>
                                    <td>{user.paameldt_tidspunkt_tekst || '-'}</td>
                                    <td>{user.studiesuppe || '-'}</td>
                                    <td>
                                        {#if isAdmin(user.id)}
                                            <span class="admin-badge">Ja</span>
                                        {:else}
                                            <span class="non-admin-badge">Nei</span>
                                        {/if}
                                    </td>
                                    <td class="actions-cell">
                                        <button onclick={() => { editingUser = {...user}; editingUserIsAdmin = isAdmin(user.id); }} class="btn-small btn-edit">
                                            Rediger
                                        </button>
                                        <button onclick={() => deleteUser(user.id)} class="btn-small btn-danger">
                                            Slett
                                        </button>
                                    </td>
                                {/if}
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </section>
    {/if}

    {#if activeTab === 'stats'}
        <section class="content-section">
            <h2>Statistikk</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Totalt antall brukere</h3>
                    <p class="stat-number">{users.length}</p>
                </div>

                <div class="stat-card">
                    <h3>Brukere med kurs</h3>
                    <p class="stat-number">{users.filter(u => u.paameldt_kurs_id).length}</p>
                </div>
            </div>

            <div class="stats-section">
                <h3>Kurspåmeldinger</h3>
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
                                            <span class="user-name">{user.navn}</span>
                                            <span class="user-email">{user.email}</span>
                                            <span class="user-time">{user.paameldt_tidspunkt_tekst || 'Ikke valgt'}</span>
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        </section>
    {/if}

    {#if activeTab === 'faq'}
        <section class="content-section">
            <div class="section-header">
                <h2>FAQ Spørsmål</h2>
                <div class="actions">
                    <input 
                        type="text" 
                        placeholder="Søk FAQ..." 
                        bind:value={faqSearch}
                        class="search-input"
                    />
                    <button onclick={() => isCreatingFAQ = !isCreatingFAQ} class="btn-primary">
                        Nytt spørsmål
                    </button>
                </div>
            </div>

            {#if isCreatingFAQ}
                <div class="create-form">
                    <h3>Opprett nytt FAQ spørsmål</h3>
                    <div class="form-grid">
                        <textarea 
                            placeholder="Spørsmål" 
                            bind:value={newFAQ.question}
                            rows="2"
                            style="grid-column: 1 / -1;"
                        ></textarea>
                        <textarea 
                            placeholder="Svar" 
                            bind:value={newFAQ.answer}
                            rows="4"
                            style="grid-column: 1 / -1;"
                        ></textarea>
                    </div>
                    <div class="form-actions">
                        <button onclick={createFAQ} class="btn-success">
                            Opprett
                        </button>
                        <button onclick={() => { isCreatingFAQ = false; newFAQ = { question: '', answer: '' }; }} class="btn-cancel">
                            Avbryt
                        </button>
                    </div>
                </div>
            {/if}

            <div class="faq-list">
                {#each filteredFAQ as faq (faq.id)}
                    <div 
                        class="faq-item"
                        draggable="true"
                        ondragstart={() => handleDragStart(faq)}
                        ondragover={handleDragOver}
                        ondrop={() => handleDrop(faq)}
                    >
                        {#if editingFAQ?.id === faq.id}
                            <div class="faq-edit-form">
                                <textarea 
                                    bind:value={editingFAQ.question}
                                    placeholder="Spørsmål"
                                    rows="2"
                                ></textarea>
                                <textarea 
                                    bind:value={editingFAQ.answer}
                                    placeholder="Svar"
                                    rows="4"
                                ></textarea>
                                <div class="faq-actions">
                                    <button onclick={() => updateFAQ(editingFAQ)} class="btn-small btn-success">
                                        Lagre
                                    </button>
                                    <button onclick={() => editingFAQ = null} class="btn-small btn-cancel">
                                        Avbryt
                                    </button>
                                </div>
                            </div>
                        {:else}
                            <div class="faq-content">
                                <div class="faq-drag-handle">☰</div>
                                <div class="faq-text">
                                    <h3>{faq.question}</h3>
                                    <p>{faq.answer}</p>
                                </div>
                                <div class="faq-actions">
                                    <button onclick={() => { editingFAQ = {...faq}; }} class="btn-small btn-edit">
                                        Rediger
                                    </button>
                                    <button onclick={() => deleteFAQ(faq.id)} class="btn-small btn-danger">
                                        Slett
                                    </button>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        </section>
    {/if}
</div>

<style>
    header {
        text-align: center;
        margin-bottom: 40px;
        padding-top: 13vh;
        padding-bottom: 3vh;
        color: white;
        width: 100vw;
        animation: colorCycle 12s ease-in-out infinite;
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

    header h1 {
        margin: 0 0 10px 0;
        font-size: 3rem;
        font-weight: 500;
        letter-spacing: -0.5px;
    }

    header p {
        margin: 0;
        opacity: 0.95;
        font-size: 1.1rem;
        font-weight: 300;
    }

    .dev-badge {
        color: white;
        padding: 10px 20px;
        font-weight: 500;
        margin-top: 15px;
        display: inline-block;
    }

    .admin-container {
        max-width: 90vw;
        margin: 0 auto;
        padding: 20px;
        min-height: 100vh;
    }

    .tabs {
        display: flex;
        gap: 15px;
        margin-bottom: 30px;
        flex-wrap: wrap;
    }

    .tabs button {
        padding: 15px 30px;
        border: 2px solid var(--color-pink);
        background: white;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        color: var(--color-pink);
        border-radius: 25px;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(217, 59, 96, 0.1);
    }

    .tabs button:hover {
        background: var(--color-pink-light);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(217, 59, 96, 0.2);
    }

    .tabs button.active {
        background: var(--color-pink);
        color: white;
        box-shadow: 0 4px 15px rgba(217, 59, 96, 0.3);
    }

    .content-section {
        background: white;
        border-radius: 15px;
        padding: 30px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        border: 1px solid #f0f0f0;
    }

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

    .form-grid input {
        padding: 10px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 0.95rem;
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
        display: grid;
        grid-template-columns: 1fr 1.5fr 1fr;
        gap: 15px;
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

    .user-name {
        font-weight: 600;
        color: #333;
    }

    .user-email {
        color: #666;
        font-size: 0.9rem;
    }

    .user-time {
        color: var(--color-green);
        font-weight: 500;
        font-size: 0.9rem;
        text-align: right;
    }

    input[type="text"],
    input[type="email"],
    input[type="number"],
    select {
        width: 100%;
        box-sizing: border-box;
    }

    /* Table edit mode styles */
    td input[type="text"],
    td input[type="email"],
    td select {
        padding: 8px 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        background: white;
    }

    td input[type="text"]:focus,
    td input[type="email"]:focus,
    td select:focus {
        outline: none;
        border-color: var(--color-pink);
        box-shadow: 0 0 0 3px rgba(217, 59, 96, 0.1);
    }

    td select {
        cursor: pointer;
        background-color: white;
    }

    tr:has(input), tr:has(select) {
        background: var(--color-pink-light) !important;
    }

    /* Admin-specific styles */
    .admin-info {
        color: #666;
        font-size: 0.9rem;
        margin: 0;
    }

    .admin-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .admin-card {
        background: white;
        border: 2px solid #f0f0f0;
        border-radius: 15px;
        padding: 25px;
        transition: all 0.3s ease;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .admin-card.is-admin {
        border-color: var(--color-green);
        background: linear-gradient(135deg, rgba(73, 116, 80, 0.1), white);
        box-shadow: 0 4px 15px rgba(73, 116, 80, 0.15);
    }

    .admin-card:hover {
        box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        transform: translateY(-3px);
    }

    .admin-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 2px solid #f0f0f0;
    }

    .admin-card-header h3 {
        margin: 0;
        color: #333;
        font-size: 1.1rem;
    }

    .admin-badge-large {
        background: var(--color-green);
        color: white;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(73, 116, 80, 0.3);
    }

    .admin-badge {
        color: var(--color-green);
        font-weight: 600;
    }

    .non-admin-badge {
        color: #999;
    }

    .admin-card-body {
        margin-bottom: 15px;
    }

    .admin-card-body p {
        margin: 8px 0;
        color: #666;
        font-size: 0.9rem;
    }

    .admin-card-actions {
        display: flex;
        gap: 10px;
    }

    .admin-card-actions button {
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s;
    }

    .btn-disabled {
        background: #e0e0e0;
        color: #999;
        cursor: not-allowed;
    }

    .faq-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .faq-item {
        background: white;
        border: 2px solid #f0f0f0;
        border-radius: 15px;
        padding: 20px;
        transition: all 0.3s ease;
        cursor: move;
    }

    .faq-item:hover {
        border-color: var(--color-pink);
        box-shadow: 0 4px 15px rgba(217, 59, 96, 0.1);
    }

    .faq-item[draggable="true"] {
        cursor: grab;
    }

    .faq-item[draggable="true"]:active {
        cursor: grabbing;
    }

    .faq-content {
        display: flex;
        gap: 15px;
        align-items: flex-start;
    }

    .faq-drag-handle {
        color: #ccc;
        font-size: 1.5rem;
        cursor: grab;
        padding: 5px;
        user-select: none;
    }

    .faq-text {
        flex: 1;
    }

    .faq-text h3 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 1.1rem;
    }

    .faq-text p {
        margin: 0;
        color: #666;
        line-height: 1.6;
    }

    .faq-edit-form {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .faq-edit-form textarea {
        width: 100%;
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.95rem;
        font-family: inherit;
        resize: vertical;
        box-sizing: border-box;
    }

    .faq-edit-form textarea:focus {
        outline: none;
        border-color: var(--color-pink);
        box-shadow: 0 0 0 3px rgba(217, 59, 96, 0.1);
    }

    .faq-actions {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    @media (max-width: 768px) {
        .admin-container {
            padding: 10px;
        }

        header h1 {
            font-size: 1.8rem;
        }

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

        .faq-content {
            flex-direction: column;
        }

        .faq-actions {
            width: 100%;
            justify-content: flex-end;
        }
    }
</style>
