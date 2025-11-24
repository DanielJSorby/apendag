<script>
    let menuOpen = $state(false);

    function toggleMenu() {
        menuOpen = !menuOpen;
    }
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
            <a href="/chatside">Spørsmål</a>
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
        <a href="/chatside" onclick={toggleMenu}>Spørsmål</a>
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

    .nav-links a {
        margin-left: 20px;
        text-decoration: none;
        color: #333333;
        font-weight: bold;
    }

    .nav-links a:hover {
        color: #fe9094;
    }

    .content-left {
        text-decoration: none;
        color: inherit;
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