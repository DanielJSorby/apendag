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
        border: 2px solid var(--color-pink);
        border-radius: 5px;
        background-color: var(--color-white);
        color: var(--color-pink);
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s, color 0.3s;
    }

    @keyframes bgPulse {
        0% { 
            background-position: 0% 50%;
        }
        100% { 
            background-position: 200% 50%;
        }
    }

    .fillerbilde {
        position: absolute;
        z-index: 0;
        width: 100%;
        height: 100%;
        background-image: 
            linear-gradient(90deg, 
                var(--color-pink) 0%, 
                var(--color-pink) 6%,
                var(--color-white) 6%,
                var(--color-white) 8%,
                var(--color-blue) 8%, 
                var(--color-blue) 14%,
                var(--color-white) 14%,
                var(--color-white) 16%,
                var(--color-green) 16%, 
                var(--color-green) 22%,
                var(--color-white) 22%,
                var(--color-white) 24%,
                var(--color-orange) 24%,
                var(--color-orange) 30%,
                var(--color-white) 30%,
                var(--color-white) 32%,
                var(--color-pink) 32%,
                var(--color-pink) 38%,
                var(--color-white) 38%,
                var(--color-white) 40%,
                var(--color-blue) 40%,
                var(--color-blue) 46%,
                var(--color-white) 46%,
                var(--color-white) 48%,
                var(--color-green) 48%,
                var(--color-green) 54%,
                var(--color-white) 54%,
                var(--color-white) 56%,
                var(--color-orange) 56%,
                var(--color-orange) 62%,
                var(--color-white) 62%,
                var(--color-white) 64%,
                var(--color-pink) 64%,
                var(--color-pink) 70%,
                var(--color-white) 70%,
                var(--color-white) 72%,
                var(--color-blue) 72%,
                var(--color-blue) 78%,
                var(--color-white) 78%,
                var(--color-white) 80%,
                var(--color-green) 80%,
                var(--color-green) 86%,
                var(--color-white) 86%,
                var(--color-white) 88%,
                var(--color-orange) 88%,
                var(--color-orange) 94%,
                var(--color-white) 94%,
                var(--color-white) 96%,
                var(--color-pink) 96%,
                var(--color-pink) 100%
            );
        background-size: 200% 100%;
        background-position: 0% 50%;
        animation: bgPulse 30s linear infinite;
    }

    .fillerbilde::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
            90deg,
            transparent 40%,
            rgba(255, 255, 255, 0.08) 50%,
            transparent 60%
        );
        animation: shimmer 15s ease-in-out infinite;
    }

    @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
</style>