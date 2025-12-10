<script lang="ts">
    import { onMount } from 'svelte';
    import { getCookie } from '$lib/functions/getCookie';
    let email = $state('');
    let password = $state('');
    let errorMessage = $state('');
    let successMessage = $state('');

    async function handleSubmit() {
        try {
            errorMessage = ''; 
            
            const response = await fetch('/api/user/log-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email }),
            });
            
            const data = await response.json();
            console.log(data);
            
            if (data.status === 401) {
                errorMessage = data.error;
                return;
            }
            
            if (data.status === 200) {
                document.cookie = `UserId=${data.userId}; path=/;`;
                window.location.href = '/';
            } else {
                errorMessage = data.error || 'An error occurred';
            }
        } catch (error) {
            console.error(error);
            errorMessage = 'An error occurred while logging in';
        }
    }

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
                successMessage = 'En verifiseringslenke er sendt til e-posten din. Trykk på den for å logge inn.';
                errorMessage = ''; // Clear any errors
                email = ''; // Clear email input after sending
            } else {
                errorMessage = data.message || 'Et problem oppstod ved sending av linken';
                successMessage = ''; // Clear success message on error
            }
        } catch (err) {
            console.error(err);
            errorMessage = 'Et problem oppstod ved sending av linken';
            successMessage = ''; // Clear success message on error
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
        <form on:submit|preventDefault={handleMagicLink}>
            <label for="email">E-post</label>
            <input type="email" id="email" placeholder="john@email.com" bind:value={email} required/>
            <button type="submit">Logg inn</button>
        </form>
        <div class="bottom-message">
            <p>Ingen bruker? <a href="/signup">Registrer deg</a></p>
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