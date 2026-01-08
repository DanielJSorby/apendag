<script lang="ts">
import { onMount } from 'svelte';
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import SystemvedlikeholdSection from './SystemvedlikeholdSection.svelte';
import BrukereSection from './BrukereSection.svelte';
import StatistikkSection from './StatistikkSection.svelte';
import FAQSection from './FAQSection.svelte';
import LinjerSection from './LinjerSection.svelte';
import SkolerSection from './SkolerSection.svelte';
import VentelisteSection from './VentelisteSection.svelte';
import DatabaseSection from './DatabaseSection.svelte';

let { data } = $props();

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
    plasser_for?: number;
    plasser_etter?: number;
    plasser_siste?: number;
    tid: {
        forLunsj: string;
        etterLunsj: string;
        siste: string;
    };
    farge: string;
};

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

type VentelisteEntry = {
    id: string;
    bruker_id: string;
    kurs_id: number;
    tidspunkt_tekst: string;
    studiesuppe: string | null;
    created_at: string;
    bruker_navn: string;
    bruker_email: string;
    position: number;
};

type School = {
    id: string;
    navn: string;
    aktiv: boolean;
};

// State
let kursMap = $state<Record<number, string>>({});
let kursListe = $state<Kurs[]>([]);
let users = $state<User[]>((data.users as User[]) || []);
let courseStats = $state<any[]>((data.courseStats as any[]) || []);
let linjer = $state<Linje[]>([]);
let faqQuestions = $state<FAQ[]>([]);
let venteliste = $state<VentelisteEntry[]>([]);
let schools = $state<School[]>([]);

let userRoles = $state<Record<string, string>>(data.userRoles || {});
let currentUserRole = $state<string>(data.currentUserRole || 'ingen');
let currentUserId = $state<string>(data.currentUserId || '');
let isDevelopmentMode = $state<boolean>(data.isDevelopmentMode || false);
let maintenanceActivatedAt = $state<string>(data.maintenanceActivatedAt || 'Ukjent tid');

// Tab management
function getInitialTab(): 'users' | 'stats' | 'faq' | 'linjer' | 'skoler' | 'venteliste' | 'Systemvedlikehold' | 'database' {
    const tabParam = $page.url.searchParams.get('tab');
    if (tabParam === 'users' || tabParam === 'stats' || tabParam === 'faq' || tabParam === 'linjer' || tabParam === 'skoler' || tabParam === 'venteliste' || tabParam === 'Systemvedlikehold' || tabParam === 'database') {
        return tabParam;
    }
    return 'users';
}

let activeTab = $state<'users' | 'stats' | 'faq' | 'linjer' | 'skoler' | 'venteliste' | 'Systemvedlikehold' | 'database'>(getInitialTab());

$effect(() => {
    const tabParam = $page.url.searchParams.get('tab');
    if (tabParam === 'users' || tabParam === 'stats' || tabParam === 'faq' || tabParam === 'linjer' || tabParam === 'skoler' || tabParam === 'venteliste' || tabParam === 'Systemvedlikehold' || tabParam === 'database') {
        if (activeTab !== tabParam) {
            activeTab = tabParam;
        }
    } else {
        if (activeTab !== 'users') {
            activeTab = 'users';
        }
        if (!$page.url.searchParams.has('tab')) {
            goto(`/adminpanel?tab=users`, { replaceState: true, noScroll: true });
        }
    }
});

function setActiveTab(tab: 'users' | 'stats' | 'faq' | 'linjer' | 'skoler' | 'venteliste' | 'Systemvedlikehold' | 'database') {
    activeTab = tab;
    goto(`/adminpanel?tab=${tab}`, { replaceState: true, noScroll: true });
}

// Data loading
onMount(async () => {
    // Initialize kurs
    if (data.kursListe && Array.isArray(data.kursListe)) {
        kursListe = data.kursListe.map((kurs: any) => ({
            id: kurs.id,
            linje: kurs.linje || '',
            navn: kurs.navn || '',
            plasser: kurs.plasser || 0,
            plasser_for: kurs.plasser_for || 0,
            plasser_etter: kurs.plasser_etter || 0,
            plasser_siste: kurs.plasser_siste || 0,
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
    
    // Load initial data
    await Promise.all([
        loadFAQ(),
        loadLinjer(),
        loadSchools(),
        loadVenteliste()
    ]);
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
</script>

<svelte:head>
    <title>Admin Panel - Elvebakken</title>
</svelte:head>

<header>
    <h1>Admin Panel</h1>
    <p>Administrer brukere for åpen dag</p>
    {#if isDevelopmentMode}
        <div class="dev-badge">UTVIKLINGSMODUS - Localhost Developer</div>
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
        <button 
            class:active={activeTab === 'venteliste'}
            onclick={async () => { 
                setActiveTab('venteliste');
                await loadVenteliste();
            }}>
            Venteliste ({venteliste.length})
        </button>
        {#if currentUserRole === 'developer'}
            <button 
                class:active={activeTab === 'Systemvedlikehold'}
                onclick={() => setActiveTab('Systemvedlikehold')}>
                Systemvedlikehold
            </button>
            <button 
                class:active={activeTab === 'database'}
                onclick={() => setActiveTab('database')}>
                Database
            </button>
        {/if}
    </nav>

    {#if activeTab === 'users'}
        <section class="content-section">
            <BrukereSection 
                bind:users
                bind:kursListe
                bind:kursMap
                {currentUserId}
                {userRoles}
            />
        </section>
    {/if}

    {#if activeTab === 'stats'}
        <section class="content-section">
            <StatistikkSection 
                bind:users
                bind:courseStats
                bind:kursListe
            />
        </section>
    {/if}

    {#if activeTab === 'faq'}
        <section class="content-section">
            <FAQSection 
                bind:faqQuestions
            />
        </section>
    {/if}

    {#if activeTab === 'linjer'}
        <section class="content-section">
            <LinjerSection 
                bind:linjer
            />
        </section>
    {/if}

    {#if activeTab === 'skoler'}
        <section class="content-section">
            <SkolerSection 
                bind:schools
            />
        </section>
    {/if}

    {#if activeTab === 'venteliste'}
        <section class="content-section">
            <VentelisteSection 
                bind:venteliste
                bind:kursListe
            />
        </section>
    {/if}

    {#if activeTab === 'database' && currentUserRole === 'developer'}
        <section class="content-section">
            <DatabaseSection 
                bind:kursListe
            />
        </section>
    {/if}

    {#if activeTab === 'Systemvedlikehold' && currentUserRole === 'developer'}
        <section class="content-section">
            <SystemvedlikeholdSection {maintenanceActivatedAt} />
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
        padding: 15px 25px;
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

    @media (max-width: 768px) {
        .admin-container {
            padding: 10px;
        }

        header h1 {
            font-size: 1.8rem;
        }

        .tabs {
            flex-direction: column;
        }

        .tabs button {
            width: 100%;
        }
    }
</style>
