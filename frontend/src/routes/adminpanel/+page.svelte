<script lang="ts">
import { onMount } from 'svelte';
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { getCookie } from '$lib/functions/getCookie';

let { data } = $props();

function setCookie(name: string, value: string, days: number = 365) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

type User = {
    id: string;
    navn: string;
    email: string;
    paameldt_kurs_id: number | null;
    paameldt_tidspunkt_tekst: string | null;
    studiesuppe: string | null;
    ungdomskole: string | null;
    telefon: string | null;
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

// Kurs-mapping basert på databasen
let kursMap = $state<Record<number, string>>({});
let kursListe = $state<Kurs[]>([]);

onMount(async () => {
    // Hent kurs fra server data
    if (data.kursListe && Array.isArray(data.kursListe)) {
        kursListe = data.kursListe.map((kurs: any) => ({
            id: kurs.id,
            linje: kurs.linje || '',
            navn: kurs.navn || '',
            plasser: kurs.plasser || 0,
            tid: {
                forLunsj: kurs.tid_for_lunsj || '',
                etterLunsj: kurs.tid_etter_lunsj || '',
                siste: kurs.tid_siste || ''
            },
            farge: kurs.farge || ''
        }));
        kursMap = {};
        kursListe.forEach((kurs: Kurs) => {
            kursMap[kurs.id] = kurs.navn;
        });
    }
    
    // Load all data on mount to show correct counts
    await Promise.all([
        loadFAQ(),
        loadLinjer(),
        loadSchools()
    ]);

    // Close dropdowns when clicking outside
    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.school-selector-inline')) {
            showEditingSchoolDropdown = false;
            showEditingUserSchoolDropdown = false;
        }
    }
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
        document.removeEventListener('click', handleClickOutside);
    };
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

type Linje = {
    id: string;
    tittel: string;
    beskrivelse: string;
    langBeskrivelse: string | null;
    bilde: string;
    farge: string;
    lysfarge: string;
    eksternLenke: string | null;
};

// Initialize activeTab from URL parameter or default to 'users'
function getInitialTab(): 'users' | 'stats' | 'faq' | 'linjer' | 'skoler' {
    const tabParam = $page.url.searchParams.get('tab');
    if (tabParam === 'users' || tabParam === 'stats' || tabParam === 'faq' || tabParam === 'linjer' || tabParam === 'skoler') {
        return tabParam;
    }
    return 'users';
}

let activeTab = $state<'users' | 'stats' | 'faq' | 'linjer' | 'skoler'>(getInitialTab());

// Update activeTab when URL parameter changes
$effect(() => {
    const tabParam = $page.url.searchParams.get('tab');
    if (tabParam === 'users' || tabParam === 'stats' || tabParam === 'faq' || tabParam === 'linjer' || tabParam === 'skoler') {
        if (activeTab !== tabParam) {
            activeTab = tabParam;
        }
    } else {
        // No tab parameter, set default and update URL
        if (activeTab !== 'users') {
            activeTab = 'users';
        }
        if (!$page.url.searchParams.has('tab')) {
            goto(`/adminpanel?tab=users`, { replaceState: true, noScroll: true });
        }
    }
});

function setActiveTab(tab: 'users' | 'stats' | 'faq' | 'linjer' | 'skoler') {
    activeTab = tab;
    goto(`/adminpanel?tab=${tab}`, { replaceState: true, noScroll: true });
}
let linjer = $state<Linje[]>([]);
let editingLinje = $state<Linje | null>(null);
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
let showDeleteConfirm = $state(false);
let userToDelete = $state<{ id: string; navn: string } | null>(null);

// New user form
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

// Schools management
type School = {
    id: string;
    navn: string;
    aktiv: boolean;
};

let schools = $state<School[]>([]);
let schoolSearch = $state('');
let editingSchool = $state<School | null>(null);
let isCreatingSchool = $state(false);
let newSchoolName = $state('');
let editingSchoolSearch = $state('');
let showEditingSchoolDropdown = $state(false);
let editingUserSchoolSearch = $state('');
let showEditingUserSchoolDropdown = $state(false);
let schoolErrorMessage = $state('');

// Column visibility for stats - default values
let visibleColumns = $state({
    navn: true,
    email: true,
    telefon: true,
    ungdomskole: true,
    paameldt_tidspunkt_tekst: true,
    studiesuppe: false,
    paameldt_kurs_id: false
});

// Load from cookies on mount (client-side only)
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

// Save to cookie whenever visibleColumns changes (client-side only)
$effect(() => {
    if (typeof document !== 'undefined') {
        setCookie('adminVisibleColumns', JSON.stringify(visibleColumns));
    }
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

let showInactiveSchools = $state(false);

let filteredSchools = $derived(
    schools.filter(s => {
        const matchesSearch = s.navn.toLowerCase().includes(schoolSearch.toLowerCase());
        if (showInactiveSchools) {
            return matchesSearch;
        }
        return matchesSearch && s.aktiv;
    })
);

function filteredSchoolsForEdit(searchTerm: string) {
    if (!searchTerm) return schools.filter(s => s.aktiv);
    const searchLower = searchTerm.toLowerCase();
    return schools.filter(s => 
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

function selectSchoolForUser(schoolName: string) {
    if (editingUser) {
        editingUser.ungdomskole = schoolName;
        editingUserSchoolSearch = schoolName;
    }
    showEditingUserSchoolDropdown = false;
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

async function updateSchool(school: School) {
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
        // Handle error silently
    }
}

function cancelDelete() {
    showDeleteConfirm = false;
    userToDelete = null;
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

// Linjer Functions
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

async function updateLinje(linje: Linje) {
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
            onclick={() => setActiveTab('users')}>
            Brukere ({users.length})
        </button>
        <button 
            class:active={activeTab === 'stats'}
            onclick={() => setActiveTab('stats')}>
            Statistikk
        </button>
        <button 
            class:active={activeTab === 'faq'}
            onclick={async () => { 
                setActiveTab('faq');
                await loadFAQ();
            }}>
            FAQ ({faqQuestions.length})
        </button>
        <button 
            class:active={activeTab === 'linjer'}
            onclick={async () => { 
                setActiveTab('linjer');
                await loadLinjer();
            }}>
            Linjer ({linjer.length})
        </button>
        <button 
            class:active={activeTab === 'skoler'}
            onclick={async () => { 
                setActiveTab('skoler');
                await loadSchools();
            }}>
            Skoler ({schools.length})
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
                                        <select bind:value={editingUserIsAdmin} disabled={user.id === currentUserId}>
                                            <option value={true}>Ja</option>
                                            <option value={false}>Nei</option>
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
                                        {#if isAdmin(user.id)}
                                            <span class="admin-badge">Ja</span>
                                        {:else}
                                            <span class="non-admin-badge">Nei</span>
                                        {/if}
                                    </td>
                                    <td class="actions-cell">
                                        <button onclick={() => { 
                                            editingUser = {...user}; 
                                            editingUserIsAdmin = isAdmin(user.id);
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

    {#if activeTab === 'linjer'}
        <section class="content-section">
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
                                        <label>ID (kan ikke endres)</label>
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
                                        <label>Ekstern lenke</label>
                                        <input type="text" bind:value={editingLinje.eksternLenke} />
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
        </section>
    {/if}

    {#if activeTab === 'skoler'}
        <section class="content-section">
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
        </section>
    {/if}
</div>

<!-- Delete Confirmation Modal -->
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
        font-family: 'Oslo Sans', sans-serif;
        transition: border-color 0.3s, box-shadow 0.3s;
    }

    .tel-input:focus {
        outline: none;
        border-color: var(--color-pink);
        box-shadow: 0 0 0 3px rgba(217, 59, 96, 0.1);
    }

    table input[type="text"],
    table input[type="email"],
    table input[type="tel"],
    table select {
        width: 100%;
        padding: 8px 12px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 0.95rem;
        font-family: 'Oslo Sans', sans-serif;
        transition: border-color 0.3s, box-shadow 0.3s;
    }

    table input[type="text"]:focus,
    table input[type="email"]:focus,
    table input[type="tel"]:focus,
    table select:focus {
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

    .linje-edit-form label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        color: #333;
    }

    .linje-edit-form input,
    .linje-edit-form textarea {
        width: 100%;
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.95rem;
        font-family: inherit;
        resize: vertical;
        box-sizing: border-box;
    }

    .linje-edit-form input:disabled {
        background: #f5f5f5;
        cursor: not-allowed;
    }

    .linje-edit-form input:focus,
    .linje-edit-form textarea:focus {
        outline: none;
        border-color: var(--color-pink);
        box-shadow: 0 0 0 3px rgba(217, 59, 96, 0.1);
    }

    .linje-actions {
        display: flex;
        gap: 10px;
        align-items: center;
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
