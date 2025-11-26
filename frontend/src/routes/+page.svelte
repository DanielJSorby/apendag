<div class="filler"></div>
<div class="container">
    <div class="fillerbilde"></div>
    <div class="content">
        <div class="tekst-boks">
            <h1>Velkommen til åpen dag på Elvebakken!</h1>
            <p>Hvilken dag vil du se på opplegge til?</p>
        </div>
        <div class="buttons">
            <button on:click={() => window.location.href = '/kalender20'}>
                <div class="">
                <h2>tirsdag 20.</h2>
                <p>Åpen dag for alle interesserte på ettermiddagen</p>
                </div>
                <p>Trykk her for mer informasjon!</p>
            </button>
            <button on:click={() => window.location.href = '/kalender22'}>
                <div class="">
                <h2>torsdag 22.</h2>
                <p>Åpen dag med spesielle programmer kun for elever</p>
                </div>
                <p>Trykk her for mer informasjon!</p>
            </button>
        </div>
    </div>
</div>

<style>
    .filler {
        height: 10vh;
        width: 100%;
    }
    .container {
        overflow-x: hidden;
        width: 100vw;
        height: 90vh;
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

    .tekst-boks{
        display: flex;
        flex-direction: column;
        align-items: left;
    }

    .buttons {
        display: flex;
        gap: 20px;
    }

    button {
        padding: 10px 20px;
        border: 2px solid var(--color-pink);
        border-radius: 5px;
        background-color: var(--color-white);
        color: var(--color-pink);
        box-shadow: var(--color-pink) 0px 0px 10px -2px;
        cursor: pointer;
        transition: background-color 0.3s, color 0.3s;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: left;
    }

    /*temp bakgrunns animasjon */

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
        animation: bgPulse 6    0s linear infinite;
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

    /* Small mobile styles */
    @media (max-width: 600px) {

    .container {
        overflow-x: hidden;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        display: flex;
        align-items: start;
        justify-content: left;
    }

    .content {
        display: flex;
        height: 90vh;
        width: 100vw;
        flex-direction: column;
        padding: 0;
        gap: 0;
        align-items: left;
        justify-content: end;
    }

    .fillerbilde {
        height: 30vh;
        width: 100%;
    }

    .tekst-boks{
        padding-left: 5vw;
    }
    .content h1 {
        font-size: 1.2rem;
    }

    .content p {
        font-size: 0.9rem;
    }

    .buttons {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
        width: 100vw;
        height: 45vh;
        gap: 0;
    }

    button {
        width: 40vw;
        height: 40vh;
        border-radius: 1rem;
        border-width: 3px;
    }
    }
</style>