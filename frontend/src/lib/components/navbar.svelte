<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let menuOpen = $state(false);
    let isLoggedIn = $state(false);
    let userName = $state<string | null>(null);
    let userMenuOpen = $state(false);

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
            userName = data.user?.name || null;
        } catch (error) {
            console.error('Error checking login status:', error);
            isLoggedIn = false;
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
            console.error('Error during logout:', error);
            // Still update local state and redirect even if API call fails
            isLoggedIn = false;
            userName = null;
            userMenuOpen = false;
            goto('/');
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
        <h1>Åpen Dag</h1>
    </a>
    <div class="content-right">
        <div class="nav-links">
            <a href="/kalender20">Tirsdag 20.</a>
            <a href="/kalender22">Torsdag 22.</a>
            <a href="/FAQ">Spørsmål</a>
            {#if isLoggedIn}
                <div class="user-menu-container">
                    <button class="user-button" onclick={toggleUserMenu} aria-label="User menu">
                        <span class="user-name">{userName || 'Logget inn'}</span>
                        <span class="user-icon">▼</span>
                    </button>
                    {#if userMenuOpen}
                        <div class="user-dropdown">
                            <button class="logout-button" onclick={handleLogout}>Logg ut</button>
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
        <a href="/kalender20" onclick={toggleMenu}>Tirsdag 20.</a>
        <a href="/kalender22" onclick={toggleMenu}>Torsdag 22.</a>
        <a href="/FAQ" onclick={toggleMenu}>Spørsmål</a>
        {#if isLoggedIn}
            <div class="mobile-user-info">
                <span>Logget inn som: {userName || 'Bruker'}</span>
            </div>
            <button class="mobile-logout-button" onclick={async () => { await handleLogout(); toggleMenu(); }}>Logg ut</button>
        {:else}
            <a href="/login" onclick={toggleMenu}>Logg inn</a>
        {/if}
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
        min-width: 120px;
        z-index: 1000;
        padding: 8px 0;
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
    }

    .logout-button:hover {
        background-color: #f5f5f5;
        color: #dc2626;
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