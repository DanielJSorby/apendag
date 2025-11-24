<div class="container">
    <div class="content-left">
        <div class="logo" on:click ={()=> window.location.href = '/'}></div>
        <h1 on:click ={()=> window.location.href = '/'}>Åpen Dag</h1>
    </div>
    <div class="content-right">
        <div class="nav-links">
            <a href="/kalender20">Tirsdag 20.</a>
            <a href="/kalender22">Torsdag 22.</a>
            <a href="/chatside">Spørsmål</a>
        </div>
    </div>
</div>

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
</style>