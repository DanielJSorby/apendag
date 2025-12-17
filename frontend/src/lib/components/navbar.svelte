<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let menuOpen = $state(false);
    let isLoggedIn = $state(false);
    let userName = $state<string | null>(null);
    let userMenuOpen = $state(false);
    let isAdmin = $state(false);
    let showDeleteModal = $state(false);
    let isDeleting = $state(false);

    function toggleMenu() {
        menuOpen = !menuOpen;
    }

    function toggleUserMenu() {
        userMenuOpen = !userMenuOpen;
    }

    async function checkLoginStatus() {
        try {
            const response = await fetch('/api/user/current');
            const data = await response.json();
            isLoggedIn = data.loggedIn || false;
            isAdmin = data.isAdmin || false;
            userName = data.user?.name || null;
        } catch (error) {
            isLoggedIn = false;
            isAdmin = false;
        }
    }

    async function handleLogout() {
        try {
            // Call server-side logout to clear httpOnly cookie
            await fetch('/api/logout', { method: 'POST' });
            
            // Update local state
            isLoggedIn = false;
            userName = null;
            userMenuOpen = false;
            
            // Redirect to home page
            goto('/');
        } catch (error) {
            // Still update local state and redirect even if API call fails
            isLoggedIn = false;
            userName = null;
            userMenuOpen = false;
            goto('/');
        }
    }

    function openDeleteModal() {
        showDeleteModal = true;
        userMenuOpen = false;
    }

    function closeDeleteModal() {
        showDeleteModal = false;
    }

    async function handleDeleteAccount() {
        if (isDeleting) return;
        
        isDeleting = true;
        try {
            const response = await fetch('/api/user/delete', { method: 'DELETE' });
            const data = await response.json();
            
            if (data.ok) {
                // Update local state
                isLoggedIn = false;
                userName = null;
                userMenuOpen = false;
                showDeleteModal = false;
                
                // Redirect to home page
                goto('/');
            } else {
                alert(data.error || 'Kunne ikke slette kontoen din');
                isDeleting = false;
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Kunne ikke slette kontoen din');
            isDeleting = false;
        }
    }

    onMount(() => {
        checkLoginStatus();
        
        // Close user menu when clicking outside
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;
            if (!target.closest('.user-menu-container')) {
                userMenuOpen = false;
            }
        }
        
        document.addEventListener('click', handleClickOutside);
        
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    });
</script>

<div class="container">
    <a href="/" class="content-left">
        <div class="logo"></div>
        <h1>Åpen dag</h1>
    </a>
    <div class="content-right">
        <div class="nav-links">
            <a href="/kalender20">20. januar</a>
            <a href="/kalender22">22. januar</a>
            <a href="/FAQ">Spørsmål</a>
            {#if isAdmin}
                <a href="/adminpanel" class="admin-link">Admin</a>
            {/if}
            {#if isLoggedIn}
                <div class="user-menu-container">
                    <button class="user-button" onclick={toggleUserMenu} aria-label="User menu">
                        <span class="user-name">{userName || 'Logget inn'}</span>
                        <span class="user-icon">▼</span>
                    </button>
                    {#if userMenuOpen}
                        <div class="user-dropdown">
                            <button class="logout-button" onclick={handleLogout}>Logg ut</button>
                            <button class="delete-account-button" onclick={openDeleteModal}>Slett konto</button>
                        </div>
                    {/if}
                </div>
            {:else}
                <a href="/login">Logg inn</a>
            {/if}
        </div>
        <button class="hamburger" onclick={toggleMenu} aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </div>
</div>

{#if menuOpen}
    <div class="mobile-menu">
        <a href="/kalender20" onclick={toggleMenu}>20. januar</a>
        <a href="/kalender22" onclick={toggleMenu}>22. januar</a>
        <a href="/FAQ" onclick={toggleMenu}>Spørsmål</a>
        {#if isAdmin}
            <a href="/adminpanel" onclick={toggleMenu} class="admin-link">Admin</a>
        {/if}
        {#if isLoggedIn}
            <div class="mobile-user-info">
                <span>Logget inn som: {userName || 'Bruker'}</span>
            </div>
            <button class="mobile-logout-button" onclick={async () => { await handleLogout(); toggleMenu(); }}>Logg ut</button>
            <button class="mobile-delete-button" onclick={() => { openDeleteModal(); toggleMenu(); }}>Slett konto</button>
        {:else}
            <a href="/login" onclick={toggleMenu}>Logg inn</a>
        {/if}
    </div>
{/if}

{#if showDeleteModal}
    <div class="modal-overlay" onclick={closeDeleteModal} role="button" tabindex="0" onkeydown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') closeDeleteModal(); }}>
        <div class="modal-content" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-labelledby="delete-modal-title" aria-modal="true" tabindex="-1">
            <h2 id="delete-modal-title">Slett konto</h2>
            <p>Er du sikker på at du vil slette kontoen din? Denne handlingen kan ikke angres.</p>
            <p class="warning-text">Alle dine data, inkludert meldinger og påmeldinger, vil bli permanent slettet.</p>
            <div class="modal-buttons">
                <button class="modal-cancel-button" onclick={closeDeleteModal} disabled={isDeleting}>
                    Avbryt
                </button>
                <button class="modal-delete-button" onclick={handleDeleteAccount} disabled={isDeleting}>
                    {isDeleting ? 'Sletter...' : 'Slett konto'}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .container {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 10000000;
        width: 100%;
        height: 10vh;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #ffffff;
        box-shadow: 0 0px 5px rgba(255, 255, 255, 0.5);
        padding: 0 20px;
        box-sizing: border-box;

    }

    .content-left {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .logo {
        width: 60px;
        height: 60px;
        background-image: url('$lib/assets/ElvebakkenLogo.svg');
        background-size: contain;
        background-repeat: no-repeat;
        cursor: pointer;
    }

    .content-left h1 {
        font-family: 'Oslo Sans', sans-serif;
        font-size: 24px;
        color: #333333;
        cursor: pointer;
    }

    .nav-links {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
    }

    .nav-links a {
        margin-left: 20px;
        text-decoration: none;
        color: #333333;
        font-weight: bold;
        white-space: nowrap;
    }

    .nav-links a:hover {
        color: #fe9094;
        transform: translateY(-2px) scale(1.08);
        transition: all 0.3s ease;
    }

    .admin-link {
        color: white;
        padding: 8px 16px;
    }

    .content-left {
        text-decoration: none;
        color: inherit;
    }

    .content-right {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .hamburger {
        display: none;
        flex-direction: column;
        gap: 5px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px;
    }

    .hamburger span {
        width: 25px;
        height: 3px;
        background-color: #333333;
        border-radius: 2px;
        transition: all 0.3s;
    }

    .mobile-menu {
        display: none;
        position: fixed;
        top: 10vh;
        left: 0;
        width: 100%;
        background-color: #ffffff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 9999999;
        flex-direction: column;
        padding: 20px;
        box-sizing: border-box;
    }

    .mobile-menu a {
        padding: 15px 0;
        text-decoration: none;
        color: #333333;
        font-weight: bold;
        border-bottom: 1px solid #eeeeee;
    }

    .mobile-menu a:last-child {
        border-bottom: none;
    }

    .mobile-menu a:hover {
        color: #fe9094;
    }

    .user-menu-container {
        position: relative;
        margin-left: 20px;
        display: flex;
        align-items: center;
        white-space: nowrap;
    }

    .user-button {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: none;
        border: none;
        color: #333333;
        font-weight: bold;
        font-size: inherit;
        font-family: inherit;
        cursor: pointer;
        padding: 0;
        white-space: nowrap;
    }

    .user-button:hover {
        color: #fe9094;
    }

    .user-name {
        margin-right: 5px;
    }

    .user-icon {
        font-size: 10px;
        transition: transform 0.3s;
    }

    .user-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 10px;
        background-color: #ffffff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        min-width: 150px;
        z-index: 1000;
        padding: 0;
        display: flex;
        flex-direction: column;
    }

    .logout-button {
        width: 100%;
        padding: 10px 20px;
        background: none;
        border: none;
        text-align: left;
        color: #333333;
        font-weight: bold;
        cursor: pointer;
        font-size: inherit;
        font-family: inherit;
        border-radius: 8px 8px 0 0;
    }

    .logout-button:hover {
        background-color: #f5f5f5;
        color: #dc2626;
        border-radius: 8px 8px 0 0;
    }

    .delete-account-button {
        width: 100%;
        padding: 10px 20px;
        background: none;
        border: none;
        text-align: left;
        color: #dc2626;
        font-weight: bold;
        cursor: pointer;
        font-size: inherit;
        font-family: inherit;
        border-top: 1px solid #eeeeee;
        border-radius: 0 0 8px 8px;
    }

    .delete-account-button:hover {
        background-color: #fef2f2;
        border-radius: 0 0 8px 8px;
    }

    .mobile-user-info {
        padding: 15px 0;
        color: #333333;
        font-weight: bold;
        border-bottom: 1px solid #eeeeee;
    }

    .mobile-logout-button {
        width: 100%;
        padding: 15px 0;
        background: none;
        border: none;
        text-align: left;
        color: #333333;
        font-weight: bold;
        cursor: pointer;
        font-size: inherit;
        font-family: inherit;
        border-top: 1px solid #eeeeee;
        margin-top: 10px;
    }

    .mobile-logout-button:hover {
        color: #dc2626;
    }

    .mobile-delete-button {
        width: 100%;
        padding: 15px 0;
        background: none;
        border: none;
        text-align: left;
        color: #dc2626;
        font-weight: bold;
        cursor: pointer;
        font-size: inherit;
        font-family: inherit;
        border-top: 1px solid #eeeeee;
        margin-top: 10px;
    }

    .mobile-delete-button:hover {
        background-color: #fef2f2;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000001;
    }

    .modal-content {
        background-color: #ffffff;
        padding: 2rem;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .modal-content h2 {
        margin: 0 0 1rem 0;
        color: #333333;
        font-size: 1.5rem;
    }

    .modal-content p {
        margin: 0.5rem 0;
        color: #333333;
        line-height: 1.5;
    }

    .warning-text {
        color: #dc2626;
        font-weight: 500;
        margin: 1rem 0 !important;
    }

    .modal-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
        justify-content: flex-end;
    }

    .modal-cancel-button,
    .modal-delete-button {
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        font-family: 'Oslo Sans', sans-serif;
        border: 2px solid;
        transition: all 0.3s;
    }

    .modal-cancel-button {
        background-color: #ffffff;
        border-color: #e0e0e0;
        color: #333333;
    }

    .modal-cancel-button:hover:not(:disabled) {
        background-color: #f5f5f5;
    }

    .modal-delete-button {
        background-color: #dc2626;
        border-color: #dc2626;
        color: #ffffff;
    }

    .modal-delete-button:hover:not(:disabled) {
        background-color: #b91c1c;
        border-color: #b91c1c;
    }

    .modal-cancel-button:disabled,
    .modal-delete-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* Mobile responsive */
    @media (max-width: 570px) {
        .nav-links {
            display: none;
        }

        .hamburger {
            display: flex;
        }

        .mobile-menu {
            display: flex;
        }

        .content-left h1 {
            font-size: 18px;
        }

        .logo {
            width: 45px;
            height: 45px;
        }
    }
</style>