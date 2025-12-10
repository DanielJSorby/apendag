<script lang="ts">
    import { onMount } from 'svelte';
    import { getCookie } from '$lib/functions/getCookie';
    let email = $state('');
    let errorMessage = $state('');
    let successMessage = $state('');

    onMount(() => {
        const userId = getCookie('UserId');
        if (userId) {
            window.location.href = '/';
        }
    });

    async function handleMagicLink() {
        try {
            errorMessage = '';
            successMessage = '';

            const response = await fetch('/api/magic_link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.ok) {
                const emailToShow = email; // Store email before clearing
                successMessage = `En verifiseringslenke er sendt til ${emailToShow}. Trykk på den for å logge inn.`;
                errorMessage = '';
                email = '';
            } else {
                errorMessage = data.message || 'Et problem oppstod ved sending av linken';
                successMessage = '';
            }
        } catch (err) {
            console.error(err);
            errorMessage = 'Et problem oppstod ved sending av linken';
            successMessage = '';
        }
    }
</script>

<div class="login">
    <div class="container">
        <div class="header">
            <h1>Logg inn</h1>
            <p>Skriv inn e-postadressen din for å få en verifiseringslenke tilsendt.</p>
        </div>
        {#if errorMessage}
            <div class="error-message">
                {errorMessage}
            </div>
        {/if}
        {#if successMessage}
            <div class="success-message">
                {successMessage}
            </div>
        {/if}
        <form onsubmit={(e) => { e.preventDefault(); handleMagicLink(); }}>
            <label for="email">E-post</label>
            <input type="email" id="email" placeholder="john@email.com" bind:value={email} required/>
            <button type="submit">Logg inn</button>
        </form>
        <div class="bottom-message">
            <p>Ingen bruker? <a href="/signup">Registrer deg</a></p>
        </div>
    </div>
</div>

<div class="background-shapes">
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
    <div class="shape shape-3"></div>
    <div class="shape shape-4"></div>
</div>

<style>
    .login {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 10vh);
        padding: 2rem 1rem;
        background-color: var(--color-grey);
        position: relative;
    }

    .container {
        width: 100%;
        max-width: 500px;
        padding: 3rem;
        background-color: var(--color-white);
        border-radius: 15px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        position: relative;
        z-index: 2;
    }

    .header {
        text-align: left;
        margin-bottom: 2rem;
    }

    .header h1 {
        font-size: 2.5rem;
        margin: 0 0 0.5rem 0;
        color: var(--color-pink);
        font-weight: bold;
    }

    .header p {
        font-size: 1rem;
        margin: 0;
        color: #333;
        font-weight: 300;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    label {
        font-size: 1rem;
        font-weight: 500;
        color: #333;
        margin-bottom: -1rem;
    }

    input {
        padding: 12px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 15px;
        font-size: 1rem;
        font-family: 'Oslo Sans', sans-serif;
        transition: border-color 0.3s, box-shadow 0.3s;
        background-color: var(--color-white);
    }

    input:focus {
        outline: none;
        border-color: var(--color-pink);
        box-shadow: var(--color-pink) 0px 0px 10px -2px;
    }

    input::placeholder {
        color: #999;
    }

    button {
        padding: 12px 24px;
        border: 2px solid var(--color-pink);
        border-radius: 15px;
        background-color: var(--color-white);
        color: var(--color-pink);
        box-shadow: var(--color-pink) 0px 0px 10px -2px;
        cursor: pointer;
        transition: background-color 0.3s, color 0.3s;
        font-size: 1rem;
        font-weight: bold;
        font-family: 'Oslo Sans', sans-serif;
        margin-top: 0.5rem;
    }

    button:hover {
        background-color: var(--color-pink);
        color: var(--color-white);
    }

    .error-message {
        background-color: #fef2f2;
        border: 2px solid #fecaca;
        color: #dc2626;
        padding: 1rem;
        border-radius: 15px;
        margin-bottom: 1rem;
        text-align: center;
        font-weight: 500;
        font-size: 0.95rem;
    }

    .success-message {
        background-color: #f0fdf4;
        border: 2px solid #86efac;
        color: #166534;
        padding: 1rem;
        border-radius: 15px;
        margin-bottom: 1rem;
        text-align: center;
        font-weight: 500;
        font-size: 0.95rem;
    }

    .bottom-message {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 1.5rem;
        text-align: center;
        font-size: 1rem;
        font-weight: 300;
        color: #333;
    }

    .bottom-message a {
        color: var(--color-pink);
        text-decoration: underline;
        font-weight: 500;
        margin-left: 0.25rem;
    }

    .bottom-message a:hover {
        color: #b82d4d;
    }

    .background-shapes {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 1;
    }

    .shape {
        position: absolute;
        border-radius: 50%;
        opacity: 0.1;
        animation: float 20s ease-in-out infinite;
    }

    .shape-1 {
        width: 300px;
        height: 300px;
        background: var(--color-blue);
        top: -150px;
        left: -150px;
        animation-delay: 0s;
    }

    .shape-2 {
        width: 200px;
        height: 200px;
        background: var(--color-pink);
        top: 20%;
        right: -100px;
        animation-delay: -5s;
    }

    .shape-3 {
        width: 250px;
        height: 250px;
        background: var(--color-green);
        bottom: -125px;
        left: 10%;
        animation-delay: -10s;
    }

    .shape-4 {
        width: 180px;
        height: 180px;
        background: var(--color-orange);
        bottom: 10%;
        right: 15%;
        animation-delay: -15s;
    }

    @keyframes float {
        0%, 100% {
            transform: translate(0, 0) scale(1);
        }
        33% {
            transform: translate(30px, -30px) scale(1.1);
        }
        66% {
            transform: translate(-20px, 20px) scale(0.9);
        }
    }

    @media (max-width: 570px) {
        .login {
            min-height: calc(100vh - 10vh);
            padding: 1rem;
        }

        .container {
            padding: 2rem 1.5rem;
        }

        .header h1 {
            font-size: 2rem;
        }

        .header p {
            font-size: 0.9rem;
        }

        .shape-1 {
            width: 200px;
            height: 200px;
            top: -100px;
            left: -100px;
        }

        .shape-2 {
            width: 150px;
            height: 150px;
            right: -75px;
        }

        .shape-3 {
            width: 180px;
            height: 180px;
            bottom: -90px;
        }

        .shape-4 {
            width: 120px;
            height: 120px;
        }
    }
</style>