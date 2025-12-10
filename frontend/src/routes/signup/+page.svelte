<script lang="ts">
    import { onMount } from 'svelte';
    import { getCookie } from '$lib/functions/getCookie';
    let name = $state('');
    let email = $state('');
    let password = $state('');
    let errorMessage = $state('');
    let successMessage = $state('');

    onMount(async () => {
        const userId = getCookie('UserId');
        if (userId) {
            window.location.href = '/';
        }
    });

    async function handleSubmit() {
        try {
            errorMessage = '';
            successMessage = '';
            
            const response = await fetch('/api/signup_link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email }),
            });
            
            const data = await response.json();
            
            if (data.ok) {
                successMessage = 'Verifiseringslenke er sendt! Sjekk e-posten din for å fullføre registreringen.';
                errorMessage = ''; // Clear any errors
                name = ''; // Clear inputs after sending
                email = ''; // Clear inputs after sending
            } else {
                errorMessage = data.message || 'Kunne ikke sende verifiseringslenke';
                successMessage = ''; // Clear success message on error
            }
        } catch (error) {
            console.error(error);
            errorMessage = 'Et problem oppstod ved oppretting av kontoen din';
            successMessage = ''; // Clear success message on error
        }
    }
</script>

<div class="login">
    <div class="container">
        <div class="header">
            <h1>Registrer deg</h1>
            <p>Opprett en konto for å melde deg på kurs. Du vil bli tilsendt en verifiseringslenke på e-post. Informasjonen brukes kun av rådgivere for å holde orden på påmelding av kurs og slettes etter åpen dag.</p>
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
        <form on:submit|preventDefault={handleSubmit}>
            <label for="name">Fullt navn</label>
            <input type="text" id="name" placeholder="John Doe" bind:value={name} required />
            <label for="email">E-post</label>
            <input type="email" id="email" placeholder="john@email.com" bind:value={email} required />
            <button type="submit">Registrer deg</button>
        </form>
        <div class="bottom-message">
            <p>Har du allerede en konto? <a href="/login">Logg inn</a></p>
        </div>
    </div>
</div>

<style>
    .login {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 10vh);
        padding: 2rem 1rem;
        background-color: var(--color-grey);
    }

    .container {
        width: 100%;
        max-width: 500px;
        padding: 3rem;
        background-color: var(--color-white);
        border-radius: 15px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
        line-height: 1.5;
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
    }
</style>