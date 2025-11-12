<div class="container">
    <div class="fillerbilde"></div>
    <div class="content">
        <h1>Velkommen til åpen dag på Elvebakken!</h1>
        <p>Hvilken dag vil du se på opplegge til?</p>
        <div class="buttons">
            <div class="button" id="200126">tirsdag 20.</div>
            <div class="button" id="220126">torsdag 22.</div>
        </div>
    </div>
</div>

<style>
    .container {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: left;
        font-family: 'Arial', sans-serif;
    }

    .content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: left;
        width: 30%;
        gap: 5px;
        padding: 30px;
    }

    .buttons {
        display: flex;
        gap: 20px;
    }

    .button {
        padding: 10px 20px;
        border: 2px solid #fe9094;
        border-radius: 5px;
        background-color: white;
        color: #fe9094;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s, color 0.3s;
    }

    @keyframes bgPulse {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
    }

    .fillerbilde {
        position: absolute;
        z-index: 0;
        width: 100%;
        height: 70%;
        background-image: linear-gradient(90deg, #fe9094 0%, #ffdbd1 50%, #fe9094 100%);
        background-size: 200% 100%;
        background-position: 0% 50%;
        animation: bgPulse 8s ease-in-out infinite alternate;
    }
</style>