<div class="container">
    <div class="content-left">
        <div class="logo"></div>
        <h1>Åpen Dag</h1>
    </div>
    <div class="content-right">
        <div class="nav-links">
            <a href="/">Hjem</a>
            <a href="/kontakt">Spørsmål</a>
        </div>
    </div>
</div>

<style>
    .container {
        position: fixed;
        z-index: 10000000;
        width: 100%;
        height: 80px;
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